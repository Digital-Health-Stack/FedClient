import React from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

export default function HyperparametersInfoStep() {
  const { register } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ChartBarIcon className="h-6 w-6 text-yellow-600" />
        <h4 className="text-lg font-semibold">Statistical Information</h4>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">
            Waiting time (in minutes)
            <input
              type="number"
              step="1"
              min={1}
              max={100}
              {...register("hyperparameters.wait_time", {
                required: "Expected Standard Deviation is required",
                min: { value: 0, message: "Value must be greater than 0" },
              })}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Number of Rounds
            <input
              type="number"
              step="1"
              min={1}
              max={100}
              {...register("hyperparameters.no_of_rounds", {
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
