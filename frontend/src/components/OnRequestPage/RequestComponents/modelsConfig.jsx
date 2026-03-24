import LinearRegression from "../CustomModels/LinearRegression";
import CustomSVM from "../CustomModels/CustomSVM";
import CustomSVR from "../CustomModels/CustomSVR";
import LandMarkSVM from "../CustomModels/LandMarkSVM";
import MultiLayerPerceptron from "../CustomModels/MultiLayerPerceptron";
import CNN from "../CustomModels/CNN";
import LSTM from "../CustomModels/LSTM";
import LogisticRegression from "../CustomModels/LogisticRegression";
import DecisionTree from "../CustomModels/DecisionTree";
import RandomForest from "../CustomModels/RandomForest";
import XGBoostRegressor from "../CustomModels/XGBoostRegressor";
export const availableModels = {
  LinearRegression: {
    label: "Linear Regression",
    component: LinearRegression,
  },
  LogisticRegression: {
    label: "Logistic Regression",
    component: LogisticRegression,
  },
  multiLayerPerceptron: {
    label: "Multi-Layer Perceptron",
    component: MultiLayerPerceptron,
  },
  CNN: {
    label: "CNN",
    component: CNN,
  },
  // LSTM: {
  //   label: "LSTM",
  //   component: LSTM,
  // },
  SVM: {
    label: "SVM",
    component: CustomSVM,
  },
  SVR: {
    label: "SVR (Regression)",
    component: CustomSVR,
  },
  DecisionTree: {
    label: "Decision Tree Classifier",
    component: (props) => <DecisionTree {...props} taskType="classification" />,
  },
  DecisionTreeRegressor: {
    label: "Decision Tree Regressor",
    component: (props) => <DecisionTree {...props} taskType="regression" />,
    backendModelName: "DecisionTree",
  },
  RandomForest: {
    label: "Random Forest",
    component: RandomForest,
  },
  XGBoostRegressor: {
    label: "XGBoost Regressor",
    component: XGBoostRegressor,
  },
};
