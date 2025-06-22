from pydantic import BaseModel


class User(BaseModel):
    name: str
    data_path: str
    email: str


class Parameter(BaseModel):
    client_parameter: dict
    client_id: int


class ModelConfig(BaseModel):
    model: str
    config: dict


# Define the request body schema
class DownloadCombineRequest(BaseModel):
    filename: str
    session_id: str
    output_column: list


# modelConfig = {
#     "model": "LandMarkSVM",
#     "config": {
#         "C": 1.0,
#         "is_binary": False,
#         "kernel": "rbf",
#         "gamma": "auto",
#         "degree": 3,
#         "coef0": 0.0,
#         "lr": 0.01,
#         "n_iters": 100,
#         "landmarks": None,
#         "num_landmarks": 15,
#         "weights_shape": None
#     }
# }

# {
#     "model": "LandMarkSVM",
#     "config": {
#         "C": 1.0,
#         "is_binary": false,
#         "kernel": "rbf",
#         "gamma": "auto",
#         "degree": 3,
#         "coef0": 0.0,
#         "lr": 0.01,
#         "n_iters": 100,
#         "landmarks": null,
#         "num_landmarks": 15,
#         "weights_shape": null
#     }
# }
