import React from "react";
import { useFieldArray } from "react-hook-form";
import {
  XCircleIcon,
  PlusCircleIcon,
  CubeIcon,
  ArrowsPointingOutIcon,
  Squares2X2Icon,
  ViewColumnsIcon,
  ChartBarIcon,
  AdjustmentsHorizontalIcon,
  NoSymbolIcon,
} from "@heroicons/react/24/outline";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";
import { useFormContext } from "react-hook-form";

const activationFunctions = {
  relu: "ReLU",
  sigmoid: "Sigmoid",
  // tanh: "Tanh",
  softmax: "Softmax",
  // leakyRelu: "Leaky ReLU",
  // prelu: "PReLU",
  // thresholdedRelu: "Thresholded ReLU",
  // hardSigmoid: "Hard Sigmoid",
  // exponential: "Exponential",
  linear: "Linear",
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
  proximal_sgd: "ProximalSGD",
};

const lossFunctions = {
  mse: "Mean Squared Error",
  mae: "Mean Absolute Error",
  binary_crossentropy: "Binary Crossentropy",
  categorical_crossentropy: "Categorical Crossentropy",
  sparse_categorical_crossentropy: "Sparse Categorical Crossentropy",
};

const layerTypes = {
  convolution: "Convolutional",
  pooling: "Pooling",
  dense: "Dense",
  flatten: "Flatten",
  reshape: "Reshape",
  batch_norm: "Batch Normalization",
  dropout: "Dropout",
};

const poolingTypes = {
  max: "Max Pooling",
  average: "Average Pooling",
};

const regularizerTypes = {
  l1: "L1",
  l2: "L2",
  l1_l2: "L1-L2",
};

const layerIcons = {
  convolution: <ViewColumnsIcon className="h-4 w-4" />,
  pooling: <Squares2X2Icon className="h-4 w-4" />,
  dense: <ChartBarIcon className="h-4 w-4" />,
  flatten: <ArrowsPointingOutIcon className="h-4 w-4" />,
  reshape: <CubeIcon className="h-4 w-4" />,
  batch_norm: <AdjustmentsHorizontalIcon className="h-4 w-4" />,
  dropout: <NoSymbolIcon className="h-4 w-4" />,
};

const defaultValues = {
  input_shape: "(128,128,1)",
  layers: [
    {
      layer_type: "convolution",
      filters: "32",
      kernel_size: "(3,3)",
      stride: "(1,1)",
      padding: "same",
      activation_function: "relu",
    },
    {
      layer_type: "batch_norm",
    },
    {
      layer_type: "pooling",
      pooling_type: "max",
      pool_size: "(2,2)",
      stride: "(2,2)",
    },
    {
      layer_type: "convolution",
      filters: "64",
      kernel_size: "(3,3)",
      stride: "(1,1)",
      padding: "same",
      activation_function: "relu",
    },
    {
      layer_type: "batch_norm",
    },
    {
      layer_type: "pooling",
      pooling_type: "max",
      pool_size: "(2,2)",
      stride: "(2,2)",
    },
    {
      layer_type: "flatten",
    },
    {
      layer_type: "dense",
      num_nodes: "512",
      activation_function: "relu",
      regularizer: {
        type: "l2",
        factor: "0.01",
      },
    },
    {
      layer_type: "dropout",
      rate: "0.5",
    },
    {
      layer_type: "dense",
      num_nodes: "256",
      activation_function: "relu",
      regularizer: {
        type: "l2",
        factor: "0.01",
      },
    },
    {
      layer_type: "dropout",
      rate: "0.4",
    },
  ],
  loss: "mse",
  optimizer: {
    type: "adam",
    learning_rate: "0.001",
  },
  metrics: ["mae", "mse"],
  output_layer: {
    activation_function: "linear",
    num_nodes: "1",
  },
};

const CNN = () => {
  const { control, register, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "model_info.layers",
  });

  const handleAddLayer = (layerType) => {
    const baseConfig = { layer_type: layerType };

    switch (layerType) {
      case "convolution":
        append({
          ...baseConfig,
          filters: "32",
          kernel_size: "(3,3)",
          stride: "(1,1)",
          padding: "same",
          activation_function: "relu",
        });
        break;
      case "pooling":
        append({
          ...baseConfig,
          pooling_type: "max",
          pool_size: "(2,2)",
          stride: "(2,2)",
        });
        break;
      case "dense":
        append({
          ...baseConfig,
          num_nodes: "64",
          activation_function: "relu",
          regularizer: {
            type: "l2",
            factor: "0.01",
          },
        });
        break;
      case "reshape":
        append({
          ...baseConfig,
          target_shape: "(128,1)",
        });
        break;
      case "batch_norm":
        append(baseConfig);
        break;
      case "dropout":
        append({
          ...baseConfig,
          rate: "0.5",
        });
        break;
      default:
        append(baseConfig);
    }
  };

  const renderLayerConfig = (layer, index) => {
    if (!layer.layer_type) return null;

    const layerColor =
      {
        convolution: "bg-blue-50 border-blue-200",
        pooling: "bg-purple-50 border-purple-200",
        dense: "bg-green-50 border-green-200",
        flatten: "bg-yellow-50 border-yellow-200",
        reshape: "bg-orange-50 border-orange-200",
        batch_norm: "bg-indigo-50 border-indigo-200",
        dropout: "bg-red-50 border-red-200",
      }[layer.layer_type] || "bg-gray-50 border-gray-200";

    switch (layer.layer_type) {
      case "convolution":
        return (
          <div
            className={`mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="col-span-2 flex items-center gap-2">
              {layerIcons.convolution}
              <span className="font-semibold text-blue-700">
                Convolutional Layer
              </span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="filters"
                title="Number of filters to use in the convolutional layer"
              >
                Filters
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. 32"
                {...register(`model_info.layers.${index}.filters`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="kernel_size"
                title="Size of the kernel to use in the convolutional layer"
              >
                Kernel Size
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. (3,3)"
                {...register(`model_info.layers.${index}.kernel_size`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="stride"
                title="Ammount of kernel to move in the convolutional layer"
              >
                Stride
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. (1,1)"
                {...register(`model_info.layers.${index}.stride`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="padding"
                title="Padding to add to the input image in the convolutional layer"
              >
                Padding
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                {...register(`model_info.layers.${index}.padding`)}
              >
                <option value="same">Same</option>
                <option value="valid">Valid</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="activation_function"
                title="Activation function to be used in the convolutional layer"
              >
                Activation
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                {...register(`model_info.layers.${index}.activation_function`)}
              >
                {Object.keys(activationFunctions).map((key) => (
                  <option key={key} value={key}>
                    {activationFunctions[key]}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2 flex justify-end">
              <button
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                type="button"
                onClick={() => remove(index)}
              >
                <XCircleIcon className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        );
      case "pooling":
        return (
          <div
            className={`mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="col-span-2 flex items-center gap-2">
              {layerIcons.pooling}
              <span className="font-semibold text-purple-700">
                Pooling Layer
              </span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="pooling_type"
                title="Type of pooling to be used in the pooling layer"
              >
                Pooling Type
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                {...register(`model_info.layers.${index}.pooling_type`)}
              >
                {Object.keys(poolingTypes).map((key) => (
                  <option key={key} value={key}>
                    {poolingTypes[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="pool_size"
                title="Size of the pooling window to be used in the pooling layer"
              >
                Pool Size
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                placeholder="e.g. (2,2)"
                {...register(`model_info.layers.${index}.pool_size`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="stride"
                title="Ammount of kernel to move in the pooling layer"
              >
                Stride
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                placeholder="e.g. (2,2)"
                {...register(`model_info.layers.${index}.stride`)}
              />
            </div>

            <div className="col-span-2 flex justify-end">
              <button
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                type="button"
                onClick={() => remove(index)}
              >
                <XCircleIcon className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        );
      case "dense":
        return (
          <div
            className={`mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="col-span-2 flex items-center gap-2">
              {layerIcons.dense}
              <span className="font-semibold text-green-700">Dense Layer</span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="num_nodes"
                title="Number of nodes to use in the dense layer"
              >
                Nodes
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500"
                placeholder="e.g. 64"
                {...register(`model_info.layers.${index}.num_nodes`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="activation_function"
                title="Activation function to be used in the dense layer"
              >
                Activation
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500"
                {...register(`model_info.layers.${index}.activation_function`)}
              >
                {Object.keys(activationFunctions).map((key) => (
                  <option key={key} value={key}>
                    {activationFunctions[key]}
                  </option>
                ))}
              </select>
            </div>

            <div className="col-span-2">
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="regularizer"
                title="Regularizer to be used in the dense layer"
              >
                Regularizer
              </label>
              <div className="grid grid-cols-2 gap-2">
                <select
                  className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500"
                  {...register(`model_info.layers.${index}.regularizer.type`)}
                >
                  <option value="">None</option>
                  {Object.keys(regularizerTypes).map((key) => (
                    <option key={key} value={key}>
                      {regularizerTypes[key]}
                    </option>
                  ))}
                </select>
                <input
                  type="number"
                  step="0.001"
                  className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-green-500"
                  placeholder="Factor (e.g. 0.01)"
                  {...register(`model_info.layers.${index}.regularizer.factor`)}
                />
              </div>
            </div>

            <div className="col-span-2 flex justify-end">
              <button
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                type="button"
                onClick={() => remove(index)}
              >
                <XCircleIcon className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        );
      case "batch_norm":
        return (
          <div
            className={`mt-2 p-3 border rounded-lg ${layerColor} flex justify-between items-center`}
          >
            <div className="flex items-center gap-2">
              {layerIcons.batch_norm}
              <span className="font-semibold text-indigo-700">
                Batch Normalization
              </span>
            </div>
            <button
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
              type="button"
              onClick={() => remove(index)}
            >
              <XCircleIcon className="h-3 w-3" /> Remove
            </button>
          </div>
        );

      case "dropout":
        return (
          <div
            className={`mt-2 grid grid-cols-1 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="flex items-center gap-2">
              {layerIcons.dropout}
              <span className="font-semibold text-red-700">Dropout Layer</span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="rate"
                title="Percentage of neurons to be dropped in the dropout layer"
              >
                Dropout Rate
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-red-500"
                placeholder="e.g. 0.5"
                {...register(`model_info.layers.${index}.rate`)}
              />
            </div>

            <div className="flex justify-end">
              <button
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                type="button"
                onClick={() => remove(index)}
              >
                <XCircleIcon className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        );

      case "flatten":
        return (
          <div
            className={`mt-2 p-2 border rounded-lg ${layerColor} flex justify-between items-center`}
          >
            <div className="flex items-center gap-2">
              {layerIcons.flatten}
              <span className="font-semibold text-yellow-700">
                Flatten Layer
              </span>
            </div>
            <button
              className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
              type="button"
              onClick={() => remove(index)}
            >
              <XCircleIcon className="h-3 w-3" /> Remove
            </button>
          </div>
        );
      case "reshape":
        return (
          <div
            className={`mt-2 grid grid-cols-1 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="flex items-center gap-2">
              {layerIcons.reshape}
              <span className="font-semibold text-orange-700">
                Reshape Layer
              </span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="target_shape"
                title="Target shape to be used in the reshape layer"
              >
                Target Shape
              </label>
              <input
                type="text"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-orange-500"
                placeholder="e.g. (512,1)"
                {...register(`model_info.layers.${index}.target_shape`)}
              />
            </div>

            <div className="flex justify-end">
              <button
                className="text-xs px-2 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 flex items-center gap-1"
                type="button"
                onClick={() => remove(index)}
              >
                <XCircleIcon className="h-3 w-3" /> Remove
              </button>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg">
      {/* Input Layer */}
      <div className="mb-4 p-3 bg-white rounded-lg border">
        <h5 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <CubeIcon className="h-4 w-4 text-blue-500" />
          <span>Input Layer</span>
        </h5>
        <div className="flex flex-col space-y-2">
          <label
            className="text-xs font-medium"
            htmlFor="input_shape"
            title="Shape of the expected input in the input layer"
          >
            Input Shape:
          </label>
          <input
            type="text"
            className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
            placeholder="e.g., (128,128,1)"
            {...register("model_info.input_shape")}
          />
        </div>
      </div>

      {/* Layers Section */}
      <div className="mb-4">
        <h5 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <ViewColumnsIcon className="h-4 w-4 text-blue-500" />
          <span>Model Layers</span>
        </h5>
        <div className="space-y-2">
          {fields.map((layer, index) => (
            <div key={layer.id} className="bg-white p-2 rounded-lg border">
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium">
                  Layer {index + 1}:
                </label>
                <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 rounded text-sm text-gray-600">
                  {layerIcons[layer.layer_type] || (
                    <CubeIcon className="h-3 w-3" />
                  )}
                  <span>
                    {layerTypes[layer.layer_type] || "Select Layer Type"}
                  </span>
                </div>
              </div>
              {renderLayerConfig(layer, index)}
            </div>
          ))}
        </div>
      </div>

      {/* Add Layer Buttons */}
      <div className="mb-6">
        <h5 className="text-xs font-medium mb-2">Add New Layer:</h5>
        <div className="flex flex-wrap gap-2">
          {Object.keys(layerTypes).map((key) => (
            <button
              key={key}
              type="button"
              className="px-2 py-1 text-xs bg-blue-50 text-blue-700 rounded hover:bg-blue-100 flex items-center space-x-1 border border-blue-100"
              onClick={() => handleAddLayer(key)}
            >
              <PlusCircleIcon className="h-3 w-3" />
              <span title={`Add ${layerTypes[key]} layer`}>
                {layerTypes[key]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Output Layer */}
      <div className="mb-4 p-3 bg-white rounded-lg border">
        <h5 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <ChartBarIcon className="h-4 w-4 text-blue-500" />
          <span>Output Layer</span>
        </h5>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div>
            <label
              className="block text-xs font-medium text-gray-600 mb-1"
              htmlFor="num_nodes"
              title="Number of nodes to use in the output layer"
            >
              Nodes
            </label>
            <input
              type="number"
              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
              placeholder="Number of Nodes"
              {...register("model_info.output_layer.num_nodes")}
            />
          </div>
          <div>
            <label
              className="block text-xs font-medium text-gray-600 mb-1"
              htmlFor="activation_function"
              title="Activation function to be used in the output layer"
            >
              Activation
            </label>
            <select
              className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
              {...register("model_info.output_layer.activation_function")}
            >
              {Object.keys(activationFunctions).map((key) => (
                <option key={key} value={key}>
                  {activationFunctions[key]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Loss Function Selection */}
      <div className="mb-3 p-3 bg-white rounded-lg border">
        <label
          className="block text-xs font-medium text-gray-600 mb-1"
          htmlFor="loss"
          title="Loss function to be used in the model"
        >
          Loss Function:
        </label>
        <select
          className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
          {...register("model_info.loss")}
        >
          {Object.keys(lossFunctions).map((key) => (
            <option key={key} value={key}>
              {lossFunctions[key]}
            </option>
          ))}
        </select>
      </div>

      {/* Optimizer Selection */}
      <div className="mb-3 p-3 bg-white rounded-lg border">
        <label
          className="block text-xs font-medium text-gray-600 mb-1"
          htmlFor="optimizer"
          title="Optimizer to be used in the model"
        >
          Optimizer:
        </label>
        <div className="grid grid-cols-2 gap-3">
          <select
            className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
            {...register("model_info.optimizer.type")}
          >
            {Object.keys(optimizers).map((key) => (
              <option key={key} value={key}>
                {optimizers[key]}
              </option>
            ))}
          </select>
          <input
            type="number"
            step="0.0001"
            className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
            placeholder="Learning Rate"
            {...register("model_info.optimizer.learning_rate")}
          />
        </div>
      </div>

      {/* Metrics Selection */}
      {/* <div className="mb-3 p-3 bg-white rounded-lg border">
        <label className="block text-xs font-medium text-gray-600 mb-1">
          Metrics:
        </label>
        <div className="space-y-2">
          {['mae', 'mse', 'accuracy'].map(metric => (
            <label key={metric} className="flex items-center space-x-2">
              <input
                type="checkbox"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                {...register(`model_info.metrics.${metric}`)}
              />
              <span className="text-sm text-gray-700">
                {metric.toUpperCase()}
              </span>
            </label>
          ))}
        </div>
      </div> */}

      {/* Test Metrics Selection */}
      <div className="p-3 bg-white rounded-lg border">
        <SelectTestMetrics register={register} />
      </div>
    </div>
  );
};

export default CNN;
