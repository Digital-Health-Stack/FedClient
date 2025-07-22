import React, { useState } from "react";
import { ChartBarIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

export default function HyperparametersInfoStep() {
  const { register } = useFormContext();
  const [showInfo, setShowInfo] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ChartBarIcon className="h-6 w-6 text-yellow-600" />
        <h4 className="text-lg font-semibold">Hyperparameters</h4>
        <div className="relative ml-1">
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
            onClick={() => setShowInfo((prev) => !prev)}
            aria-label="Show info about hyperparameters"
          >
            <span className="font-bold text-xs">
              <InformationCircleIcon className="h-5 w-5" />
            </span>
          </button>
          {showInfo && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Hyperparameters</span>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowInfo(false)}
                  aria-label="Close info"
                >
                  ×
                </button>
              </div>
              <div>
                Set the training hyperparameters such as waiting time and number
                of rounds. These control the training process for your federated
                learning session.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="wait_time"
            title="Waiting time (in minutes) for which the server will wait for other clients to join the training"
          >
            Waiting time (in minutes)
            <input
              type="number"
              step="1"
              min={1}
              max={100}
              {...register("wait_time", {
                required: "Expected Standard Deviation is required",
                min: { value: 0, message: "Value must be greater than 0" },
              })}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="no_of_rounds"
            title="Number of rounds for which the training will run"
          >
            Number of Rounds
            <input
              type="number"
              step="1"
              min={1}
              max={100}
              {...register("no_of_rounds", {
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
