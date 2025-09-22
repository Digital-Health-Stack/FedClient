import React, { useEffect } from "react";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";
import { useFormContext } from "react-hook-form";
import {
  AdjustmentsHorizontalIcon,
  HashtagIcon,
  DocumentTextIcon,
  CubeIcon,
  BeakerIcon,
} from "@heroicons/react/24/outline";

/*
Random Forest Component for Federated Learning

This component generates model_info object for Random Forest:

==================================================
Sample model_info object:

  "model_info": {
    "n_estimators": 100,
    "max_depth": 5,
    "min_samples_split": 2,
    "min_samples_leaf": 1,
    "task_type": "auto"
  }

==================================================
*/

const RandomForest = () => {
  const { register, getValues, setValue, watch } = useFormContext();
  const defaultValues = {
    n_estimators: 100,
    max_depth: 5,
    min_samples_split: 2,
    min_samples_leaf: 1,
    task_type: "auto", // auto-detect from target variable
  };

  // Initialize model_info values if they don't exist
  useEffect(() => {
    const currentModelInfo = watch("model_info") || {};
    if (!currentModelInfo.n_estimators) {
      setValue("model_info.n_estimators", defaultValues.n_estimators);
    }
    if (!currentModelInfo.max_depth) {
      setValue("model_info.max_depth", defaultValues.max_depth);
    }
    if (!currentModelInfo.min_samples_split) {
      setValue("model_info.min_samples_split", defaultValues.min_samples_split);
    }
    if (!currentModelInfo.min_samples_leaf) {
      setValue("model_info.min_samples_leaf", defaultValues.min_samples_leaf);
    }
    setValue("model_info.task_type", defaultValues.task_type);
  }, [setValue, watch]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <p className="text-lg font-semibold mb-4">
        Configure the Random Forest Parameters:
      </p>

      <input type="hidden" {...register("model_info.task_type")} value="auto" />

      {/* Number of Estimators */}
      <div className="mb-4">
        <label
          className="flex items-center text-gray-700 font-medium mb-1"
          htmlFor="n_estimators"
          title="Number of trees in the forest"
        >
          <BeakerIcon className="h-5 w-5 mr-2 text-green-500" />
          Number of Trees (Estimators)
        </label>
        <input
          type="number"
          min="1"
          max="1000"
          placeholder="e.g. 100"
          {...register("model_info.n_estimators")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-400 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          More trees generally improve performance but increase computation time
        </p>
      </div>

      {/* Maximum Depth */}
      <div className="mb-4">
        <label
          className="flex items-center text-gray-700 font-medium mb-1"
          htmlFor="max_depth"
          title="Maximum depth of each tree (0 means no limit)"
        >
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-blue-500" />
          Maximum Depth per Tree
        </label>
        <input
          type="number"
          min="0"
          placeholder="e.g. 5"
          {...register("model_info.max_depth")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Set to 0 for unlimited depth (may cause overfitting)
        </p>
      </div>

      {/* Minimum Samples Split */}
      <div className="mb-4">
        <label
          className="flex items-center text-gray-700 font-medium mb-1"
          htmlFor="min_samples_split"
          title="Minimum number of samples required to split an internal node"
        >
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Minimum Samples to Split
        </label>
        <input
          type="number"
          min="2"
          placeholder="e.g. 2"
          {...register("model_info.min_samples_split")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Higher values prevent overfitting but may underfit
        </p>
      </div>

      {/* Minimum Samples Leaf */}
      <div className="mb-4">
        <label
          className="flex items-center text-gray-700 font-medium mb-1"
          htmlFor="min_samples_leaf"
          title="Minimum number of samples required to be at a leaf node"
        >
          <CubeIcon className="h-5 w-5 mr-2 text-blue-500" />
          Minimum Samples per Leaf
        </label>
        <input
          type="number"
          min="1"
          placeholder="e.g. 1"
          {...register("model_info.min_samples_leaf")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
        <p className="text-sm text-gray-500 mt-1">
          Higher values smooth the model and prevent overfitting
        </p>
      </div>

      {/* Select test metrics */}
      <SelectTestMetrics register={register} />
    </div>
  );
};

export default RandomForest;
