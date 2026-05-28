import React, { useEffect } from "react";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";
import { useFormContext } from "react-hook-form";
import { HashtagIcon } from "@heroicons/react/24/outline";

/*
Schema:
  "model_info": {
    "n_estimators": 100,
    "max_depth": null,
    "min_samples_split": 2,
    "max_features": "sqrt",
    "test_metrics": ["mse", "mae"]
  }
*/

const RandomForestRegressor = () => {
  const { register, watch, setValue } = useFormContext();
  const defaultValues = { n_estimators: 100, max_depth: "", min_samples_split: 2, max_features: "sqrt" };

  useEffect(() => {
    const cur = watch("model_info") || {};
    if (!cur.n_estimators) setValue("model_info.n_estimators", defaultValues.n_estimators);
    if (!cur.min_samples_split) setValue("model_info.min_samples_split", defaultValues.min_samples_split);
    if (!cur.max_features) setValue("model_info.max_features", defaultValues.max_features);
  }, [setValue, watch]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <p className="text-lg font-semibold mb-4">Configure the Random Forest Regressor Parameters:</p>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Number of trees in the forest">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Number of Estimators
        </label>
        <input type="number" step="10" min="1" placeholder="e.g. 100"
          {...register("model_info.n_estimators")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Max depth per tree; leave blank for no limit">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Max Depth (blank = unlimited)
        </label>
        <input type="number" step="1" min="1" placeholder="Leave blank for unlimited"
          {...register("model_info.max_depth")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Minimum samples to split a node">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Min Samples Split
        </label>
        <input type="number" step="1" min="2" placeholder="e.g. 2"
          {...register("model_info.min_samples_split")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Features to consider at each split">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Max Features
        </label>
        <select {...register("model_info.max_features")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none">
          <option value="sqrt">sqrt</option>
          <option value="log2">log2</option>
          <option value="1.0">All (1.0)</option>
        </select>
      </div>

      <SelectTestMetrics register={register} />
    </div>
  );
};

export default RandomForestRegressor;
