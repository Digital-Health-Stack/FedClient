import {
  InformationCircleIcon,
  BuildingOfficeIcon,
  CpuChipIcon,
  ScaleIcon,
  ArrowPathIcon,
  UserGroupIcon,
  CurrencyDollarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  CogIcon,
  XCircleIcon,
  DocumentPlusIcon,
  Cog6ToothIcon,
  CheckBadgeIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";

const SessionInfo = ({ data }) => {
  // Training Status Configuration
  const TRAINING_STATUS = {
    0: {
      label: "Session Created",
      variant: "neutral",
      icon: <DocumentPlusIcon className="h-5 w-5" />,
    },
    1: {
      label: "Price Negotiation",
      variant: "warning",
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
    },
    2: {
      label: "Client Recruitment",
      variant: "info",
      icon: <UserGroupIcon className="h-5 w-5" />,
    },
    3: {
      label: "Model Initialization",
      variant: "primary",
      icon: <Cog6ToothIcon className="h-5 w-5" />,
    },
    4: {
      label: "Training Active",
      variant: "primary",
      icon: <ArrowPathIcon className="h-5 w-5 animate-spin" />,
    },
    5: {
      label: "Completed",
      variant: "success",
      icon: <CheckBadgeIcon className="h-5 w-5" />,
      description: "Training successfully completed",
    },
    [-1]: {
      label: "Failed",
      variant: "danger",
      icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    },
  };

  // Client Status Configuration
  const CLIENT_STATUS = {
    0: {
      label: "Accepted",
      variant: "success",
      icon: <CheckCircleIcon className="h-5 w-5" />,
    },
    1: {
      label: "Initialized",
      variant: "primary",
      icon: <CogIcon className="h-5 w-5" />,
    },
    [-1]: {
      label: "Rejected",
      variant: "danger",
      icon: <XCircleIcon className="h-5 w-5" />,
    },
  };

  // Define the ordered steps for the progress bar
  const steps = [
    { key: 0, label: "Session Created" },
    { key: 1, label: "Price Negotiation" },
    { key: 2, label: "Client Recruitment" },
    { key: 3, label: "Model Initialization" },
    { key: 4, label: "Training Active" },
    { key: 5, label: "Completed" },
  ];
  // Map training_status to progress index
  const currentStatus =
    typeof data?.training_status === "number" ? data.training_status : 0;
  // If failed, show as completed but with error color
  const isFailed = currentStatus === -1;
  const progressIndex = isFailed
    ? steps.length - 1
    : Math.max(0, Math.min(currentStatus, steps.length - 1));

  useEffect(() => {
    console.log("Training Status Value:", data);
  }, [data]);

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Session Information Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-indigo-600 mr-2" />
          Session Details
        </h3>
      </div>
      {/* Progress Bar */}
      <div className="p-6 mt-5 m-10">
        <ProgressBar
          percent={(progressIndex / (steps.length - 1)) * 100}
          filledBackground="#22c55e"
          height={6}
        >
          {steps.map((step, idx) => (
            <Step key={step.key}>
              {({ accomplished }) => (
                <div className="relative w-6 h-6 flex flex-col items-center">
                  {/* Circle */}
                  <div
                    style={{
                      position: "absolute",
                      top: 0,
                      left: "50%",
                      transform: "translate(-50%, 0)",
                      zIndex: 2,
                    }}
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2
                      ${
                        isFailed && idx === steps.length - 1
                          ? "bg-red-500 border-red-700 text-white"
                          : idx === progressIndex
                          ? "bg-green-500 border-green-400 text-white"
                          : accomplished
                          ? "bg-green-500 border-green-400 text-white"
                          : "bg-gray-200 border-gray-400 text-gray-500"
                      }`}
                  >
                    {idx + 1}
                  </div>
                  {/* Label */}
                  <span
                    style={{
                      position: "absolute",
                      top: 32,
                      left: "50%",
                      transform: "translate(-50%, 0)",
                      width: 80,
                      textAlign: "center",
                      fontSize: 12,
                      fontWeight: idx <= progressIndex ? 600 : 400,
                      color: idx <= progressIndex ? "#22c55e" : "#6b7280",
                      zIndex: 1,
                    }}
                  >
                    {step.label}
                  </span>
                </div>
              )}
            </Step>
          ))}
        </ProgressBar>
      </div>
      {/* Session Details Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InfoItem
            label="Organisation Name"
            value={data?.federated_info?.organisation_name || "N/A"}
            icon={<BuildingOfficeIcon className="h-5 w-5 text-gray-400" />}
          />
          <InfoItem
            label="Model Name"
            value={data?.federated_info?.model_name || "N/A"}
            icon={<CpuChipIcon className="h-5 w-5 text-gray-400" />}
          />
          <InfoItem
            label="Expected Value"
            value={data?.federated_info?.expected_results?.std_mean}
            icon={<ScaleIcon className="h-5 w-5 text-gray-400" />}
          />
          <InfoItem
            label="Expected Deviation"
            value={data?.federated_info?.expected_results?.std_deviation}
            icon={<ArrowPathIcon className="h-5 w-5 text-gray-400" />}
          />
          <StatusItem
            label="Training Status"
            statusConfig={
              TRAINING_STATUS[data?.training_status] || TRAINING_STATUS[0]
            }
          />
          <StatusItem
            label="Client Status"
            statusConfig={
              CLIENT_STATUS[data?.client_status] || CLIENT_STATUS[-1]
            }
          />
        </div>
      </div>
    </div>
  );
};

// Supporting components
const InfoItem = ({ label, value, icon }) => (
  <div className="flex items-start space-x-3">
    <div className="flex-shrink-0 mt-0.5">{icon}</div>
    <div>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="text-base font-semibold text-gray-900">{value}</p>
    </div>
  </div>
);

const StatusItem = ({ label, statusConfig }) => {
  const variantClasses = {
    primary: "bg-blue-50 text-blue-800",
    success: "bg-green-50 text-green-800",
    warning: "bg-yellow-50 text-yellow-800",
    danger: "bg-red-50 text-red-800",
    info: "bg-cyan-50 text-cyan-800",
    neutral: "bg-gray-50 text-gray-800",
  };

  return (
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0 mt-0.5">
        {React.cloneElement(statusConfig.icon, {
          className: `h-5 w-5 ${
            variantClasses[statusConfig.variant]
              .replace("bg-", "text-")
              .split(" ")[1]
          }`,
        })}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500">{label}</p>
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
            variantClasses[statusConfig.variant]
          }`}
        >
          {statusConfig.label}
        </span>
      </div>
    </div>
  );
};

export default SessionInfo;
