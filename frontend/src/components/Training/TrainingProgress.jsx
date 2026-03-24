import {
  InformationCircleIcon,
  ArrowPathIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { getFederatedSessionStatus } from "../../services/federatedService";
import { useEffect, useState } from "react";

const TrainingProgress = ({ sessionId }) => {
  const [sessionStatus, setSessionStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { api } = useAuth();

  useEffect(() => {
    const fetchSessionStatus = async () => {
      try {
        setLoading(true);
        const response = await getFederatedSessionStatus(api, sessionId);
        setSessionStatus(response.data);
      } catch (err) {
        setError(err.message || "Failed to fetch session status");
      } finally {
        setLoading(false);
      }
    };

    fetchSessionStatus();
  }, [sessionId, api]);

  if (loading) {
    return (
      <div className="p-4 text-center text-gray-500">
        Loading session status...
      </div>
    );
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">Error: {error}</div>;
  }
  if (!sessionStatus) {
    return (
      <div className="p-4 text-center text-gray-500">
        No session data available
      </div>
    );
  }

  // Status mapping with colors and icons
  const statusMap = {
    1: {
      label: "Pending",
      color: "bg-gray-100 text-gray-800",
      icon: ClockIcon,
    },
    2: {
      label: "Initializing",
      color: "bg-blue-100 text-blue-800",
      icon: ArrowPathIcon,
    },
    3: {
      label: "Training",
      color: "bg-yellow-100 text-yellow-800",
      icon: ArrowPathIcon,
    },
    4: {
      label: "Aggregating",
      color: "bg-purple-100 text-purple-800",
      icon: ArrowPathIcon,
    },
    5: {
      label: "Completed",
      color: "bg-green-100 text-green-800",
      icon: InformationCircleIcon,
    },
    6: {
      label: "Failed",
      color: "bg-red-100 text-red-800",
      icon: InformationCircleIcon,
    },
  };

  const statusInfo = statusMap[sessionStatus.training_status] || statusMap[1];
  const StatusIcon = statusInfo.icon;

  // Format duration from seconds to HH:MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return "00:00:00";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = Math.floor(seconds % 60);
    return [
      hours.toString().padStart(2, "0"),
      minutes.toString().padStart(2, "0"),
      secs.toString().padStart(2, "0"),
    ].join(":");
  };

  return (
    <div className="space-y-6">
      {/* Session Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Status Card */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className={`p-2 rounded-full ${statusInfo.color}`}>
              <StatusIcon className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500">Status</h3>
              <p className="text-lg font-semibold">{statusInfo.label}</p>
            </div>
          </div>
        </div>

        {/* Round Progress */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500 mb-1">
            Training Round
          </h3>
          <div className="flex items-end space-x-2">
            <span className="text-2xl font-bold">
              {sessionStatus.current_round}
            </span>
            <span className="text-gray-500">/ {sessionStatus.max_rounds}</span>
          </div>
          <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full"
              style={{
                width: `${(sessionStatus.current_round / sessionStatus.max_rounds) * 100}%`,
              }}
            />
          </div>
        </div>

        {/* Process Duration */}
        <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
          <h3 className="text-sm font-medium text-gray-500">Duration</h3>
          <p className="text-2xl font-bold">
            {formatDuration(sessionStatus.process?.duration_seconds)}
          </p>
          {sessionStatus.process?.start_time && (
            <p className="text-xs text-gray-500 mt-1">
              Started:{" "}
              {new Date(sessionStatus.process.start_time).toLocaleString()}
            </p>
          )}
        </div>
      </div>

      {/* Process Details */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Process Details
        </h3>
        {sessionStatus.process?.exists ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <p className="text-sm text-gray-500">PID</p>
              <p className="font-medium">
                {sessionStatus.process.pid || "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Status</p>
              <p className="font-medium capitalize">
                {sessionStatus.process.status || "unknown"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Exit Code</p>
              <p className="font-medium">
                {sessionStatus.process.exit_code ?? "N/A"}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Alive</p>
              <p className="font-medium">
                {sessionStatus.process.alive ? (
                  <span className="text-green-600">Yes</span>
                ) : (
                  <span className="text-red-600">No</span>
                )}
              </p>
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No active process</p>
        )}
      </div>

      {/* Session Timeline */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Session Timeline
        </h3>
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Created</span>
            <span className="font-medium">
              {new Date(sessionStatus.created_at).toLocaleString()}
            </span>
          </div>
          {sessionStatus.updated_at && (
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Last Updated</span>
              <span className="font-medium">
                {new Date(sessionStatus.updated_at).toLocaleString()}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
        <h3 className="text-lg font-medium text-gray-900 mb-3">
          Recent Activity
        </h3>
        {sessionStatus.recent_logs?.length > 0 ? (
          <ul className="space-y-3">
            {sessionStatus.recent_logs.map((log, index) => (
              <li key={index} className="flex items-start">
                <div className="flex-shrink-0 h-2 w-2 mt-2 bg-blue-500 rounded-full mr-2" />
                <p className="text-sm text-gray-800">{log}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">No recent activity</p>
        )}
      </div>
    </div>
  );
};

export default TrainingProgress;
