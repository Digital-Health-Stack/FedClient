import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useHelp } from "../../contexts/HelpContext";
import Joyride from "react-joyride";
import {
  FolderIcon,
  DocumentTextIcon,
  ArrowUpTrayIcon,
  XCircleIcon,
} from "@heroicons/react/24/solid";
import Pagination from "./ViewAllFiles/Pagination";
import FileCard from "./ViewAllFiles/FileCard";
import { FilePlus } from "lucide-react";
import AddDataset from "./ViewAllDatasetsHelper/AddDataset";

const ViewAllDatasets = () => {
  // Environment variables and navigation setup
  const [selectedFolder, setSelectedFolder] = useState("add");
  const [datasets, setDatasets] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { showWalkthrough, stopWalkthrough } = useHelp();
  const [walkthroughKey, setWalkthroughKey] = useState(0);

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
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(endpoints[selectedFolder].fetch, {
        params: { skip: (currentPage - 1) * PAGE_SIZE, limit: PAGE_SIZE },
      });
      setDatasets(response.data);
      setTotalCount(response.headers["x-total-count"] || response.data.length);
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
          setTimeout(() => setSelectedFolder("add"), 100);
          break;
        case 5: // Raw Datasets step - switch to raw tab
          setTimeout(() => setSelectedFolder("raw"), 100);
          break;
        case 9: // Processed Datasets step - switch to processed tab
          setTimeout(() => setSelectedFolder("processed"), 100);
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
      setSelectedFolder("add");
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
              onClick={() => setSelectedFolder("add")}
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
                onClick={() => setSelectedFolder(folder)}
                className={`manage-data-${folder}-datasets w-full flex items-center gap-3 p-3 rounded-xl text-left
                ${
                  selectedFolder === folder
                    ? "bg-blue-50 text-blue-700"
                    : "hover:bg-gray-100"
                }`}
              >
                <FolderIcon className="h-5 w-5" />
                {folder.charAt(0).toUpperCase() + folder.slice(1)} Datasets
              </button>
            ))}
          </div>
          {selectedFolder === "add" && <AddDataset />}
          {/* Main Content */}
          {selectedFolder !== "add" && (
            <div className="space-y-6">
              {/* Header */}
              <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center justify-between">
                  <h1 className="manage-data-header text-2xl font-bold flex items-center gap-3">
                    <DocumentTextIcon className="h-8 w-8 text-blue-500" />
                    {selectedFolder === "raw"
                      ? "Raw Datasets"
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
                    {datasets.map((dataset) => (
                      <FileCard
                        key={dataset.dataset_id}
                        dataset={dataset}
                        isRaw={selectedFolder === "raw"}
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
