from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from utility.db import get_db
from schemas.training_data_transfer import TransferCreate, SubmitPrice
from utility.spark_services import SparkSessionManager
import requests
import os
import asyncio
from concurrent.futures import ThreadPoolExecutor
from dotenv import load_dotenv

load_dotenv()

# instead ensure max free cpu, if no one is free wait !!
executor = ThreadPoolExecutor(max_workers=os.cpu_count())

qpd_router = APIRouter(tags=["QPD"])

BASE_URL = os.getenv("REACT_APP_SERVER_BASE_URL")
spark_client = SparkSessionManager()


async def create_qpd_dataset_from_client_data(
    fed_info, num_points, client_token, session_id
):
    try:
        filename = fed_info.get("dataset_info", {}).get("client_filename")
        parent_filename = fed_info.get("dataset_info", {}).get("server_filename")
        overview = await spark_client.create_qpd_dataset(filename, num_points)

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
def create_qpd_dataset_endpoint(request: SubmitPrice):
    # -------------------------------------------------------------------
    # Create a remote Dataset and updates the status to the server DB.
    # -------------------------------------------------------------------
    print(f"Received request to create QPD dataset: {request}")
    # print(f"Received request to create QPD dataset for session ID: {request.session_id}")
    session_id = request.session_id
    num_points = request.session_price
    client_token = request.client_token

    headers = {
        "Authorization": f"Bearer {client_token}",
        "Content-Type": "application/json",
    }

    get_url = f"{BASE_URL}/v2/get-federated-session/{session_id}"
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


#  smaple fed_info json:
# {
#   "organisation_name": "CDIS",
#   "model_name": "CNN",
#   "model_info": {
#     "input_shape": "(128,128,1)",
#     "output_layer": {
#       "num_nodes": "1",
#       "activation_function": "sigmoid"
#     },
#     "loss": "mae",
#     "optimizer": "adam",
#     "test_metrics": [
#       "mse",
#       "mae"
#     ],
#     "layers": [
#       {
#         "layer_type": "convolution",
#         "filters": "8",
#         "kernel_size": "(3,3)",
#         "stride": "(1,1)",
#         "activation_function": "relu"
#       },
#       {
#         "layer_type": "pooling",
#         "pooling_type": "max",
#         "pool_size": "(2,2)",
#         "stride": "(2,2)"
#       },
#       {
#         "layer_type": "convolution",
#         "filters": "4",
#         "kernel_size": "(2,2)",
#         "stride": "(1,1)",
#         "activation_function": "relu"
#       },
#       # //.... other layers
#     ]
#   },
#   "dataset_info": {
#     "about_dataset": "",
#     "feature_list": [
#       {}
#     ],
#     "client_filename": "abcd.csv",
#     "server_filename": "Bone Age Data",
#     "client_stats": {
#       "numRows": 26,
#       "numColumns": 3,
#       "columnStats": []
#     },
#     "server_stats": {
#       "numRows": 26,
#       "numColumns": 3,
#       "columnStats": [ ]
#     },
#     "task_id": 1,
#     "task_name": "Sample Task",
#     "metric": "MAE",
#     "output_columns": [
#       "pct_2013"
#     ]
#   },
#   "std_mean": 2,
#   "std_deviation": 1
# }
