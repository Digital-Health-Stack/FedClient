from sqlalchemy import Column, Integer, String, JSON
from models.Base import Base


class RawDataset(Base):
    __tablename__ = "raw_datasets"
    dataset_id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, nullable=False, index=True)
    description = Column(String, nullable=True)
    datastats = Column(JSON)

    def as_dict(self):
        return {
            "dataset_id": self.dataset_id,
            "filename": self.filename,
            "description": self.description,
            "datastats": self.datastats,
        }


class Dataset(Base):
    __tablename__ = "datasets"
    dataset_id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), unique=True, nullable=False, index=True)
    description = Column(String, nullable=True)
    datastats = Column(JSON, nullable=True)

    def as_dict(self):
        return {
            "dataset_id": self.dataset_id,
            "filename": self.filename,
            "description": self.description,
            "datastats": self.datastats,
        }
