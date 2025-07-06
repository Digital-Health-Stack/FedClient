from fastapi import APIRouter
from schemas.training_data_transfer import SaveToken
from utility.redis import redis_bhai as redis_client

utils_router = APIRouter(tags=["Utils"])


@utils_router.post("/save-token", status_code=201)
async def save_token_endpoint(request: SaveToken):
    # -------------------------------------------------------------------
    # Save the client token to the database
    # -------------------------------------------------------------------
    client_token = request.client_token
    await redis_client.set(f"client_token", client_token)
    return {"message": "Token saved successfully."}


@utils_router.delete("/remove-token", status_code=200)
async def remove_token_endpoint():
    # -------------------------------------------------------------------
    # Remove the client token from the database
    # -------------------------------------------------------------------
    await redis_client.delete("client_token")
    return {"message": "Token removed successfully."}
