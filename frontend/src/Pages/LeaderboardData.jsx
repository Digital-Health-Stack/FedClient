import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  getServerDatasets,
  getDatasetTasksById,
} from "../services/fedServerService";
import {
  ChartBarIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { TrophyIcon } from "@heroicons/react/24/solid";
import { useHelp } from "../contexts/HelpContext";
import CoachMarksOverlay from "../components/Common/CoachMarksOverlay";

const LeaderboardData = () => {
  const [datasets, setDatasets] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [selectedDatasetId, setSelectedDatasetId] = useState("");
  const [selectedTaskId, setSelectedTaskId] = useState("");
  const [loadingDatasets, setLoadingDatasets] = useState(true);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [errorDatasets, setErrorDatasets] = useState(null);
  const [errorTasks, setErrorTasks] = useState(null);
  const { showWalkthrough, stopWalkthrough } = useHelp();

  // Coach marks steps
  const coachMarksSteps = [
    {
      target: "#dataset-select",
      content: "Select a dataset from the server to view available tasks.",
      placement: "top",
    },
    {
      target: "#task-select",
      content: "Choose a task associated with the selected dataset.",
      placement: "left",
    },
    {
      target: ".leaderboard-view-link",
      content: "Click here to view the leaderboard for the selected task.",
      placement: "right",
    },
  ];

  useEffect(() => {
    const fetchDatasets = async () => {
      setLoadingDatasets(true);
      setErrorDatasets(null);
      try {
        const response = await getServerDatasets();
        const data = response?.data;
        const list = Array.isArray(data) ? data : data?.datasets ?? [];
        setDatasets(list);
        if (list.length > 0 && !selectedDatasetId) {
          setSelectedDatasetId(list[0].dataset_id);
        }
      } catch (err) {
        console.error("Error fetching datasets:", err);
        setErrorDatasets("Failed to load datasets.");
        setDatasets([]);
      } finally {
        setLoadingDatasets(false);
      }
    };
    fetchDatasets();
  }, []);

  useEffect(() => {
    if (!selectedDatasetId) {
      setTasks([]);
      setSelectedTaskId("");
      return;
    }
    const fetchTasks = async () => {
      setLoadingTasks(true);
      setErrorTasks(null);
      try {
        const response = await getDatasetTasksById(selectedDatasetId);
        const data = response?.data;
        if (data?.detail) {
          throw new Error(data.detail);
        }
        const list = Array.isArray(data) ? data : [];
        setTasks(list);
        setSelectedTaskId(list.length > 0 ? String(list[0].task_id) : "");
      } catch (err) {
        console.error("Error fetching tasks:", err);
        setErrorTasks(
          err.response?.data?.detail ||
          err.message ||
          "Failed to load tasks for this dataset."
        );
        setTasks([]);
        setSelectedTaskId("");
      } finally {
        setLoadingTasks(false);
      }
    };
    fetchTasks();
  }, [selectedDatasetId]);

  const selectedTask = tasks.find(
    (t) => String(t.task_id) === String(selectedTaskId)
  );

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="my-6">
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <TrophyIcon className="w-8 h-8" />
          Leaderboards
        </h1>
        <p className="text-gray-600 mt-1">
          Select a dataset and task to view the leaderboard.
        </p>
      </div>

      <div className="space-y-6 bg-white rounded-lg border border-gray-200 shadow-sm p-6">
        <div>
          <label
            htmlFor="dataset-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Dataset
          </label>
          <select
            id="dataset-select"
            value={selectedDatasetId}
            onChange={(e) => setSelectedDatasetId(e.target.value)}
            disabled={loadingDatasets}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a dataset</option>
            {datasets.map((d) => (
              <option key={d.dataset_id} value={d.dataset_id}>
                {d.filename || d.name || d.dataset_id}
              </option>
            ))}
          </select>
          {loadingDatasets && (
            <p className="mt-1 text-sm text-gray-500">Loading datasets...</p>
          )}
          {errorDatasets && (
            <p className="mt-1 text-sm text-red-600">{errorDatasets}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="task-select"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Task
          </label>
          <select
            id="task-select"
            value={selectedTaskId}
            onChange={(e) => setSelectedTaskId(e.target.value)}
            disabled={loadingTasks || !selectedDatasetId || tasks.length === 0}
            className="block w-full rounded-md border border-gray-300 bg-white py-2 px-3 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="">Select a task</option>
            {tasks.map((t) => (
              <option key={t.task_id} value={String(t.task_id)}>
                {t.task_name} (metric: {t.metric})
              </option>
            ))}
          </select>
          {loadingTasks && selectedDatasetId && (
            <p className="mt-1 text-sm text-gray-500">Loading tasks...</p>
          )}
          {errorTasks && (
            <p className="mt-1 text-sm text-red-600">{errorTasks}</p>
          )}
          {selectedDatasetId && !loadingTasks && tasks.length === 0 && !errorTasks && (
            <p className="mt-1 text-sm text-amber-600">
              No tasks available for this dataset.
            </p>
          )}
        </div>

        {selectedTaskId && selectedTask && (
          <div className="pt-4 border-t border-gray-200">
            <Link
              to={`/history/${selectedTaskId}`}
              className="leaderboard-view-link inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              View leaderboard
              <ArrowTopRightOnSquareIcon className="w-5 h-5" />
            </Link>
            <p className="mt-2 text-sm text-gray-500">
              Task: {selectedTask.task_name} · Metric: {selectedTask.metric}
            </p>
          </div>
        )}
      </div>

      <CoachMarksOverlay
        isVisible={showWalkthrough}
        onDismiss={stopWalkthrough}
        steps={coachMarksSteps}
        title="Leaderboard Data Guide"
        subtitle="Learn how to navigate and use the leaderboard data page"
      />
    </div>
  );
};

export default LeaderboardData;
