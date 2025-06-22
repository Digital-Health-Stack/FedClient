from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from dotenv import load_dotenv
import uvicorn
import requests
from contextlib import asynccontextmanager
import asyncio
from api import preprocessing_routes
from api import model_training_routes
from api import confidential_routers
from api import qpd_routers
from api import testing_routers
from api.Notification import notification_router, redis_listener

"""
  Don't start this server from terminal without specifying port (9000 or something unused) in the command,
  otherwise by default 8000 port will conflict with federated server


  Dataset link: https://drive.google.com/drive/folders/11fclSnlnfEvgYukFkUk9ienmv7SzHmv2?usp=drive_link
  Please download respective client datasets and adjust the paths accordingly (preferably keep in PrivateServer\data directory).

  NOTE: adjust the directory of training_script
"""
load_dotenv()
environment = os.getenv("ENVIRONMENT")


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    print("Starting Redis listener")
    task = asyncio.create_task(redis_listener())
    yield
    # Shutdown
    task.cancel()
    try:
        await task
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

# Including routers
app.include_router(preprocessing_routes.dataset_router)
app.include_router(model_training_routes.model_router)
app.include_router(confidential_routers.confidential_router)
app.include_router(qpd_routers.qpd_router)
app.include_router(testing_routers.test_router)
app.include_router(notification_router)


# Temporary testing endpoints
@app.get("/testing")
def testing():
    try:
        response = requests.get("http://host.docker.internal:8000/datasets")
        response.raise_for_status()
        return response.json()
    except Exception as e:
        return f"Error Connecting to FedServer: {e}"


if __name__ == "__main__":
    uvicorn.run(app, host="localhost", port=9090)
