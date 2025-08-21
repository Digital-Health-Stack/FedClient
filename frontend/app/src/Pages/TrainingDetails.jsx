import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { useAuth } from "../contexts/AuthContext";
import { getFederatedSession } from "../services/federatedService";
import axios from "axios";
import FederatedSessionLogs from "../components/Training/FederatedSessionLogs";
import SessionInfo from "../components/Training/SessionInfo";
import DatasetInfo from "../components/Training/DatasetInfo";
import ModelConfig from "../components/Training/ModelConfig";
import {
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  ChartBarIcon,
  CogIcon,
  ServerStackIcon,
  InformationCircleIcon,
  BoltIcon,
} from "@heroicons/react/24/outline";
import ActionSection from "../components/Training/ActionSection";
import Result from "../components/Training/Result";
// import TrainingProgress from "../components/Training/TrainingProgress";

const statusConfig = {
  STARTED: {
    text: "Training Started",
    color: "bg-blue-100 text-blue-800",
    icon: <ClockIcon className="h-5 w-5" />,
  },
  ACCEPTING_CLIENTS: {
    text: "Waiting for Clients",
    color: "bg-blue-100 text-blue-800",
    icon: <InformationCircleIcon className="h-5 w-5" />,
  },
  PRICE_NEGOTIATION: {
    text: "Awaiting price approval",
    color: "bg-yellow-100 text-yellow-800",
    icon: <BoltIcon className="h-5 w-5" />,
  },
  COMPLETED: {
    text: "Completed",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircleIcon className="h-5 w-5" />,
  },
  FAILED: {
    text: "Failed",
    color: "bg-red-100 text-red-800",
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
  },
  CANCELLED: {
    text: "Cancelled",
    color: "bg-red-100 text-red-800",
    icon: <XCircleIcon className="h-5 w-5" />,
  },
};

export default function TrainingDetails() {
  const { sessionId } = useParams();
  const { api } = useAuth();
  const [federatedSessionData, setFederatedSessionData] = useState({});
  const [currentSection, setCurrentSection] = useState("session-info");
  const [showSectionInfo, setShowSectionInfo] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  const fetchFederatedSessionData = async () => {
    try {
      setIsRefreshing(true);
      const response = await getFederatedSession(api, sessionId);
      setFederatedSessionData(response.data);
    } catch (error) {
      console.error("Error fetching session data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchFederatedSessionData();
  }, [sessionId]);

  const sections = [
    {
      id: "session-info",
      label: "Session Information",
      icon: <InformationCircleIcon className="h-5 w-5" />,
    },
    {
      id: "dataset-info",
      label: "Dataset",
      icon: <ServerStackIcon className="h-5 w-5" />,
    },
    {
      id: "model-config",
      label: "Model Config",
      icon: <CogIcon className="h-5 w-5" />,
    },
    {
      id: "session-logs",
      label: "Logs",
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    {
      id: "results",
      label: "Results",
      icon: <ChartBarIcon className="h-5 w-5" />,
    },
    { id: "actions", label: "Actions", icon: <BoltIcon className="h-5 w-5" /> },
    { id: "retry", label: "Retry Training", icon: <ArrowPathIcon className="h-5 w-5" /> },
    // {
    //   id: "training-progress", // New section
    //   label: "Training Progress",
    //   icon: <ArrowPathIcon className="h-5 w-5" />,
    // },
  ];

  const renderStatusBadge = () => {
    const status = federatedSessionData?.training_status;
    const config = statusConfig[status] || statusConfig["CANCELLED"];

    return (
      <div
        className={`inline-flex items-center px-3 py-1  rounded-full text-sm font-medium ${config.color}`}
      >
        {config.icon}
        <span className="ml-2">{config.text}</span>
      </div>
    );
  };

  const handleRetryNavigation = () => {
    const fed = federatedSessionData?.federated_info || {};
    const originalName = (fed.organisation_name || "").trim();
    let retryName = originalName || "training";
    const retryMatch = retryName.match(/^(.*)_retry(\d+)$/i);
    if (retryMatch) {
      const base = retryMatch[1];
      const n = parseInt(retryMatch[2], 10) || 0;
      retryName = `${base}_retry${n + 1}`;
    } else {
      retryName = `${retryName}_retry1`;
    }
    const prefill = {
      organisation_name: retryName,
      server_filename: fed.server_filename || "",
      task_id: fed.task_id ? String(fed.task_id) : "",
      task_name: fed.task_name || "",
      metric: fed.metric || "",
      input_columns: Array.isArray(fed.input_columns) ? fed.input_columns : [],
      output_columns: Array.isArray(fed.output_columns)
        ? fed.output_columns
        : [],
      model_name: fed.model_name || "",
      model_info: fed.model_info || {},
      expected_std_mean: fed.expected_std_mean || "",
      expected_std_deviation: fed.expected_std_deviation || "",
      wait_time: fed.wait_time ?? 0,
      no_of_rounds: fed.no_of_rounds || "",
      server_stats: null,
      server_stats_data: null,
      client_stats: null,
    };

    navigate("/Request", {
      state: {
        retry: true,
        fromSessionId: sessionId,
        prefill,
        lockedStepIds: [0, 1],
      },
    });
  };

  if (!federatedSessionData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-sm max-w-md">
          <ExclamationTriangleIcon className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-4 text-lg font-medium text-gray-900">
            No session data
          </h3>
          <p className="mt-2 text-sm text-gray-600">
            The requested training session could not be found or loaded.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50 min-h-screen">
      {/* Sidebar Navigation */}
      <div className="w-64 bg-white shadow-sm p-4 border-r border-gray-200">
        <div className="flex items-center justify-between mb-6 p-2">
          <h3 className="text-lg font-semibold text-gray-800">
            Session Navigation
          </h3>
          <button
            onClick={fetchFederatedSessionData}
            disabled={isRefreshing}
            className="p-1 text-gray-500 hover:text-gray-700 disabled:opacity-50"
          >
            <ArrowPathIcon
              className={`h-5 w-5 ${isRefreshing ? "animate-spin" : ""}`}
            />
          </button>
        </div>

        <div className="mb-4 p-2">{renderStatusBadge()}</div>

        <nav className="space-y-1">
          {sections.map((section) => (
            <button
              key={section.id}
              onClick={() => setCurrentSection(section.id)}
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${currentSection === section.id
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              <span className="mr-3">{section.icon}</span>
              {section.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6">
        <div className="bg-white rounded-lg shadow-sm p-6 relative">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-semibold text-gray-900">
                {sections.find((s) => s.id === currentSection)?.label ||
                  "Section"}
              </h2>
              <div className="relative ml-2">
                <button
                  type="button"
                  className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
                  onClick={() => setShowSectionInfo((prev) => !prev)}
                  aria-label="Show info about this section"
                >
                  <span className="font-bold text-xs">
                    <InformationCircleIcon className="h-5 w-5" />
                  </span>
                </button>
                {showSectionInfo && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-72 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
                    <div className="flex justify-between items-center mb-2">
                      <span className="font-semibold">
                        {sections.find((s) => s.id === currentSection)?.label ||
                          "Section"}
                      </span>
                      <button
                        className="text-gray-400 hover:text-gray-600"
                        onClick={() => setShowSectionInfo(false)}
                        aria-label="Close info"
                      >
                        ×
                      </button>
                    </div>
                    <div>
                      {currentSection === "session-info" &&
                        "Overview and metadata of the current federated training session."}
                      {currentSection === "dataset-info" &&
                        "Details about the dataset(s) used in this session."}
                      {currentSection === "model-config" &&
                        "Configuration and parameters of the selected machine learning model."}
                      {currentSection === "session-logs" &&
                        "Logs and events recorded during the training session."}
                      {currentSection === "results" &&
                        "Results and evaluation metrics from the completed training session."}
                      {currentSection === "actions" &&
                        "Actions you can perform on this session, such as retrain or stop."}
                      {currentSection === "training-progress" &&
                        "Progress and status of the ongoing training rounds."}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          {currentSection === "session-info" && (
            <SessionInfo data={federatedSessionData} />
          )}
          {currentSection === "session-logs" && (
            <FederatedSessionLogs sessionId={sessionId} />
          )}
          {currentSection === "dataset-info" && (
            <DatasetInfo data={federatedSessionData.federated_info} />
          )}
          {currentSection === "model-config" && (
            <ModelConfig data={federatedSessionData.federated_info} />
          )}
          {currentSection === "actions" && (
            <ActionSection data={federatedSessionData} sessionId={sessionId} />
          )}
          {currentSection === "results" && <Result sessionId={sessionId} />}
          {/* {currentSection === "training-progress" && (
            <TrainingProgress sessionId={sessionId} />
          )} */}
          {currentSection === "retry" && (
            <div className="text-center">
              <button
                onClick={handleRetryNavigation}
                className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium"
              >
                Retry this training as new request
              </button>
              <p className="mt-3 text-sm text-gray-500">
                You will be redirected to the new training page with the same
                details. Model configuration and later steps will be reset.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
