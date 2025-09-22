import LinearRegression from "../CustomModels/LinearRegression";
import CustomSVM from "../CustomModels/CustomSVM";
import LandMarkSVM from "../CustomModels/LandMarkSVM";
import MultiLayerPerceptron from "../CustomModels/MultiLayerPerceptron";
import CNN from "../CustomModels/CNN";
import LSTM from "../CustomModels/LSTM";
import LogisticRegression from "../CustomModels/LogisticRegression";
import DecisionTree from "../CustomModels/DecisionTree";
export const availableModels = {
  LinearRegression: {
    label: "Linear Regression",
    component: LinearRegression,
  },
  LogisticRegression: {
    label: "Logistic Regression",
    component: LogisticRegression,
  },
  // SVM: {
  //   label: "SVM",
  //   component: CustomSVM,
  // },
  // LandMarkSVM: {
  //   label: "LandMark SVM",
  //   component: LandMarkSVM,
  // },
  // multiLayerPerceptron: {
  //   label: "Multi Layer Perceptron",
  //   component: MultiLayerPerceptron,
  // },
  CNN: {
    label: "CNN",
    component: CNN,
  },
  LSTM: {
    label: "LSTM",
    component: LSTM,
  },
  SVM: {
    label: "SVM",
    component: CustomSVM,
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
};
