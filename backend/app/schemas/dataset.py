from pydantic import BaseModel
from typing import Optional, List


class DatasetCreate(BaseModel):
    filename: str
    description: Optional[str] = None
    datastats: Optional[dict] = None


class DatasetResponse(DatasetCreate):
    pass


class DatasetUpdate(BaseModel):
    """Rename/edit: provide current file name as old_filename when changing name."""

    old_filename: str
    filename: str
    description: Optional[str] = None


class DatasetListItem(BaseModel):
    filename: str
    description: Optional[str] = None


class DatasetListWithCountResponse(BaseModel):
    datasets: List[DatasetListItem]
    total: int


class Operation(BaseModel):
    column: str
    operation: str
