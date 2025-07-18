import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getLogsSession } from "../../services/federatedService";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";

const FederatedSessionLogs = ({ sessionId }) => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState(""); // <-- New state for search
  const [selectedTag, setSelectedTag] = useState("ALL"); // <-- New state for tag filter
  const { api } = useAuth();
  const logsEndRef = useRef(null);
  const logsTopRef = useRef(null); // <-- New ref for top

  // Available tags
  const availableTags = [
    "ALL",
    "INFO",
    "ERROR",
    "SUCCESS",
    "TRAINING",
    "CLIENT_JOINED",
    "WEIGHTS_RECEIVED",
    "AGGREGATED_WEIGHTS",
    "TEST_RESULTS",
    "CLIENT_LEFT",
    "PRIZE_NEGOTIATION",
  ];

  const fetchLogsSessionData = async () => {
    if (!sessionId) {
      setLogs([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getLogsSession(api, sessionId);
      // Reverse the logs to show most recent first
      setLogs(response.data.reverse());
    } catch (err) {
      console.error("Error fetching logs:", err);
      setError("Failed to fetch logs. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogsSessionData();
  }, [sessionId]);

  // Auto-scroll to bottom when new logs are added
  useEffect(() => {
    if (logs.length > 0 && !loading) {
      logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, loading]);

  const formatTimestamp = (timestamp) => {
    try {
      const date = new Date(timestamp);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (e) {
      return timestamp;
    }
  };

  // Filter logs based on search query and selected tag
  const filteredLogs = logs.filter((log) => {
    // Tag filter
    if (selectedTag !== "ALL" && log.tag !== selectedTag) {
      return false;
    }

    // Search filter
    if (!searchQuery) return true;
    const message = log.message?.toLowerCase() || "";
    const timestamp = log.created_at?.toLowerCase?.() || "";
    return (
      message.includes(searchQuery.toLowerCase()) ||
      timestamp.includes(searchQuery.toLowerCase())
    );
  });

  // Function to get tag colors
  const getTagColors = (tag) => {
    switch (tag) {
      case "ERROR":
        return {
          dot: "bg-red-500",
          border: "border-red-300",
          text: "text-red-700",
        };
      case "SUCCESS":
        return {
          dot: "bg-green-500",
          border: "border-green-300",
          text: "text-green-700",
        };
      case "TRAINING":
        return {
          dot: "bg-blue-500",
          border: "border-blue-300",
          text: "text-blue-700",
        };
      case "CLIENT_JOINED":
        return {
          dot: "bg-purple-500",
          border: "border-purple-300",
          text: "text-purple-700",
        };
      case "WEIGHTS_RECEIVED":
        return {
          dot: "bg-yellow-500",
          border: "border-yellow-300",
          text: "text-yellow-700",
        };
      case "AGGREGATED_WEIGHTS":
        return {
          dot: "bg-indigo-500",
          border: "border-indigo-300",
          text: "text-indigo-700",
        };
      case "TEST_RESULTS":
        return {
          dot: "bg-pink-500",
          border: "border-pink-300",
          text: "text-pink-700",
        };
      case "CLIENT_LEFT":
        return {
          dot: "bg-orange-500",
          border: "border-orange-300",
          text: "text-orange-700",
        };
      case "PRIZE_NEGOTIATION":
        return {
          dot: "bg-teal-500",
          border: "border-teal-300",
          text: "text-teal-700",
        };
      case "INFO":
        return {
          dot: "bg-gray-500",
          border: "border-gray-300",
          text: "text-gray-700",
        };
      default:
        return {
          dot: "bg-gray-500",
          border: "border-gray-300",
          text: "text-gray-700",
        };
    }
  };

  return (
    <div className="w-full relative">
      {" "}
      {/* Add relative for absolute buttons */}
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            Training Logs
            {loading && (
              <ArrowPathIcon className="h-5 w-5 ml-2 text-blue-500 animate-spin" />
            )}
          </h3>
          {/* Search and filter controls */}
          <div className="mt-2 flex flex-col sm:flex-row gap-3">
            {/* Search input */}
            <div className="flex items-center relative w-full sm:max-w-md">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                {/* Heroicons MagnifyingGlassIcon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                  />
                </svg>
              </span>
              <input
                type="text"
                className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition placeholder-gray-400 shadow-sm hover:border-blue-300"
                placeholder="Search logs by message or timestamp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              />
            </div>

            {/* Tag filter dropdown */}
            <div className="flex items-center relative w-full sm:w-auto">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10">
                {/* Heroicons FunnelIcon */}
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-5 h-5"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 3c2.755 0 5.455.232 8.083.678.533.09.917.556.917 1.096v1.044a2.25 2.25 0 01-.659 1.591l-5.432 5.432a2.25 2.25 0 00-.659 1.591v2.927a2.25 2.25 0 01-1.244 2.013L9.75 21v-6.568a2.25 2.25 0 00-.659-1.591L3.659 7.409A2.25 2.25 0 013 5.818V4.774c0-.54.384-1.006.917-1.096A48.32 48.32 0 0112 3z"
                  />
                </svg>
              </span>
              <select
                value={selectedTag}
                onChange={(e) => setSelectedTag(e.target.value)}
                className="pl-10 pr-8 py-2 w-full sm:w-auto rounded-lg border border-gray-300 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition shadow-sm hover:border-blue-300 appearance-none cursor-pointer"
                style={{ boxShadow: "0 1px 2px rgba(0,0,0,0.04)" }}
              >
                {availableTags.map((tag) => {
                  const tagColors = tag !== "ALL" ? getTagColors(tag) : null;
                  return (
                    <option key={tag} value={tag} className="flex items-center">
                      {tag === "ALL" ? (
                        "All Tags"
                      ) : (
                        <span className="flex items-center">
                          <span
                            className={`w-2 h-2 rounded-full ${tagColors.dot} mr-2 inline-block`}
                          ></span>
                          {tag}
                        </span>
                      )}
                    </option>
                  );
                })}
              </select>
              {/* Custom dropdown arrow */}
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth={1.5}
                  stroke="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 8.25l-7.5 7.5-7.5-7.5"
                  />
                </svg>
              </span>
            </div>
          </div>
        </div>

        <div className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr ref={logsTopRef}>
                  {/* Top ref here */}
                  <th
                    scope="col"
                    className="px-6 py-3 w-1/2 text-xs font-medium text-gray-500 uppercase text-left tracking-wider"
                  >
                    Timestamp
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 w-1/2 text-xs font-medium text-gray-500 uppercase text-left tracking-wider"
                  >
                    Message
                  </th>
                </tr>
              </thead>
            </table>
            <div className="max-h-[500px] overflow-y-auto relative">
              {" "}
              {/* Make relative for absolute buttons */}
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center text-gray-500">
                          <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                          Loading logs...
                        </div>
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center text-red-500">
                          <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                          {error}
                        </div>
                      </td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan="2" className="px-6 py-4 text-center">
                        <div className="flex justify-center items-center text-gray-500">
                          <InformationCircleIcon className="h-5 w-5 mr-2" />
                          {searchQuery || selectedTag !== "ALL"
                            ? "No logs match your search or filter criteria."
                            : sessionId
                            ? "No logs available"
                            : "Select a session to view logs"}
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const tagColors = getTagColors(log.tag);
                      return (
                        <tr key={log.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 w-1/2 align-top text-left">
                            <div className="text-sm text-gray-900">
                              {formatTimestamp(log.created_at)}
                            </div>
                          </td>
                          <td className="px-6 py-4 align-top text-left flex justify-between">
                            <span className="text-sm text-gray-900 mr-2">
                              {log.message}
                            </span>
                            <span
                              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${tagColors.border} ${tagColors.text} bg-white`}
                            >
                              <span
                                className={`w-2 h-2 rounded-full ${tagColors.dot} mr-2`}
                              ></span>
                              {log.tag}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                  <tr ref={logsEndRef} />
                </tbody>
              </table>
              {/* Floating Go to Top/Bottom Buttons inside logs area */}
            </div>
            {logs.length > 0 && !loading && (
              <>
                <button
                  onClick={() =>
                    logsTopRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="absolute translate-x-6 bottom-2 right-1/2 bg-gray-800/30 text-white rounded-full p-1 hover:bg-gray-800/50 z-20"
                  title="Go to Top"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M5 15l7-7 7 7"
                    />
                  </svg>
                </button>
                <button
                  onClick={() =>
                    logsEndRef.current?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="absolute -translate-x-6 bottom-2 right-1/2 bg-gray-800/30 text-white rounded-full p-1 hover:bg-gray-800/50 z-20"
                  title="Go to Bottom"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={2}
                    stroke="currentColor"
                    className="w-5 h-5"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>
              </>
            )}
          </div>
        </div>

        <div className="px-6 py-3 bg-gray-50 text-right text-xs text-gray-500 border-t border-gray-200">
          {sessionId && `Showing logs for Session ID #${sessionId}`}
        </div>
      </div>
    </div>
  );
};

export default FederatedSessionLogs;
