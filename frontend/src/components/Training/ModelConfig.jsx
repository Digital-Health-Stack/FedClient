import { InformationCircleIcon } from "@heroicons/react/24/outline";
import FeatureList from "./FeatureList";
import InfoItem from "./InfoItem";
import LayerInfo from "./LayerInfo";

const ModelConfig = ({ data }) => {
  const modelType = data?.model_name || data?.model_info?.model_type;

  // Helper function to render model-specific configuration
  const renderModelSpecificConfig = () => {
    const modelInfo = data?.model_info;

    switch (modelType) {
      case "LinearRegression":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <InfoItem label="Learning Rate" value={modelInfo?.lr} />
            <InfoItem label="Number of Iterations" value={modelInfo?.n_iters} />
            {modelInfo?.regularization && (
              <InfoItem
                label="Regularization"
                value={modelInfo.regularization}
              />
            )}
          </div>
        );

      case "SVM":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem label="Regularization (C)" value={modelInfo?.C} />
              <InfoItem label="Max Iterations" value={modelInfo?.max_iter} />
              <InfoItem label="Learning Rate" value={modelInfo?.lr} />
              <InfoItem label="Weight Shape" value={modelInfo?.weights_shape} />
              <InfoItem
                label="Binary Classification"
                value={
                  modelInfo?.is_binary === "true"
                    ? "Yes"
                    : modelInfo?.is_binary === "false"
                    ? "No"
                    : modelInfo?.is_binary
                }
              />
            </div>
          </div>
        );

      case "LandMarkSVM":
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <InfoItem label="Regularization (C)" value={modelInfo?.C} />
            <InfoItem label="Gamma" value={modelInfo?.gamma} />
            <InfoItem label="Degree" value={modelInfo?.degree} />
            <InfoItem label="Coef0" value={modelInfo?.coef0} />
            <InfoItem label="Learning Rate" value={modelInfo?.lr} />
            <InfoItem label="Number of Iterations" value={modelInfo?.n_iters} />
            <InfoItem label="Weight Shape" value={modelInfo?.weights_shape} />
            <InfoItem label="Kernel" value={modelInfo?.kernel} />
            <InfoItem
              label="Number of Landmarks"
              value={modelInfo?.num_landmarks}
            />
            <InfoItem
              label="Binary Classification"
              value={modelInfo?.binary_classification ? "Yes" : "No"}
            />
          </div>
        );

      case "multiLayerPerceptron":
        // Align the MLP display style with CNN and use MLP form schema
        const activationMap = {
          relu: "ReLU",
          tanh: "Tanh",
          logistic: "Sigmoid (logistic)",
          identity: "Identity",
        };

        return (
          <div className="space-y-6">
            {/* Core Params (styled like CNN header grids) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem label="Task Type" value={modelInfo?.task_type} />
              {modelInfo?.num_classes !== undefined && (
                <InfoItem label="Num Classes" value={modelInfo?.num_classes} />
              )}
              <InfoItem
                label="Activation"
                value={
                  activationMap[modelInfo?.activation] || modelInfo?.activation
                }
              />
              <InfoItem
                label="Learning Rate"
                value={modelInfo?.learning_rate}
              />
              <InfoItem label="Max Iterations" value={modelInfo?.max_iter} />
              <InfoItem label="Alpha (L2)" value={modelInfo?.alpha} />
              <InfoItem label="Random State" value={modelInfo?.random_state} />
            </div>

            {/* Architecture - Hidden Layers like CNN's layers list */}
            {Array.isArray(modelInfo?.hidden_layer_sizes) &&
              modelInfo.hidden_layer_sizes.length > 0 && (
                <div className="rounded-lg">
                  <h4 className="text-lg font-semibold text-gray-700 mb-2">
                    Model Architecture
                  </h4>
                  <div className="space-y-3">
                    {modelInfo.hidden_layer_sizes.map((nodes, index) => (
                      <div
                        key={index}
                        className="bg-white rounded-lg p-3 border"
                      >
                        <h6 className="font-semibold text-gray-700 mb-2">
                          Layer {index + 1}: Dense
                        </h6>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-gray-500">Units:</span>{" "}
                            <span className="font-medium">{nodes}</span>
                          </div>
                          <div>
                            <span className="text-gray-500">Activation:</span>{" "}
                            <span className="font-medium">
                              {activationMap[modelInfo?.activation] ||
                                modelInfo?.activation}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            {/* Output section for classification (nodes inferred from classes) */}
            {modelInfo?.task_type === "classification" && (
              <div className="rounded-lg">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Output Layer
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    label="Number of Nodes"
                    value={modelInfo?.num_classes}
                  />
                  {/* Activation is not explicitly captured in MLP form; omit to avoid misinformation */}
                </div>
              </div>
            )}

            {/* Test Metrics (already rendered globally below if present) */}
          </div>
        );

      case "CNN":
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
          binary_crossentropy: "Binary Cross Entropy",
          categorical_crossentropy: "Categorical Cross Entropy",
          sparse_categorical_crossentropy: "Sparse Categorical Cross Entropy",
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
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem label="Input Shape" value={modelInfo?.input_shape} />
              <InfoItem
                label="Loss Function"
                value={lossFunctions[modelInfo?.loss]}
              />
              <InfoItem
                label="Optimizer"
                value={
                  modelInfo?.optimizer
                    ? typeof modelInfo.optimizer === "string"
                      ? modelInfo.optimizer
                      : `${optimizers[modelInfo.optimizer.type] || "Unknown"}`
                    : "N/A"
                }
              />
              <InfoItem
                label="Learning Rate"
                value={modelInfo?.optimizer?.learning_rate}
              />
            </div>

            {/* Model Layers */}
            {modelInfo?.layers && modelInfo.layers.length > 0 && (
              <div className="rounded-lg">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Model Architecture
                </h4>
                <div className="space-y-3">
                  {modelInfo.layers.map((layer, index) => (
                    <div key={index} className="bg-white rounded-lg p-3 border">
                      <h6 className="font-semibold text-gray-700 mb-2">
                        Layer {index + 1}:{" "}
                        {layerTypes[layer.layer_type] || layer.layer_type}
                      </h6>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                        {layer.layer_type === "convolution" && (
                          <>
                            <div>
                              <span className="text-gray-500">Filters:</span>{" "}
                              <span className="font-medium">
                                {layer.filters}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Kernel:</span>{" "}
                              <span className="font-medium">
                                {layer.kernel_size}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Stride:</span>{" "}
                              <span className="font-medium">
                                {layer.stride}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Padding:</span>{" "}
                              <span className="font-medium">
                                {layer.padding}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Activation:</span>{" "}
                              <span className="font-medium">
                                {activationFunctions[
                                  layer.activation_function
                                ] || layer.activation_function}
                              </span>
                            </div>
                          </>
                        )}
                        {layer.layer_type === "pooling" && (
                          <>
                            <div>
                              <span className="text-gray-500">Type:</span>{" "}
                              <span className="font-medium">
                                {poolingTypes[layer.pooling_type] ||
                                  layer.pooling_type}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Pool Size:</span>{" "}
                              <span className="font-medium">
                                {layer.pool_size}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Stride:</span>{" "}
                              <span className="font-medium">
                                {layer.stride}
                              </span>
                            </div>
                          </>
                        )}
                        {layer.layer_type === "dense" && (
                          <>
                            <div>
                              <span className="text-gray-500">Units:</span>{" "}
                              <span className="font-medium">
                                {layer.num_nodes}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-500">Activation:</span>{" "}
                              <span className="font-medium">
                                {activationFunctions[
                                  layer.activation_function
                                ] || layer.activation_function}
                              </span>
                            </div>
                          </>
                        )}
                        {layer.layer_type === "dropout" && (
                          <div>
                            <span className="text-gray-500">Rate:</span>{" "}
                            <span className="font-medium">{layer.rate}</span>
                          </div>
                        )}
                        {layer.layer_type === "flatten" && (
                          <div className="text-gray-500 italic">
                            Flattens input
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Output Layer */}
            {modelInfo?.output_layer && (
              <div className="rounded-lg">
                <h4 className="text-lg font-semibold text-gray-700 mb-2">
                  Output Layer
                </h4>
                {/* <h5 className="font-medium text-gray-800 mb-3">
                  Output Layer
                </h5> */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    label="Number of Nodes"
                    value={modelInfo.output_layer.num_nodes}
                  />
                  <InfoItem
                    label="Activation"
                    value={
                      activationFunctions[
                        modelInfo.output_layer.activation_function
                      ]
                    }
                  />
                </div>
              </div>
            )}

            {/* Training Parameters */}
            {/* <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-3">
                Training Parameters
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Batch Size" value={modelInfo?.batch_size} />
                <InfoItem label="Epochs" value={modelInfo?.epochs} />
              </div>
            </div> */}
          </div>
        );

      case "LSTM":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem label="Input Shape" value={modelInfo?.input_shape} />
              <InfoItem
                label="Loss Function"
                value={modelInfo?.loss_function}
              />
              <InfoItem
                label="Optimizer"
                value={
                  modelInfo?.optimizer
                    ? typeof modelInfo.optimizer === "string"
                      ? modelInfo.optimizer
                      : `${modelInfo.optimizer.type || "Unknown"} (lr: ${
                          modelInfo.optimizer.learning_rate || "N/A"
                        })`
                    : "N/A"
                }
              />
              <InfoItem
                label="Learning Rate"
                value={modelInfo?.learning_rate}
              />
            </div>

            {/* LSTM Layers */}
            {modelInfo?.lstm_layers && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-3">LSTM Layers</h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoItem
                    label="Number of Layers"
                    value={modelInfo.lstm_layers.num_layers}
                  />
                  <InfoItem label="Units" value={modelInfo.lstm_layers.units} />
                  <InfoItem
                    label="Return Sequences"
                    value={
                      modelInfo.lstm_layers.return_sequences ? "Yes" : "No"
                    }
                  />
                  <InfoItem
                    label="Dropout Rate"
                    value={modelInfo.lstm_layers.dropout_rate}
                  />
                  <InfoItem
                    label="Recurrent Dropout"
                    value={modelInfo.lstm_layers.recurrent_dropout}
                  />
                  <InfoItem
                    label="Activation"
                    value={modelInfo.lstm_layers.activation}
                  />
                </div>
              </div>
            )}

            {/* Dense Layers */}
            {modelInfo?.dense_layers && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-3">
                  Dense Layers
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoItem
                    label="Number of Layers"
                    value={modelInfo.dense_layers.num_layers}
                  />
                  <InfoItem
                    label="Nodes"
                    value={modelInfo.dense_layers.nodes}
                  />
                  <InfoItem
                    label="Activation"
                    value={modelInfo.dense_layers.activation}
                  />
                  <InfoItem
                    label="Dropout Rate"
                    value={modelInfo.dense_layers.dropout_rate}
                  />
                </div>
              </div>
            )}

            {/* Output Layer */}
            {modelInfo?.output_layer && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h5 className="font-medium text-yellow-800 mb-3">
                  Output Layer
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    label="Number of Nodes"
                    value={modelInfo.output_layer.num_nodes}
                  />
                  <InfoItem
                    label="Activation"
                    value={modelInfo.output_layer.activation}
                  />
                </div>
              </div>
            )}

            {/* Training Parameters */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-medium text-gray-800 mb-3">
                Training Parameters
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InfoItem label="Batch Size" value={modelInfo?.batch_size} />
                <InfoItem label="Epochs" value={modelInfo?.epochs} />
                <InfoItem
                  label="Validation Split"
                  value={modelInfo?.validation_split}
                />
              </div>
            </div>
          </div>
        );

      case "DecisionTree":
        return (
          <div className="space-y-6">
            {/* Core Hyperparameters (aligned with CNN/MLP header grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem label="Task Type" value={modelInfo?.task_type} />
              <InfoItem label="Max Depth" value={modelInfo?.max_depth} />
              <InfoItem
                label="Min Samples Split"
                value={modelInfo?.min_samples_split}
              />
              <InfoItem
                label="Min Samples Leaf"
                value={modelInfo?.min_samples_leaf}
              />
            </div>

            {/* No layered architecture for Decision Trees; parameters above suffice */}
          </div>
        );

      case "RandomForest":
        return (
          <div className="space-y-6">
            {/* Core Hyperparameters (aligned with CNN/MLP header grid) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem label="Estimators" value={modelInfo?.n_estimators} />
              <InfoItem label="Max Depth" value={modelInfo?.max_depth} />
              <InfoItem
                label="Min Samples Split"
                value={modelInfo?.min_samples_split}
              />
              <InfoItem
                label="Min Samples Leaf"
                value={modelInfo?.min_samples_leaf}
              />
            </div>

            {/* No layered architecture for Random Forest; parameters above suffice */}
          </div>
        );

      case "SVR":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem label="Regularization (C)" value={modelInfo?.C} />
              <InfoItem label="Epsilon" value={modelInfo?.epsilon} />
              <InfoItem label="Kernel" value={modelInfo?.kernel} />
              {(modelInfo?.kernel === "rbf" ||
                modelInfo?.kernel === "poly") && (
                <InfoItem label="Gamma" value={modelInfo?.gamma} />
              )}
              {modelInfo?.kernel === "poly" && (
                <>
                  <InfoItem label="Degree" value={modelInfo?.degree} />
                  <InfoItem label="Coef0" value={modelInfo?.coef0} />
                </>
              )}
            </div>
          </div>
        );

      case "LogisticRegression":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem label="Learning Rate" value={modelInfo?.lr} />
              <InfoItem
                label="Number of Iterations"
                value={modelInfo?.n_iters}
              />
            </div>
          </div>
        );

      default:
        // Fallback to original display for unknown models
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <InfoItem
              label="Input Shape"
              value={data?.model_info?.input_shape}
            />
            <InfoItem label="Loss Function" value={data?.model_info?.loss} />
            <InfoItem
              label="Optimizer"
              value={
                data?.model_info?.optimizer
                  ? typeof data.model_info.optimizer === "string"
                    ? data.model_info.optimizer
                    : `${data.model_info.optimizer.type || "Unknown"} (lr: ${
                        data.model_info.optimizer.learning_rate || "N/A"
                      })`
                  : "N/A"
              }
            />
            <InfoItem
              label="Output Nodes"
              value={data?.model_info?.output_layer?.num_nodes}
            />
            <InfoItem
              label="Output Activation"
              value={data?.model_info?.output_layer?.activation_function}
            />
          </div>
        );
    }
  };

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-100">
      <h3 className="text-xl font-semibold mb-4 text-gray-800 border-b pb-2 flex items-center">
        {/* <InformationCircleIcon className="h-5 w-5 text-gray-700 mr-2" /> */}
        {modelType || "Unknown Model"}
      </h3>

      {renderModelSpecificConfig()}

      {/* Metrics Section */}
      {/* <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Metrics</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(data?.training_metrics || {}).map(
            ([metric, enabled]) =>
              enabled && (
                <span
                  key={metric}
                  className="px-2 py-1 bg-blue-50 text-blue-700 rounded-full text-xs"
                >
                  {metric.toUpperCase()}
                </span>
              )
          )}
        </div>
      </div> */}

      {/* Test Metrics Section */}
      {data?.model_info?.test_metrics?.length > 0 && (
        <div className="mt-4">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Test Metrics
          </h4>
          <div className="flex flex-wrap gap-2">
            {data.model_info.test_metrics.map((metric) => (
              <span
                key={metric}
                className="px-2 py-1 bg-green-50 text-green-700 rounded-full text-xs"
              >
                {metric[0].toUpperCase() + metric.slice(1)}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelConfig;
