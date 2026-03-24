import React, { useState, useEffect, useRef } from "react";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  BookmarkIcon,
  BookmarkSlashIcon,
  ChartBarIcon,
  ArrowsPointingInIcon,
  PencilIcon,
} from "@heroicons/react/24/outline";
import NumericColumn from "./ColumnComponents/NumericColumn";
import StringColumn from "./ColumnComponents/StringColumn";
import ArrayColumn from "./ColumnComponents/ArrayColumn";

const columnComponents = {
  Numeric: NumericColumn,
  String: StringColumn,
  Array: ArrayColumn,
};

const ColumnDetails = ({ columnStats, selectedColumnIndex, sendToBackend }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [pinnedColumns, setPinnedColumns] = useState([]);
  const [isExpanded, setIsExpanded] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editedDescriptions, setEditedDescriptions] = useState({});
  const [clickedColumnIndex, setClickedColumnIndex] = useState(null);
  const inputRefs = useRef({});

  useEffect(() => {
    if (
      typeof selectedColumnIndex === "number" &&
      selectedColumnIndex >= 0 &&
      selectedColumnIndex < columnStats.length
    ) {
      setCurrentIndex(selectedColumnIndex);
    }
  }, [selectedColumnIndex, columnStats.length]);

  // Effect to scroll to and focus the clicked column when dialog opens
  useEffect(() => {
    if (
      isEditDialogOpen &&
      clickedColumnIndex !== null &&
      columnStats[clickedColumnIndex]
    ) {
      const columnName = columnStats[clickedColumnIndex].name;
      // Use setTimeout to ensure the dialog has fully rendered
      setTimeout(() => {
        const inputElement = inputRefs.current[columnName];
        if (inputElement) {
          inputElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          inputElement.focus();
        }
      }, 100);
    }
  }, [isEditDialogOpen, clickedColumnIndex, columnStats]);

  const handleNavigation = (direction) => {
    setCurrentIndex(
      (prev) => (prev + direction + columnStats.length) % columnStats.length
    );
  };

  const handlePin = () => {
    const currentColumn = columnStats[currentIndex];
    if (pinnedColumns.some((col) => col.name === currentColumn.name)) {
      setPinnedColumns(
        pinnedColumns.filter((col) => col.name !== currentColumn.name)
      );
    } else {
      setPinnedColumns([...pinnedColumns, currentColumn]);
    }
  };

  const handleEditDescriptions = () => {
    // Initialize edited descriptions with current values
    const initialDescriptions = {};
    columnStats.forEach((col) => {
      initialDescriptions[col.name] = col.description || "";
    });
    setEditedDescriptions(initialDescriptions);
    setClickedColumnIndex(currentIndex); // Track which column's pencil was clicked
    setIsEditDialogOpen(true);
  };

  const handleSaveDescriptions = () => {
    // Here you would typically make an API call to save the descriptions
    sendToBackend(editedDescriptions);
    // For now, we'll just update the local state
    columnStats.forEach((col) => {
      if (editedDescriptions[col.name] !== undefined) {
        col.description = editedDescriptions[col.name];
      }
    });
    setIsEditDialogOpen(false);
    setClickedColumnIndex(null);
  };

  const handleCancelEdit = () => {
    setIsEditDialogOpen(false);
    setEditedDescriptions({});
    setClickedColumnIndex(null);
  };

  if (columnStats.length === 0) return null;
  const currentColumn = columnStats[currentIndex];
  let col_type = "Unknown";

  if (currentColumn.type.includes("ArrayType")) {
    col_type = "Array";
  } else if (currentColumn.type.includes("StringType")) {
    col_type = "String";
  } else if (
    currentColumn.type.includes("IntegerType") ||
    currentColumn.type.includes("DoubleType") ||
    currentColumn.type.includes("FloatType") ||
    currentColumn.type.includes("LongType") ||
    currentColumn.type.includes("ShortType")
  ) {
    col_type = "Numeric";
  }

  const ColumnComponent = columnComponents[col_type];
  const isPinned = pinnedColumns.some((col) => col.name === currentColumn.name);

  return (
    <div className="bg-white rounded-xl shadow-sm p-2">
      <div className="p-4 border-b flex items-center justify-between bg-blue-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <ChartBarIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-800">
            View Summary
          </h2>
        </div>
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-1 hover:bg-blue-100 rounded-full"
        >
          <ArrowsPointingInIcon className="w-5 h-5 text-blue-600" />
        </button>
      </div>

      {isExpanded && (
        <div className="flex-1 overflow-y-auto p-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => handleNavigation(-1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
            </button>

            <select
              value={currentColumn.name}
              onChange={(e) => {
                const index = columnStats.findIndex(
                  (col) => col.name === e.target.value
                );
                setCurrentIndex(index);
              }}
              className="flex-1 p-2 bg-white border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {columnStats.map((col, index) => (
                <option key={col.name} value={col.name}>
                  {`${index + 1}. ${col.name} `}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleNavigation(1)}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <ChevronRightIcon className="w-6 h-6 text-gray-600" />
            </button>
          </div>

          <div className="bg-gray-50 rounded-xl p-4 mb-4">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="font-medium text-gray-900 text-lg">
                  {currentColumn.name}
                </h3>
                <div className="flex items-center gap-2">
                  <p className="text-sm text-gray-500">
                    {currentColumn.description || "No Description Available"}
                  </p>
                  <button
                    onClick={handleEditDescriptions}
                    className="p-1 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-600"
                    title="Edit all column descriptions"
                  >
                    <PencilIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <button
                onClick={handlePin}
                className={`p-1 rounded-full ${
                  isPinned ? "text-blue-600" : "text-gray-400"
                }`}
              >
                {isPinned ? (
                  <BookmarkSlashIcon className="w-6 h-6 fill-current" />
                ) : (
                  <BookmarkIcon className="w-6 h-6" />
                )}
              </button>
            </div>

            <div className="border-t pt-4">
              {ColumnComponent ? (
                <ColumnComponent column={currentColumn} />
              ) : (
                <div className="text-gray-500 text-sm p-2">
                  No visualization component available for {currentColumn.type}
                </div>
              )}
            </div>
          </div>

          {pinnedColumns.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-700">
                Pinned Columns
              </h3>
              {pinnedColumns.map((col) => {
                const PinnedComponent = columnComponents[col.type];
                return (
                  <div key={col.name} className="bg-gray-50 rounded-xl p-4">
                    <div className="flex justify-between items-center mb-2">
                      <div>
                        <h4 className="font-medium text-gray-900">
                          {col.name}
                        </h4>
                        <p className="text-sm text-gray-500">{col.type}</p>
                      </div>
                      <button
                        onClick={() =>
                          setPinnedColumns(
                            pinnedColumns.filter((c) => c.name !== col.name)
                          )
                        }
                        className="text-red-400 hover:text-red-600"
                      >
                        <BookmarkSlashIcon className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="border-t pt-4">
                      {PinnedComponent ? (
                        <PinnedComponent column={col} />
                      ) : (
                        <div className="text-gray-500 text-sm p-2">
                          No visualization component available for {col.type}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Edit Descriptions Dialog */}
      {isEditDialogOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg w-full max-w-2xl shadow-xl max-h-[80vh] overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900">
                Edit Column Descriptions
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Update descriptions for all columns in this dataset
              </p>
            </div>

            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <div className="space-y-4">
                {columnStats.map((col) => (
                  <div key={col.name} className="space-y-2">
                    <label className="block text-sm font-medium text-gray-700">
                      {col.name}
                    </label>
                    <textarea
                      ref={(el) => (inputRefs.current[col.name] = el)}
                      value={editedDescriptions[col.name] || ""}
                      onChange={(e) =>
                        setEditedDescriptions((prev) => ({
                          ...prev,
                          [col.name]: e.target.value,
                        }))
                      }
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                      rows="2"
                      placeholder="Enter description for this column..."
                    />
                  </div>
                ))}
              </div>
            </div>

            <div className="p-6 border-t bg-gray-50 flex justify-end gap-3">
              <button
                onClick={handleCancelEdit}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveDescriptions}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ColumnDetails;
