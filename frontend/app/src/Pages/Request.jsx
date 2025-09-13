import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import Stepper from "../components/OnRequestPage/RequestComponents/Stepper";
import TrainingDetailsStep from "../components/OnRequestPage/RequestComponents/TrainingDetailsStep";
import SelectDatasetsStep from "../components/OnRequestPage/RequestComponents/SelectDatasetsStep";
import StatisticalInfoStep from "../components/OnRequestPage/RequestComponents/StatisticalInfoStep";
import ModelSelectionStep from "../components/OnRequestPage/RequestComponents/ModelSelectionStep";
import HyperparametersInfoStep from "../components/OnRequestPage/RequestComponents/Hyperparameters";
import LoaderButton from "../components/Common/LoaderButton";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";
import { createSession } from "../services/federatedService";
import {
  BuildingOfficeIcon,
  FolderIcon,
  CpuChipIcon,
  ChartBarIcon,
  ArrowRightIcon,
  ArrowLeftIcon,
  WrenchScrewdriverIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { toast } from "react-toastify";

const steps = [
  { id: 0, label: "Training Details", icon: BuildingOfficeIcon },
  { id: 1, label: "Dataset Information", icon: FolderIcon },
  { id: 2, label: "Model Selection", icon: CpuChipIcon },
  { id: 3, label: "Statistical Info", icon: ChartBarIcon },
  { id: 4, label: "Hyperparameters", icon: WrenchScrewdriverIcon },
];

const REQUEST_FORM_STORAGE_KEY = "fedclient_request_form_data";
const REQUEST_STEP_STORAGE_KEY = "fedclient_request_current_step";

// Function to get saved form data from localStorage
const getSavedFormData = () => {
  try {
    const saved = localStorage.getItem(REQUEST_FORM_STORAGE_KEY);
    return saved ? JSON.parse(saved) : null;
  } catch (error) {
    console.error("Error loading saved form data:", error);
    return null;
  }
};

// Function to get saved current step from localStorage
const getSavedCurrentStep = () => {
  try {
    const saved = localStorage.getItem(REQUEST_STEP_STORAGE_KEY);
    return saved ? parseInt(saved, 10) : 0;
  } catch (error) {
    console.error("Error loading saved current step:", error);
    return 0;
  }
};

// Function to save form data to localStorage
const saveFormData = (data) => {
  try {
    localStorage.setItem(REQUEST_FORM_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error("Error saving form data:", error);
  }
};

// Function to save current step to localStorage
const saveCurrentStep = (step) => {
  try {
    localStorage.setItem(REQUEST_STEP_STORAGE_KEY, step.toString());
  } catch (error) {
    console.error("Error saving current step:", error);
  }
};

// Function to clear saved form data
const clearSavedFormData = () => {
  try {
    localStorage.removeItem(REQUEST_FORM_STORAGE_KEY);
    localStorage.removeItem(REQUEST_STEP_STORAGE_KEY);
  } catch (error) {
    console.error("Error clearing saved form data:", error);
  }
};

export default function Request() {
  const location = useLocation();
  const retryState = location?.state || {};
  const isRetry = !!retryState.retry;
  const lockedStepIds = retryState.lockedStepIds || [];

  const [currentStep, setCurrentStep] = useState(() =>
    isRetry ? 0 : getSavedCurrentStep()
  );

  // Get saved form data or use retry prefill/defaults
  const savedFormData = isRetry ? retryState.prefill : getSavedFormData();

  // Initialize form with saved data or default values
  const methods = useForm({
    defaultValues: savedFormData || {
      organisation_name: "",
      server_filename: "",
      task_id: "",
      task_name: "",
      metric: "",
      input_columns: [],
      output_columns: [],
      model_name: "",
      model_info: { test_metrics: [] },
      expected_std_mean: "",
      expected_std_deviation: "",
      wait_time: 0,
      no_of_rounds: "",
      server_stats: null,
      server_stats_data: null, // Add this to persist full server stats data
      client_stats: null,
    },
    mode: "onChange", // Enable real-time validation
  });

  // If retry with model info provided, ensure the form gets initialized with it once
  useEffect(() => {
    if (isRetry && retryState.prefill) {
      methods.reset(retryState.prefill);
    }
  }, [isRetry, retryState, methods]);

  const [showStepInfo, setShowStepInfo] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { api } = useAuth();
  const navigate = useNavigate();

  // Watch form values and save to localStorage
  useEffect(() => {
    const subscription = methods.watch((data) => {
      // Only save if there's meaningful data to preserve
      const hasData = Object.values(data).some((value) => {
        if (Array.isArray(value)) return value.length > 0;
        if (typeof value === "object" && value !== null)
          return Object.keys(value).length > 0;
        return (
          value !== "" && value !== null && value !== undefined && value !== 0
        );
      });

      if (hasData) {
        saveFormData(data);
      }
    });

    return () => subscription.unsubscribe();
  }, [methods]);

  // Save current step to localStorage whenever it changes
  useEffect(() => {
    saveCurrentStep(currentStep);
  }, [currentStep]);

  const handleNext = async () => {
    const isValid = await methods.trigger();
    if (isValid) {
      setCurrentStep((prev) => {
        let nextStep = prev + 1;
        // Skip locked steps during navigation
        while (nextStep < steps.length && lockedStepIds.includes(nextStep)) {
          nextStep++;
        }
        return Math.min(nextStep, steps.length - 1);
      });
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => {
      let prevStep = prev - 1;
      // Skip locked steps during navigation
      while (prevStep >= 0 && lockedStepIds.includes(prevStep)) {
        prevStep--;
      }
      return Math.max(prevStep, 0);
    });
  };

  const onSubmit = async (data) => {
    if (data.organisation_name === "") {
      toast.error("Please enter your organization name.");
      return setCurrentStep(0);
    }
    if (!data.server_filename) {
      toast.error("Please fetch at least one dataset.");
      return setCurrentStep(1);
    }
    if (!data.task_id) {
      toast.error("Please select a task for the dataset.");
      return setCurrentStep(1);
    }
    if (!data.output_columns || data.output_columns.length === 0) {
      toast.error("Please select at least one output column.");
      return setCurrentStep(1);
    }
    if (!data.model_name || data.model_name === "" || !data.model_info) {
      toast.error("Please select a model.");
      return setCurrentStep(2);
    }
    if (!data.expected_std_mean || !data.expected_std_deviation) {
      toast.error("Please provide expected results.");
      return setCurrentStep(3);
    }
    if (!data.wait_time || !data.no_of_rounds) {
      toast.error("Please provide hyperparameters.");
      return setCurrentStep(4);
    }

    const requestData = {
      fed_info: data,
      // client_token: api.getAccessToken(),
    };

    setIsSubmitting(true);
    try {
      const res = await createSession(api, requestData);
      // Clear saved form data on successful submission
      clearSavedFormData();
      navigate(`/trainings/${res.data.session_id}`);
    } catch (error) {
      console.error("Submission error:", error);
      toast.error("Failed to submit training request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <FormProvider {...methods}>
      <div className="flex bg-gray-50 w-full">
        <Stepper
          steps={steps}
          currentStep={currentStep}
          setCurrentStep={setCurrentStep}
          lockedStepIds={lockedStepIds}
        />

        <div className="flex-1 p-8 ml-0">
          <form
            onSubmit={methods.handleSubmit(onSubmit)}
            className="max-w-4xl mx-auto bg-white rounded-xl shadow-sm p-8 relative"
          >
            <div className="mb-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-2xl font-semibold text-gray-800">
                    {steps[currentStep].label}
                  </h3>
                </div>
              </div>
              <p className="text-gray-500 mt-2 text-sm">
                {currentStep === 0 &&
                  "Enter your organization details to proceed with the model request"}
                {currentStep === 1 &&
                  "Select datasets you want to include in the training process"}
                {currentStep === 2 &&
                  "Choose the machine learning model architecture"}
                {currentStep === 3 &&
                  "Configure statistical parameters for model training"}
                {currentStep === 4 &&
                  "Set hyperparameters for the training process"}
              </p>
            </div>

            <div className="space-y-8">
              {currentStep === 0 && (
                <TrainingDetailsStep disabled={lockedStepIds.includes(0)} />
              )}
              {currentStep === 1 && (
                <SelectDatasetsStep
                  disabled={lockedStepIds.includes(1)}
                  autoFetch={isRetry}
                />
              )}
              {currentStep === 2 && <ModelSelectionStep />}
              {currentStep === 3 && <StatisticalInfoStep />}
              {currentStep === 4 && <HyperparametersInfoStep />}
            </div>

            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-between">
              {currentStep > 0 && (
                <button
                  type="button"
                  onClick={handlePrev}
                  className="px-6 py-3 text-gray-600 hover:bg-gray-50 rounded-lg border font-medium flex items-center transition-colors"
                >
                  <ArrowLeftIcon className="w-5 h-5 mr-2" />
                  Previous
                </button>
              )}

              {currentStep < steps.length - 1 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium flex items-center transition-colors"
                >
                  Next
                  <ArrowRightIcon className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <LoaderButton
                  type="submit"
                  isLoading={isSubmitting}
                  loadingText="Submitting..."
                  className={`px-6 py-3 text-white rounded-lg font-medium ${
                    isSubmitting
                      ? "bg-green-400"
                      : "bg-green-600 hover:bg-green-700"
                  }`}
                >
                  Submit Request
                </LoaderButton>
              )}
            </div>
          </form>
        </div>
      </div>
    </FormProvider>
  );
}
