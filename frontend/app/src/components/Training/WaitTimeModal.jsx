import React, { useState, useEffect } from "react";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";
import { submitWaitTime } from "../../services/federatedService";
import { useAuth } from "../../contexts/AuthContext";
import LoaderButton from "../Common/LoaderButton";

export default function WaitTimeModal({ sessionId, onClose, onSuccess }) {
  const { api } = useAuth();
  const [waitTimeOption, setWaitTimeOption] = useState(null); // "now" or "custom"
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Time values for custom time option
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);

  // Helper to clamp values
  const clamp = (val, min, max) => Math.max(min, Math.min(max, val));

  // Get total minutes from time values
  const getTotalMinutes = () =>
    Number(days) * 24 * 60 + Number(hours) * 60 + Number(minutes);

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
    if ((value === 0 || value === "0") && /^[1-9]$/.test(input)) {
      setter(Number(parseInt(input)));
    } else {
      const val = parseInt(input) || 0;
      setter(clamp(val, min, max));
    }
  };

  // On + or - button
  const handleInc = () => setFromTotalMinutes(getTotalMinutes() + 1);
  const handleDec = () =>
    setFromTotalMinutes(Math.max(0, getTotalMinutes() - 1));

  const handleSubmit = async () => {
    let waitTimeMinutes = 0;

    if (waitTimeOption === "now") {
      // 2 seconds = 0.033 minutes (approximately)
      waitTimeMinutes = 0.033;
    } else if (waitTimeOption === "custom") {
      waitTimeMinutes = getTotalMinutes();
      if (waitTimeMinutes < 0) {
        toast.error("Wait time must be 0 or greater.");
        return;
      }
    } else {
      toast.error("Please select an option.");
      return;
    }

    setIsSubmitting(true);
    try {
      await submitWaitTime(api, {
        session_id: Number(sessionId),
        wait_time: waitTimeMinutes,
      });

      toast.success("Training start time has been set successfully!", {
        position: "bottom-center",
        autoClose: 3000,
      });

      // Remove from localStorage
      localStorage.removeItem(`wait_time_pending_${sessionId}`);

      // Call success callback to refresh data
      if (onSuccess) {
        await onSuccess();
      }

      // Close modal
      if (onClose) {
        onClose();
      }
    } catch (error) {
      console.error("Error submitting wait time:", error);
      toast.error(
        error?.response?.data?.detail ||
          "Failed to submit wait time. Please try again.",
        {
          position: "bottom-center",
          autoClose: 4000,
        }
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 p-8 z-10">
        <div className="flex items-center gap-3 mb-6">
          <ClockIcon className="h-8 w-8 text-blue-600" />
          <h2 className="text-2xl font-bold text-gray-900">
            Set Training Start Time
          </h2>
        </div>

        <p className="text-gray-600 mb-6">
          Choose when you want the training to start. You can start it immediately
          or schedule it for later.
        </p>

        <div className="space-y-4 mb-6">
          {/* Start Now Option */}
          <button
            type="button"
            onClick={() => setWaitTimeOption("now")}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              waitTimeOption === "now"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-900">
                  Start Training Now
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Training will start in 2 seconds
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  waitTimeOption === "now"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              >
                {waitTimeOption === "now" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>
          </button>

          {/* Set Custom Time Option */}
          <button
            type="button"
            onClick={() => setWaitTimeOption("custom")}
            className={`w-full p-4 border-2 rounded-lg text-left transition-all ${
              waitTimeOption === "custom"
                ? "border-blue-600 bg-blue-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="font-semibold text-gray-900">
                  Set Custom Time
                </div>
                <div className="text-sm text-gray-500 mt-1">
                  Schedule training to start after a specific duration
                </div>
              </div>
              <div
                className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  waitTimeOption === "custom"
                    ? "border-blue-600 bg-blue-600"
                    : "border-gray-300"
                }`}
              >
                {waitTimeOption === "custom" && (
                  <div className="w-2 h-2 rounded-full bg-white" />
                )}
              </div>
            </div>

            {/* Time Inputs - shown when custom is selected */}
            {waitTimeOption === "custom" && (
              <div className="mt-4 pt-4 border-t border-gray-200">
                <style>
                  {`
                    .no-spinner::-webkit-inner-spin-button,
                    .no-spinner::-webkit-outer-spin-button {
                      -webkit-appearance: none;
                      margin: 0;
                    }
                  `}
                </style>
                <label className="block text-sm font-medium mb-3 text-gray-700">
                  Waiting time (in days, hours, minutes)
                </label>
                <div className="flex items-center justify-between pr-4 border border-gray-300 rounded-md bg-white">
                  {/* Days */}
                  <div className="flex gap-4 ml-2">
                    <div className="flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={99}
                        value={days}
                        onChange={handleChange(setDays, 0, 99, days)}
                        className="py-2 text-center no-spinner focus:outline-none focus:border-b border-black w-16"
                        placeholder="0"
                        aria-label="Days"
                      />
                      <span className="ml-1 text-sm text-gray-600">Days</span>
                    </div>
                    {/* Hours */}
                    <div className="flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={23}
                        value={hours}
                        onChange={handleChange(setHours, 0, 23, hours)}
                        className="py-2 text-center no-spinner focus:outline-none focus:border-b border-black w-16"
                        placeholder="0"
                        aria-label="Hours"
                      />
                      <span className="ml-1 text-sm text-gray-600">Hrs</span>
                    </div>
                    {/* Minutes */}
                    <div className="flex items-center">
                      <input
                        type="number"
                        min={0}
                        max={59}
                        value={minutes}
                        onChange={handleChange(setMinutes, 0, 59, minutes)}
                        className="py-2 text-center no-spinner focus:outline-none focus:border-b border-black w-16"
                        placeholder="0"
                        aria-label="Minutes"
                      />
                      <span className="ml-1 text-sm text-gray-600">Mins</span>
                    </div>
                  </div>
                  {/* Increment/Decrement buttons */}
                  <div className="flex gap-2 items-center">
                    <button
                      type="button"
                      onClick={handleInc}
                      aria-label="Add minute"
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <ArrowUpIcon className="h-6 w-6 text-gray-600" />
                    </button>
                    <button
                      type="button"
                      onClick={handleDec}
                      aria-label="Subtract minute"
                      className="p-1 hover:bg-gray-100 rounded-full"
                    >
                      <ArrowDownIcon className="h-6 w-6 text-gray-600" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </button>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
          <LoaderButton
            type="button"
            onClick={handleSubmit}
            isLoading={isSubmitting}
            loadingText="Setting time..."
            disabled={!waitTimeOption || isSubmitting}
            className={`px-6 py-2.5 rounded-lg font-medium transition-colors ${
              !waitTimeOption || isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 text-white"
            }`}
          >
            Confirm
          </LoaderButton>
        </div>
      </div>
    </div>
  );
}
