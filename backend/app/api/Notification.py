import redis.asyncio as redis
import asyncio
from fastapi import APIRouter, WebSocket
from fastapi.websockets import WebSocketDisconnect
import os

notification_router = APIRouter(tags=["Notification"])

r = redis.Redis(
    host=os.environ.get("REDIS_URL", "localhost"),
    port=int(os.environ.get("REDIS_PORT", 6380)),
    password=os.environ.get("REDIS_PASSWORD", "123456"),
)
pubsub = r.pubsub()
connected_websockets = set()


async def redis_listener():
    await pubsub.subscribe("new-session")
    while True:
        message = await pubsub.get_message(ignore_subscribe_messages=True, timeout=1)
        if message:
            # Create a copy of the set to avoid issues with modification during iteration
            for ws in list(connected_websockets):
                try:
                    await ws.send_text(message["data"].decode())
                except WebSocketDisconnect:
                    connected_websockets.remove(ws)
        await asyncio.sleep(0.1)


@notification_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.add(websocket)
    try:
        while True:
            await websocket.receive_text()  # Optional
    except WebSocketDisconnect:
        connected_websockets.remove(websocket)
