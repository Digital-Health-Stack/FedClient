import os
from dotenv import load_dotenv
import redis.asyncio as redis

load_dotenv()

# Redis connection for get/set operations (key-value storage)
redis_client = redis.Redis(
    host=os.environ.get("REDIS_URL", "localhost"),
    port=int(os.environ.get("REDIS_PORT", 6380)),
    password=os.environ.get("REDIS_PASSWORD", "123456"),
    decode_responses=True,  # Automatically decode responses to strings
    db=0,  # Use database 0 for key-value operations
)

# Redis connection for pubsub operations
redis_pubsub = redis.Redis(
    host=os.environ.get("REDIS_URL", "localhost"),
    port=int(os.environ.get("REDIS_PORT", 6380)),
    password=os.environ.get("REDIS_PASSWORD", "123456"),
    decode_responses=True,  # Automatically decode responses to strings
    db=0,  # Use database 0 for pubsub operations
)
# Redis connection for pubsub operations
redis_pubsub2 = redis.Redis(
    host=os.environ.get("REDIS_URL", "localhost"),
    port=int(os.environ.get("REDIS_PORT", 6380)),
    password=os.environ.get("REDIS_PASSWORD", "123456"),
    decode_responses=True,  # Automatically decode responses to strings
    db=0,  # Use database 0 for pubsub operations
)
