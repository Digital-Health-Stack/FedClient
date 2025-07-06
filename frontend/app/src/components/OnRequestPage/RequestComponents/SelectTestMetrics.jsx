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
    <div className="mt-4 p-4 border border-gray-300 rounded-lg shadow-sm">
      <h5 className="text-lg font-semibold text-gray-700 mb-3">
        Select Test Metrics:
      </h5>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-3 gap-3">
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
              {...register("metric")}
            />
            <span className="text-gray-700 text-sm">{option.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default SelectTestMetrics;
