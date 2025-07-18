import React from "react";
import { useFieldArray } from "react-hook-form";
import { useFormContext } from "react-hook-form";

const MultiLayerPerceptron = () => {
  const { register, control } = useFormContext();

  const lossFunctions = {
    mse: "Mean Squared Error",
    mae: "Mean Absolute Error",
    binaryCrossentropy: "Binary Cross Entropy",
    categoricalCrossentropy: "Categorical Cross Entropy",
    hinge: "Hinge",
    huber: "Huber",
    klDivergence: "Kullback-Leibler Divergence",
    logCosh: "Log-Cosh",
    poisson: "Poisson",
    sparseCategoricalCrossentropy: "Sparse Categorical Cross Entropy",
  };
  const optimizers = {
    sgd: "Stochastic Gradient Descent",
    rmsprop: "RMSprop (Root Mean Square Propagation)",
    adam: "Adam (Adaptive Moment Estimation)",
    adagrad: "Adagrad (Adaptive Gradient Algorithm)",
    adadelta: "Adadelta (Adaptive Delta)",
    adamax: "Adamax",
    nadam: "Nadam (Nesterov-accelerated Adaptive Moment Estimation)",
    ftrl: "FTRL (Follow-The-Regularized-Leader)",
    proximalSGD: "ProximalSGD",
    rmspropGraves: "RMSpropGraves",
  };
  const activationFunctions = {
    relu: "ReLU (Rectified Linear Unit)",
    sigmoid: "Sigmoid",
    tanh: "Tanh (Hyperbolic Tangent)",
    softmax: "Softmax",
    elu: "ELU (Exponential Linear Unit)",
    selu: "SELU (Scaled Exponential Linear Unit)",
    swish: "Swish",
    leakyRelu: "Leaky ReLU",
    prelu: "PReLU (Parametric ReLU)",
    thresholdedRelu: "Thresholded ReLU",
    hardSigmoid: "Hard Sigmoid",
    exponential: "Exponential",
    linear: "Linear",
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "model_info.intermediate_layer",
  });

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-2">
        <h5 className="text-lg font-semibold">Loss Function:</h5>
        <select
          className="border rounded p-2"
          id="lossFunction"
          {...register("model_info.loss_function")}
        >
          <option value="selectLossFunction">Select your Loss Function</option>
          {Object.keys(lossFunctions).map((lossFunctionValue) => (
            <option key={lossFunctionValue} value={lossFunctionValue}>
              {lossFunctions[lossFunctionValue]}
            </option>
          ))}
        </select>
      </div>

      <div className="flex justify-between items-center mb-2">
        <h5 className="text-lg font-semibold">Optimizer Function:</h5>
        <select
          className="border rounded p-2"
          {...register("model_info.optimizer")}
        >
          <option value="selectOptimizer">
            Select your Optimizer Function
          </option>
          {Object.keys(optimizers).map((optimizer_key) => (
            <option key={optimizer_key} value={optimizer_key}>
              {optimizers[optimizer_key]}
            </option>
          ))}
        </select>
      </div>

      <h5 className="text-lg font-semibold">Input Layer:</h5>
      <div className="flex space-x-2 mb-3">
        <input
          type="text"
          className="border rounded p-2 flex-1"
          placeholder="Input Shape of Dataset"
          {...register("model_info.input_layer.input_shape")}
        />
        <input
          type="text"
          className="border rounded p-2 flex-1"
          placeholder="Number of Nodes"
          {...register("model_info.input_layer.num_nodes")}
        />
        <select
          className="border rounded p-2"
          {...register("model_info.input_layer.activation_function")}
        >
          <option value="select-activation">Activation Function</option>
          {Object.keys(activationFunctions).map((activation_key) => (
            <option key={activation_key} value={activation_key}>
              {activationFunctions[activation_key]}
            </option>
          ))}
        </select>
      </div>

      <h5 className="text-lg font-semibold">Intermediate Layer:</h5>
      <div>
        {fields.map((field, index) => (
          <div key={field.id} className="flex space-x-2 mb-2 items-center">
            <input
              type="text"
              className="border rounded p-2 flex-1"
              placeholder="Number of Nodes"
              {...register(
                `model_info.intermediate_layer.${index}.feature_name`
              )}
            />
            <select
              className="border rounded p-2"
              {...register(
                `model_info.intermediate_layer.${index}.activation_function`
              )}
            >
              <option value="select-activation">Activation Function</option>
              {Object.keys(activationFunctions).map((activation_key) => (
                <option key={activation_key} value={activation_key}>
                  {activationFunctions[activation_key]}
                </option>
              ))}
            </select>
            <button
              className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              type="button"
              onClick={() => remove(index)}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        onClick={() => append()}
      >
        Add Intermediate Level
      </button>

      <h5 className="text-lg font-semibold">Output Layer:</h5>
      <div className="flex space-x-2 mb-3">
        <input
          type="text"
          className="border rounded p-2 flex-1"
          placeholder="Number of Nodes"
          {...register("model_info.output_layer.num_nodes")}
        />
        <select
          className="border rounded p-2"
          {...register("model_info.output_layer.activation_function")}
        >
          <option value="select-activation">Activation Function</option>
          {Object.keys(activationFunctions).map((activation_key) => (
            <option key={activation_key} value={activation_key}>
              {activationFunctions[activation_key]}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default MultiLayerPerceptron;
