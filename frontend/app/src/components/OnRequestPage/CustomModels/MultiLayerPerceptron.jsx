import React from "react";
import { useFieldArray } from "react-hook-form";
import { useFormContext } from "react-hook-form";
import SelectTestMetrics from "../RequestComponents/SelectTestMetrics";

const MultiLayerPerceptron = () => {
  const { register, control, watch } = useFormContext();

  const activationOptions = {
    relu: "ReLU",
    tanh: "Tanh",
    logistic: "Sigmoid (logistic)",
    identity: "Identity",
  };

  const taskTypes = {
    classification: "Classification",
    regression: "Regression",
  };

  const { fields, append, remove } = useFieldArray({
    control,
    name: "model_info.hidden_layer_sizes",
  });

  const taskType = watch("model_info.task_type");

  return (
    <div className="space-y-4">
      {/* Task Type & Classes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Task Type</label>
          <select
            className="border rounded p-2 w-full"
            {...register("model_info.task_type")}
          >
            {Object.keys(taskTypes).map((key) => (
              <option key={key} value={key}>
                {taskTypes[key]}
              </option>
            ))}
          </select>
        </div>
        {taskType === "classification" && (
          <div>
            <label className="block text-sm font-medium mb-1">
              Num Classes
            </label>
            <input
              type="number"
              className="border rounded p-2 w-full"
              placeholder="e.g. 2"
              {...register("model_info.num_classes")}
            />
          </div>
        )}
      </div>

      {/* Hidden Layers */}
      <div>
        <h5 className="text-lg font-semibold mb-2">Hidden Layers</h5>
        {fields.length === 0 && (
          <p className="text-sm text-gray-500 mb-2">
            No hidden layers added yet.
          </p>
        )}
        <div className="space-y-2">
          {fields.map((field, index) => (
            <div key={field.id} className="flex items-center gap-2">
              <input
                type="number"
                className="border rounded p-2 flex-1"
                placeholder="Number of nodes"
                {...register(`model_info.hidden_layer_sizes.${index}`)}
              />
              <button
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                type="button"
                onClick={() => remove(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
        <button
          type="button"
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => append(128)}
        >
          Add Hidden Layer
        </button>
        <p className="text-xs text-gray-500 mt-1">
          These will be sent as an integer list to the backend.
        </p>
      </div>

      {/* Core Hyperparameters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium mb-1">Activation</label>
          <select
            className="border rounded p-2 w-full"
            {...register("model_info.activation")}
          >
            {Object.keys(activationOptions).map((key) => (
              <option key={key} value={key}>
                {activationOptions[key]}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Learning Rate
          </label>
          <input
            type="number"
            step="0.0001"
            className="border rounded p-2 w-full"
            placeholder="e.g. 0.001"
            {...register("model_info.learning_rate")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">
            Max Iterations
          </label>
          <input
            type="number"
            className="border rounded p-2 w-full"
            placeholder="e.g. 200"
            {...register("model_info.max_iter")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Alpha (L2)</label>
          <input
            type="number"
            step="0.0001"
            className="border rounded p-2 w-full"
            placeholder="e.g. 0.0001"
            {...register("model_info.alpha")}
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Random State</label>
          <input
            type="number"
            className="border rounded p-2 w-full"
            placeholder="e.g. 42"
            {...register("model_info.random_state")}
          />
        </div>
      </div>

      {/* Test Metrics Selection */}
      <div>
        <h5 className="text-lg font-semibold mb-2">Test Metrics</h5>
        <div className="border rounded p-3">
          <SelectTestMetrics register={register} />
        </div>
      </div>
    </div>
  );
};

export default MultiLayerPerceptron;
