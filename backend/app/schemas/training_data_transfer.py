from typing import Dict, Any
from typing import Optional
from pydantic import BaseModel


class TransferCreate(BaseModel):
    training_name: str
    num_datapoints: int
    data_path: str
    parent_filename: str
    datastats: Optional[dict] = None
    federated_session_id: int


class SubmitPrice(BaseModel):
    session_id: int
    session_price: int
    client_token: str
