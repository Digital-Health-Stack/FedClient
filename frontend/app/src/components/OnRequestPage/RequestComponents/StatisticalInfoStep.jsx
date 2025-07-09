import React, { useEffect, useState } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

export default function StatisticalInfoStep() {
  const { register, watch } = useFormContext();
  const [test_parameter, setTestParameter] = useState("Accuracy");
  useEffect(() => {
    setTestParameter(watch("metric") || "metric value");
  }, [watch("metric")]);
  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ChartBarIcon className="h-6 w-6 text-yellow-600" />
        <h4 className="text-lg font-semibold">Statistical Information</h4>
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
              {...register("expected_std_mean", {
                required: "Expected Standard Mean is required",
                min: { value: 0, message: "Value must be greater than 0" },
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
              {...register("expected_std_deviation", {
                required: "Expected Standard Deviation is required",
                min: { value: 0, message: "Value must be greater than 0" },
              })}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
