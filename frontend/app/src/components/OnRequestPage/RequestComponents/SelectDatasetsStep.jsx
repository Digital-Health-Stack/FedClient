import React, { useState, useEffect } from "react";
import {
  FolderIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { useFormContext } from "react-hook-form";

import {
  getDatasetOverview,
  getDatasetTasksById,
  getServerDatasets,
} from "../../../services/fedServerService";
import { getDatasetDetails } from "../../../services/privateService";

// Environment variables
// const CLIENT_DATASET_OVERVIEW = process.env.REACT_APP_PROCESSED_OVERVIEW_PATH;
// const SERVER_DATASET_OVERVIEW =
//   process.env.REACT_APP_SERVER_DATASET_OVERVIEW_PATH;
// const LIST_TASKS_WITH_DATASET_ID =
//   process.env.REACT_APP_GET_TASKS_WITH_DATASET_ID;

// Cache for uploaded files to prevent re-fetching
let uploadedFilesCache = null;
let filesCacheTimestamp = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export default function SelectDatasetsStep({
  disabled = false,
  autoFetch = false,
}) {
  const { register, setValue, watch } = useFormContext();
  const [loadingClient, setLoadingClient] = useState(false);
  const [loadingServer, setLoadingServer] = useState(false);
  const [loadingTasks, setLoadingTasks] = useState(false);
  const [clientStats, setClientStats] = useState(null);
  const [serverStats, setServerStats] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [errorClient, setErrorClient] = useState(null);
  const [errorServer, setErrorServer] = useState(null);
  const [errorTasks, setErrorTasks] = useState(null);
  const [outputColumns, setOutputColumns] = useState(null);
  const [inputColumns, setInputColumns] = useState([]);
  const [showColumnSelection, setShowColumnSelection] = useState(true);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [showInputColumnSelection, setShowInputColumnSelection] =
    useState(true);
  const [fetchingFiles, setFetchingFiles] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  const clientFilename = watch("client_filename");
  const serverFilename = watch("server_filename");
  const selectedTaskId = watch("task_id");
  const formInputColumns = watch("input_columns") || [];
  const formOutputColumns = watch("output_columns") || [];
  const formServerStats = watch("server_stats");
  const formServerStatsData = watch("server_stats_data");

  // Initialize local state from form values when component mounts
  useEffect(() => {
    if (formInputColumns.length > 0) {
      setInputColumns(formInputColumns);
    }
    if (formOutputColumns.length > 0) {
      setOutputColumns(formOutputColumns[0]); // Assuming single output column
    }
    // Restore server stats from form state if they exist
    if (formServerStatsData) {
      setServerStats(formServerStatsData);
    }
  }, []);

  // Sync local state with form state
  useEffect(() => {
    setValue("input_columns", inputColumns);
  }, [inputColumns, setValue]);

  useEffect(() => {
    if (outputColumns) {
      setValue("output_columns", [outputColumns]);
    }
  }, [outputColumns, setValue]);

  useEffect(() => {
    const fetchTasks = async () => {
      if (!serverStats?.dataset_id) return;
      setLoadingTasks(true);
      setErrorTasks(null);
      try {
        const response = await getDatasetTasksById(serverStats.dataset_id);
        const data = response.data;
        // console.log("Tasks data received: ", data);
        if (data.detail) {
          throw new Error(data.detail);
        }

        if (Array.isArray(data)) {
          setTasks(data);
          if (data.length > 0 && !selectedTaskId) {
            setValue("task_id", String(data[0].task_id));
            setValue("output_columns", [data[0].output_column]);
            setOutputColumns(data[0].output_column);
            setValue("task_name", data[0].task_name);
            setValue("metric", data[0].metric);
          }
        } else {
          setErrorTasks(data.detail || "Invalid tasks data received");
          setTasks([]);
        }
      } catch (err) {
        console.error("Error fetching tasks: ", err);
        const errorMessage =
          err.response?.data?.detail ||
          err.message ||
          "Failed to fetch tasks for this dataset";
        setErrorTasks(errorMessage);
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [serverStats?.dataset_id, setValue, selectedTaskId]);

  const shortenText = (text, maxLength) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const fetchServerDatasetStats = async () => {
    if (!serverFilename) return;

    setLoadingServer(true);
    setErrorServer(null);
    try {
      const response = await getDatasetOverview(serverFilename);

      const data = response.data;

      // console.log("Server dataset stats received: ", data);

      if (data.details) {
        throw new Error(data.details);
      }
      setServerStats(data);
      setValue("server_stats", data.datastats);
      setValue("server_stats_data", data); // Store the full data for persistence
      setErrorServer(null);
    } catch (err) {
      console.error("Error fetching server dataset stats: ", err);
      const errorMessage =
        err.response?.data?.details ||
        err.message ||
        "Failed to fetch server dataset stats";
      setErrorServer(errorMessage);
      setServerStats(null);
      setValue("server_stats", null);
      setValue("server_stats_data", null);
    } finally {
      setLoadingServer(false);
    }
  };

  const handleOutputColumnChange = (column) => {
    setOutputColumns(column);
    setValue("output_columns", [column]);
  };

  const handleInputColumnChange = (column) => {
    const newColumns = inputColumns.includes(column)
      ? inputColumns.filter((c) => c !== column)
      : [...inputColumns, column];
    setInputColumns(newColumns);
    setValue("input_columns", newColumns);
  };

  const handleTaskChange = (taskId) => {
    const selectedTask = tasks.find((task) => task.task_id === taskId);
    if (selectedTask) {
      setValue("task_id", String(selectedTask.task_id));
      setValue("metric", selectedTask.metric);
    }
    handleOutputColumnChange(selectedTask.output_column);
  };

  const columnsMatch = () => {
    if (!clientStats || !serverStats) return false;
    const clientColumns = clientStats.datastats.columnStats.map((c) => c.name);
    const serverColumns = serverStats.datastats.columnStats.map((c) => c.name);
    return JSON.stringify(clientColumns) === JSON.stringify(serverColumns);
  };

  const getAvailableColumns = () => {
    if (serverStats) {
      return serverStats.datastats.columnStats.map((c) => c.name);
    }
    return [];
  };

  const getSelectedTaskMetric = () => {
    if (!selectedTaskId || !tasks.length) return null;
    const task = tasks.find((t) => t.task_id === selectedTaskId);
    return task ? task.metric : null;
  };

  // Fetch uploaded files from HDFS with caching
  const fetchUploadedFiles = async () => {
    // Check if we have cached data that's still valid
    const now = Date.now();
    if (
      uploadedFilesCache &&
      filesCacheTimestamp &&
      now - filesCacheTimestamp < CACHE_DURATION
    ) {
      setUploadedFiles(uploadedFilesCache);
      return;
    }

    setFetchingFiles(true);
    try {
      const response = await getServerDatasets();
      if (response.data && response.status == 200) {
        // Cache the files and timestamp
        uploadedFilesCache = response.data;
        filesCacheTimestamp = now;
        setUploadedFiles(response.data);
      }
    } catch (err) {
      console.error("Error fetching uploaded files:", err);
      setError("Failed to fetch uploaded files");
    } finally {
      setFetchingFiles(false);
    }
  };

  useEffect(() => {
    fetchUploadedFiles();
  }, []);

  // If autoFetch is enabled (retry flow), try fetching stats automatically
  useEffect(() => {
    if (autoFetch && serverFilename && !serverStats) {
      fetchServerDatasetStats();
    }
  }, [autoFetch, serverFilename, serverStats]);

  return (
    <div className="space-y-8">
      {/* <div className="flex items-center space-x-3">
        <FolderIcon className="h-7 w-7 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">
          Dataset Information
        </h3>
        <div className="relative ml-1">
          <button
            type="button"
            className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
            onClick={() => setShowInfo((prev) => !prev)}
            aria-label="Show info about dataset information"
          >
            <span className="font-bold text-xs">
              <InformationCircleIcon className="h-5 w-5" />
            </span>
          </button>
          {showInfo && (
            <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
              <div className="flex justify-between items-center mb-2">
                <span className="font-semibold">Dataset Information</span>
                <button
                  className="text-gray-400 hover:text-gray-600"
                  onClick={() => setShowInfo(false)}
                  aria-label="Close info"
                >
                  ×
                </button>
              </div>
              <div>
                Select and configure the datasets you want to use for training
                and testing. You can fetch stats, select columns, and choose
                tasks for your federated learning job.
              </div>
            </div>
          )}
        </div>
      </div> */}

      <div className="space-y-6">
        <div className="grid grid-cols-1 gap-6">
          {/* Server Dataset Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-3">
              <label
                className="block text-sm font-medium text-gray-700"
                htmlFor="server_filename"
                title="Choose one from FedServer. This is the dataset that will be used for testing."
              >
                Testing Dataset
              </label>
              <div className="flex space-x-2">
                <select
                  {...register("server_filename", {
                    required: "*required",
                  })}
                  className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  defaultValue=""
                  disabled={disabled}
                >
                  <option value="" disabled>
                    Select a dataset
                  </option>
                  {uploadedFiles.map((file, index) => (
                    <option
                      key={index}
                      value={file.filename}
                      title={file.filename}
                    >
                      {shortenText(file.filename, 50)}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={fetchServerDatasetStats}
                  disabled={disabled || loadingServer || !serverFilename}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingServer ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowPathIcon className="h-4 w-4" />
                  )}
                  <span className="ml-2">Fetch</span>
                </button>
              </div>

              {errorServer && (
                <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded-md flex items-start">
                  <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  {errorServer}
                </div>
              )}

              {serverStats && (
                <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md flex items-start">
                  <CheckCircleIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    Successfully loaded dataset with{" "}
                    {serverStats.datastats.numRows} rows and{" "}
                    {serverStats.datastats.numColumns} columns
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Dataset Comparison and Task Selection */}
        {serverStats && (
          <div className="space-y-6">
            {/* Task Selection */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {loadingTasks ? (
                <div className="flex items-center justify-center p-4 text-gray-500">
                  <ArrowPathIcon className="h-5 w-5 mr-3 animate-spin" />
                  <span>Loading available training options...</span>
                </div>
              ) : errorTasks ? (
                <div className="p-3 bg-red-50 text-red-600 rounded-md flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">Error loading tasks</p>
                    <p className="text-sm mt-1">{errorTasks}</p>
                  </div>
                </div>
              ) : tasks.length > 0 ? (
                <div className="space-y-6">
                  <div className="bg-white shadow-sm rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                      <h3 className="text-lg font-medium text-gray-900">
                        Available Training Options
                      </h3>
                      <p className="text-sm text-gray-600">
                        Select the training option you want to use for your
                        federated learning job.
                      </p>
                    </div>
                    <div className="px-6 py-4">
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Training Option
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Output Column
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Metric
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Current Benchmark
                              </th>
                              <th
                                scope="col"
                                className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {tasks.map((task) => (
                              <tr
                                key={task.task_id}
                                className={
                                  selectedTaskId === task.task_id
                                    ? "bg-blue-50"
                                    : ""
                                }
                              >
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {task.task_name}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {task.output_column}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {task.metric}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                  {task.benchmark[task.metric]?.std_mean ||
                                    "N/A"}{" "}
                                  ±{" "}
                                  {task.benchmark[task.metric]?.std_dev ||
                                    "N/A"}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      handleTaskChange(task.task_id);
                                      setValue("task_id", String(task.task_id)); // Update form value if using react-hook-form
                                    }}
                                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${selectedTaskId === String(task.task_id)
                                      ? "bg-blue-600 text-white hover:bg-blue-700"
                                      : "text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100"
                                      } ${disabled
                                        ? "opacity-60 cursor-not-allowed"
                                        : ""
                                      }`}
                                    disabled={disabled}
                                  >
                                    {selectedTaskId === String(task.task_id)
                                      ? "Selected"
                                      : "Select"}
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                    {selectedTaskId && (
                      <div className="bg-gray-50 px-6 py-3 border-t border-gray-200">
                        <div className="flex items-center">
                          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                          <p className="text-sm text-gray-600">
                            Selected task uses{" "}
                            <strong className="font-medium">
                              {getSelectedTaskMetric()}
                            </strong>{" "}
                            as its evaluation metric. Please ensure you select
                            this metric in the model selection step.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="p-3 bg-yellow-50 text-yellow-700 rounded-md flex items-start">
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="font-medium">No tasks available</p>
                    <p className="text-sm mt-1">
                      No tasks are associated with this dataset.
                    </p>
                  </div>
                </div>
              )}
            </div>
            {/* Column Selection */}
            {
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <button
                  title="Select the columns you want to use as input for training"
                  type="button"
                  onClick={() =>
                    setShowInputColumnSelection(!showInputColumnSelection)
                  }
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showInputColumnSelection ? (
                    <ChevronUpIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 mr-2" />
                  )}
                  Select Input Columns
                </button>

                {showInputColumnSelection && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-gray-600">
                      Select which columns should be marked as input column(s).
                      <br />
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                      {getAvailableColumns().map((column) => (
                        <label
                          key={column}
                          className="flex items-center space-x-3 p-2 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            disabled={
                              disabled ||
                              (selectedTaskId &&
                                tasks.length > 0 &&
                                tasks.find(
                                  (t) =>
                                    String(t.task_id) === String(selectedTaskId)
                                ) &&
                                column ===
                                tasks.find(
                                  (t) =>
                                    String(t.task_id) ===
                                    String(selectedTaskId)
                                ).output_column)
                            }
                            checked={inputColumns.includes(column)}
                            value={column}
                            onChange={() => handleInputColumnChange(column)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed"
                          />
                          <span className="text-sm text-gray-700">
                            {column}
                          </span>
                        </label>
                      ))}
                    </div>
                    {selectedTaskId && (
                      <div className="px-1 py-3">
                        <div className="flex items-center">
                          <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2 flex-shrink-0" />
                          <p className="text-sm text-gray-600">
                            Remember that the input column must be selected
                            which you want to use for training.
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            }
          </div>
        )}
      </div>
    </div>
  );
}
