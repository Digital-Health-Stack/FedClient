import React, { useEffect } from "react";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";
import { useFormContext } from "react-hook-form";
import { AdjustmentsHorizontalIcon, HashtagIcon } from "@heroicons/react/24/outline";

/*
Schema:
  "model_info": {
    "n_estimators": 50,
    "learning_rate": 1.0,
    "test_metrics": ["accuracy", "f1_score"]
  }
*/

const AdaBoost = () => {
  const { register, watch, setValue } = useFormContext();
  const defaultValues = { n_estimators: 50, learning_rate: 1.0 };

  useEffect(() => {
    const cur = watch("model_info") || {};
    if (!cur.n_estimators) setValue("model_info.n_estimators", defaultValues.n_estimators);
    if (!cur.learning_rate) setValue("model_info.learning_rate", defaultValues.learning_rate);
  }, [setValue, watch]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <p className="text-lg font-semibold mb-4">Configure the AdaBoost Classifier Parameters:</p>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Number of weak learners (stumps)">
          <HashtagIcon className="h-5 w-5 mr-2 text-blue-500" />
          Number of Estimators
        </label>
        <input type="number" step="1" min="1" placeholder="e.g. 50"
          {...register("model_info.n_estimators")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1" title="Weight applied to each estimator">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-blue-500" />
          Learning Rate
        </label>
        <input type="number" step="0.01" min="0.01" placeholder="e.g. 1.0"
          {...register("model_info.learning_rate")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
      </div>

      <SelectTestMetrics register={register} />
    </div>
  );
};

export default AdaBoost;
