import React, { useEffect, useState } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

export default function StatisticalInfoStep() {
  const { register, watch, setValue } = useFormContext();
  const [test_parameter, setTestParameter] = useState("Accuracy");
  const [showInfo, setShowInfo] = React.useState(false);
  useEffect(() => {
    setTestParameter(watch("metric") || "metric value");
  }, [watch("metric")]);

  function enforceMinMax(name, value) {
    if (value !== "") {
      let num = parseFloat(value);
      if (num < 0) {
        setValue(name, 0);
        return 0;
      }
      if (num > 1) {
        setValue(name, 1);
        return 1;
      }
    }
    return value;
  }

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center space-x-2">
          <ChartBarIcon className="h-6 w-6 text-yellow-600" />
          <h4 className="text-lg font-semibold">Statistical Information</h4>
          <div className="relative ml-1">
            <button
              type="button"
              className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
              onClick={() => setShowInfo((prev) => !prev)}
              aria-label="Show info about statistical information"
            >
              <span className="font-bold text-xs">
                <InformationCircleIcon className="h-5 w-5" />
              </span>
            </button>
            {showInfo && (
              <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-semibold">Statistical Information</span>
                  <button
                    className="text-gray-400 hover:text-gray-600"
                    onClick={() => setShowInfo(false)}
                    aria-label="Close info"
                  >
                    ×
                  </button>
                </div>
                <div>
                  Configure the expected mean and variation for your target
                  metric. These values help set expectations for model
                  performance and validation.
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          Please enter a value between 0 and 1, inclusive.
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="expected_std_mean"
            title="Expected value of the target metric"
          >
            Target {test_parameter}
            <input
              type="number"
              step="0.00001"
              min={0}
              max={1}
              {...register("expected_std_mean", {
                required: "Expected Standard Mean is required",
                min: { value: 0, message: "Value must be greater than 0" },
                max: {
                  value: 1,
                  message: "Value must be less than or equal to 1",
                },
                onChange: (e) => {
                  enforceMinMax("expected_std_mean", e.target.value);
                },
              })}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="expected_std_deviation"
            title="Expected Variation in the target metric"
          >
            Expected Variation in {test_parameter}
            <input
              type="number"
              step="0.00001"
              min={0}
              max={1}
              {...register("expected_std_deviation", {
                required: "Expected Standard Deviation is required",
                min: { value: 0, message: "Value must be greater than 0" },
                max: {
                  value: 1,
                  message: "Value must be less than or equal to 1",
                },
                onChange: (e) => {
                  enforceMinMax("expected_std_deviation", e.target.value);
                },
              })}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
