import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import {
  DocumentTextIcon,
  ArrowUpTrayIcon,
  XCircleIcon,
  CheckCircleIcon,
} from "@heroicons/react/24/solid";
import { FilePlus } from "lucide-react";

const AddDataset = () => {
  // Environment variables and navigation setup
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const navigate = useNavigate();

  const endpoints = {
    upload: {
      upload: `${process.env.REACT_APP_PRIVATE_SERVER_BASE_URL}/create-new-dataset`,
      list: `${process.env.REACT_APP_PRIVATE_SERVER_BASE_URL}/file-upload/list-files`,
    },
  };

  // Fetch uploaded files from HDFS (to check if summarization is complete)
  const fetchUploadedFiles = async () => {
    try {
      const response = await axios.get(endpoints.upload.list);
      if (response.data && response.data.contents) {
        const files = Object.values(response.data.contents).flat();
        setUploadedFiles(files);
      }
    } catch (err) {
      console.error("Error fetching uploaded files:", err);
    }
  };

  // Poll for summarization completion and redirect when done
  useEffect(() => {
    const interval = setInterval(() => {
      if (uploadedFiles.length > 0) {
        // Still processing, keep checking
        fetchUploadedFiles();
      } else if (success && success.includes("uploaded") && !uploading) {
        // Summarization complete, redirect to raw datasets
        navigate("/view-all-datasets#raw");
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, [uploadedFiles, success, uploading, navigate]);

  // Start checking for summarization status after successful upload
  useEffect(() => {
    if (success && success.includes("uploaded")) {
      fetchUploadedFiles();
    }
  }, [success]);

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    setSelectedFiles(files);
  };

  const handleFileSelect = (e) => {
    const files = Array.from(e.target.files);
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress({});

    try {
      const uploadPromises = selectedFiles.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);

        // Update progress for this file
        setUploadProgress((prev) => ({
          ...prev,
          [file.name]: { status: "uploading", progress: 0 },
        }));

        try {
          const response = await axios.post(endpoints.upload.upload, formData, {
            headers: {
              "Content-Type": "multipart/form-data",
            },
            onUploadProgress: (progressEvent) => {
              const progress = Math.round(
                (progressEvent.loaded * 100) / progressEvent.total
              );
              setUploadProgress((prev) => ({
                ...prev,
                [file.name]: { status: "uploading", progress },
              }));
            },
          });

          // Update progress to completed
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: { status: "completed", progress: 100 },
          }));

          return { file: file.name, success: true, data: response.data };
        } catch (error) {
          // Update progress to failed
          setError(error.response?.data?.detail || "Upload failed");
          setUploadProgress((prev) => ({
            ...prev,
            [file.name]: {
              status: "failed",
              progress: 0,
              error: error.response?.data?.detail || "Upload failed",
            },
          }));

          return {
            file: file.name,
            success: false,
            error: error.response?.data?.detail || "Upload failed",
          };
        }
      });

      const results = await Promise.all(uploadPromises);
      const successfulUploads = results.filter((r) => r.success);
      const failedUploads = results.filter((r) => !r.success);

      if (successfulUploads.length > 0) {
        setSuccess(
          `${successfulUploads.length} file(s) uploaded. Doing some checks... wait for some time, page will reload when done`
        );
        // Store uploaded filenames for highlighting after navigation
        localStorage.setItem('highlightDatasets', JSON.stringify(successfulUploads.map(u => u.file)));
        setSelectedFiles([]); // Clear selected files
      }

      if (failedUploads.length > 0) {
        setError(
          `${failedUploads.length} file(s) failed to upload. One of the errors is: ${failedUploads[0].error}`
        );
      }
    } catch (error) {
      setError(
        "Upload failed: " + (error.response?.data?.detail || error.message)
      );
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveSelectedFile = (fileIdx) => {
    setSelectedFiles((prev) => prev.filter((_, idx) => idx !== fileIdx));
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 rounded-xl shadow-sm border">
        <div className="flex items-center justify-between">
          <h1 className="add-dataset-header text-2xl font-bold flex items-center gap-3">
            <FilePlus className="h-8 w-8" />
            Add New Dataset
          </h1>
        </div>
      </div>

      {/* Content */}
      {error && (
        <div className="bg-red-50 p-4 rounded-lg flex items-center gap-3">
          <XCircleIcon className="h-5 w-5 text-red-500" />
          <span className="text-red-600">{error}</span>
          <button
            onClick={clearMessages}
            className="ml-auto text-red-500 hover:text-red-700"
          >
            ×
          </button>
        </div>
      )}

      {success && (
        <div className="bg-green-50 p-4 rounded-lg flex items-center gap-3">
          <CheckCircleIcon className="h-5 w-5 text-green-500" />
          <span className="text-green-600">{success}</span>
          <button
            onClick={clearMessages}
            className="ml-auto text-green-500 hover:text-green-700"
          >
            ×
          </button>
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
          {/* Centered File Upload UI with fixed height */}
          <div className="flex items-center justify-center w-full">
            <div
              className={`manage-data-add-dataset add-dataset-upload-area bg-white p-8 rounded-2xl min-h-[350px] shadow-lg border-2 border-dashed flex flex-col items-center justify-center w-full transition-all duration-200 ${isDragOver ? "border-blue-400 bg-blue-50 shadow-blue-200" : "border-blue-600 hover:border-blue-800"
                }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <label
                htmlFor="file-upload"
                className="flex flex-col items-center gap-2 cursor-pointer text-blue-600 hover:text-blue-800 font-medium"
              >
                <ArrowUpTrayIcon
                  className={`h-10 w-10 mb-2 transition-colors ${isDragOver ? "text-blue-500" : ""
                    }`}
                />
                <span className="mb-2">
                  {isDragOver
                    ? "Drop files here"
                    : "Click to select files to upload"}
                </span>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="hidden"
                  multiple
                  accept=".csv,.parquet"
                  onChange={handleFileSelect}
                />
                <span className="text-xs text-gray-400 mb-1">or drag and drop</span>
                <span className="text-xs text-gray-500 mt-1">Accepted Formats: .csv, .parquet</span>
              </label>
              <button
                type="button"
                className="add-dataset-upload-button mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleUpload}
                disabled={selectedFiles.length === 0 || uploading}
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <FilePlus className="h-5 w-5" />
                    Upload to HDFS
                  </>
                )}
              </button>

              {/* Show selected files */}
              {selectedFiles.length > 0 && (
                <div className="mt-6 w-full">
                  <h3 className="text-sm font-semibold mb-2 text-gray-700">
                    Selected Files:
                  </h3>
                  <ul className="space-y-2 max-h-48 overflow-y-auto">
                    {selectedFiles.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center gap-2 text-gray-600 text-sm bg-gray-100 rounded px-3 py-2"
                      >
                        <DocumentTextIcon className="h-4 w-4 text-blue-400" />
                        <span className="truncate max-w-[150px]">
                          {file.name}
                        </span>
                        <span className="ml-auto text-xs text-gray-400">
                          {(file.size / 1024).toFixed(1)} KB
                        </span>
                        {/* Upload progress indicator */}
                        {uploadProgress[file.name] && (
                          <div className="ml-2">
                            {uploadProgress[file.name].status ===
                              "uploading" && (
                                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                              )}
                            {uploadProgress[file.name].status ===
                              "completed" && (
                                <CheckCircleIcon className="h-4 w-4 text-green-500" />
                              )}
                            {uploadProgress[file.name].status === "failed" && (
                              <XCircleIcon
                                className="h-4 w-4 text-red-500"
                                title={uploadProgress[file.name].error}
                              />
                            )}
                          </div>
                        )}
                        {/* Remove file button */}
                        <button
                          type="button"
                          className="ml-2 text-red-700 hover:text-red-500 transition-all duration-300 focus:outline-none"
                          title="Remove file"
                          onClick={() => handleRemoveSelectedFile(idx)}
                        >
                          <XCircleIcon className="h-4 w-4" />
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>

        </>
      )}
    </div>
  );
};

export default AddDataset;
