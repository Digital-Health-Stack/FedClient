import React from "react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

export default function TrainingDetailsStep({ disabled = false }) {
  const {
    register,
    formState: { errors },
  } = useFormContext();
  const [showInfo, setShowInfo] = React.useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
        <h4 className="text-lg font-semibold">Training Details</h4>
        <div className="relative ml-1">
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
            onClick={() => setShowInfo((prev) => !prev)}
            aria-label="Show info about training details"
          >
            <span className="font-bold text-xs">
              <InformationCircleIcon className="h-5 w-5" />
            </span>
          </button>
          {showInfo && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Training Details</span>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowInfo(false)}
                  aria-label="Close info"
                >
                  ×
                </button>
              </div>
              <div>
                Enter a name for your training session. This will help you
                identify and manage your federated learning jobs.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="space-y-4">
        <label
          className="block text-sm font-medium text-gray-700"
          htmlFor="organisation_name"
          title="Training Name (To identify the training)"
        >
          Training Name
          <input
            type="text"
            placeholder="Enter your training name"
            {...register("organisation_name", {
              required: "training name is required",
            })}
            className={`w-full p-3 mt-1 border rounded-md focus:outline-none ${
              errors.organisation_name
                ? "focus:ring-red-500 border-red-300"
                : "focus:ring-blue-500"
            }`}
            disabled={disabled}
          />
        </label>

        {errors.organisation_name && (
          <p className="text-red-500 text-sm mt-1">
            {errors.organisation_name.message}
          </p>
        )}
      </div>
    </div>
  );
}
