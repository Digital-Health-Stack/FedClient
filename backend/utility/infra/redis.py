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


def get_username_from_jwt(token: str) -> str:
    try:
        parts = token.split('.')
        if len(parts) == 3:
            import base64
            import json
            payload_b64 = parts[1]
            payload_b64 += '=' * (-len(payload_b64) % 4)
            payload_json = base64.b64decode(payload_b64).decode('utf-8')
            payload = json.loads(payload_json)
            return payload.get("sub")
    except Exception as e:
        print(f"Error decoding JWT: {e}")
    return None

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
    while True:
        try:
            async for message in session_pubsub.listen():
                if message is None or message["type"] != "message":
                    continue

                for ws in list(connected_websockets):
                    try:
                        await ws.send_text(message["data"])
                    except WebSocketDisconnect:
                        connected_websockets.discard(ws)
                    except Exception as ws_err:
                        print(f"Error sending message to websocket: {ws_err}")
        except Exception as e:
            print(f"Error in redis_listener loop: {e}")
            await asyncio.sleep(1)


async def _run_script_async(process_id: str, session_id: int, client_token: str) -> None:
    from routers.training import _run_script

    loop = asyncio.get_running_loop()
    await loop.run_in_executor(None, _run_script, process_id, session_id, client_token)


async def redis_round_listener() -> None:
    from utility.federated.services import process_parquet_and_save_xy

    await round_pubsub.subscribe("new-round")
    print("Subscribed to new-round")
    while True:
        try:
            async for message in round_pubsub.listen():
                try:
                    if message is None or message["type"] != "message":
                        continue
                    print("maine sunn liya")
                    message_data = json.loads(message["data"])
                    print(f"Message data: {message_data}")
                    session_id = message_data.get("session_id")
                    round_number = message_data.get("round_number")

                    # Get all saved client usernames
                    usernames = await redis_client.smembers("client_usernames")
                    if not usernames:
                        # Fallback to single username from client_token
                        single_token = await redis_client.get("client_token")
                        if single_token:
                            u = get_username_from_jwt(single_token)
                            usernames = {u} if u else set()
                        else:
                            usernames = set()

                    print(f"Active usernames in Redis: {usernames}")

                    for username in list(usernames):
                        # 1. Get client token for this username
                        client_token = await redis_client.get(f"client_token:{username}")
                        if not client_token:
                            continue

                        # 2. Get client filename for this session and username
                        redis_key = f"client_filename:{session_id}:{username}"
                        client_filename = await redis_client.get(redis_key)
                        if not client_filename:
                            # Fallback to session client_filename
                            client_filename = await redis_client.get(f"client_filename:{session_id}")

                        if not client_filename:
                            print(f"No client filename found for user {username} and session {session_id}")
                            continue

                        # 3. Get session info from main server to verify this user is a participant
                        try:
                            session_res = requests.get(
                                f"{BASE_URL}/get-federated-session/{session_id}",
                                headers={"Authorization": f"Bearer {client_token}"},
                            )
                            session_res.raise_for_status()
                            session = session_res.json()
                        except Exception as get_err:
                            print(f"Error fetching session status for {username}: {get_err}")
                            continue

                        # If user is not registered in this session, skip
                        if session.get("client_status") == -1:
                            print(f"User {username} is not registered in session {session_id}")
                            continue

                        if round_number == 1:
                            process_parquet_and_save_xy(
                                client_filename,
                                str(session_id),
                                session["federated_info"]["input_columns"],
                                session["federated_info"]["output_columns"],
                                client_token,
                                username=username,
                            )

                        process_id = str(uuid.uuid4())
                        asyncio.create_task(
                            _run_script_async(
                                process_id=process_id,
                                session_id=session_id,
                                client_token=client_token,
                            )
                        )
                except Exception as inner_e:
                    print(f"Error processing round message: {inner_e}")
        except Exception as e:
            print(f"Error in redis_round_listener loop: {e}")
            await asyncio.sleep(1)
