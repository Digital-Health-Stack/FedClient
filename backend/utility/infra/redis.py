import asyncio
import json
import os
import uuid
from typing import Set

import redis.asyncio as redis
import requests
from dotenv import load_dotenv
from fastapi import WebSocket
from fastapi.websockets import WebSocketDisconnect

load_dotenv()

# Redis connection for get/set operations (key-value storage)
redis_client = redis.Redis(
    host=os.environ.get("REDIS_URL"),
    port=int(os.environ.get("REDIS_PORT")),
    password=os.environ.get("REDIS_PASSWORD"),
    decode_responses=True,
    db=0,
)

# Dedicated connections for concurrent pub/sub listen loops
redis_pubsub = redis.Redis(
    host=os.environ.get("REDIS_URL"),
    port=int(os.environ.get("REDIS_PORT")),
    password=os.environ.get("REDIS_PASSWORD"),
    decode_responses=True,
    db=0,
)
redis_pubsub2 = redis.Redis(
    host=os.environ.get("REDIS_URL"),
    port=int(os.environ.get("REDIS_PORT")),
    password=os.environ.get("REDIS_PASSWORD"),
    decode_responses=True,
    db=0,
)

session_pubsub = redis_pubsub.pubsub()
round_pubsub = redis_pubsub2.pubsub()

BASE_URL = os.getenv("REACT_APP_SERVER_BASE_URL")


async def redis_listener(connected_websockets: Set[WebSocket]):
    await session_pubsub.subscribe("new-session")
    try:
        async for message in session_pubsub.listen():
            if message is None or message["type"] != "message":
                continue

            for ws in list(connected_websockets):
                try:
                    await ws.send_text(message["data"])
                except WebSocketDisconnect:
                    connected_websockets.discard(ws)
    except Exception as e:
        print(f"Error in redis_listener: {e}")


async def _run_script_async(process_id: str, session_id: int, client_token: str) -> None:
    from routers.training import _run_script

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _run_script, process_id, session_id, client_token)


async def redis_round_listener() -> None:
    from utility.federated.services import process_parquet_and_save_xy

    await round_pubsub.subscribe("new-round")
    print("Subscribed to new-round")
    try:
        async for message in round_pubsub.listen():
            if message is None or message["type"] != "message":
                continue
            print("maine sunn liya")
            message_data = json.loads(message["data"])
            print(f"Message data: {message_data}")
            session_id = message_data.get("session_id")
            redis_key = f"client_filename:{session_id}"
            client_filename = await redis_client.get(redis_key)
            round_number = message_data.get("round_number")
            client_token = await redis_client.get("client_token")

            session = requests.get(
                f"{BASE_URL}/get-federated-session/{session_id}",
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
            asyncio.create_task(
                _run_script_async(
                    process_id=process_id,
                    session_id=session_id,
                    client_token=client_token,
                )
            )
    except Exception as e:
        print(f"Error in redis_round_listener: {e}")
