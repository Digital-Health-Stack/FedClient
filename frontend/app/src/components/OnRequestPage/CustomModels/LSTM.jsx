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
  ClockIcon,
  ArrowPathIcon,
  GlobeAltIcon,
  DocumentTextIcon,
} from "@heroicons/react/24/outline";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";
import { useFormContext } from "react-hook-form";

const activationFunctions = {
  relu: "ReLU",
  sigmoid: "Sigmoid",
  tanh: "Tanh",
  softmax: "Softmax",
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
  lstm: "LSTM",
  bidirectional_lstm: "Bidirectional LSTM",
  embedding: "Embedding",
  masking: "Masking",
  time_distributed: "Time Distributed",
  global_max_pooling: "Global Max Pooling",
  global_average_pooling: "Global Average Pooling",
  dense: "Dense",
  batch_norm: "Batch Normalization",
  dropout: "Dropout",
};

const regularizerTypes = {
  l1: "L1",
  l2: "L2",
  l1_l2: "L1-L2",
};

const layerIcons = {
  lstm: <ClockIcon className="h-4 w-4" />,
  bidirectional_lstm: <ArrowPathIcon className="h-4 w-4" />,
  embedding: <DocumentTextIcon className="h-4 w-4" />,
  masking: <NoSymbolIcon className="h-4 w-4" />,
  time_distributed: <ViewColumnsIcon className="h-4 w-4" />,
  global_max_pooling: <GlobeAltIcon className="h-4 w-4" />,
  global_average_pooling: <GlobeAltIcon className="h-4 w-4" />,
  dense: <ChartBarIcon className="h-4 w-4" />,
  batch_norm: <AdjustmentsHorizontalIcon className="h-4 w-4" />,
  dropout: <NoSymbolIcon className="h-4 w-4" />,
};

const defaultValues = {
  input_shape: "(None, 128)",
  layers: [
    {
      layer_type: "embedding",
      input_dim: "10000",
      output_dim: "128",
      mask_zero: true,
    },
    {
      layer_type: "lstm",
      units: "64",
      return_sequences: true,
      dropout: "0.2",
      recurrent_dropout: "0.2",
    },
    {
      layer_type: "bidirectional_lstm",
      units: "32",
      return_sequences: false,
      dropout: "0.2",
      recurrent_dropout: "0.2",
    },
    {
      layer_type: "dropout",
      rate: "0.5",
    },
    {
      layer_type: "dense",
      num_nodes: "64",
      activation_function: "relu",
      regularizer: {
        type: "l2",
        factor: "0.01",
      },
    },
    {
      layer_type: "dropout",
      rate: "0.3",
    },
  ],
  loss: "binary_crossentropy",
  optimizer: {
    type: "adam",
    learning_rate: "0.001",
  },
  metrics: ["accuracy", "f1_score"],
  output_layer: {
    activation_function: "sigmoid",
    num_nodes: "1",
  },
};

const LSTM = () => {
  const { control, register, setValue } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "model_info.layers",
  });

  const handleAddLayer = (layerType) => {
    const baseConfig = { layer_type: layerType };

    switch (layerType) {
      case "lstm":
        append({
          ...baseConfig,
          units: "64",
          activation_function: "tanh",
          recurrent_activation: "sigmoid",
          return_sequences: false,
          dropout: "0.0",
          recurrent_dropout: "0.0",
        });
        break;
      case "bidirectional_lstm":
        append({
          ...baseConfig,
          units: "64",
          activation_function: "tanh",
          recurrent_activation: "sigmoid",
          return_sequences: false,
          dropout: "0.0",
          recurrent_dropout: "0.0",
        });
        break;
      case "embedding":
        append({
          ...baseConfig,
          input_dim: "10000",
          output_dim: "128",
          mask_zero: false,
        });
        break;
      case "masking":
        append({
          ...baseConfig,
          mask_value: "0.0",
        });
        break;
      case "time_distributed":
        append({
          ...baseConfig,
          num_nodes: "64",
          activation_function: "relu",
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
        lstm: "bg-blue-50 border-blue-200",
        bidirectional_lstm: "bg-indigo-50 border-indigo-200",
        embedding: "bg-purple-50 border-purple-200",
        masking: "bg-gray-50 border-gray-200",
        time_distributed: "bg-pink-50 border-pink-200",
        global_max_pooling: "bg-green-50 border-green-200",
        global_average_pooling: "bg-green-50 border-green-200",
        dense: "bg-green-50 border-green-200",
        batch_norm: "bg-indigo-50 border-indigo-200",
        dropout: "bg-red-50 border-red-200",
      }[layer.layer_type] || "bg-gray-50 border-gray-200";

    switch (layer.layer_type) {
      case "lstm":
        return (
          <div
            className={`mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="col-span-2 flex items-center gap-2">
              {layerIcons.lstm}
              <span className="font-semibold text-blue-700">LSTM Layer</span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="units"
                title="Number of LSTM units"
              >
                Units
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. 64"
                {...register(`model_info.layers.${index}.units`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="activation_function"
                title="Activation function for the LSTM layer"
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

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="recurrent_activation"
                title="Recurrent activation function"
              >
                Recurrent Activation
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                {...register(`model_info.layers.${index}.recurrent_activation`)}
              >
                <option value="sigmoid">Sigmoid</option>
                <option value="tanh">Tanh</option>
                <option value="relu">ReLU</option>
                <option value="linear">Linear</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="return_sequences"
                title="Whether to return the full sequence or just the last output"
              >
                Return Sequences
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                {...register(`model_info.layers.${index}.return_sequences`)}
              >
                <option value={false}>False</option>
                <option value={true}>True</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="dropout"
                title="Dropout rate for input connections"
              >
                Dropout Rate
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. 0.2"
                {...register(`model_info.layers.${index}.dropout`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="recurrent_dropout"
                title="Dropout rate for recurrent connections"
              >
                Recurrent Dropout
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-blue-500"
                placeholder="e.g. 0.2"
                {...register(`model_info.layers.${index}.recurrent_dropout`)}
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

      case "bidirectional_lstm":
        return (
          <div
            className={`mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="col-span-2 flex items-center gap-2">
              {layerIcons.bidirectional_lstm}
              <span className="font-semibold text-indigo-700">
                Bidirectional LSTM Layer
              </span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="units"
                title="Number of LSTM units"
              >
                Units
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. 64"
                {...register(`model_info.layers.${index}.units`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="activation_function"
                title="Activation function for the LSTM layer"
              >
                Activation
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500"
                {...register(`model_info.layers.${index}.activation_function`)}
              >
                {Object.keys(activationFunctions).map((key) => (
                  <option key={key} value={key}>
                    {activationFunctions[key]}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="recurrent_activation"
                title="Recurrent activation function"
              >
                Recurrent Activation
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500"
                {...register(`model_info.layers.${index}.recurrent_activation`)}
              >
                <option value="sigmoid">Sigmoid</option>
                <option value="tanh">Tanh</option>
                <option value="relu">ReLU</option>
                <option value="linear">Linear</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="return_sequences"
                title="Whether to return the full sequence or just the last output"
              >
                Return Sequences
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500"
                {...register(`model_info.layers.${index}.return_sequences`)}
              >
                <option value={false}>False</option>
                <option value={true}>True</option>
              </select>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="dropout"
                title="Dropout rate for input connections"
              >
                Dropout Rate
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. 0.2"
                {...register(`model_info.layers.${index}.dropout`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="recurrent_dropout"
                title="Dropout rate for recurrent connections"
              >
                Recurrent Dropout
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                max="1"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. 0.2"
                {...register(`model_info.layers.${index}.recurrent_dropout`)}
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

      case "embedding":
        return (
          <div
            className={`mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="col-span-2 flex items-center gap-2">
              {layerIcons.embedding}
              <span className="font-semibold text-purple-700">
                Embedding Layer
              </span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="input_dim"
                title="Size of the vocabulary"
              >
                Input Dimension
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                placeholder="e.g. 10000"
                {...register(`model_info.layers.${index}.input_dim`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="output_dim"
                title="Dimension of the dense embedding"
              >
                Output Dimension
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                placeholder="e.g. 128"
                {...register(`model_info.layers.${index}.output_dim`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="input_length"
                title="Length of input sequences"
              >
                Input Length
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                placeholder="e.g. 100 (optional)"
                {...register(`model_info.layers.${index}.input_length`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="mask_zero"
                title="Whether the input value 0 is a special padding value"
              >
                Mask Zero
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-purple-500"
                {...register(`model_info.layers.${index}.mask_zero`)}
              >
                <option value={false}>False</option>
                <option value={true}>True</option>
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

      case "masking":
        return (
          <div
            className={`mt-2 grid grid-cols-1 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="flex items-center gap-2">
              {layerIcons.masking}
              <span className="font-semibold text-gray-700">Masking Layer</span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="mask_value"
                title="Value to mask in the input"
              >
                Mask Value
              </label>
              <input
                type="number"
                step="0.1"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-gray-500"
                placeholder="e.g. 0.0"
                {...register(`model_info.layers.${index}.mask_value`)}
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

      case "time_distributed":
        return (
          <div
            className={`mt-2 grid grid-cols-1 md:grid-cols-2 gap-3 p-3 border rounded-lg ${layerColor}`}
          >
            <div className="col-span-2 flex items-center gap-2">
              {layerIcons.time_distributed}
              <span className="font-semibold text-pink-700">
                Time Distributed Layer
              </span>
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="num_nodes"
                title="Number of nodes in the dense layer"
              >
                Nodes
              </label>
              <input
                type="number"
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-pink-500"
                placeholder="e.g. 64"
                {...register(`model_info.layers.${index}.num_nodes`)}
              />
            </div>

            <div>
              <label
                className="block text-xs font-medium text-gray-600 mb-1"
                htmlFor="activation_function"
                title="Activation function for the dense layer"
              >
                Activation
              </label>
              <select
                className="w-full px-2 py-1 text-sm border rounded focus:ring-1 focus:ring-pink-500"
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

      case "global_max_pooling":
        return (
          <div
            className={`mt-2 p-2 border rounded-lg ${layerColor} flex justify-between items-center`}
          >
            <div className="flex items-center gap-2">
              {layerIcons.global_max_pooling}
              <span className="font-semibold text-green-700">
                Global Max Pooling
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

      case "global_average_pooling":
        return (
          <div
            className={`mt-2 p-2 border rounded-lg ${layerColor} flex justify-between items-center`}
          >
            <div className="flex items-center gap-2">
              {layerIcons.global_average_pooling}
              <span className="font-semibold text-green-700">
                Global Average Pooling
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
            placeholder="e.g., (None, 128)"
            {...register("model_info.input_shape")}
          />
        </div>
      </div>

      {/* Layers Section */}
      <div className="mb-4">
        <h5 className="text-sm font-semibold mb-2 flex items-center gap-1">
          <ClockIcon className="h-4 w-4 text-blue-500" />
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

      {/* Test Metrics Selection */}
      <div className="p-3 bg-white rounded-lg border">
        <SelectTestMetrics register={register} />
      </div>
    </div>
  );
};

export default LSTM;
