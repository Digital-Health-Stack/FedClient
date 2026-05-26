from .custom_models.CustomLSTM import CustomLSTM
from .custom_models.LandMarkSVM import LandMarkSVM
from .custom_models.CustomSVM import CustomSVM
from .custom_models.LinearRegression import LinearRegression
from .custom_models.MultiLayerPerceptron import MultiLayerPerceptron
from .custom_models.CustomCNN import CustomCNN
from .custom_models.LogisticRegression import LogisticRegression
from .custom_models.DecisionTree import DecisionTree
from .custom_models.RandomForest import RandomForest
from .custom_models.XGBoostRegressor import XGBoostRegressor
from .custom_models.CustomSVR import CustomSVR
from .custom_models.LassoRegression import LassoRegression
from .custom_models.RidgeRegression import RidgeRegression
from .custom_models.KNNClassifier import KNNClassifier
import json

model_classes = {
    "LinearRegression": LinearRegression,
    "SVM": CustomSVM,
    "SVR": CustomSVR,
    "LandMarkSVM": LandMarkSVM,
    "multiLayerPerceptron": MultiLayerPerceptron,
    "CNN": CustomCNN,
    "LSTM": CustomLSTM,
    "LogisticRegression": LogisticRegression,
    "DecisionTree": DecisionTree,
    "RandomForest": RandomForest,
    "XGBoostRegressor": XGBoostRegressor,
    "LassoRegression": LassoRegression,
    "RidgeRegression": RidgeRegression,
    "KNNClassifier": KNNClassifier,
}


def model_instance_from_config(modelConfig):
    try:
        model_name = modelConfig["model_name"]
        config = modelConfig["model_info"]
        model_class = model_classes.get(model_name)

        if model_class is None:
            raise ValueError(f"Unknown model: {model_name}")

        model_instance = model_class(config)
        return model_instance

    except Exception as e:
        print(f"Error creating model instance: {e}")
        return None
