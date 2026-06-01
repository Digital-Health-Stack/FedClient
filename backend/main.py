from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import uvicorn
import requests
from contextlib import asynccontextmanager
import asyncio
from routers import dataset, training, qpd, notification
from utility.infra.redis import redis_listener, redis_round_listener

"""
  Don't start this server from terminal without specifying port (9000 or something unused) in the command,
  otherwise by default 8000 port will conflict with federated server


  Dataset link: https://drive.google.com/drive/folders/11fclSnlnfEvgYukFkUk9ienmv7SzHmv2?usp=drive_link
  Please download respective client datasets and adjust the paths accordingly (preferably keep in PrivateServer/data directory).

  NOTE: adjust the directory of training_script
"""
load_dotenv()
environment = os.getenv("ENVIRONMENT")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Redis listeners")
    session_task = asyncio.create_task(redis_listener(notification.connected_websockets))
    round_task = asyncio.create_task(redis_round_listener())
    yield
    # Shutdown
    session_task.cancel()
    round_task.cancel()
    try:
        await session_task
    except asyncio.CancelledError:
        pass
    try:
        await round_task
    except asyncio.CancelledError:
        # This is expected
        pass


app = FastAPI(lifespan=lifespan)

origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,  # OR Define the origins that should be allowed to make requests 'origins = ["http://localhost:5173",]'
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(dataset.dataset_router)
app.include_router(dataset.file_upload_router)
app.include_router(training.model_router)
app.include_router(qpd.qpd_router)
app.include_router(notification.notification_router)


# Temporary testing endpoints
@app.get("/testing")
def testing():
    try:
        response = requests.get("http://localhost:8000/list-datasets")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return f"Error Connecting to FedServer: {e}"


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=9090)
# trigger reload to pick up new redis env configurations
