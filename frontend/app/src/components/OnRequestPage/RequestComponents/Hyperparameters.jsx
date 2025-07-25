import React, { useState } from "react";
import {
  ArrowDownCircleIcon,
  ArrowDownIcon,
  ArrowUpCircleIcon,
  ArrowUpIcon,
  ChartBarIcon,
  PlusCircleIcon,
} from "@heroicons/react/24/outline";
import { InformationCircleIcon } from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

export default function HyperparametersInfoStep() {
  const { register, setValue } = useFormContext();
  const [showInfo, setShowInfo] = useState(false);
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Helper to clamp values
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  // Update all fields from total minutes
  const setFromTotalMinutes = (total) => {
    total = Math.max(0, Math.floor(total));
    const d = Math.floor(total / (24 * 60));
    const h = Math.floor((total % (24 * 60)) / 60);
    const m = total % 60;
    setDays(d);
    setHours(h);
    setMinutes(m);
  };

  // On manual change
  const handleChange = (setter, min, max, value) => (e) => {
    const input = e.target.value;
    // If the current value is 0 and the user types a digit, replace 0 with the digit
    if ((value === 0 || value === "0") && /^[1-9]$/.test(input)) {
      setter(Number(parseInt(input)));
    } else {
      const val = parseInt(input) || 0;
      setter(clamp(val, min, max));
    }
  };

  // On + or - button
  const getTotalMinutes = () =>
    Number(days) * 24 * 60 + Number(hours) * 60 + Number(minutes);
  const handleInc = () => setFromTotalMinutes(getTotalMinutes() + 1);
  const handleDec = () =>
    setFromTotalMinutes(Math.max(0, getTotalMinutes() - 1));

  // Sync hidden field
  React.useEffect(() => {
    setValue("wait_time", getTotalMinutes());
  }, [days, hours, minutes, setValue]);

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <ChartBarIcon className="h-6 w-6 text-yellow-600" />
        <h4 className="text-lg font-semibold">Hyperparameters</h4>
        <div className="relative ml-1">
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
            onClick={() => setShowInfo((prev) => !prev)}
            aria-label="Show info about hyperparameters"
          >
            <span className="font-bold text-xs">
              <InformationCircleIcon className="h-5 w-5" />
            </span>
          </button>
          {showInfo && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Hyperparameters</span>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowInfo(false)}
                  aria-label="Close info"
                >
                  ×
                </button>
              </div>
              <div>
                Set the training hyperparameters such as waiting time and number
                of rounds. These control the training process for your federated
                learning session.
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <style>
            {`
              .no-spinner::-webkit-inner-spin-button,
              .no-spinner::-webkit-outer-spin-button {
                -webkit-appearance: none;
                margin: 0;
              }
            `}
          </style>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="wait_time"
            title="Waiting time for which the server will wait for other clients to join the training (in days, hours, minutes)"
          >
            Waiting time
            <div className="flex mt-1 items-center justify-between pr-4 border   border-gray-300 rounded-md">
              {/* Days */}
              <div className="flex gap-2 ml-2">
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={99}
                    value={days}
                    onChange={handleChange(setDays, 0, 99, days)}
                    className=" py-2 text-center no-spinner focus:outline-none focus:border-b border-black"
                    placeholder="Days"
                    aria-label="Days"
                  />
                  <span className="ml-1 text-md">Days</span>
                </div>
                {/* Hours */}
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={23}
                    value={hours}
                    onChange={handleChange(setHours, 0, 23, hours)}
                    className=" py-2 text-center no-spinner focus:outline-none focus:border-b border-black"
                    placeholder="Hours"
                    aria-label="Hours"
                  />
                  <span className="ml-1 text-md">Hrs</span>
                </div>
                {/* Minutes */}
                <div className="flex items-center">
                  <input
                    type="number"
                    min={0}
                    max={59}
                    value={minutes}
                    onChange={handleChange(setMinutes, 0, 59, minutes)}
                    className=" py-2 text-center no-spinner focus:outline-none focus:border-b border-black"
                    placeholder="Minutes"
                    aria-label="Minutes"
                  />
                  <span className="ml-1 text-md">Mins</span>
                </div>
              </div>
              {/* Increment/Decrement buttons */}
              <div className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={handleInc}
                  aria-label="Add minute"
                >
                  <ArrowUpIcon className="h-8 w-8 p-1 hover:bg-gray-200 rounded-full" />
                </button>
                <button
                  type="button"
                  onClick={handleDec}
                  aria-label="Subtract minute"
                >
                  <ArrowDownIcon className="h-8 w-8 p-1 hover:bg-gray-200 rounded-full" />
                </button>
              </div>
            </div>
            {/* Hidden input to register wait_time in minutes */}
            <input
              type="hidden"
              {...register("wait_time", {
                required: true,
                min: { value: 0, message: "Value must be greater than 0" },
              })}
            />
          </label>
        </div>
        <div>
          <label
            className="block text-sm font-medium mb-1"
            htmlFor="no_of_rounds"
            title="Number of rounds for which the training will run"
          >
            Number of Rounds
            <input
              type="number"
              step="1"
              min={1}
              max={100}
              {...register("no_of_rounds", {
                required: "Expected Standard Deviation is required",
                min: { value: 0, message: "Value must be greater than 0" },
              })}
              className="w-full p-2 border rounded-md mt-1"
            />
          </label>
        </div>
      </div>
    </div>
  );
}
