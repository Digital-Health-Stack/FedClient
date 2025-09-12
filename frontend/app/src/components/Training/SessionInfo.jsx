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
  CheckIcon,
  DocumentPlusIcon,
  Cog6ToothIcon,
  CheckBadgeIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";
import React, { useEffect } from "react";
import { ProgressBar, Step } from "react-step-progress-bar";
import "react-step-progress-bar/styles.css";

const SessionInfo = ({ data }) => {
  // Training Status Configuration
  const TRAINING_STATUS = {
    STARTED: {
      label: "Training Started",
      variant: "info",
      icon: <DocumentPlusIcon className="h-5 w-5" />,
    },
    PRICE_NEGOTIATION: {
      label: "Price Negotiation",
      variant: "warning",
      icon: <CurrencyDollarIcon className="h-5 w-5" />,
    },
    ACCEPTING_CLIENTS: {
      label: "Client Recruitment",
      variant: "info",
      icon: <UserGroupIcon className="h-5 w-5" />,
    },
    COMPLETED: {
      label: "Completed",
      variant: "success",
      icon: <CheckBadgeIcon className="h-5 w-5" />,
      description: "Training successfully completed",
    },
    FAILED: {
      label: "Failed",
      variant: "danger",
      icon: <ExclamationTriangleIcon className="h-5 w-5" />,
    },
    CANCELLED: {
      label: "Cancelled",
      variant: "danger",
      icon: <XCircleIcon className="h-5 w-5" />,
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
    { key: 3, label: "Training Completed" },
  ];
  // Map string training_status to numeric step for progress bar
  const TRAINING_STATUS_MAP = {
    PRICE_NEGOTIATION: 0,
    ACCEPTING_CLIENTS: 1,
    STARTED: 2,
    COMPLETED: 3,
  };

  // Map training_status to progress index
  const currentStatus =
    typeof TRAINING_STATUS_MAP[data?.training_status] === "number"
      ? TRAINING_STATUS_MAP[data?.training_status]
      : 0;
  // If failed, show as completed but with error color
  const isFailed = currentStatus === -1;
  const progressIndex = isFailed
    ? steps.length - 1
    : Math.max(0, Math.min(currentStatus, steps.length - 1));

  // Helper to get time left for the current step
  const getStepTimeInfo = (idx) => {
    if (idx === 0) return "Waiting for your price confirmation. Go to Actions";
    else if (idx === 1) return "Waiting for client recruitment. ";
    else if (idx === 2)
      return (
        <p>
          Training in progress. <br /> On round {data?.curr_round}/{" "}
          {data?.federated_info?.no_of_rounds}
        </p>
      );
    return "--";
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Session Information Header */}
      <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <InformationCircleIcon className="h-5 w-5 text-indigo-600 mr-2" />
          Session Details
        </h3>
      </div>
      {/* Progress Bar with hoverable tooltip for time left */}
      {/* {alert(progressIndex + " " + steps.length)} */}
      <div className="relative p-6 mt-5 m-10">
        <ProgressBar
          percent={progressIndex * 33.33333333333333 + 1}
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
                      transform: "translate(-50%, -10%)",
                      zIndex: 2,
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-extrabold mb-2 
                      ${
                        isFailed && idx === steps.length - 1
                          ? "bg-red-500 text-white"
                          : accomplished
                          ? "bg-green-500 text-white"
                          : "bg-gray-200 border-2 border-gray-400 text-gray-500"
                      }`}
                  >
                    {isFailed && idx === steps.length - 1 ? (
                      <ExclamationTriangleIcon className="h-5 w-5 text-white" />
                    ) : accomplished ? (
                      <CheckIcon className="h-5 w-5 text-white" />
                    ) : (
                      <div className="h-5 w-5 text-white" />
                    )}
                  </div>
                  {/* Label */}
                  <span
                    style={{
                      position: "absolute",
                      top: 32,
                      left: "50%",
                      transform: "translate(-50%, 40%)",
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
        {/* Hoverable area for tooltip between current and next step */}
        {progressIndex < steps.length - 1 && !isFailed && (
          <div
            className="absolute"
            style={{
              left: `${(progressIndex / (steps.length - 1)) * 100}%`,
              width: `${100 / (steps.length - 1)}%`,
              top: 0,
              height: "100%",
              zIndex: 10,
              pointerEvents: "auto",
            }}
          >
            <div className="w-full h-full group">
              {/* Invisible hover area */}
              <div className="w-full h-6 cursor-pointer" />
              {/* Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 -top-2 hidden group-hover:block text-center text-white bg-gray-800 px-2 py-1 rounded shadow">
                {getStepTimeInfo(progressIndex)}
              </div>
            </div>
          </div>
        )}
      </div>
      {/* Session Details Content */}
      <div className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
          <InfoItem
            label="Training Name"
            value={data?.federated_info?.organisation_name || "N/A"}
            icon={<BuildingOfficeIcon className="h-5 w-5 text-gray-400" />}
          />
          <InfoItem
            label="Model Name"
            value={data?.federated_info?.model_name || "N/A"}
            icon={<CpuChipIcon className="h-5 w-5 text-gray-400" />}
          />
          <InfoItem
            label={"Expected " + data?.federated_info?.metric}
            value={data?.federated_info?.expected_std_mean}
            icon={<ScaleIcon className="h-5 w-5 text-gray-400" />}
          />
          <InfoItem
            label={"Expected Variation in " + data?.federated_info?.metric}
            value={data?.federated_info?.expected_std_deviation}
            icon={
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400"
                viewBox="0 0 14 14"
                fill="#000000"
              >
                <g
                  fill="none"
                  stroke="#000000"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <path d="M9.5 3.5h4v4" />
                  <path d="M13.5 3.5L7.85 9.15a.5.5 0 0 1-.7 0l-2.3-2.3a.5.5 0 0 0-.7 0L.5 10.5" />
                </g>
              </svg>
            }
          />
          <StatusItem
            label="Training Status"
            statusConfig={TRAINING_STATUS[data?.training_status || "FAILED"]}
          />
          {/* <StatusItem
            label="Client Status"
            statusConfig={
              CLIENT_STATUS[data?.client_status] || CLIENT_STATUS[-1]
            }
          /> */}
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
        {React.cloneElement(<InformationCircleIcon />, {
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
