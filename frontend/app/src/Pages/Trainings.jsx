import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getAllSessions } from "../services/federatedService";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  CubeIcon,
  ArrowRightIcon,
  ClockIcon,
  ChartBarIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  InformationCircleIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { DocumentArrowUpIcon } from "@heroicons/react/24/solid";
import { InView } from "react-intersection-observer";

export default function Trainings() {
  const navigate = useNavigate();
  const { api } = useAuth();
  const [sessions, setSessions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingOneTime, setIsLoadingOneTime] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    perPage: 11,
    total: 0,
    totalPages: 1,
  });
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const [showInfo, setShowInfo] = useState(false);
  const [filters, setFilters] = useState({
    sortOrder: "desc",
    trainingStatus: "",
    search: "",
  });
  const [tempFilters, setTempFilters] = useState({
    sortOrder: "desc",
    trainingStatus: "",
    search: "",
  });
  const [showFilters, setShowFilters] = useState(false);
  const isInitialMount = useRef(true);

  const openDetails = (sessionId) => {
    navigate(`/trainings/${sessionId}`);
  };
  const openNewTraining = () => {
    localStorage.removeItem("fedclient_request_form_data");
    localStorage.removeItem("fedclient_request_current_step");
    navigate(`/Request`);
  };

  // const fetchSessions = async () => {
  //   try {
  //     setIsLoading(true);
  //     setError(null);
  //     const response = await getAllSessions(
  //       api,
  //       pagination.page,
  //       pagination.perPage
  //     );
  //     setSessions(response.data.data || []);
  //     setPagination((prev) => ({
  //       ...prev,
  //       total: response.data.total,
  //       totalPages: Math.ceil(response.data.total / pagination.perPage), // Ensure correct page count
  //     }));
  //   } catch (err) {
  //     console.error("Error fetching sessions:", err);
  //     setError("Failed to load training sessions");
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
  const fetchSessions = async () => {
    if (!hasMore) return;

    try {
      setIsLoading(true);
      setError(null);

      const response = await getAllSessions(
        api,
        page,
        pagination.perPage,
        filters
      );
      const newSessions = response.data.data || [];

      // setSessions((prev) => [...prev, ...newSessions]);
      setSessions((prev) => {
        const all = [...prev, ...newSessions];
        const unique = Array.from(new Map(all.map((s) => [s.id, s])).values());
        return unique;
      });

      const total = response.data.total;
      const totalPages = Math.ceil(total / pagination.perPage);

      setHasMore(page < totalPages);
      setPage((prev) => prev + 1);
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load training sessions");
    } finally {
      setIsLoading(false);
      setIsLoadingOneTime(false);
    }
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      // setPagination((prev) => ({ ...prev, page: newPage }));
      setPagination((prev) => ({
        ...prev,
        total,
        totalPages,
      }));
    }
  };

  const resetAndFetch = async () => {
    setSessions([]);
    setPage(1);
    setHasMore(true);

    // Fetch with page 1 explicitly to avoid state update timing issues
    try {
      setIsLoading(true);
      setIsLoadingOneTime(true);
      setError(null);

      const response = await getAllSessions(
        api,
        1,
        pagination.perPage,
        filters
      );
      const newSessions = response.data.data || [];

      setSessions(newSessions);

      const total = response.data.total;
      const totalPages = Math.ceil(total / pagination.perPage);

      setHasMore(1 < totalPages);
      setPage(2); // Set to 2 since we just fetched page 1
    } catch (err) {
      console.error("Error fetching sessions:", err);
      setError("Failed to load training sessions");
    } finally {
      setIsLoading(false);
      setIsLoadingOneTime(false);
    }
  };

  useEffect(() => {
    resetAndFetch();
  }, []);

  const applyFilters = () => {
    setFilters(tempFilters);
  };

  const clearAllFilters = () => {
    const clearedFilters = {
      sortOrder: "desc",
      trainingStatus: "",
      search: "",
    };
    setTempFilters(clearedFilters);
    setFilters(clearedFilters);
  };

  // Function to highlight search terms in text
  const highlightSearchTerm = (text, searchTerm) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(
      `(${searchTerm.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
      "gi"
    );
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <mark key={index} className="bg-blue-200 px-1 rounded">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  useEffect(() => {
    // Skip the filters effect on initial mount to prevent double API call
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    resetAndFetch();
  }, [filters]);

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
  const formatTimestamp = (timestamp) => {
    try {
      const utcTimestamp = timestamp + "Z";
      const date = new Date(utcTimestamp);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (e) {
      return timestamp;
    }
  };

  if (isLoadingOneTime) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <ArrowPathIcon className="h-12 w-12 text-blue-500 animate-spin" />
        <p className="mt-4 text-lg font-medium text-gray-700">
          Loading training sessions...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">
              Error loading data
            </h3>
          </div>
          <p className="mt-2 text-sm text-red-700">{error}</p>
          <button
            onClick={fetchSessions}
            className="mt-3 inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 relative">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-gray-900 flex items-center">
              <CubeIcon className="h-6 w-6 text-blue-600 mr-2" />
              Training Sessions
            </h1>
            <div className="relative ml-2">
              <button
                type="button"
                className="w-5 h-5 flex items-center justify-center rounded-full text-gray-500 hover:text-gray-700"
                onClick={() => setShowInfo((prev) => !prev)}
                aria-label="Show info about trainings page"
              >
                <span className="font-bold text-xs">
                  <InformationCircleIcon className="h-5 w-5" />
                </span>
              </button>
              {showInfo && (
                <div className="absolute left-1/2 -translate-x-1/2 mt-2 z-20 w-80 bg-white border border-gray-200 rounded-lg shadow-lg p-4 text-sm text-gray-700 animate-fade-in">
                  <div className="flex justify-between items-center mb-2">
                    <span className="font-semibold">Training Sessions</span>
                    <button
                      className="text-gray-400 hover:text-gray-600"
                      onClick={() => setShowInfo(false)}
                      aria-label="Close info"
                    >
                      ×
                    </button>
                  </div>
                  <div>
                    This page lists all your federated learning training
                    sessions. You can monitor the status, view details, and
                    track progress of both active and completed sessions.
                  </div>
                </div>
              )}
            </div>
          </div>
          <p className="text-sm text-gray-500 mt-1">
            Monitor active and completed federated learning sessions
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center px-3 py-1.5 border shadow-sm text-sm font-medium rounded-md ${
              showFilters
                ? "border-blue-300 text-blue-700 bg-blue-50 hover:bg-blue-100"
                : "border-gray-300 text-gray-700 bg-white hover:bg-gray-50"
            }`}
          >
            <FunnelIcon className="h-4 w-4 mr-2" />
            Filters
          </button>
          <button
            onClick={resetAndFetch}
            className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            <ArrowPathIcon className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters Panel */}
      {showFilters && (
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Unified Search */}
            <div className="col-span-1 md:col-span-1 lg:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <div className="relative">
                <MagnifyingGlassIcon className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  value={tempFilters.search}
                  onChange={(e) =>
                    setTempFilters((prev) => ({
                      ...prev,
                      search: e.target.value,
                    }))
                  }
                  placeholder="Search by training name or server file..."
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                {tempFilters.search && (
                  <button
                    onClick={() =>
                      setTempFilters((prev) => ({ ...prev, search: "" }))
                    }
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <XMarkIcon className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Sort Order */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Sort by Date
              </label>
              <select
                value={tempFilters.sortOrder}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    sortOrder: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="desc">Newest First</option>
                <option value="asc">Oldest First</option>
              </select>
            </div>

            {/* Training Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Training Status
              </label>
              <select
                value={tempFilters.trainingStatus}
                onChange={(e) =>
                  setTempFilters((prev) => ({
                    ...prev,
                    trainingStatus: e.target.value,
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">All Statuses</option>
                {/* <option value="CREATED">Created</option> */}
                <option value="PRICE_NEGOTIATION">Price Negotiation</option>
                <option value="ACCEPTING_CLIENTS">Client Recruitment</option>
                <option value="MODEL_INITIALIZATION">
                  Model Initialization
                </option>
                <option value="STARTED">Training Active</option>
                <option value="COMPLETED">Completed</option>
                <option value="FAILED">Failed</option>
                <option value="CANCELLED">Cancelled</option>
              </select>
            </div>
          </div>

          {/* Apply and Clear Buttons */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={clearAllFilters}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-600 hover:text-gray-800"
            >
              Clear All Filters
            </button>
            <button
              onClick={applyFilters}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="flex flex-col gap-4">
          <div
            className="bg-blue-200 hover:bg-blue-300  rounded-lg shadow-sm border-2 border-blue-600 overflow-hidden hover:shadow-md transition-shadow cursor-pointer h-40"
            onClick={openNewTraining}
          >
            <div className="p-5 h-full flex items-center justify-center">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium text-gray-800 truncate flex items-center gap-3">
                  <DocumentArrowUpIcon className="w-8 h-8" /> New Training
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-center">
              <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium text-yellow-800">
                No training sessions
              </h3>
            </div>
            <p className="mt-2 text-sm text-yellow-700">
              There are currently no training sessions to display.
            </p>
          </div>
        </div>
      ) : (
        <>
          {/* <div className="mb-4 flex justify-between items-center">
            <p className="text-sm text-gray-500">
              Showing{" "}
              <span className="font-medium">
                {(pagination.page - 1) * pagination.perPage + 1}
              </span>{" "}
              to{" "}
              <span className="font-medium">
                {Math.min(
                  pagination.page * pagination.perPage,
                  pagination.total
                )}
              </span>{" "}
              of <span className="font-medium">{pagination.total}</span>{" "}
              training sessions
            </p>
          </div> */}

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            <div
              className="bg-blue-200 hover:bg-blue-300  rounded-lg shadow-sm border-2 border-blue-600 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
              onClick={openNewTraining}
            >
              <div className="p-5 h-full flex items-center justify-center">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-800 truncate flex items-center gap-3">
                    <DocumentArrowUpIcon className="w-8 h-8" /> New Training
                  </h3>
                </div>
              </div>
            </div>
            {sessions.map((session) => (
              <div
                key={session.id}
                className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => openDetails(session.id)}
              >
                <div className="p-5">
                  <div className="flex items-center justify-between mb-3">
                    <h3
                      title={session.name}
                      className="text-lg font-medium text-gray-900 truncate"
                    >
                      {session.name.length > 22
                        ? highlightSearchTerm(
                            `${session.name.substring(0, 22)}...`,
                            filters.search
                          )
                        : highlightSearchTerm(
                            session.name || "Untitled Session",
                            filters.search
                          )}
                    </h3>
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        session.training_status
                      )}`}
                    >
                      {TrainingStatuses[session.training_status] || "Unknown"}
                    </span>
                  </div>

                  <div className="flex items-center text-sm text-gray-500 mb-2">
                    <InformationCircleIcon className="flex-shrink-0 h-4 w-4 mr-1.5" />
                    <span>Session ID: {session.id}</span>
                  </div>

                  {session.server_filename && (
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      {/* <DocumentArrowUpIcon className="flex-shrink-0 h-4 w-4 mr-1.5" /> */}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-7 w-7 mr-1.5"
                        viewBox="0 0 2048 2048"
                      >
                        <path
                          fill="currentColor"
                          d="M1152 640H512V512h640v128zM256 1664h681l-64 128H128V128h1408v640h-128V256H256v1408zm256-384h617l-64 128H512v-128zm512-384v128H512V896h512zm939 967q14 28 14 57q0 26-10 49t-27 41t-41 28t-50 10h-754q-26 0-49-10t-41-27t-28-41t-10-50q0-29 14-57l299-598v-241h-128V896h640v128h-128v241l299 598zm-242-199l-185-369v-271h-128v271l-185 369h498z"
                        />
                      </svg>
                      <span className="truncate">
                        {highlightSearchTerm(
                          session.server_filename,
                          filters.search
                        )}
                      </span>
                    </div>
                  )}

                  <div className="flex items-center text-sm text-gray-500">
                    <ClockIcon className="flex-shrink-0 h-4 w-4 mr-1.5" />
                    <span>Created: {formatTimestamp(session.created_at)}</span>
                  </div>
                </div>

                <div className="bg-gray-50 px-5 py-3 flex justify-between items-center">
                  <span className="text-sm font-medium text-gray-500">
                    View details
                  </span>
                  <ArrowRightIcon className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            ))}
          </div>
          <InView
            as="div"
            onChange={(inView) => {
              if (inView) fetchSessions();
            }}
          >
            {isLoading && (
              <div className="flex justify-center my-4">
                <ArrowPathIcon className="h-6 w-6 text-blue-500 animate-spin" />
              </div>
            )}
          </InView>
          {/* <div className="mt-8 flex items-center justify-between border-t border-gray-200 px-4 py-3 sm:px-6">
            <div className="flex flex-1 justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Next
              </button>
            </div>
            <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Showing{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.perPage + 1}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium">
                    {Math.min(
                      pagination.page * pagination.perPage,
                      pagination.total
                    )}
                  </span>{" "}
                  of <span className="font-medium">{pagination.total}</span>{" "}
                  results
                </p>
              </div>
              <div>
                <nav
                  className="isolate inline-flex -space-x-px rounded-md shadow-sm"
                  aria-label="Pagination"
                >
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Previous</span>
                    <ChevronLeftIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                  {Array.from(
                    { length: Math.min(5, pagination.totalPages) },
                    (_, i) => {
                      let pageNum;
                      if (pagination.totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (pagination.page <= 3) {
                        pageNum = i + 1;
                      } else if (pagination.page >= pagination.totalPages - 2) {
                        pageNum = pagination.totalPages - 4 + i;
                      } else {
                        pageNum = pagination.page - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => handlePageChange(pageNum)}
                          className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ${pagination.page === pageNum
                            ? "bg-blue-600 text-white focus:z-20 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
                            : "text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                            }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                  )}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0"
                  >
                    <span className="sr-only">Next</span>
                    <ChevronRightIcon className="h-5 w-5" aria-hidden="true" />
                  </button>
                </nav>
              </div>
            </div>
          </div> */}
        </>
      )}
    </div>
  );
}
