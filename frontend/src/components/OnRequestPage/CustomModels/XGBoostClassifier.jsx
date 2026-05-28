import React, { useEffect } from "react";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";
import { useFormContext } from "react-hook-form";
import { AdjustmentsHorizontalIcon, HashtagIcon } from "@heroicons/react/24/outline";

/*
Schema:
  "model_info": {
    "n_estimators": 100,
    "learning_rate": 0.1,
    "max_depth": 3,
    "test_metrics": ["accuracy", "f1_score"]
  }
*/

const XGBoostClassifier = () => {
  const { register, watch, setValue } = useFormContext();
  const defaultValues = { n_estimators: 100, learning_rate: 0.1, max_depth: 3 };

  useEffect(() => {
    const cur = watch("model_info") || {};
    if (!cur.n_estimators) setValue("model_info.n_estimators", defaultValues.n_estimators);
    if (!cur.learning_rate) setValue("model_info.learning_rate", defaultValues.learning_rate);
    if (!cur.max_depth) setValue("model_info.max_depth", defaultValues.max_depth);
  }, [setValue, watch]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <p className="text-lg font-semibold mb-4">Configure the XGBoost Classifier Parameters:</p>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Number of gradient-boosted trees">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Number of Estimators
        </label>
        <input type="number" step="10" min="1" placeholder="e.g. 100"
          {...register("model_info.n_estimators")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Boosting step size">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-blue-500" />
          Learning Rate
        </label>
        <input type="number" step="0.01" min="0.001" placeholder="e.g. 0.1"
          {...register("model_info.learning_rate")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Maximum depth of each tree">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Max Depth
        </label>
        <input type="number" step="1" min="1" placeholder="e.g. 3"
          {...register("model_info.max_depth")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <SelectTestMetrics register={register} />
    </div>
  );
};

export default XGBoostClassifier;
