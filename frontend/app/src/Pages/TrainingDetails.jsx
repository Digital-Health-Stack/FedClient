import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import TrainingProgress from "../components/Training/TrainingProgress";

const statusConfig = {
  0: {
    text: "Pending",
    color: "bg-blue-100 text-blue-800",
    icon: <ClockIcon className="h-5 w-5" />,
  },
  1: {
    text: "Waiting for Clients",
    color: "bg-blue-100 text-blue-800",
    icon: <InformationCircleIcon className="h-5 w-5" />,
  },
  2: {
    text: "Active",
    color: "bg-yellow-100 text-yellow-800",
    icon: <BoltIcon className="h-5 w-5" />,
  },
  3: {
    text: "Completed",
    color: "bg-green-100 text-green-800",
    icon: <CheckCircleIcon className="h-5 w-5" />,
  },
  "-2": {
    text: "Failed",
    color: "bg-red-100 text-red-800",
    icon: <ExclamationTriangleIcon className="h-5 w-5" />,
  },
  "-1": {
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
    {
      id: "training-progress", // New section
      label: "Training Progress",
      icon: <ArrowPathIcon className="h-5 w-5" />,
    },
  ];

  const renderStatusBadge = () => {
    const status = federatedSessionData?.training_status;
    const config = statusConfig[status] || statusConfig["-1"];

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${config.color}`}
      >
        {config.icon}
        <span className="ml-2">{config.text}</span>
      </span>
    );
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
              className={`w-full flex items-center px-3 py-2 text-sm font-medium rounded-md transition ${
                currentSection === section.id
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
          {currentSection === "training-progress" && (
            <TrainingProgress sessionId={sessionId} />
          )}
        </div>
      </div>
    </div>
  );
}
