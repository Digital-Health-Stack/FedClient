import { RectangleStackIcon } from "@heroicons/react/24/outline";

const testMetricsOptions = [
  { value: "accuracy", label: "Accuracy" },
  { value: "f1_score", label: "F1 Score" },
  { value: "mae", label: "Mean Absolute Error" },
  { value: "mse", label: "Mean Squared Error" },
  { value: "precision", label: "Precision" },
  { value: "recall", label: "Recall" },
].sort((a, b) => a.label.localeCompare(b.label)); // Alphabetically sorted by label

const SelectTestMetrics = ({ register }) => {
  return (
    <div className="mb-4">
      <label
        className="flex items-center text-gray-700 font-medium mb-1"
        htmlFor="test_metrics"
        title="Select the test metrics to be used for evaluation"
      >
        <RectangleStackIcon className="h-5 w-5 mr-2 text-blue-500" />
        Select Test Metrics:
      </label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3 p-2 border border-gray-300 rounded-lg shadow-sm">
        {testMetricsOptions.map((option) => (
          <label
            key={option.value}
            className="flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition"
          >
            <input
              type="checkbox"
              value={option.value}
              id={`test-metric-${option.value}`}
              className="w-4 h-4 accent-blue-500"
              {...register("model_info.test_metrics")}
            />
            <span className="text-gray-700 text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SelectTestMetrics;
