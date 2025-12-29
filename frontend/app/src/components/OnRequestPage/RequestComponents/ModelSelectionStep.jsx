import React, { useState, useEffect } from "react";
import { CubeIcon } from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { availableModels } from "./modelsConfig";
import { useFormContext } from "react-hook-form";

export default function ModelSelectionStep() {
  const { register, watch, setValue } = useFormContext();
  const selectedModel = watch("model_name");
  const [showInfo, setShowInfo] = useState(false);

  // Get the model component based on selected model
  const ModelComponent = selectedModel
    ? availableModels[selectedModel]?.component
    : null;

  return (
    <div className="space-y-6">
      {/* <div className="flex items-center space-x-2">
        <CubeIcon className="h-6 w-6 text-purple-600" />
        <h4 className="text-lg font-semibold">Model Selection</h4>
        <div className="relative ml-1">
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
            onClick={() => setShowInfo((prev) => !prev)}
            aria-label="Show info about model selection"
          >
            <span className="font-bold text-xs">
              <InformationCircleIcon className="h-5 w-5" />
            </span>
          </button>
          {showInfo && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Model Selection</span>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowInfo(false)}
                  aria-label="Close info"
                >
                  ×
                </button>
              </div>
              <div>
                Choose the machine learning model architecture you want to use
                for this federated training session. Each model may have
                different configuration options.
              </div>
            </div>
          )}
        </div>
      </div> */}

      <select
        title="Select the model you want to use for training"
        {...register("model_name", { required: true })}
        className="w-full p-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
      >
        <option value="">Select your model</option>
        {Object.entries(availableModels).map(([key, model]) => (
          <option key={key} value={key}>
            {model.label}
          </option>
        ))}
      </select>

      {ModelComponent && (
        <div className="mt-4 p-4 border rounded-md bg-gray-50">
          <ModelComponent />
        </div>
      )}
    </div>
  );
}
