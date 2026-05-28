import React, { useEffect } from "react";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";
import { useFormContext } from "react-hook-form";
import { HashtagIcon } from "@heroicons/react/24/outline";

/*
Schema:
  "model_info": {
    "n_neighbors": 5,
    "weights": "uniform",
    "metric": "minkowski",
    "test_metrics": ["mse", "mae"]
  }
*/

const KNNRegressor = () => {
  const { register, watch, setValue } = useFormContext();
  const defaultValues = { n_neighbors: 5, weights: "uniform", metric: "minkowski" };

  useEffect(() => {
    const cur = watch("model_info") || {};
    if (!cur.n_neighbors) setValue("model_info.n_neighbors", defaultValues.n_neighbors);
    if (!cur.weights) setValue("model_info.weights", defaultValues.weights);
    if (!cur.metric) setValue("model_info.metric", defaultValues.metric);
  }, [setValue, watch]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <p className="text-lg font-semibold mb-4">Configure the KNN Regressor Parameters:</p>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Number of nearest neighbors">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Number of Neighbors (k)
        </label>
        <input type="number" step="1" min="1" placeholder="e.g. 5"
          {...register("model_info.n_neighbors")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="How neighbors are weighted">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Weight Function
        </label>
        <select {...register("model_info.weights")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none">
          <option value="uniform">Uniform</option>
          <option value="distance">Distance</option>
        </select>
      </div>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Distance metric">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Distance Metric
        </label>
        <select {...register("model_info.metric")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none">
          <option value="minkowski">Minkowski</option>
          <option value="euclidean">Euclidean</option>
          <option value="manhattan">Manhattan</option>
        </select>
      </div>

      <SelectTestMetrics register={register} />
    </div>
  );
};

export default KNNRegressor;
