import LinearRegression from "../CustomModels/LinearRegression";
import CustomSVM from "../CustomModels/CustomSVM";
import LandMarkSVM from "../CustomModels/LandMarkSVM";
import MultiLayerPerceptron from "../CustomModels/MultiLayerPerceptron";
import CNN from "../CustomModels/CNN";

export const availableModels = {
  // LinearRegression: {
  //   label: "Linear Regression",
  //   component: LinearRegression,
  // },
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
};
