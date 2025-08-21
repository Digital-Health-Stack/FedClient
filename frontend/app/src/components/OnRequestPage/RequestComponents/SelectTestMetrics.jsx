import { RectangleStackIcon } from "@heroicons/react/24/outline";
import { useEffect } from "react";
import { useFormContext, useController } from "react-hook-form";

const testMetricsOptions = [
  { value: "accuracy", label: "Accuracy" },
  { value: "f1_score", label: "F1 Score" },
  { value: "mae", label: "Mean Absolute Error" },
  { value: "mse", label: "Mean Squared Error" },
  { value: "precision", label: "Precision" },
  { value: "recall", label: "Recall" },
].sort((a, b) => a.label.localeCompare(b.label)); // Alphabetically sorted by label

const SelectTestMetrics = ({ register }) => {
  const { getValues, setValue, control } = useFormContext();
  const {
    field: { value: metricsValue = [], onChange },
  } = useController({ name: "model_info.test_metrics", control, defaultValue: [] });

  useEffect(() => {
    if (!getValues("metric")) return;
    const currentValue = getValues("model_info.test_metrics");
    const normalized = Array.isArray(currentValue)
      ? currentValue
      : currentValue
        ? [currentValue]
        : [];
    if (!normalized.includes(getValues("metric"))) {
      setValue("model_info.test_metrics", [getValues("metric"), ...normalized], {
        shouldDirty: true,
      });
    }
  }, [getValues, setValue]);

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
        {testMetricsOptions.map((option) => {
          const isDefault = option.value === getValues("metric");
          return (
            <label
              key={option.value}
              className={`flex items-center space-x-2 cursor-pointer p-2 rounded-md hover:bg-gray-100 transition ${isDefault ? "opacity-70" : ""
                }`}
            >
              <input
                type="checkbox"
                value={option.value}
                id={`test-metric-${option.value}`}
                className="w-4 h-4 accent-blue-500"
                checked={
                  isDefault
                    ? true
                    : Array.isArray(metricsValue)
                      ? metricsValue.includes(option.value)
                      : false
                }
                onChange={(e) => {
                  if (isDefault) return;
                  const selected = Array.isArray(metricsValue)
                    ? metricsValue
                    : metricsValue
                      ? [metricsValue]
                      : [];
                  const next = e.target.checked
                    ? Array.from(new Set([...selected, option.value]))
                    : selected.filter((v) => v !== option.value);
                  const ensured = getValues("metric")
                    ? Array.from(new Set([getValues("metric"), ...next]))
                    : next;
                  onChange(ensured);
                }}
                disabled={isDefault}
                readOnly={isDefault}
              />
              <span className="text-gray-700 text-sm">
                {option.label}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default SelectTestMetrics;
