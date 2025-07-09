import React from "react";
import { BuildingOfficeIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

export default function OrganizationDetailsStep() {
  const {
    register,
    formState: { errors },
  } = useFormContext();

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <BuildingOfficeIcon className="h-6 w-6 text-blue-600" />
        <h4 className="text-lg font-semibold">Training Details</h4>
      </div>

      <div className="space-y-4">
        <label className="block text-sm font-medium text-gray-700">
          Training Name (To identify the training)
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
