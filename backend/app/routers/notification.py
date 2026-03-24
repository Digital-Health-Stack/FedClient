"""Redis token endpoints, WebSocket fan-out, and Redis listeners for sessions and rounds."""

from fastapi import APIRouter, WebSocket
from fastapi.websockets import WebSocketDisconnect

from schemas.training_data_transfer import SaveToken
from utility.infra.redis import redis_client

notification_router = APIRouter(tags=["Notification"])

connected_websockets = set()


@notification_router.post("/save-token", status_code=201)
async def save_token_endpoint(request: SaveToken):
    client_token = request.client_token
    await redis_client.set("client_token", client_token)
    return {"message": "Token saved successfully."}


@notification_router.delete("/remove-token", status_code=200)
async def remove_token_endpoint():
    await redis_client.delete("client_token")
    return {"message": "Token removed successfully."}


@notification_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.add(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        connected_websockets.discard(websocket)
