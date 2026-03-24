from pydantic import BaseModel


class CreateTraining(BaseModel):
    session_id: int
    training_details: dict


class InitiateModelRequest(BaseModel):
    session_id: int
    client_token: str

class AcceptClientFilenameTrainingRequest(BaseModel):
    session_id: int
    client_filename: str