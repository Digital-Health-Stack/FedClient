import { useState } from "react";
import axios from "axios";
import {
  PencilIcon,
  TrashIcon,
  Cog6ToothIcon,
  ArrowRightIcon,
} from "@heroicons/react/24/solid";
import EditDatasetModal from "./EditDatasetModal";

const RAW_DATASET_RENAME_URL =
  process.env.REACT_APP_PRIVATE_SERVER_BASE_URL + "/edit-raw-dataset-details";
const PROCESSED_DATASET_RENAME_URL =
  process.env.REACT_APP_PRIVATE_SERVER_BASE_URL + "/edit-dataset-details";

const FileCard = ({
  dataset,
  isRaw,
  onDelete,
  onClick,
  onEditSuccess,
  selectedFolder,
  isHighlighted = false,
}) => {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isProcessing] = useState(dataset.filename.endsWith("__PROCESSING__"));
  const displayName = dataset.filename.replace(/__PROCESSING__$/, "");

  const handleEdit = async (newFilename, newDescription) => {
    try {
      const endpoint = isRaw
        ? RAW_DATASET_RENAME_URL
        : PROCESSED_DATASET_RENAME_URL;

      await axios.put(endpoint, {
        dataset_id: dataset.dataset_id,
        filename: newFilename,
        description: newDescription,
      });

      onEditSuccess();
    } catch (error) {
      console.error("Error updating dataset:", error);
    }
  };

  return (
    <div
      className={`group relative px-4 py-3 rounded-xl border transition-all flex flex-col min-h-[140px]
        ${
          isProcessing
            ? "border-yellow-200 bg-yellow-50 cursor-wait"
            : "border-gray-200 hover:border-blue-500 hover:bg-blue-50 hover:shadow-md"
        }
        ${isHighlighted ? "ring-2 ring-blue-500 ring-offset-2 animate-pulse bg-blue-50 border-blue-400" : ""}`}
    >
      {isHighlighted && (
        <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg animate-bounce">
          NEW
        </span>
      )}
      
      {/* Top section with buttons */}
      <div className="flex justify-between items-start gap-3 flex-1">
        <div className="flex-col flex gap-1 items-start min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800 truncate">
            {console.log(displayName.split(".parquet")[0])}
              {displayName.split(".parquet")[0].length > 30
                ? `${displayName.split(".parquet")[0].slice(0, 30)}...`
                : displayName.split(".parquet")[0]}
            </h3>
          </div>

          {dataset.description && (
            <p className="text-sm text-gray-600 mt-2 line-clamp-3">
              {dataset.description}
            </p>
          )}

          {isProcessing && (
            <div className="mt-3 flex items-center text-sm text-yellow-700">
              <Cog6ToothIcon className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </div>
          )}
        </div>

        {/* Delete and Edit buttons at top right, side by side */}
        {!isProcessing && selectedFolder !== "datasets" && (
          <div className="flex items-center gap-1">
            <button
              className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(dataset.dataset_id, isRaw);
              }}
            >
              <TrashIcon className="h-5 w-5" />
            </button>
            <button
              className="p-1.5 text-blue-400 hover:text-blue-600 hover:bg-blue-100 rounded-full transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                setIsEditModalOpen(true);
              }}
            >
              <PencilIcon className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>

      {/* Bottom section with View link - sticks to bottom */}
      {!isProcessing && (
        <div className="flex justify-end mt-auto pt-3 border-t border-gray-100">
          <button
            className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
          >
            {isRaw ? "View Summary / Preprocess" : "View Summary"}
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </div>
      )}

      <EditDatasetModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialFilename={displayName}
        initialDescription={dataset.description}
        onSave={handleEdit}
      />
    </div>
  );
};

export default FileCard;
