from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException
from sqlalchemy.orm import Session
from utility.db import get_db
from crud.trainings_crud import create_training, get_training_details
from schemas.trainings import InitiateModelRequest, AcceptClientFilenameTrainingRequest
import requests
import subprocess
from subprocess import CalledProcessError
import json
import os
import random
import sys
from typing import Dict
import uuid
from datetime import datetime
from utility.federated_services import process_parquet_and_save_xy
from utility.redis import redis_client

model_router = APIRouter(tags=["Model Training"])
BASE_URL = os.getenv("REACT_APP_SERVER_BASE_URL")
get_training_url = f"{BASE_URL}/get-federated-session"
get_params_url = f"{BASE_URL}/get-model-parameters"
post_params_url = f"{BASE_URL}/receive-client-parameters"

# In-memory process store (replace with DB in production)
process_store: Dict[str, dict] = {}


@model_router.post("/initiate-model")
def initiate_model(request: InitiateModelRequest, db: Session = Depends(get_db)):
    try:
        # ------------------------------------------
        # Fetch client_data from hdfs to data folder
        # ------------------------------------------
        session_id = request.session_id
        client_token = request.client_token

        headers = {
            "Authorization": f"Bearer {client_token}",
            "Content-Type": "application/json",
        }

        get_url = f"{get_training_url}/{session_id}"
        response = requests.get(get_url, headers=headers)
        response.raise_for_status()  # Raises HTTPError if not 2xx

        result = response.json()

        # Read output column from it
        federated_info = result.get("federated_info")
        dataset_info = federated_info.get("dataset_info")
        client_filename = dataset_info.get("client_filename")
        output_columns = dataset_info.get("output_columns")
        process_parquet_and_save_xy(
            client_filename, session_id, output_columns, client_token
        )

        training_details = {
            "session_id": session_id,
            "training_details": federated_info,
        }

        # Store in DB
        db_training = create_training(db, training_details)

        if isinstance(db_training, dict) and "error" in db_training:
            raise HTTPException(status_code=400, detail=db_training["error"])

        return {"message": "Model initiation successful"}

    except requests.exceptions.HTTPError as http_err:
        raise HTTPException(status_code=response.status_code, detail=str(http_err))
    except Exception as e:
        print(f"Error initiating model: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")


def _run_script(process_id: str, session_id: int, client_token: str):
    """Background task function that executes the script"""
    env = os.environ.copy()
    process_store[process_id] = {
        "status": "running",
        "start_time": datetime.now(),
        "session_id": session_id,
        "output": {"stdout": "", "stderr": ""},
    }

    try:
        proc = subprocess.Popen(
            [
                sys.executable,
                "-m",
                "utility.training_script",
                "--session_id",
                str(session_id),
                "--client_token",
                client_token,
            ],
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            env=env,
        )

        # Stream output while process runs
        stdout, stderr = proc.communicate()

        process_store[process_id].update(
            {
                "status": "completed" if proc.returncode == 0 else "failed",
                "end_time": datetime.now(),
                "return_code": proc.returncode,
                "output": {"stdout": stdout, "stderr": stderr},
            }
        )

    except Exception as e:
        process_store[process_id].update(
            {"status": "failed", "end_time": datetime.now(), "error": str(e)}
        )


@model_router.get("/execute-round")
async def execute_round(
    session_id: int, client_token: str, background_tasks: BackgroundTasks
):
    """Launch script in background and return process ID"""
    process_id = str(uuid.uuid4())
    background_tasks.add_task(
        _run_script,
        process_id=process_id,
        session_id=session_id,
        client_token=client_token,
    )

    return {
        "message": "Script execution started",
        "process_id": process_id,
        "status_endpoint": f"/process-status/{process_id}",
    }


@model_router.get("/process-status/{process_id}")
def get_process_status(process_id: str):
    """Check status of a background process"""
    if process_id not in process_store:
        return {"error": "Process not found"}, 404

    process_info = process_store[process_id]
    response = {
        "process_id": process_id,
        "status": process_info["status"],
        "start_time": process_info["start_time"],
        "session_id": process_info["session_id"],
    }

    if "end_time" in process_info:
        response["duration_seconds"] = (
            process_info["end_time"] - process_info["start_time"]
        ).total_seconds()
        response["return_code"] = process_info.get("return_code")

    if process_info["status"] in ("completed", "failed"):
        response.update({"output": process_info["output"]})

    return response


# # Paths for model configuration and training data
# # model_path = "/backend/app/storage/model_config"
# model_path = "/"
# data_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'data')
# train_X_path = os.path.join(data_dir, "X_train.npy")
# train_Y_path = os.path.join(data_dir, "Y_train.npy")
# utils_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), "utils")
# training_script_path = os.path.join(utils_path, "training_script.py")

# # Ensure the directory exists
# os.makedirs(model_path, exist_ok=True)

# # Determine the server argument
# environment = os.getenv('ENVIRONMENT')
# server_argument = '--production' if environment == 'production' else '--development'

# def generate_random_hex(n):
#     if n <= 0:
#         raise ValueError("Length of the hex string must be greater than 0")
#     # Generate a random hex string
#     return ''.join(random.choices('0123456789abcdef', k=n))

# @model_router.post("/initiate-model")
# def initiate_model(modelConfig: dict):
#     local_model_id = None

#     while local_model_id == None or os.path.exists(model_file):
#         local_model_id = generate_random_hex(18)
#         model_file = f"{model_path}/{local_model_id}.json"

#     with open(model_file, 'w') as json_file:
#         json.dump(modelConfig, json_file, indent=4)
#     return {
#         "message": "model configuration saved",
#         "local_model_id": local_model_id
#     }

# @model_router.get("/execute-round")
# def run_script(local_model_id: str):
#     # Run the script using subprocess
#     model_path_with_id = f"{model_path}/{local_model_id}.json"
#     result = subprocess.run(["python", training_script_path, model_path_with_id, train_X_path, train_Y_path, server_argument], capture_output=True, text=True, encoding='utf-8')
#     return {"stdout": result.stdout, "stderr": result.stderr, "returncode": result.returncode}


@model_router.post("/accept-client-filename-training")
async def accept_client_filename_training(request: AcceptClientFilenameTrainingRequest):
    try:
        session_id = request.session_id
        client_filename = request.client_filename

        redis_key = f"client_filename:{session_id}"
        await redis_client.set(redis_key, client_filename)
        
        return {"message": "Client filename saved successfully"}
    except Exception as e:
        print(f"Error accepting client filename training: {e}")
        raise HTTPException(status_code=500, detail="Internal server error")