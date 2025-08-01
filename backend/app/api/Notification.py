import requests
from sqlalchemy.orm import Session
from models.Trainings import CurrentTrainings
from utility.db import get_db
from utility.redis import redis_pubsub, redis_client, redis_pubsub2
import asyncio
from fastapi import APIRouter, WebSocket
from fastapi.websockets import WebSocketDisconnect
import os
import uuid
import json
from datetime import datetime
from utility.federated_services import process_parquet_and_save_xy
from api.model_training_routes import _run_script, process_store
import subprocess
import sys

notification_router = APIRouter(tags=["Notification"])

BASE_URL = os.getenv("REACT_APP_SERVER_BASE_URL")


async def _run_script_async(process_id: str, session_id: int, client_token: str):
    """Async wrapper for the synchronous _run_script function"""
    # Run the synchronous function in a thread pool
    loop = asyncio.get_event_loop()
    await loop.run_in_executor(None, _run_script, process_id, session_id, client_token)


pubsub = redis_pubsub.pubsub()
pubsub2 = redis_pubsub2.pubsub()
connected_websockets = set()


async def redis_listener():
    await pubsub.subscribe("new-session")
    try:
        async for message in pubsub.listen():
            if message is None or message["type"] != "message":
                continue

            # Create a copy of the set to avoid issues with modification during iteration
            for ws in list(connected_websockets):
                try:
                    await ws.send_text(message["data"])
                except WebSocketDisconnect:
                    connected_websockets.remove(ws)
    except Exception as e:
        print(f"Error in redis_listener: {e}")
        # Reconnect logic could be added here if needed


async def redis_round_listener():
    await pubsub2.subscribe("new-round")
    try:
        async for message in pubsub2.listen():
            if message is None or message["type"] != "message":
                continue            
            print("Received round message:", message)
            message_data = json.loads(message["data"])
            session_id = message_data.get("session_id")
            redis_key = f"client_filename:{session_id}"
            client_filename = await redis_client.get(redis_key)
            print("client_filename", client_filename)
            round_number = message_data.get("round_number")
            client_token = await redis_client.get("client_token")

            session = requests.get(
                f"{BASE_URL}/v2/get-federated-session/{session_id}",
                headers={"Authorization": f"Bearer {client_token}"},
            )
            session.raise_for_status()
            session = session.json()

            if round_number == 1:
                process_parquet_and_save_xy(
                    client_filename,
                    str(session_id),
                    session["federated_info"]["input_columns"],
                    session["federated_info"]["output_columns"],
                    client_token,
                )

            process_id = str(uuid.uuid4())
            # Use asyncio.create_task instead of background_tasks
            asyncio.create_task(
                _run_script_async(
                    process_id=process_id,
                    session_id=session_id,
                    client_token=client_token,
                )
            )
    except Exception as e:
        print(f"Error in redis_round_listener: {e}")
        # Reconnect logic could be added here if needed


@notification_router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    connected_websockets.add(websocket)
    try:
        while True:
            await websocket.receive_text()  # Optional
    except WebSocketDisconnect:
        connected_websockets.remove(websocket)
