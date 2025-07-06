import os
from dotenv import load_dotenv
import redis.asyncio as redis

load_dotenv()
redis_bhai = redis.Redis(
    host=os.environ.get("REDIS_URL", "localhost"),
    port=int(os.environ.get("REDIS_PORT", 6380)),
    password=os.environ.get("REDIS_PASSWORD", "123456"),
)
