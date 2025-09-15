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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
            <InfoItem label="Regularization (C)" value={modelInfo?.C} />
            <InfoItem label="Learning Rate" value={modelInfo?.lr} />
            <InfoItem label="Number of Iterations" value={modelInfo?.n_iters} />
            <InfoItem label="Weight Shape" value={modelInfo?.weights_shape} />
            <InfoItem
              label="Binary Classification"
              value={modelInfo?.binary_classification ? "Yes" : "No"}
            />
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
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem
                label="Loss Function"
                value={modelInfo?.loss_function}
              />
              <InfoItem label="Optimizer" value={modelInfo?.optimizer} />
              <InfoItem
                label="Learning Rate"
                value={modelInfo?.learning_rate}
              />
            </div>

            {/* Input Layer */}
            {modelInfo?.input_layer && (
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h5 className="font-medium text-gray-800 mb-3">Input Layer</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <InfoItem
                    label="Input Shape"
                    value={modelInfo.input_layer.input_shape}
                  />
                  <InfoItem
                    label="Number of Nodes"
                    value={modelInfo.input_layer.num_nodes}
                  />
                </div>
              </div>
            )}

            {/* Hidden Layers */}
            {modelInfo?.hidden_layers && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-3">
                  Hidden Layers
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoItem
                    label="Number of Layers"
                    value={modelInfo.hidden_layers.num_layers}
                  />
                  <InfoItem
                    label="Nodes per Layer"
                    value={modelInfo.hidden_layers.nodes_per_layer}
                  />
                  <InfoItem
                    label="Activation"
                    value={modelInfo.hidden_layers.activation}
                  />
                  <InfoItem
                    label="Dropout Rate"
                    value={modelInfo.hidden_layers.dropout_rate}
                  />
                </div>
              </div>
            )}

            {/* Output Layer */}
            {modelInfo?.output_layer && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h5 className="font-medium text-green-800 mb-3">
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
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <h5 className="font-medium text-yellow-800 mb-3">
                Training Parameters
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Batch Size" value={modelInfo?.batch_size} />
                <InfoItem label="Epochs" value={modelInfo?.epochs} />
              </div>
            </div>
          </div>
        );

      case "CNN":
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-700">
              <InfoItem label="Input Shape" value={modelInfo?.input_shape} />
              <InfoItem
                label="Loss Function"
                value={modelInfo?.loss_function}
              />
              <InfoItem label="Optimizer" value={modelInfo?.optimizer} />
              <InfoItem
                label="Learning Rate"
                value={modelInfo?.learning_rate}
              />
            </div>

            {/* Convolutional Layers */}
            {modelInfo?.conv_layers && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h5 className="font-medium text-blue-800 mb-3">
                  Convolutional Layers
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoItem
                    label="Number of Layers"
                    value={modelInfo.conv_layers.num_layers}
                  />
                  <InfoItem
                    label="Filters"
                    value={modelInfo.conv_layers.filters}
                  />
                  <InfoItem
                    label="Kernel Size"
                    value={modelInfo.conv_layers.kernel_size}
                  />
                  <InfoItem
                    label="Stride"
                    value={modelInfo.conv_layers.stride}
                  />
                  <InfoItem
                    label="Padding"
                    value={modelInfo.conv_layers.padding}
                  />
                  <InfoItem
                    label="Activation"
                    value={modelInfo.conv_layers.activation}
                  />
                </div>
              </div>
            )}

            {/* Pooling Layers */}
            {modelInfo?.pooling && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <h5 className="font-medium text-purple-800 mb-3">
                  Pooling Layers
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <InfoItem
                    label="Pooling Type"
                    value={modelInfo.pooling.type}
                  />
                  <InfoItem
                    label="Pool Size"
                    value={modelInfo.pooling.pool_size}
                  />
                  <InfoItem label="Stride" value={modelInfo.pooling.stride} />
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InfoItem label="Batch Size" value={modelInfo?.batch_size} />
                <InfoItem label="Epochs" value={modelInfo?.epochs} />
              </div>
            </div>
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
              <InfoItem label="Optimizer" value={modelInfo?.optimizer} />
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
              value={`${data?.model_info?.optimizer?.type} (lr: ${data?.model_info?.optimizer?.learning_rate})`}
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
        <InformationCircleIcon className="h-5 w-5 text-gray-700 mr-2" />
        Model Configuration - {modelType || "Unknown Model"}
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
          <h4 className="text-sm font-medium text-gray-700 mb-2">
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

      {/* Model Architecture - Layers (for models that use layers) */}
      {data?.model_info?.layers?.length > 0 && (
        <div className="mt-6">
          <h4 className="text-lg font-semibold text-gray-700 mb-2">
            Model Architecture (Layers)
          </h4>
          <div className="space-y-3">
            {data.model_info.layers.map((layer, index) => (
              <LayerInfo key={index} layer={layer} index={index} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ModelConfig;
