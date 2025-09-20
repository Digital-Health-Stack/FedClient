import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useHelp } from "../../contexts/HelpContext";
import Joyride from "react-joyride";
import {
  FolderIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  XCircleIcon,
  HashtagIcon,
  CircleStackIcon,
} from "@heroicons/react/24/solid";
import Pagination from "./ViewAllFiles/Pagination";
import FileCard from "./ViewAllFiles/FileCard";
import { FilePlus } from "lucide-react";
import AddDataset from "./ViewAllDatasetsHelper/AddDataset";

const ViewAllDatasets = () => {
  // Environment variables and navigation setup
  const location = useLocation();
  const navigate = useNavigate();

  const [selectedFolder, setSelectedFolder] = useState("add");
  const [datasets, setDatasets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { showWalkthrough, stopWalkthrough } = useHelp();
  const [walkthroughKey, setWalkthroughKey] = useState(0);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["add", "raw", "processed", "datasets"].includes(hash)) {
      setSelectedFolder(hash);
    } else {
      setSelectedFolder("add");
      navigate(`${location.pathname}#add`);
    }
  }, [location.hash, location.pathname]);

  const handleTabClick = (folder) => {
    navigate(`${location.pathname}#${folder}`);
    setSelectedFolder(folder);
  };

  const PAGE_SIZE = 20; // Number of datasets per page
  const endpoints = {
    raw: {
      fetch: `${process.env.REACT_APP_PRIVATE_SERVER_BASE_URL}/list-raw-datasets`,
      // fetch: `${process.env.REACT_APP_PRIVATE_SERVER_BASE_URL}/file-upload/list-files`,
      delete: `${process.env.REACT_APP_PRIVATE_SERVER_BASE_URL}/delete-raw-dataset-file`,
      // delete: `${process.env.REACT_APP_PRIVATE_SERVER_BASE_URL}/file-upload/delete`,
      overview: "/raw-dataset-overview",
    },
    processed: {
      fetch: `${process.env.REACT_APP_PRIVATE_SERVER_BASE_URL}/list-datasets`,
      delete: `${process.env.REACT_APP_PRIVATE_SERVER_BASE_URL}/delete-dataset-file`,
      overview: "/processed-dataset-overview",
    },
    datasets: {
      fetch: `${process.env.REACT_APP_SERVER_BASE_URL}/list-datasets`,
      delete: `${process.env.REACT_APP_SERVER_BASE_URL}/delete-dataset-file`,
      overview: "/testing-dataset-overview",
    },
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(endpoints[selectedFolder].fetch, {
        params: { skip: (currentPage - 1) * PAGE_SIZE, limit: PAGE_SIZE },
      });
      if (selectedFolder == "datasets") {
        setDatasets(response.data);
      } else {
        setDatasets(response.data.datasets);
        setTotalCount(response.data.total);
      }
    } catch (err) {
      setError("Failed to load datasets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedFolder, currentPage]);

  // Walkthrough steps
  const [steps] = useState([
    // Add Dataset Section Steps
    {
      target: ".manage-data-add-dataset",
      content:
        "Click here to upload a new dataset to your federated learning environment.",
      disableBeacon: true,
    },
    {
      target: ".add-dataset-header",
      content:
        "This is the Add New Dataset page where you can upload your data files.",
      disableBeacon: true,
    },
    {
      target: ".add-dataset-upload-area",
      content:
        "Drag and drop your files here or click to browse. Supported formats include CSV, JSON, and other data files.",
      disableBeacon: true,
    },
    {
      target: ".add-dataset-upload-button",
      content:
        "Click this button to upload your selected files to the system for processing.",
      disableBeacon: true,
    },
    {
      target: ".add-dataset-summarizing-section",
      content:
        "Here you can see files that are being processed and summarized for federated learning.",
      disableBeacon: true,
    },

    // Raw Datasets Section Steps
    {
      target: ".manage-data-raw-datasets",
      content:
        "View and manage your raw datasets - the original data files you've uploaded.",
      disableBeacon: true,
    },
    {
      target: ".manage-data-header",
      content:
        "This shows the current section you're viewing - Raw datasets that are ready for processing.",
      disableBeacon: true,
    },
    {
      target: ".manage-data-guidelines",
      content:
        "Click here to view guidelines for data preprocessing and preparation.",
      disableBeacon: true,
    },
    {
      target: ".manage-data-dataset-grid",
      content:
        "Your raw datasets are displayed here. Click on any dataset to view its details and statistics.",
      disableBeacon: true,
    },

    // Processed Datasets Section Steps
    {
      target: ".manage-data-processed-datasets",
      content:
        "View and manage your processed datasets - data that has been cleaned and prepared for training.",
      disableBeacon: true,
    },
    {
      target: ".manage-data-header",
      content:
        "This shows the current section you're viewing - Processed datasets ready for federated learning.",
      disableBeacon: true,
    },
    {
      target: ".manage-data-guidelines",
      content:
        "Click here to view guidelines for data preprocessing and preparation.",
      disableBeacon: true,
    },
    {
      target: ".manage-data-dataset-grid",
      content:
        "Your processed datasets are displayed here. These are ready to use in federated learning sessions.",
      disableBeacon: true,
    },
  ]);

  const handleJoyrideCallback = (data) => {
    const { action, status, index } = data;

    if (action === "close" || status === "finished" || action === "skip") {
      stopWalkthrough();
      return;
    }

    // Switch to appropriate tab based on step index
    if (action === "next" || action === "update") {
      switch (index) {
        case 0: // Add Dataset step - switch to add tab
          setTimeout(() => handleTabClick("add"), 100);
          break;
        case 5: // Raw Datasets step - switch to raw tab
          setTimeout(() => handleTabClick("raw"), 100);
          break;
        case 9: // Processed Datasets step - switch to processed tab
          setTimeout(() => handleTabClick("processed"), 100);
          break;
        default:
          break;
      }
    }
  };

  // Reset walkthrough when it starts
  useEffect(() => {
    if (showWalkthrough) {
      setWalkthroughKey((prev) => prev + 1);
      // Reset to "add" tab when walkthrough starts
      ("add");
    }
  }, [showWalkthrough]);

  const handleDelete = async (datasetId) => {
    if (!window.confirm("Permanently delete this dataset?")) return;
    try {
      await axios.delete(endpoints[selectedFolder].delete, {
        params: { dataset_id: datasetId },
      });
      fetchData();
    } catch (err) {
      setError("Deletion failed");
    }
  };

  // Fetch uploaded files from HDFS
  const fetchUploadedFiles = async () => {
    setFetchingFiles(true);
    try {
      const response = await axios.get(endpoints.upload.list);
      if (response.data && response.data.contents) {
        // Extract files from the response structure
        const files = Object.values(response.data.contents).flat();
        setUploadedFiles(files);
      }
    } catch (err) {
      console.error("Error fetching uploaded files:", err);
      setError("Failed to fetch uploaded files");
    } finally {
      setFetchingFiles(false);
    }
  };

  // Delete uploaded file
  const handleDeleteUploadedFile = async (filename) => {
    if (!window.confirm(`Are you sure you want to delete "${filename}"?`))
      return;

    try {
      await axios.delete(`${endpoints.upload.delete}/${filename}`);
      setSuccess(`File "${filename}" deleted successfully`);
      fetchUploadedFiles(); // Refresh the list
    } catch (err) {
      setError(`Failed to delete "${filename}"`);
    }
  };

  // Format file size to human readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Format modification time
  const formatModificationTime = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleString();
  };

  // Fetch files on component mount and after successful upload
  // useEffect(() => {
  //   fetchUploadedFiles();
  // }, []);

  // Refresh files list after successful upload
  // useEffect(() => {
  //   if (success && success.includes("uploaded successfully")) {
  //     fetchUploadedFiles();
  //   }
  // }, [success]);

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
        <div className="max-w-9xl mx-auto grid grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-3">
            <button
              onClick={() => handleTabClick("add")}
              className={`manage-data-add-dataset w-full flex items-center gap-3 p-3 rounded-xl text-left
                ${
                  selectedFolder === "add"
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
            >
              <FilePlus className="h-5 w-5" />
              Add New Dataset
            </button>
            {["raw", "processed"].map((folder) => (
              <button
                key={folder}
                onClick={() => handleTabClick(folder)}
                className={`manage-data-${folder}-datasets w-full flex items-center gap-3 p-3 rounded-xl text-left
                ${
                  selectedFolder === folder
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                {folder === "raw" && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 16 16"
                    fill="#000000"
                  >
                    <path
                      fill="#000000"
                      fillRule="evenodd"
                      d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.597 11.85H0v3.999h.782v-1.491h.71l.7 1.491h1.651l.313-1.028h1.336l.314 1.028h.84L5.31 11.85h-.925l-1.329 3.96l-.783-1.572A1.18 1.18 0 0 0 3 13.116c0-.256-.056-.479-.167-.668a1.098 1.098 0 0 0-.478-.44a1.669 1.669 0 0 0-.758-.158Zm-.815 1.913v-1.292h.7a.74.74 0 0 1 .507.17c.13.113.194.276.194.49c0 .21-.065.368-.194.474c-.127.105-.3.158-.518.158H.782Zm4.063-1.148l.489 1.617H4.32l.49-1.617h.035Zm4.006.445l-.74 2.789h-.73L6.326 11.85h.855l.601 2.903h.038l.706-2.903h.683l.706 2.903h.04l.596-2.903h.858l-1.055 3.999h-.73l-.74-2.789H8.85Z"
                    />
                  </svg>
                )}
                {folder === "processed" && (
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
                )}
                {folder.charAt(0).toUpperCase() + folder.slice(1)} Datasets
              </button>
            ))}
            <button
              onClick={() => handleTabClick("datasets")}
              className={`manage-data-datasets w-full flex items-center gap-3 p-3 rounded-xl text-left
                      ${
                        selectedFolder === "datasets"
                          ? "bg-blue-50 text-blue-700"
                          : "hover:bg-gray-100"
                      }`}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 2048 2048"
              >
                <path
                  stroke="currentColor"
                  d="M1152 640H512V512h640v128zM256 1664h681l-64 128H128V128h1408v640h-128V256H256v1408zm256-384h617l-64 128H512v-128zm512-384v128H512V896h512zm939 967q14 28 14 57q0 26-10 49t-27 41t-41 28t-50 10h-754q-26 0-49-10t-41-27t-28-41t-10-50q0-29 14-57l299-598v-241h-128V896h640v128h-128v241l299 598zm-242-199l-185-369v-271h-128v271l-185 369h498z"
                />
              </svg>
              Testing Datasets
            </button>
          </div>
          {selectedFolder === "add" && <AddDataset />}
          {/* Main Content */}
          {selectedFolder !== "add" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <h1 className="manage-data-header text-2xl font-bold flex items-center gap-3">
                    {/* <DocumentTextIcon className="h-8 w-8 text-blue-500" /> */}
                    {selectedFolder === "raw" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        viewBox="0 0 16 16"
                      >
                        <path
                          strokeWidth="2"
                          fill="currentColor"
                          // fillRule="evenodd"
                          d="M14 4.5V14a2 2 0 0 1-2 2v-1a1 1 0 0 0 1-1V4.5h-2A1.5 1.5 0 0 1 9.5 3V1H4a1 1 0 0 0-1 1v9H2V2a2 2 0 0 1 2-2h5.5L14 4.5ZM1.597 11.85H0v3.999h.782v-1.491h.71l.7 1.491h1.651l.313-1.028h1.336l.314 1.028h.84L5.31 11.85h-.925l-1.329 3.96l-.783-1.572A1.18 1.18 0 0 0 3 13.116c0-.256-.056-.479-.167-.668a1.098 1.098 0 0 0-.478-.44a1.669 1.669 0 0 0-.758-.158Zm-.815 1.913v-1.292h.7a.74.74 0 0 1 .507.17c.13.113.194.276.194.49c0 .21-.065.368-.194.474c-.127.105-.3.158-.518.158H.782Zm4.063-1.148l.489 1.617H4.32l.49-1.617h.035Zm4.006.445l-.74 2.789h-.73L6.326 11.85h.855l.601 2.903h.038l.706-2.903h.683l.706 2.903h.04l.596-2.903h.858l-1.055 3.999h-.73l-.74-2.789H8.85Z"
                        />
                      </svg>
                    ) : selectedFolder === "processed" ? (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
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
                    ) : (
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-8 w-8"
                        viewBox="0 0 2048 2048"
                      >
                        <path
                          stroke="currentColor"
                          d="M1152 640H512V512h640v128zM256 1664h681l-64 128H128V128h1408v640h-128V256H256v1408zm256-384h617l-64 128H512v-128zm512-384v128H512V896h512zm939 967q14 28 14 57q0 26-10 49t-27 41t-41 28t-50 10h-754q-26 0-49-10t-41-27t-28-41t-10-50q0-29 14-57l299-598v-241h-128V896h640v128h-128v241l299 598zm-242-199l-185-369v-271h-128v271l-185 369h498z"
                        />
                      </svg>
                    )}
                    {selectedFolder === "raw"
                      ? "Raw Datasets"
                      : selectedFolder == "datasets"
                      ? "Testing Datasets"
                      : "Processed Datasets"}
                  </h1>
                  <a
                    href="/preprocessing-docs"
                    className="manage-data-guidelines flex items-center gap-2 text-blue-600 hover:text-blue-800"
                  >
                    <ArrowUpTrayIcon className="h-5 w-5" />
                    Processing Guidelines
                  </a>
                </div>
              </div>

              {/* Content */}
              {error && (
                <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3">
                  <XCircleIcon className="h-5 w-5 text-red-500" />
                  <span className="text-red-600">{error}</span>
                </div>
              )}

              {loading ? (
                <div className="animate-pulse space-y-4">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded-xl" />
                  ))}
                </div>
              ) : (
                <>
                  <div className="manage-data-dataset-grid grid grid-cols-2 md:grid-cols-3 gap-4">
                    {datasets
                      .sort(
                        (a, b) =>
                          new Date(b.dataset_id) - new Date(a.dataset_id)
                      )
                      .map((dataset) => (
                        <FileCard
                          key={dataset.dataset_id}
                          dataset={dataset}
                          isRaw={selectedFolder === "raw"}
                          selectedFolder={selectedFolder}
                          onDelete={handleDelete}
                          onClick={() =>
                            navigate(
                              `${endpoints[selectedFolder].overview}/${dataset.filename}`
                            )
                          }
                          onEditSuccess={fetchData}
                        />
                      ))}
                  </div>

                  <Pagination
                    currentPage={currentPage}
                    totalCount={totalCount}
                    pageSize={PAGE_SIZE}
                    onPageChange={setCurrentPage}
                  />
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ViewAllDatasets;
