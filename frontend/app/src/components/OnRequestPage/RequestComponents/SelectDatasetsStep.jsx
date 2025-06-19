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

import { getDatasetOverview, getDatasetTasksById } from "../../../services/fedServerService";
import { getDatasetDetails } from "../../../services/privateService";

// Environment variables
// const CLIENT_DATASET_OVERVIEW = process.env.REACT_APP_PROCESSED_OVERVIEW_PATH;
// const SERVER_DATASET_OVERVIEW =
//   process.env.REACT_APP_SERVER_DATASET_OVERVIEW_PATH;
// const LIST_TASKS_WITH_DATASET_ID =
//   process.env.REACT_APP_GET_TASKS_WITH_DATASET_ID;

export default function SelectDatasetsStep() {
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
  const [outputColumns, setOutputColumns] = useState([]);
  const [showColumnSelection, setShowColumnSelection] = useState(true);

  const clientFilename = watch("dataset_info.client_filename");
  const serverFilename = watch("dataset_info.server_filename");
  const selectedTaskId = watch("dataset_info.task_id");

  useEffect(() => {
    const fetchTasks = async () => {
      if (!serverStats?.dataset_id) return;
      setLoadingTasks(true);
      setErrorTasks(null);
      try {
        const response = await getDatasetTasksById(serverStats.dataset_id);
        const data = response.data;
        console.log("Tasks data received: ", data);
        if (data.detail) {
          throw new Error(data.detail);
        }

        if (Array.isArray(data)) {
          setTasks(data);
          if (data.length > 0 && !selectedTaskId) {
            setValue("dataset_info.task_id", data[0].task_id);
            setValue("dataset_info.task_name", data[0].task_name);
            setValue("dataset_info.metric", data[0].metric);
          }
        } else {
          setErrorTasks(data.detail || "Invalid tasks data received");
          setTasks([]);
        }
      } catch (err) {
        console.error("Error fetching tasks: ", err);
        const errorMessage = err.response?.data?.detail || err.message || "Failed to fetch tasks for this dataset";
        setErrorTasks(errorMessage);
        setTasks([]);
      } finally {
        setLoadingTasks(false);
      }
    };

    fetchTasks();
  }, [serverStats?.dataset_id, selectedTaskId, setValue]);

  const fetchClientDatasetStats = async () => {
    if (!clientFilename) return;

    setLoadingClient(true);
    setErrorClient(null);

    try {
      const response = await getDatasetDetails(clientFilename);
      const data = response.data;

      console.log("Client dataset stats received: ", data);

      if (data.details) {
        throw new Error(data.details);
      }

      setClientStats(data);
      setValue("dataset_info.client_stats", data.datastats);
      setErrorClient(null);
    } catch (err) {
      const errorMessage = err.response?.data?.details || err.message || "Failed to fetch client dataset stats";
      setErrorClient(errorMessage);
      setClientStats(null);
      setValue("dataset_info.client_stats", null);
    } finally {
      setLoadingClient(false);
    }
  };

  const fetchServerDatasetStats = async () => {
    if (!serverFilename) return;

    setLoadingServer(true);
    setErrorServer(null);

    try {
      const response = await getDatasetOverview(serverFilename);

      const data = response.data;

      console.log("Server dataset stats received: ", data);

      if (data.details) {
        throw new Error(data.details);
      }

      setServerStats(data);
      setValue("dataset_info.server_stats", data.datastats);
      setErrorServer(null);
    } catch (err) {
      console.error("Error fetching server dataset stats: ", err);
      const errorMessage = err.response?.data?.details || err.message || "Failed to fetch server dataset stats";
      setErrorServer(errorMessage);
      setServerStats(null);
      setValue("dataset_info.server_stats", null);
    } finally {
      setLoadingServer(false);
    }
  };

  const handleOutputColumnChange = (column) => {
    const newColumns = outputColumns.includes(column)
      ? outputColumns.filter((c) => c !== column)
      : [...outputColumns, column];
    setOutputColumns(newColumns);
    setValue("dataset_info.output_columns", newColumns);
  };

  const handleTaskChange = (taskId) => {
    const selectedTask = tasks.find((task) => task.task_id === taskId);
    if (selectedTask) {
      setValue("dataset_info.task_id", selectedTask.task_id);
      setValue("dataset_info.metric", selectedTask.metric);
    }
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

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3">
        <FolderIcon className="h-7 w-7 text-blue-600" />
        <h3 className="text-xl font-semibold text-gray-800">
          Dataset Information
        </h3>
      </div>

      <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Client Dataset Section */}
          {/* <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Client Dataset
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter client filename"
                  {...register("dataset_info.client_filename", {
                    required: "*required",
                  })}
                  className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={fetchClientDatasetStats}
                  disabled={loadingClient || !clientFilename}
                  className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loadingClient ? (
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                  ) : (
                    <ArrowPathIcon className="h-4 w-4" />
                  )}
                  <span className="ml-2">Fetch</span>
                </button>
              </div>

              {errorClient && (
                <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded-md flex items-start">
                  <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  {errorClient}
                </div>
              )}

              {clientStats && (
                <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md flex items-start">
                  <CheckCircleIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
                  <span>
                    Successfully loaded dataset with{" "}
                    {clientStats.datastats.numRows} rows and{" "}
                    {clientStats.datastats.numColumns} columns
                  </span>
                </div>
              )}
            </div>
          </div> */}

          {/* Server Dataset Section */}
          <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Server Dataset
              </label>
              <div className="flex space-x-2">
                <input
                  type="text"
                  placeholder="Enter server filename"
                  {...register("dataset_info.server_filename", {
                    required: "*required",
                  })}
                  className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={fetchServerDatasetStats}
                  disabled={loadingServer || !serverFilename}
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
            {/* Column Matching Status */}
            {/* <div
              className={`p-3 rounded-md border ${
                columnsMatch()
                  ? "bg-green-50 border-green-200 text-green-800"
                  : "bg-yellow-50 border-yellow-200 text-yellow-800"
              }`}
            >
               <div className="flex items-start">
                {columnsMatch() ? (
                  <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                ) : (
                  <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
                )}
                <div>
                  <p className="font-medium">
                    {columnsMatch()
                      ? "Column names match between client and server datasets"
                      : "Column names do not match between client and server datasets"}
                  </p>
                  {!columnsMatch() && (
                    <p className="text-sm mt-1">
                      statistics for client and server datasets are different.
                      <br />
                    </p>
                  )}
                </div>
              </div> 
            </div> */}

            {/* Column Selection */}
            {(
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowColumnSelection(!showColumnSelection)}
                  className="flex items-center text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
                >
                  {showColumnSelection ? (
                    <ChevronUpIcon className="h-4 w-4 mr-2" />
                  ) : (
                    <ChevronDownIcon className="h-4 w-4 mr-2" />
                  )}
                  Select Output Columns
                </button>

                {showColumnSelection && (
                  <div className="mt-4 space-y-3">
                    <p className="text-sm text-gray-600">
                      Select which columns should be marked as output column(s).
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
                            checked={outputColumns.includes(column)}
                            onChange={() => handleOutputColumnChange(column)}
                            className="h-4 w-4 text-blue-600 rounded focus:ring-blue-500 border-gray-300"
                          />
                          <span className="text-sm text-gray-700">
                            {column}
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Task Selection */}
            <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
              {loadingTasks ? (
                <div className="flex items-center justify-center p-4 text-gray-500">
                  <ArrowPathIcon className="h-5 w-5 mr-3 animate-spin" />
                  <span>Loading available tasks...</span>
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
      <h3 className="text-lg font-medium text-gray-900">Available Tasks</h3>
    </div>
    <div className="px-6 py-4">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Task Name
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Metric
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Benchmark (Std Mean)
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Benchmark (Std Dev)
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {tasks.map((task) => (
              <tr 
                key={task.task_id}
                className={selectedTaskId === task.task_id ? 'bg-blue-50' : ''}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {task.task_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.metric}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.benchmark[task.metric]?.std_mean || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {task.benchmark[task.metric]?.std_dev || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleTaskChange(task.task_id);
                      setValue("dataset_info.task_id", task.task_id); // Update form value if using react-hook-form
                    }}
                    className={`px-4 py-2 rounded-md text-sm font-medium transition-colors duration-150 ${
                      selectedTaskId === task.task_id
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100'
                    }`}
                  >
                    {selectedTaskId === task.task_id ? 'Selected' : 'Select'}
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
            Selected task uses <strong className="font-medium">{getSelectedTaskMetric()}</strong> as its evaluation metric. 
            Please ensure you select this metric in the model selection step.
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


          </div>
        )}
      </div>
    </div>
  );
}
