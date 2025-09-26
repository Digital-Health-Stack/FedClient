import React, { useEffect } from "react";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";
import { useFormContext } from "react-hook-form";
import {
  AdjustmentsHorizontalIcon,
  HashtagIcon,
} from "@heroicons/react/24/outline";

const XGBoostRegressor = () => {
  const { register, setValue, watch } = useFormContext();

  const defaultValues = {
    learning_rate: 0.1,
    n_estimators: 200,
    max_depth: 6,
    subsample: 1.0,
    colsample_bytree: 1.0,
  };

  useEffect(() => {
    const mi = watch("model_info") || {};
    Object.entries(defaultValues).forEach(([k, v]) => {
      if (mi[k] === undefined || mi[k] === null || mi[k] === "") {
        setValue(`model_info.${k}`, v);
      }
    });
  }, [setValue, watch]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md space-y-4">
      <p className="text-lg font-semibold">Configure XGBoost Regressor:</p>

      <div>
        <label className="flex items-center text-gray-700 font-medium mb-1">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-blue-500" />
          Learning Rate
        </label>
        <input
          type="number"
          step="0.01"
          {...register("model_info.learning_rate")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="flex items-center text-gray-700 font-medium mb-1">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Number of Trees (n_estimators)
        </label>
        <input
          type="number"
          {...register("model_info.n_estimators")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="flex items-center text-gray-700 font-medium mb-1">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Max Depth
        </label>
        <input
          type="number"
          {...register("model_info.max_depth")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="flex items-center text-gray-700 font-medium mb-1">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-blue-500" />
          Subsample
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          {...register("model_info.subsample")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <div>
        <label className="flex items-center text-gray-700 font-medium mb-1">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-blue-500" />
          Colsample By Tree
        </label>
        <input
          type="number"
          step="0.01"
          min="0"
          max="1"
          {...register("model_info.colsample_bytree")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none"
        />
      </div>

      <SelectTestMetrics register={register} />
    </div>
  );
};

export default XGBoostRegressor;
