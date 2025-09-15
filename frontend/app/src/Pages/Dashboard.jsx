import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useHelp } from "../contexts/HelpContext";
import Joyride from "react-joyride";
import {
  getAllSessions,
  getUserInitiatedSessions,
} from "../services/federatedService";
import {
  getRawDatasets,
  getProcessedDatasets,
} from "../services/privateService";
import { InformationCircleIcon } from "@heroicons/react/24/outline";

export default function Dashboard() {
  const [initiatedSessions, setInitiatedSessions] = useState([]);
  const [datasets, setDatasets] = useState({ uploads: [], processed: [] });
  const [sessions, setSessions] = useState([]);
  const { api } = useAuth();
  const user = JSON.parse(localStorage.getItem("user"));
  // Update fetchInitiatedSession
  const fetchInitiatedSession = async () => {
    try {
      const res = await getUserInitiatedSessions(api);
      // Check if res.data is an array before slicing
      const data = Array.isArray(res.data) ? res.data : [];
      setInitiatedSessions(data.slice(0, 5));
    } catch (error) {
      setInitiatedSessions([]);
      console.error("Error fetching initiated sessions:", error);
    }
  };

  // Update fetchDatasets
  const fetchDatasets = async () => {
    try {
      const [raw, processed] = await Promise.all([
        getRawDatasets().catch(() => ({ data: [] })), // Handle rejected promises
        getProcessedDatasets().catch(() => ({ data: [] })),
      ]);

      // Ensure data is an array
      const uploads = Array.isArray(raw.data) ? raw.data : [];
      const processedData = Array.isArray(processed.data) ? processed.data : [];

      setDatasets({ uploads, processed: processedData });
    } catch (error) {
      setDatasets({ uploads: [], processed: [] });
      console.error("Error fetching datasets:", error);
    }
  };

  // Update fetchSessions
  const fetchSessions = async () => {
    try {
      const res = await getAllSessions(api, 1, 5);
      const data = Array.isArray(res.data.data) ? res.data.data : [];
      setSessions(data.slice(0, 5));
    } catch (error) {
      setSessions([]);
      console.error("Error fetching sessions:", error);
    }
  };
  const getStatusColor = (status) => {
    switch (status) {
      case "CREATED":
        return "bg-gray-100 text-gray-800"; // Session Created
      case "PRICE_NEGOTIATION":
        return "bg-yellow-100 text-yellow-800"; // Price Negotiation
      case "ACCEPTING_CLIENTS":
        return "bg-blue-100 text-blue-800"; // Client Recruitment
      case "MODEL_INITIALIZATION":
        return "bg-indigo-100 text-indigo-800"; // Model Initialization
      case "STARTED":
        return "bg-purple-100 text-purple-800"; // Training Active
      case "COMPLETED":
        return "bg-green-100 text-green-800"; // Completed
      case "FAILED":
        return "bg-red-100 text-red-800"; // Failed
      case "CANCELLED":
        return "bg-red-800 text-red-100"; // Cancelled
      default:
        return "bg-gray-100 text-gray-800"; // Unknown
    }
  };

  const TrainingStatuses = {
    PRICE_NEGOTIATION: "Price Negotiation",
    ACCEPTING_CLIENTS: "Client Recruitment",
    STARTED: "Training Active",
    COMPLETED: "Completed",
    CANCELLED: "Cancelled",
    FAILED: "Failed",
  };

  useEffect(() => {
    // fetchInitiatedSession();
    fetchDatasets();
    fetchSessions();
  }, []);
  const { showWalkthrough, stopWalkthrough } = useHelp();
  const [walkthroughKey, setWalkthroughKey] = useState(0);
  const [steps] = useState([
    {
      target: ".navbar-dashboard",
      content:
        "This is your Dashboard - the main overview of your federated learning activities.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: ".navbar-new-training",
      content: "Click here to start a new federated learning training session.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: ".navbar-trainings",
      content: "View all your training sessions and their current status.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: ".navbar-manage-data",
      content: "Upload and manage your datasets for federated learning.",
      disableBeacon: true,
      placement: "bottom",
    },
    {
      target: ".dashboard-active-sessions",
      content: "Monitor your active training sessions here.",
      disableBeacon: true,
    },
    {
      target: ".dashboard-raw-datasets",
      content: "Manage your raw datasets here.",
      disableBeacon: true,
    },
    {
      target: ".dashboard-processed-datasets",
      content: "Manage your pre-processed datasets here.",
      disableBeacon: true,
    },
    {
      target: ".dashboard-active-training-sessions",
      content: "View your active training sessions here.",
      disableBeacon: true,
    },
    {
      target: ".dashboard-recent-datasets",
      content: "View your recent uploaded datasets here.",
      disableBeacon: true,
    },
    {
      target: ".dashboard-recent-sessions",
      content: "View your recent completed sessions here.",
      disableBeacon: true,
    },
    {
      target: ".dashboard-add-training",
      content: "Add a new training session from here.",
      disableBeacon: true,
    },
  ]);

  const handleJoyrideCallback = (data) => {
    const { action, status } = data;
    if (action === "close" || status === "finished" || action === "skip") {
      stopWalkthrough();
    }
  };

  // Reset walkthrough when it starts
  useEffect(() => {
    if (showWalkthrough) {
      setWalkthroughKey((prev) => prev + 1);
    }
  }, [showWalkthrough]);

  const [showRawInfo, setShowRawInfo] = useState(false);
  const [showActiveSessionsInfo, setShowActiveSessionsInfo] = useState(false);
  const [showProcessedInfo, setShowProcessedInfo] = useState(false);
  const [showActiveTrainingInfo, setShowActiveTrainingInfo] = useState(false);
  const [showRecentDatasetsInfo, setShowRecentDatasetsInfo] = useState(false);
  const [showRecentSessionsInfo, setShowRecentSessionsInfo] = useState(false);

  return (
    <>
      <Joyride
        key={walkthroughKey}
        run={showWalkthrough}
        steps={steps}
        continuous
        showSkipButton
        callback={handleJoyrideCallback}
        locale={{
          last: "Finish",
          back: "Prev",
        }}
        styles={{
          tooltipContent: {
            paddingBlock: 0,
            textAlign: "left",
            paddingRight: "25px",
          },
          tooltip: {
            // backgroundColor: "red",
            // paddingInline: "5px",
          },
          options: {
            arrowColor: "#fff",
            backgroundColor: "#fff",
            overlayColor: "rgba(0, 0, 0, 0.5)",
            primaryColor: "#000",
            textColor: "#000",
            zIndex: 1000,
          },
        }}
      />
      <div className="min-h-[calc(100vh-57px)] bg-gray-50 p-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            {(() => {
              const getGreeting = () => {
                const now = new Date();
                const hour = now.getHours();
                if (hour >= 5 && hour < 12) {
                  return "Good Morning";
                } else if (hour >= 12 && hour < 16) {
                  return "Good Afternoon";
                } else if (hour >= 16 && hour < 20) {
                  return "Good Evening";
                } else if (hour >= 20 && hour < 24) {
                  return "Welcome back";
                } else {
                  const lateNightGreetings = ["Still up?", "Working late?"];
                  return lateNightGreetings[
                    Math.floor(Math.random() * lateNightGreetings.length)
                  ];
                }
              };
              return getGreeting() + ", " + (user.name || user.username) + "!";
            })()}
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-sm dashboard-active-sessions relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-500 ">Active Sessions</p>
                    <div className="relative ml-1">
                      <button
                        type="button"
                        className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
                        onClick={() =>
                          setShowActiveSessionsInfo((prev) => !prev)
                        }
                        aria-label="Show info about active sessions"
                      >
                        <span className="font-bold text-xs">
                          <InformationCircleIcon className="h-5 w-5" />
                        </span>
                      </button>
                      {showActiveSessionsInfo && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">
                              Active Sessions
                            </span>
                            <button
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => setShowActiveSessionsInfo(false)}
                              aria-label="Close info"
                            >
                              ×
                            </button>
                          </div>
                          <div>
                            Shows the number of federated learning sessions you
                            have initiated and are currently active.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {initiatedSessions.length}
                  </p>
                </div>
                <div className="bg-blue-100 p-3 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-blue-600"
                    viewBox="0 0 15 15"
                  >
                    <path
                      fill="currentColor"
                      fillRule="evenodd"
                      d="M7.07.65a.85.85 0 0 0-.828.662l-.238 1.05c-.38.11-.74.262-1.08.448l-.91-.574a.85.85 0 0 0-1.055.118l-.606.606a.85.85 0 0 0-.118 1.054l.574.912c-.186.338-.337.7-.447 1.079l-1.05.238a.85.85 0 0 0-.662.829v.857a.85.85 0 0 0 .662.829l1.05.238c.11.379.261.74.448 1.08l-.575.91a.85.85 0 0 0 .118 1.055l.607.606a.85.85 0 0 0 1.054.118l.911-.574c.339.186.7.337 1.079.447l.238 1.05a.85.85 0 0 0 .829.662h.857a.85.85 0 0 0 .829-.662l.238-1.05c.38-.11.74-.26 1.08-.447l.911.574a.85.85 0 0 0 1.054-.118l.606-.606a.85.85 0 0 0 .118-1.054l-.574-.911c.187-.34.338-.7.448-1.08l1.05-.238a.85.85 0 0 0 .662-.829v-.857a.85.85 0 0 0-.662-.83l-1.05-.237c-.11-.38-.26-.74-.447-1.08l.574-.91a.85.85 0 0 0-.118-1.055l-.606-.606a.85.85 0 0 0-1.055-.118l-.91.574a5.323 5.323 0 0 0-1.08-.448l-.239-1.05A.85.85 0 0 0 7.928.65h-.857ZM4.92 3.813a4.476 4.476 0 0 1 1.795-.745L7.071 1.5h.857l.356 1.568a4.48 4.48 0 0 1 1.795.744l1.36-.857l.607.606l-.858 1.36c.37.527.628 1.136.744 1.795l1.568.356v.857l-1.568.355a4.475 4.475 0 0 1-.744 1.796l.857 1.36l-.606.606l-1.36-.857a4.476 4.476 0 0 1-1.795.743L7.928 13.5h-.857l-.356-1.568a4.475 4.475 0 0 1-1.794-.744l-1.36.858l-.607-.606l.858-1.36a4.476 4.476 0 0 1-.744-1.796L1.5 7.93v-.857l1.568-.356a4.476 4.476 0 0 1 .744-1.794L2.954 3.56l.606-.606l1.36.858ZM9.026 7.5a1.525 1.525 0 1 1-3.05 0a1.525 1.525 0 0 1 3.05 0Zm.9 0a2.425 2.425 0 1 1-4.85 0a2.425 2.425 0 0 1 4.85 0Z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
              <Link
                to="/trainings"
                className="text-blue-600 text-sm mt-4 block hover:underline"
              >
                View all sessions →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm dashboard-raw-datasets relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-500">Raw Datasets</p>
                    <div className="relative ml-1">
                      <button
                        type="button"
                        className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
                        onClick={() => setShowRawInfo((prev) => !prev)}
                        aria-label="Show info about raw datasets"
                      >
                        <span className="font-bold text-xs">
                          <InformationCircleIcon className="h-5 w-5" />
                        </span>
                      </button>
                      {showRawInfo && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">Raw Datasets</span>
                            <button
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => setShowRawInfo(false)}
                              aria-label="Close info"
                            >
                              ×
                            </button>
                          </div>
                          <div>
                            These are the original datasets you have uploaded.
                            You can manage, view, or preprocess them for
                            federated learning tasks.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {datasets.uploads.length}
                  </p>
                </div>
                <div className="bg-purple-100 p-3 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-purple-600"
                    viewBox="0 0 16 16"
                  >
                    <path
                      strokeWidth="2"
                      fill="currentColor"
                      // fillRule="evenodd"
                      d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.597 11.85H0v3.999h.782v-1.491h.71l.7 1.491h1.651l.313-1.028h1.336l.314 1.028h.84L5.31 11.85h-.925l-1.329 3.96l-.783-1.572A1.18 1.18 0 0 0 3 13.116c0-.256-.056-.479-.167-.668a1.098 1.098 0 0 0-.478-.44a1.669 1.669 0 0 0-.758-.158Zm-.815 1.913v-1.292h.7a.74.74 0 0 1 .507.17c.13.113.194.276.194.49c0 .21-.065.368-.194.474c-.127.105-.3.158-.518.158H.782Zm4.063-1.148l.489 1.617H4.32l.49-1.617h.035Zm4.006.445l-.74 2.789h-.73L6.326 11.85h.855l.601 2.903h.038l.706-2.903h.683l.706 2.903h.04l.596-2.903h.858l-1.055 3.999h-.73l-.74-2.789H8.85Z"
                    />
                  </svg>
                </div>
              </div>
              <Link
                to="/view-all-datasets"
                className="text-blue-600 text-sm mt-4 block hover:underline"
              >
                Manage datasets →
              </Link>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm dashboard-processed-datasets relative">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1">
                    <p className="text-sm text-gray-500">Processed Datasets</p>
                    <div className="relative ml-1">
                      <button
                        type="button"
                        className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
                        onClick={() => setShowProcessedInfo((prev) => !prev)}
                        aria-label="Show info about processed datasets"
                      >
                        <span className="font-bold text-xs">
                          <InformationCircleIcon className="h-5 w-5" />
                        </span>
                      </button>
                      {showProcessedInfo && (
                        <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-64 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
                          <div className="flex justify-between items-center mb-2">
                            <span className="font-semibold">
                              Processed Datasets
                            </span>
                            <button
                              className="text-gray-400 hover:text-gray-600"
                              onClick={() => setShowProcessedInfo(false)}
                              aria-label="Close info"
                            >
                              ×
                            </button>
                          </div>
                          <div>
                            These are datasets that have been pre-processed and
                            are ready for use in federated learning tasks.
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  <p className="text-2xl font-semibold mt-2">
                    {datasets.processed.length}
                  </p>
                </div>
                <div className="bg-green-100 p-3 rounded-lg">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 text-green-600"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill="currentColor"
                      d="M12 0H5v6h.7l.2.7l.1.1V1h5v4h4v9H9l.3.5l-.5.5H16V4l-4-4zm0 4V1l3 3h-3zm-6.5 7.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"
                    />
                    <path
                      fill="currentColor"
                      d="M7.9 12.4L9 12v-1l-1.1-.4c-.1-.3-.2-.6-.4-.9l.5-1l-.7-.7l-1 .5c-.3-.2-.6-.3-.9-.4L5 7H4l-.4 1.1c-.3.1-.6.2-.9.4l-1-.5l-.7.7l.5 1.1c-.2.3-.3.6-.4.9L0 11v1l1.1.4c.1.3.2.6.4.9l-.5 1l.7.7l1.1-.5c.3.2.6.3.9.4L4 16h1l.4-1.1c.3-.1.6-.2.9-.4l1 .5l.7-.7l-.5-1.1c.2-.2.3-.5.4-.8zm-3.4 1.1c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2z"
                    />
                  </svg>
                </div>
              </div>
              <Link
                to="/view-all-datasets"
                className="text-blue-600 text-sm mt-4 block hover:underline"
              >
                Process data →
              </Link>
            </div>
          </div>

          {/* Active Sessions Table */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-8 dashboard-active-training-sessions relative">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Active Training Sessions
              </h2>
              <Link
                to="/trainings"
                className="text-blue-600 text-sm hover:underline"
              >
                View All →
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Session ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {initiatedSessions.length > 0 &&
                    initiatedSessions.map((session) => (
                      <tr key={session.session_id}>
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {session.session_id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-600"
                                style={{
                                  width: `${
                                    (session.curr_round / session.max_round) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                            <span className="ml-2 text-sm text-gray-600">
                              {session.curr_round}/{session.max_round}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getStatusColor(
                              session.training_status
                            )}`}
                          >
                            {TrainingStatuses[session.training_status] ||
                              "Unknown"}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <Link
                            to={`/trainings/${session.session_id}`}
                            className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                          >
                            Details →
                          </Link>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
              {!initiatedSessions.length && (
                <div className="text-center py-8 text-gray-500">
                  No active training sessions
                </div>
              )}
            </div>
          </div>

          {/* Recent Data Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Datasets */}
            <div className="bg-white rounded-xl shadow-sm p-6 dashboard-recent-datasets relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Datasets
                </h2>
                <Link
                  to="/view-all-datasets"
                  className="text-blue-600 text-sm hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {datasets.uploads
                  .sort(
                    (a, b) => new Date(b.dataset_id) - new Date(a.dataset_id)
                  )
                  .slice(0, 2)
                  .map((dataset) => (
                    <div
                      key={dataset.dataset_id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-100 p-2 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5 text-blue-600"
                            viewBox="0 0 16 16"
                            fill="#000000"
                          >
                            <path
                              fill="#000000"
                              fillRule="evenodd"
                              d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.597 11.85H0v3.999h.782v-1.491h.71l.7 1.491h1.651l.313-1.028h1.336l.314 1.028h.84L5.31 11.85h-.925l-1.329 3.96l-.783-1.572A1.18 1.18 0 0 0 3 13.116c0-.256-.056-.479-.167-.668a1.098 1.098 0 0 0-.478-.44a1.669 1.669 0 0 0-.758-.158Zm-.815 1.913v-1.292h.7a.74.74 0 0 1 .507.17c.13.113.194.276.194.49c0 .21-.065.368-.194.474c-.127.105-.3.158-.518.158H.782Zm4.063-1.148l.489 1.617H4.32l.49-1.617h.035Zm4.006.445l-.74 2.789h-.73L6.326 11.85h.855l.601 2.903h.038l.706-2.903h.683l.706 2.903h.04l.596-2.903h.858l-1.055 3.999h-.73l-.74-2.789H8.85Z"
                            />
                          </svg>
                        </div>
                        <span
                          title={dataset.filename}
                          className="text-sm font-medium text-gray-900"
                        >
                          {dataset.filename.length > 40
                            ? `${dataset.filename.substring(0, 40)}...`
                            : dataset.filename}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium text-blue-800 bg-blue-100 rounded-full">
                          Raw
                        </span>
                      </div>
                      <Link
                        to={`/raw-dataset-overview/${dataset.filename}`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                {datasets.processed
                  .sort(
                    (a, b) => new Date(b.dataset_id) - new Date(a.dataset_id)
                  )
                  .slice(0, 3)
                  .map((dataset) => (
                    <div
                      key={dataset.dataset_id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-100 p-2 rounded-lg">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fill="#000000"
                              d="M12 0H5v6h.7l.2.7l.1.1V1h5v4h4v9H9l.3.5l-.5.5H16V4l-4-4zm0 4V1l3 3h-3zm-6.5 7.5a1 1 0 1 1-2 0a1 1 0 0 1 2 0z"
                            />
                            <path
                              fill="#000000"
                              d="M7.9 12.4L9 12v-1l-1.1-.4c-.1-.3-.2-.6-.4-.9l.5-1l-.7-.7l-1 .5c-.3-.2-.6-.3-.9-.4L5 7H4l-.4 1.1c-.3.1-.6.2-.9.4l-1-.5l-.7.7l.5 1.1c-.2.3-.3.6-.4.9L0 11v1l1.1.4c.1.3.2.6.4.9l-.5 1l.7.7l1.1-.5c.3.2.6.3.9.4L4 16h1l.4-1.1c.3-.1.6-.2.9-.4l1 .5l.7-.7l-.5-1.1c.2-.2.3-.5.4-.8zm-3.4 1.1c-1.1 0-2-.9-2-2s.9-2 2-2s2 .9 2 2s-.9 2-2 2z"
                            />
                          </svg>
                        </div>
                        <span
                          title={dataset.filename}
                          className="text-sm font-medium text-gray-900"
                        >
                          {dataset.filename.length > 40
                            ? `${dataset.filename.substring(0, 40)}...`
                            : dataset.filename}
                        </span>
                        <span className="px-2 py-1 text-xs font-medium text-green-800 bg-green-100 rounded-full">
                          Processed
                        </span>
                      </div>
                      <Link
                        to={`/processed-dataset-overview/${dataset.filename}`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  ))}
                {!datasets.uploads.length && !datasets.processed.length && (
                  <div className="text-center py-4 text-gray-500">
                    No datasets found
                  </div>
                )}
              </div>
            </div>

            {/* Recent Sessions */}
            <div className="bg-white rounded-xl shadow-sm p-6 dashboard-recent-sessions relative">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">
                  Recent Sessions
                </h2>
                <Link
                  to="/trainings"
                  className="text-blue-600 text-sm hover:underline"
                >
                  View All →
                </Link>
              </div>
              <div className="space-y-4">
                {sessions.map((session) => {
                  const getStatusIcon = (status) => {
                    switch (status) {
                      case "CREATED":
                        return (
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 6v6m0 0v6m0-6h6m-6 0H6"
                            />
                          </svg>
                        );
                      case "PRICE_NEGOTIATION":
                        return (
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="w-5 h-5"
                            viewBox="0 0 72 72"
                          >
                            <ellipse
                              cx="34.153"
                              cy="34.635"
                              fill="#fcea2b"
                              rx="29.033"
                              ry="22.118"
                              transform="rotate(-51.131 34.153 34.635)"
                            />
                            <path
                              fill="#fff"
                              d="M52.139 12.03a18.698 18.698 0 0 0-13.3-3.86a17.98 17.98 0 0 1 10.077 3.86c9.51 7.666 9.064 24-.998 36.484c-6.14 7.618-14.44 12.034-22.14 12.584c8.53.639 18.353-3.889 25.362-12.584c10.062-12.484 10.51-28.819.999-36.484Z"
                            />
                            <path
                              fill="#f1b31c"
                              d="M55.349 13.082a20.374 20.374 0 0 0-1.558-1.138a.928.928 0 0 0-.11-.045a1.03 1.03 0 0 0-.556-.102a.923.923 0 0 0-.527.235a.943.943 0 0 0-.094.069c-.019.02-.025.047-.042.068s-.041.034-.057.057a.945.945 0 0 0-.044.11a1.027 1.027 0 0 0-.102.562a.978.978 0 0 0 .043.183a.834.834 0 0 0 .19.336a.941.941 0 0 0 .07.097c8.278 7.636 7.415 22.736-1.965 34.375c-9.702 12.035-24.97 15.88-34.034 8.573a.96.96 0 0 0-.187-.097l-.055-.029a.97.97 0 0 0-.3-.074c-.027-.002-.053-.006-.08-.007a.916.916 0 0 0-.59.196a.94.94 0 0 0-.098.058c-.02.017-.027.041-.044.06c-.016.017-.038.025-.053.043a.935.935 0 0 0-.047.091a.96.96 0 0 0-.117.226a.934.934 0 0 0-.024.097a.972.972 0 0 0-.026.297c.002.02.006.038.009.058a.965.965 0 0 0 .096.312c.008.016.018.03.027.045a.953.953 0 0 0 .109.183a20.069 20.069 0 0 0 2.286 2.158a21.13 21.13 0 0 0 13.441 4.555c8.59 0 17.89-4.48 24.528-12.715c10.444-12.957 10.403-30.38-.09-38.837Z"
                            />
                            <path
                              fill="#f1b31c"
                              d="M20.652 44.72c.073-.232.61-2.214.681-2.446c5.918.106 6.21-.091 7.089-3.008c1.66-5.508 2.144-6.494 3.805-12.002c.583-1.932.48-2.354-2.29-2.882l-1.687-.311c.063-.204.441-2.075.504-2.278a94.249 94.249 0 0 0 12.214-.789l-5.499 19c-.858 2.966-.752 3.204 4.93 4.302c-.066.234-.6 2.218-.665 2.453Z"
                            />
                            <g fill="none" stroke="#000" stroke-width="2">
                              <path
                                stroke-miterlimit="10"
                                d="M53.237 12.777q.762.501 1.483 1.082c10.08 8.124 10.052 24.883-.061 37.43S28.175 67.424 18.095 59.3a19.09 19.09 0 0 1-2.172-2.05"
                              />
                              <ellipse
                                cx="34.153"
                                cy="34.635"
                                stroke-miterlimit="10"
                                rx="29.033"
                                ry="22.118"
                                transform="rotate(-51.131 34.153 34.635)"
                              />
                              <path
                                stroke-miterlimit="10"
                                d="m51.373 48.515l3.286 2.775m-6.743.97l2.896 3.113m-6.555-.069l2.378 3.322m-6.392-.644l1.872 3.344m11.921-16.551l3.489 2.414"
                              />
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M20.652 44.72c.073-.232.61-2.214.681-2.446c5.918.106 6.21-.091 7.089-3.008c1.66-5.508 2.144-6.494 3.805-12.002c.583-1.932.48-2.354-2.29-2.882l-1.687-.311c.063-.204.441-2.075.504-2.278a94.249 94.249 0 0 0 12.214-.789l-5.499 19c-.858 2.966-.752 3.204 4.93 4.302c-.066.234-.6 2.218-.665 2.453Z"
                              />
                            </g>
                          </svg>
                        );
                      case "ACCEPTING_CLIENTS":
                        return (
                          <svg
                            className="w-5 h-5 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                            />
                          </svg>
                        );
                      case "MODEL_INITIALIZATION":
                        return (
                          <svg
                            className="w-5 h-5 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                            />
                          </svg>
                        );
                      case "STARTED":
                        return (
                          <svg
                            className="w-5 h-5 text-purple-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13 10V3L4 14h7v7l9-11h-7z"
                            />
                          </svg>
                        );
                      case "COMPLETED":
                        return (
                          <svg
                            className="w-5 h-5 text-green-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        );
                      case "FAILED":
                        return (
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z"
                            />
                          </svg>
                        );
                      case "CANCELLED":
                        return (
                          <svg
                            className="w-5 h-5 text-red-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        );
                      default:
                        return (
                          <svg
                            className="w-5 h-5 text-gray-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        );
                    }
                  };

                  return (
                    <div
                      key={session.id}
                      className="flex items-center justify-between p-3 hover:bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <div
                          className={`p-2 rounded-lg ${(() => {
                            switch (session.training_status) {
                              case "CREATED":
                                return "bg-gray-100";
                              case "PRICE_NEGOTIATION":
                                return "bg-yellow-100";
                              case "ACCEPTING_CLIENTS":
                                return "bg-blue-100";
                              case "MODEL_INITIALIZATION":
                                return "bg-indigo-100";
                              case "STARTED":
                                return "bg-purple-100";
                              case "COMPLETED":
                                return "bg-green-100";
                              case "FAILED":
                                return "bg-red-100";
                              case "CANCELLED":
                                return "bg-red-100";
                              default:
                                return "bg-gray-100";
                            }
                          })()}`}
                        >
                          {getStatusIcon(session.training_status)}
                        </div>
                        <span
                          title={session.name}
                          className="text-sm font-medium text-gray-900"
                        >
                          {session.name && session.name.length > 40
                            ? `${session.name.substring(0, 40)}...`
                            : session.name || "Untitled Session"}
                        </span>
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(
                            session.training_status
                          )}`}
                        >
                          {TrainingStatuses[session.training_status] ||
                            "Unknown"}
                        </span>
                      </div>
                      <Link
                        to={`/trainings/${session.id}`}
                        className="text-blue-600 text-sm hover:underline"
                      >
                        View
                      </Link>
                    </div>
                  );
                })}
                {!sessions.length && (
                  <div className="text-center py-4 text-gray-500">
                    No recent sessions
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Floating Action Button */}
          <div className="fixed bottom-8 right-8 dashboard-add-training">
            <Link to="/request">
              <button className="bg-blue-600 flex items-center hover:bg-blue-700 text-white p-4 rounded-full shadow-lg transition-all transform hover:scale-105">
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                <span className="ml-2 font-semibold text-lg">Add Training</span>
              </button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}

// import { useEffect, useState } from "react";
// import { Link } from "react-router-dom";
// import { useAuth } from "../contexts/AuthContext";
// import {
//   getAllSessions,
//   getUserInitiatedSessions,
// } from "../services/federatedService";
// import { getLocalDatasets } from "../services/privateService";

// export default function Dashboard() {
//   const [initiatedSessions, setInitiatedSessions] = useState([]);
//   const [datasets, setDatasets] = useState({ uploads: [], processed: [] });
//   const [sessions, setSessions] = useState([]);
//   const { api } = useAuth();
// const fetchInitiatedSession = async () => {
//   try {
//     getUserInitiatedSessions(api).then((res) => {
//       console.log("Initiated Sessions fetched: ", res.data);
//       setInitiatedSessions(res.data);
//     });
//   } catch (error) {
//     console.error("Error fetching initiated sessions:", error);
//   }
// };
//   const fetchDatasets = async () => {
//     try {
//       getLocalDatasets().then((res) => {
//         console.log("Global Datasets : ", res.data);
//         setDatasets(res.data.contents);
//       });
//     } catch (error) {
//       console.error("Error fetching Datasets:", error);
//     }
//   };
//   const fetchSessions = async () => {
//     try {
//       getAllSessions(api).then((res) => {
//         console.log("Sessions : ", res.data);
//         setSessions(res.data);
//       });
//     } catch (error) {
//       console.error("Error fetching Sessions:", error);
//     }
//   };
//   // Define statusMap outside for better performance
//   const statusMap = {
//     1: { text: "Pre-Training Stage", color: "bg-blue-200 text-blue-700" },
//     2: { text: "Pre-Training Stage", color: "bg-blue-200 text-blue-700" },
//     3: { text: "Pre-Training Stage", color: "bg-blue-200 text-blue-700" },
//     4: { text: "Training Stage", color: "bg-yellow-200 text-yellow-700" },
//     5: { text: "Post-Training", color: "bg-green-200 text-green-700" },
//     "-1": { text: "Training Failed", color: "bg-red-200 text-red-700" },
//   };

//   // Default status if not found
//   const defaultStatus = { text: "Unknown", color: "bg-gray-200 text-gray-700" };

//   useEffect(() => {
//     const fetchData = async () => {
//       await fetchInitiatedSession();
//       await fetchDatasets();
//       await fetchSessions();
//     };
//     fetchData();
//   }, []);
//   return (
//     <div className="w-full min-h-screen p-8 bg-gray-50 flex flex-col items-center">
//       <h1 className="text-4xl font-bold text-gray-800 mb-8">
//         Federated Learning Dashboard
//       </h1>

//       {/* Initiated Sessions Section */}
//       <div className="w-full max-w-6xl bg-white shadow-lg rounded-xl p-6 mb-8">
//         <h2 className="text-2xl font-semibold mb-4">Initiated Sessions</h2>
//         <div className="overflow-x-auto">
//           {initiatedSessions.length > 0 ? (
//             <table className="w-full border-collapse border border-gray-200 text-center">
//               <thead>
//                 <tr className="bg-gray-100 text-gray-700">
//                   <th className="border border-gray-300 px-4 py-2">#</th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Session ID
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Current Round
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Max Rounds
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Session Price
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">
//                     Training Status
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2">Action</th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {initiatedSessions.map((session, index) => (
//                   <tr key={session.session_id} className="hover:bg-gray-50">
//                     <td className="border border-gray-300 px-4 py-2">
//                       {index + 1}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {session.session_id}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {session.curr_round}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {session.max_round}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       {session.session_price || "N/A"}
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       <span
//                         className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
//                           statusMap[session.training_status]?.color ||
//                           defaultStatus.color
//                         }`}
//                       >
//                         {statusMap[session.training_status]?.text ||
//                           defaultStatus.text}
//                       </span>
//                     </td>
//                     <td className="border border-gray-300 px-4 py-2">
//                       <Link
//                         to={`/TrainingStatus/details/${session.session_id}`}
//                         className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
//                       >
//                         View Details
//                       </Link>
//                     </td>
//                   </tr>
//                 ))}
//               </tbody>
//             </table>
//           ) : (
//             <p className="text-gray-500">No initiated sessions found.</p>
//           )}
//         </div>
//       </div>

//       {/* Grid Sections */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl">
//         {/* Recent Sessions */}
//         <div className="p-6 bg-white shadow-lg rounded-xl">
//           <h2 className="text-xl font-semibold mb-3">Recent Sessions</h2>
//           <div className="overflow-x-auto">
//             <table className="w-full border-collapse border border-gray-200">
//               <thead>
//                 <tr className="bg-gray-100">
//                   <th className="border border-gray-300 px-4 py-2 text-left">
//                     ID
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2 text-left">
//                     Name
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2 text-left">
//                     Status
//                   </th>
//                   <th className="border border-gray-300 px-4 py-2 text-left">
//                     Actions
//                   </th>
//                 </tr>
//               </thead>
//               <tbody>
//                 {sessions.length > 0 ? (
//                   sessions.map(({ id, name, training_status }) => (
//                     <tr key={id} className="border-b border-gray-200">
//                       <td className="border border-gray-300 px-4 py-2">{id}</td>
//                       <td className="border border-gray-300 px-4 py-2">
//                         {name || "Unknown"}
//                       </td>
//                       <td className="border border-gray-300 px-4 py-2">
//                         <span
//                           className={`px-2 py-0.5 text-xs font-semibold rounded-lg ${
//                             statusMap[training_status]?.color ||
//                             defaultStatus.color
//                           }`}
//                         >
//                           {statusMap[training_status]?.text ||
//                             defaultStatus.text}
//                         </span>
//                       </td>
//                       <td className="border border-gray-300 px-4 py-2">
//                         <Link
//                           to={`/TrainingStatus/details/${id}`}
//                           className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
//                         >
//                           🔍 View
//                         </Link>
//                       </td>
//                     </tr>
//                   ))
//                 ) : (
//                   <tr>
//                     <td
//                       colSpan="4"
//                       className="text-center text-gray-500 border border-gray-300 px-4 py-2"
//                     >
//                       No recent sessions found.
//                     </td>
//                   </tr>
//                 )}
//               </tbody>
//             </table>
//           </div>
//           <Link
//             to="/TrainingStatus"
//             className="text-blue-500 mt-4 block hover:underline text-center"
//           >
//             📂 View All Sessions →
//           </Link>
//         </div>

//         {/* My Data */}
//         <div className="p-6 bg-white shadow-lg rounded-xl">
//           <h2 className="text-xl font-semibold">My Data</h2>
//           <div className="mt-2 space-y-3">
//             {datasets.uploads.map((dataset) => (
//               <div key={dataset} className="flex justify-between items-center">
//                 <span className="text-gray-700 flex items-center">
//                   {dataset}
//                   <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-green-700 bg-green-200 rounded-lg">
//                     Raw
//                   </span>
//                 </span>
//                 <Link
//                   to={`/dataset-overview/uploads/${dataset}`}
//                   className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
//                 >
//                   🔍 View
//                 </Link>
//               </div>
//             ))}
//             {datasets.processed.map((dataset) => (
//               <div key={dataset} className="flex justify-between items-center">
//                 <span className="text-gray-700 flex items-center">
//                   {dataset}
//                   <span className="ml-2 px-2 py-0.5 text-xs font-semibold text-orange-700 bg-orange-200 rounded-lg">
//                     Processed
//                   </span>
//                 </span>
//                 <Link
//                   to={`/dataset-overview/processed/${dataset}`}
//                   className="px-3 py-1 text-sm bg-gray-200 rounded hover:bg-gray-300"
//                 >
//                   🔍 View
//                 </Link>
//               </div>
//             ))}
//           </div>
//           <Link
//             to="/view-all-datasets"
//             className="text-blue-500 mt-4 block hover:underline"
//           >
//             📂 Manage Datasets →
//           </Link>
//         </div>
//       </div>

//       {/* Floating Add Job Button */}
//       <div className="fixed bottom-6 right-6">
//         <Link to="/request">
//           <button className="px-4 py-2 bg-blue-600 text-white rounded-full shadow-lg hover:bg-blue-700 transition">
//             + Add Session
//           </button>
//         </Link>
//       </div>
//     </div>
//   );
// }
