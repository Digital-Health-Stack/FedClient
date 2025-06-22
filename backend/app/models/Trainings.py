from models.Base import Base
from sqlalchemy import Column, Integer, JSON


class CurrentTrainings(Base):
    """All trainings that are currently in progress and the client is involved in"""

    __tablename__ = "current_trainings"
    training_id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, nullable=False, index=True)
    training_details = Column(JSON, nullable=False)

    def as_dict(self):
        return {
            "training_id": self.training_id,
            "session_id": self.session_id,
            "training_details": self.training_details,
        }
