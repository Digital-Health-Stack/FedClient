from pydantic import BaseModel
from typing import Optional


class DatasetCreate(BaseModel):
    filename: str
    description: Optional[str] = None
    datastats: Optional[dict] = None


class DatasetResponse(DatasetCreate):
    dataset_id: int


class DatasetUpdate(BaseModel):
    dataset_id: int
    filename: str
    description: Optional[str] = None


class RawDatasetListResponse(BaseModel):
    dataset_id: int
    filename: str
    description: Optional[str] = None


class DatasetListResponse(BaseModel):
    dataset_id: int
    filename: str
    description: Optional[str] = None


class Operation(BaseModel):
    column: str
    operation: str
