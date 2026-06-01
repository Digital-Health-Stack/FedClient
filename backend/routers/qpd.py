"""QPD dataset creation flow (federated server + background tasks)."""

from fastapi import APIRouter
from schemas.training_data_transfer import TransferCreate, SubmitPrice
from utility.dataset.processing import DataProcessingManager
import requests
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv
from utility.infra.redis import redis_client
load_dotenv()

# instead ensure max free cpu, if no one is free wait !!
executor = ThreadPoolExecutor(max_workers=os.cpu_count())

qpd_router = APIRouter(tags=["QPD"])

BASE_URL = os.getenv("REACT_APP_SERVER_BASE_URL")
data_client = DataProcessingManager()


async def create_qpd_dataset_from_client_data(
    fed_info, num_points, client_token, session_id
):
    return {"message": "QPD Dataset will be created later in LIFE."}
    # TODO: After researching
    try:
        # filename = fed_info.get("dataset_info", {}).get("client_filename")
        session_key = f"client_filename:{session_id}"
        filename = await redis_client.get(session_key)
        parent_filename = fed_info.get("dataset_info", {}).get("server_filename")
        overview = await data_client.create_qpd_dataset(filename, num_points)

        qpd_data = TransferCreate(
            training_name=fed_info.get("organisation_name"),
            num_datapoints=int(num_points),
            # data_path=overview["datapath"],
            parent_filename=parent_filename,
            datastats=overview,
            federated_session_id=int(session_id),
        )

        headers = {
            "Authorization": f"Bearer {client_token}",
            "Content-Type": "application/json",
        }

        create_qpd_data_url = f"{BASE_URL}/create-transferred-data"

        response = requests.post(
            create_qpd_data_url, json=qpd_data.dict(), headers=headers
        )
        response.raise_for_status()  # Raises HTTPError if not 2xx
        result = response.json()
        print(f"QPD Dataset {filename} created in server DB successfully.")
        return {"message": "QPD Dataset created successfully."}
    except Exception as e:
        print(f"Error creating QPD Dataset: {e}")
        return {"error": str(e)}


@qpd_router.post("/create-qpdataset", status_code=201)
async def create_qpd_dataset_endpoint(request: SubmitPrice):
    # -------------------------------------------------------------------
    # Create a remote Dataset and updates the status to the server DB.
    # -------------------------------------------------------------------
    print(f"Received request to create QPD dataset: {request}")
    # print(f"Received request to create QPD dataset for session ID: {request.session_id}")
    session_id = request.session_id
    num_points = request.session_price
    client_token = request.client_token

    # Proactively save client token to Redis
    try:
        await redis_client.set("client_token", client_token)
    except Exception as redis_err:
        print(f"Error saving client token to Redis in create-qpdataset: {redis_err}")

    headers = {
        "Authorization": f"Bearer {client_token}",
        "Content-Type": "application/json",
    }

    get_url = f"{BASE_URL}/get-federated-session/{session_id}"
    response = requests.get(get_url, headers=headers)
    response.raise_for_status()  # Raises HTTPError if not 2xx
    result = response.json()

    fed_info = result.get("federated_info")

    executor.submit(
        asyncio.run,
        create_qpd_dataset_from_client_data(
            fed_info, num_points, client_token, session_id
        ),
    )

    print(f"QPD Dataset creation started for session ID: {session_id}")
    return {"message": "QPD Dataset creation started successfully."}