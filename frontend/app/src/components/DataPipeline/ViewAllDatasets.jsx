import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useHelp } from "../../contexts/HelpContext";
import CoachMarksOverlay from "../Common/CoachMarksOverlay";
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
  const [highlightedDatasets, setHighlightedDatasets] = useState([]);

  useEffect(() => {
    const hash = window.location.hash.replace("#", "");
    if (["add", "raw", "processed", "datasets"].includes(hash)) {
      setSelectedFolder(hash);

      // Check for highlighted datasets when navigating to raw
      if (hash === "raw") {
        const stored = localStorage.getItem('highlightDatasets');
        if (stored) {
          try {
            const filenames = JSON.parse(stored);
            setHighlightedDatasets(filenames);
            // Clear localStorage after reading
            localStorage.removeItem('highlightDatasets');
            // Auto-clear highlights after 8 seconds
            setTimeout(() => setHighlightedDatasets([]), 8000);
          } catch (e) {
            console.error('Error parsing highlightDatasets:', e);
          }
        }
      }
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
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
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

  // Coach marks steps - sidebar navigation
  const coachMarksSteps = [
    {
      target: ".manage-data-add-dataset",
      content: "Upload new datasets here.",
      placement: "top",
    },
    {
      target: ".manage-data-raw-datasets",
      content: "View your raw and processed datasets here.",
      placement: "top",
    },
    {
      target: ".manage-data-datasets",
      content: "Browse server benchmarks, training tasks and leaderboards.",
      placement: "bottom",
    },
  ];

  const handleDelete = async (datasetId) => {
    if (!window.confirm("Permanently delete this dataset?")) return;
    try {
      await axios.delete(endpoints[selectedFolder].delete, {
        params: { dataset_id: datasetId },
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
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
      const response = await axios.get(endpoints.upload.list, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
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
      await axios.delete(`${endpoints.upload.delete}/${filename}`, {
        headers: {
          "ngrok-skip-browser-warning": "true",
        },
      });
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
      <CoachMarksOverlay
        isVisible={showWalkthrough}
        onDismiss={stopWalkthrough}
        steps={coachMarksSteps}
        title="Manage Your Datasets"
        subtitle="Upload, view, and organize your data for federated learning"
      />
      <div className="min-h-[calc(100vh-57px)] bg-gray-50 p-8">
        <div className="max-w-9xl mx-auto grid grid-cols-[240px_1fr] gap-8">
          {/* Sidebar */}
          <div className="space-y-3">
            <button
              onClick={() => handleTabClick("add")}
              className={`w-full flex items-center gap-3 p-3 rounded-xl text-left
                ${selectedFolder === "add"
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-100"
                }`}
            >
              <FilePlus className="h-5 w-5" />
              Add New Dataset
            </button>
            <div className="manage-data-raw-datasets space-y-3">
              {["raw", "processed"].map((folder) => (
                <button
                  key={folder}
                  onClick={() => handleTabClick(folder)}
                  className={` w-full flex items-center gap-3 p-3 rounded-xl text-left
                ${selectedFolder === folder
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
            </div>
            <button
              onClick={() => handleTabClick("datasets")}
              className={`manage-data-datasets w-full flex items-center gap-3 p-3 rounded-xl text-left
                      ${selectedFolder === "datasets"
                  ? "bg-blue-50 text-blue-700"
                  : "hover:bg-gray-100"
                }`}
            >
              {/* TODO: Add server benchmarks icon */}
              <svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" className="w-6 h-6" zoomAndPan="magnify" viewBox="0 0 480 479.999983" preserveAspectRatio="xMidYMid meet" version="1.0"><defs><clipPath id="6ca31e83c9"><path d="M 28.816406 28.816406 L 451.066406 28.816406 L 451.066406 451.066406 L 28.816406 451.066406 Z M 28.816406 28.816406 " clip-rule="nonzero" /></clipPath></defs><g clip-path="url(#6ca31e83c9)"><path fill="#000000" d="M 430.855469 410.644531 L 382 410.644531 L 382 249.199219 C 382 246.300781 379.640625 243.945312 376.742188 243.945312 L 298.03125 243.945312 C 295.132812 243.945312 292.773438 246.300781 292.773438 249.199219 L 292.773438 410.644531 L 279.476562 410.644531 L 279.476562 300.519531 C 279.476562 297.617188 277.121094 295.261719 274.21875 295.261719 L 195.507812 295.261719 C 192.609375 295.261719 190.25 297.617188 190.25 300.519531 L 190.25 410.644531 L 176.953125 410.644531 L 176.953125 351.835938 C 176.953125 348.9375 174.597656 346.582031 171.699219 346.582031 L 92.984375 346.582031 C 90.085938 346.582031 87.730469 348.9375 87.730469 351.835938 L 87.730469 410.644531 L 69.253906 410.644531 L 69.253906 180.527344 C 69.253906 169.382812 60.1875 160.316406 49.042969 160.316406 C 37.898438 160.316406 28.832031 169.382812 28.832031 180.527344 L 28.832031 445.808594 C 28.832031 448.710938 31.191406 451.066406 34.089844 451.066406 L 430.871094 451.066406 C 442.015625 451.066406 451.082031 442 451.082031 430.855469 C 451.082031 419.710938 442.015625 410.644531 430.871094 410.644531 Z M 303.277344 254.457031 L 371.476562 254.457031 L 371.476562 410.644531 L 303.277344 410.644531 Z M 200.753906 305.773438 L 268.953125 305.773438 L 268.953125 410.644531 L 200.753906 410.644531 Z M 98.222656 357.09375 L 166.421875 357.09375 L 166.421875 410.644531 L 98.222656 410.644531 Z M 430.855469 440.554688 L 39.328125 440.554688 L 39.328125 180.527344 C 39.328125 175.183594 43.683594 170.828125 49.027344 170.828125 C 54.371094 170.828125 58.722656 175.183594 58.722656 180.527344 L 58.722656 415.902344 C 58.722656 418.800781 61.078125 421.15625 63.980469 421.15625 L 430.855469 421.15625 C 436.199219 421.15625 440.554688 425.511719 440.554688 430.855469 C 440.554688 436.199219 436.199219 440.554688 430.855469 440.554688 Z M 84.332031 266.6875 C 84.332031 293.152344 105.863281 314.683594 132.328125 314.683594 C 158.792969 314.683594 180.328125 293.152344 180.328125 266.6875 C 180.328125 240.222656 158.792969 218.6875 132.328125 218.6875 C 105.863281 218.6875 84.332031 240.222656 84.332031 266.6875 Z M 112.679688 298.589844 L 112.679688 293.019531 C 112.679688 288.980469 115.964844 285.6875 120.011719 285.6875 L 144.636719 285.6875 C 148.675781 285.6875 151.96875 288.972656 151.96875 293.019531 L 151.96875 298.589844 C 146.25 302.121094 139.519531 304.171875 132.328125 304.171875 C 125.136719 304.171875 118.398438 302.128906 112.6875 298.589844 Z M 169.8125 266.6875 C 169.8125 275.226562 166.941406 283.09375 162.113281 289.410156 C 160.441406 281.296875 153.238281 275.183594 144.636719 275.183594 L 120.011719 275.183594 C 111.410156 275.183594 104.214844 281.296875 102.535156 289.410156 C 97.707031 283.101562 94.832031 275.226562 94.832031 266.6875 C 94.832031 246.019531 111.652344 229.199219 132.320312 229.199219 C 152.984375 229.199219 169.804688 246.019531 169.804688 266.6875 Z M 113.203125 253.011719 C 113.203125 263.550781 121.78125 272.125 132.320312 272.125 C 142.859375 272.125 151.433594 263.550781 151.433594 253.011719 C 151.433594 242.472656 142.859375 233.894531 132.320312 233.894531 C 121.78125 233.894531 113.203125 242.472656 113.203125 253.011719 Z M 140.929688 253.011719 C 140.929688 257.757812 137.066406 261.613281 132.328125 261.613281 C 127.589844 261.613281 123.726562 257.75 123.726562 253.011719 C 123.726562 248.273438 127.589844 244.410156 132.328125 244.410156 C 137.066406 244.410156 140.929688 248.273438 140.929688 253.011719 Z M 186.851562 215.367188 C 186.851562 241.832031 208.386719 263.367188 234.851562 263.367188 C 261.316406 263.367188 282.847656 241.832031 282.847656 215.367188 C 282.847656 188.902344 261.316406 167.371094 234.851562 167.371094 C 208.386719 167.371094 186.851562 188.902344 186.851562 215.367188 Z M 215.210938 247.28125 L 215.210938 241.710938 C 215.210938 237.671875 218.496094 234.378906 222.542969 234.378906 L 247.167969 234.378906 C 251.207031 234.378906 254.5 237.664062 254.5 241.710938 L 254.5 247.28125 C 248.78125 250.8125 242.050781 252.863281 234.859375 252.863281 C 227.667969 252.863281 220.929688 250.820312 215.21875 247.28125 Z M 272.335938 215.367188 C 272.335938 223.898438 269.464844 231.777344 264.636719 238.09375 C 262.960938 229.980469 255.761719 223.867188 247.160156 223.867188 L 222.535156 223.867188 C 213.929688 223.867188 206.738281 229.980469 205.058594 238.09375 C 200.230469 231.785156 197.355469 223.910156 197.355469 215.367188 C 197.355469 194.691406 214.175781 177.882812 234.84375 177.882812 C 255.507812 177.882812 272.328125 194.703125 272.328125 215.367188 Z M 215.734375 201.691406 C 215.734375 212.230469 224.3125 220.808594 234.851562 220.808594 C 245.390625 220.808594 253.964844 212.230469 253.964844 201.691406 C 253.964844 191.152344 245.390625 182.578125 234.851562 182.578125 C 224.3125 182.578125 215.734375 191.152344 215.734375 201.691406 Z M 243.460938 201.691406 C 243.460938 206.441406 239.597656 210.296875 234.859375 210.296875 C 230.121094 210.296875 226.257812 206.433594 226.257812 201.691406 C 226.257812 196.953125 230.121094 193.089844 234.859375 193.089844 C 239.597656 193.089844 243.460938 196.953125 243.460938 201.691406 Z M 337.382812 212.054688 C 363.847656 212.054688 385.378906 190.523438 385.378906 164.058594 C 385.378906 137.59375 363.847656 116.058594 337.382812 116.058594 C 310.917969 116.058594 289.382812 137.59375 289.382812 164.058594 C 289.382812 190.523438 310.917969 212.054688 337.382812 212.054688 Z M 317.734375 195.964844 L 317.734375 190.390625 C 317.734375 186.351562 321.019531 183.058594 325.066406 183.058594 L 349.691406 183.058594 C 353.730469 183.058594 357.023438 186.34375 357.023438 190.390625 L 357.023438 195.964844 C 351.300781 199.492188 344.574219 201.542969 337.382812 201.542969 C 330.191406 201.542969 323.453125 199.503906 317.742188 195.964844 Z M 337.382812 126.5625 C 358.046875 126.5625 374.867188 143.382812 374.867188 164.050781 C 374.867188 172.582031 371.996094 180.457031 367.167969 186.773438 C 365.496094 178.660156 358.292969 172.546875 349.691406 172.546875 L 325.066406 172.546875 C 316.460938 172.546875 309.269531 178.660156 307.589844 186.773438 C 302.761719 180.464844 299.886719 172.589844 299.886719 164.050781 C 299.886719 143.375 316.707031 126.5625 337.375 126.5625 Z M 337.382812 169.5 C 347.921875 169.5 356.496094 160.921875 356.496094 150.382812 C 356.496094 139.84375 347.921875 131.269531 337.382812 131.269531 C 326.84375 131.269531 318.265625 139.84375 318.265625 150.382812 C 318.265625 160.921875 326.84375 169.5 337.382812 169.5 Z M 337.382812 141.773438 C 342.128906 141.773438 345.984375 145.636719 345.984375 150.375 C 345.984375 155.113281 342.121094 158.976562 337.382812 158.976562 C 332.644531 158.976562 328.78125 155.113281 328.78125 150.375 C 328.78125 145.636719 332.644531 141.773438 337.382812 141.773438 Z M 100.273438 214.808594 C 105.898438 214.808594 111.171875 212.625 115.132812 208.675781 L 156.742188 167.0625 C 158.785156 165.023438 158.792969 161.738281 156.777344 159.679688 L 175.410156 141.042969 C 184.390625 146.195312 194.589844 148.945312 205.214844 148.945312 C 221.261719 148.945312 236.347656 142.699219 247.695312 131.355469 C 259.039062 120.011719 265.285156 104.925781 265.285156 88.875 C 265.285156 72.828125 259.039062 57.742188 247.695312 46.398438 C 236.347656 35.054688 221.261719 28.808594 205.214844 28.808594 C 189.164062 28.808594 174.082031 35.054688 162.734375 46.398438 C 143.183594 65.949219 139.96875 95.734375 153.054688 118.671875 L 134.414062 137.3125 C 133.433594 136.359375 132.117188 135.816406 130.742188 135.816406 C 129.367188 135.816406 128.007812 136.367188 127.027344 137.355469 L 85.417969 178.96875 C 81.457031 182.917969 79.285156 188.203125 79.285156 193.824219 C 79.285156 199.449219 81.464844 204.722656 85.417969 208.683594 C 89.367188 212.644531 94.648438 214.816406 100.273438 214.816406 Z M 170.164062 53.84375 C 179.527344 44.480469 191.96875 39.328125 205.207031 39.328125 C 218.441406 39.328125 230.890625 44.480469 240.246094 53.84375 C 249.601562 63.207031 254.761719 75.648438 254.761719 88.886719 C 254.761719 102.121094 249.613281 114.570312 240.246094 123.925781 C 230.882812 133.292969 218.441406 138.441406 205.207031 138.441406 C 191.96875 138.441406 179.519531 133.292969 170.164062 123.925781 C 150.839844 104.601562 150.839844 73.160156 170.164062 53.84375 Z M 162.726562 131.363281 C 163.988281 132.625 165.292969 133.808594 166.640625 134.9375 L 149.339844 152.242188 L 141.84375 144.742188 L 159.152344 127.429688 C 160.28125 128.769531 161.464844 130.085938 162.726562 131.355469 Z M 92.855469 186.40625 L 130.742188 148.515625 L 145.582031 163.355469 L 107.695312 201.246094 C 103.601562 205.335938 96.945312 205.335938 92.855469 201.246094 C 90.882812 199.273438 89.796875 196.636719 89.796875 193.824219 C 89.796875 191.015625 90.882812 188.378906 92.855469 186.40625 Z M 205.207031 130.804688 C 215.945312 130.804688 226.6875 126.710938 234.859375 118.539062 C 251.214844 102.183594 251.214844 75.578125 234.859375 59.230469 C 226.941406 51.3125 216.410156 46.949219 205.207031 46.949219 C 194 46.949219 183.472656 51.3125 175.550781 59.230469 C 159.195312 75.585938 159.195312 102.191406 175.550781 118.539062 C 183.726562 126.710938 194.464844 130.804688 205.207031 130.804688 Z M 182.980469 66.667969 C 188.921875 60.730469 196.8125 57.460938 205.207031 57.460938 C 213.597656 57.460938 221.492188 60.730469 227.429688 66.667969 C 239.6875 78.925781 239.6875 98.863281 227.429688 111.109375 C 215.175781 123.367188 195.238281 123.367188 182.980469 111.109375 C 170.726562 98.855469 170.726562 78.917969 182.980469 66.667969 Z M 182.980469 66.667969 " fill-opacity="1" fill-rule="nonzero" /></g></svg>
              Server Benchmarks
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
                        ? "Server Benchmarks"
                        : "Processed Datasets"}
                  </h1>
                  <a

                    href="/preprocessing-docs"
                    className="hidden manage-data-guidelines flex items-center gap-2 text-blue-600 hover:text-blue-800"
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
                          isHighlighted={highlightedDatasets.some(h =>
                            dataset.filename === h ||
                            dataset.filename.includes(h.replace(/\.(csv|parquet)$/i, '')) ||
                            h.includes(dataset.filename.replace(/\.(csv|parquet)$/i, ''))
                          )}
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
