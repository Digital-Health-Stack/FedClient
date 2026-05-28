import React, { useEffect } from "react";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";
import { useFormContext } from "react-hook-form";
import { AdjustmentsHorizontalIcon } from "@heroicons/react/24/outline";

/*
Schema:
  "model_info": {
    "var_smoothing": 1e-9,
    "test_metrics": ["accuracy", "f1_score"]
  }
*/

const NaiveBayes = () => {
  const { register, watch, setValue } = useFormContext();
  const defaultValues = { var_smoothing: 1e-9 };

  useEffect(() => {
    const cur = watch("model_info") || {};
    if (cur.var_smoothing === undefined) setValue("model_info.var_smoothing", defaultValues.var_smoothing);
  }, [setValue, watch]);

  return (
    <div className="p-4 bg-white rounded-lg shadow-md">
      <p className="text-lg font-semibold mb-4">Configure the Gaussian Naive Bayes Parameters:</p>

      <div className="mb-4">
        <label className="flex items-center text-gray-700 font-medium mb-1"
          title="Small value added to variances for numerical stability">
          <AdjustmentsHorizontalIcon className="h-5 w-5 mr-2 text-blue-500" />
          Variance Smoothing
        </label>
        <input type="number" step="1e-10" min="0" placeholder="e.g. 1e-9"
          {...register("model_info.var_smoothing")}
          className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:outline-none" />
        <p className="text-xs text-gray-500 mt-1">Default: 1e-9 (0.000000001). Increase if you encounter numerical instability.</p>
      </div>

      <SelectTestMetrics register={register} />
    </div>
  );
};

export default NaiveBayes;
