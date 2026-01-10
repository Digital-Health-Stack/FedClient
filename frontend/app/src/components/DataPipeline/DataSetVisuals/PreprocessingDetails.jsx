import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  TrashIcon,
  ArrowUpTrayIcon,
  CheckIcon,
  PlusIcon,
  CloudArrowUpIcon,
  Cog6ToothIcon,
  Bars3Icon,
  InformationCircleIcon,
} from "@heroicons/react/24/solid";
import PreprocessingOptions from "./ProcessingComponents/PreprocessingOptions.jsx";
import { preprocessDataset } from "../../../services/privateService";
import { WrenchIcon } from "@heroicons/react/24/outline";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
const SortableOperationItem = ({ config, index, onRemove }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: `operation-${index}` });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      className={`flex items-center justify-between bg-white p-4 rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow ${isDragging ? "opacity-50 z-50" : ""
        }`}
    >
      <div className="flex items-center gap-3 flex-1">
        <button
          {...attributes}
          {...listeners}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors cursor-grab active:cursor-grabbing"
          title="Drag to reorder"
        >
          <Bars3Icon className="h-5 w-5 text-gray-400" />
        </button>
        <span className="text-gray-700">
          <span className="font-medium">{config.column}</span> -{" "}
          <span className="text-blue-600">{config.operation}</span>
        </span>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="p-1 hover:bg-red-50 rounded-full transition-colors"
      >
        <TrashIcon className="h-5 w-5 text-red-400 hover:text-red-600" />
      </button>
    </li>
  );
};

const PreprocessingDetails = ({ columns, filename, directory }) => {
  const [selectedColumn, setSelectedColumn] = useState("");
  const [selectedMainOperation, setSelectedMainOperation] = useState("");
  const [selectedSubOperation, setSelectedSubOperation] = useState("");
  const [operations, setOperations] = useState([]);
  const [isBannerFixed, setIsBannerFixed] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Drag and drop sensors
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  // Preprocessing options data structure
  const preprocessingOptions = {
    all_columns: [
      {
        name: "Handle Null",
        subOptions: [
          "Drop Null",
          "Fill 0 Unknown False",
          "Fill Mean",
          "Fill Median",
        ],
      },
      { name: "Drop Duplicates", subOptions: [] },
      {
        name: "Normalize",
        subOptions: ["L1 Norm", "L2 Norm", "L inf Norm", "Min-Max", "Z-score"],
      },
      { name: "Remove Outliers", subOptions: [] },
    ],
    numeric: [
      { name: "Drop Column", subOptions: [] },
      {
        name: "Handle Null",
        subOptions: [
          "Drop Null",
          "Fill 0",
          "Fill mean",
          "Fill Mode",
          "Fill Median",
        ],
      },
      { name: "Drop Duplicates", subOptions: [] },
      {
        name: "Normalize",
        subOptions: ["L1 Norm", "L2 Norm", "L inf Norm", "Min-Max", "Z-score"],
      },
      { name: "Transform", subOptions: ["Log", "Square", "Square Root"] },
      { name: "Remove Outliers", subOptions: [] },
      { name: "Encode", subOptions: ["One Hot Encoding"] },
      { name: "Exclude from All Columns list", subOptions: [] },
    ],
    string: [
      { name: "Drop Column", subOptions: [] },
      { name: "Handle Null", subOptions: ["Drop Null", "Fill Unknown"] },
      { name: "Drop Duplicates", subOptions: [] },
      { name: "Encode", subOptions: ["Label Encoding", "One Hot Encoding"] },
      { name: "Exclude from All Columns list", subOptions: [] },
    ],
  };

  // Get current options based on selected column type
  const getCurrentOptions = () => {
    const columnType =
      selectedColumn === "" ? "all_columns" : columns[selectedColumn];
    if (columnType === "all_columns") {
      return preprocessingOptions.all_columns;
    } else if (
      ["IntegerType()", "FloatType()", "DoubleType()"].includes(columnType)
    ) {
      return preprocessingOptions.numeric;
    } else {
      return preprocessingOptions.string;
    }
  };

  // Get sub-options for selected main operation
  const getSubOptions = () => {
    const currentOptions = getCurrentOptions();
    const selectedOption = currentOptions.find(
      (option) => option.name === selectedMainOperation
    );
    return selectedOption ? selectedOption.subOptions : [];
  };

  const handleMainOperationChange = (operation) => {
    setSelectedMainOperation(operation);
    setSelectedSubOperation(""); // Reset sub-operation when main operation changes
  };

  const handleSubOperationChange = (subOperation) => {
    setSelectedSubOperation(subOperation);
  };

  // Reset operations when column changes
  useEffect(() => {
    setSelectedMainOperation("");
    setSelectedSubOperation("");
  }, [selectedColumn]);

  // Auto-add operation when all required fields are filled
  useEffect(() => {
    // Check if main operation is selected
    if (!selectedMainOperation) return;

    // Get sub-options for the selected operation
    const subOptions = getSubOptions();

    // If sub-options exist, wait for sub-operation to be selected
    if (subOptions.length > 0) {
      if (!selectedSubOperation) return;
    }

    // All required fields are filled, auto-add the operation
    // Use a small delay to ensure state is updated and prevent rapid re-triggers
    const timeoutId = setTimeout(() => {
      // Double-check that fields are still filled (in case user changed them during timeout)
      if (selectedMainOperation) {
        const currentSubOptions = getSubOptions();
        if (currentSubOptions.length === 0 || selectedSubOperation) {
          handleAddSelection();
        }
      }
    }, 150);

    return () => clearTimeout(timeoutId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedColumn, selectedMainOperation, selectedSubOperation]);

  const handleAddSelection = () => {
    if (!selectedMainOperation) return;

    // Determine the final operation string
    const finalOperation = selectedSubOperation || selectedMainOperation;

    const newOperation = {
      column: selectedColumn || "All Columns",
      operation: finalOperation,
    };

    // Check if this exact operation already exists to prevent duplicates
    const isDuplicate = operations.some(
      (op) =>
        op.column === newOperation.column &&
        op.operation === newOperation.operation
    );

    if (isDuplicate) return;

    setOperations([...operations, newOperation]);
    setSelectedMainOperation("");
    setSelectedSubOperation("");
  };

  const handleRemoveSelection = (index) => {
    const updatedOperations = [...operations];
    updatedOperations.splice(index, 1);
    setOperations(updatedOperations);
  };

  // Handle drag end for reordering operations
  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setOperations((items) => {
        const oldIndex = items.findIndex(
          (_, index) => `operation-${index}` === active.id
        );
        const newIndex = items.findIndex(
          (_, index) => `operation-${index}` === over.id
        );

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleSubmit = async () => {
    const payload = {
      filename: filename,
      directory: directory,
      operations: operations,
    };

    try {
      setIsSubmitted(true);
      await preprocessDataset(payload);

      // Show success message
      toast.success("Will be added to Processed Datasets", {
        position: "bottom-center",
        autoClose: 3000,
      });

      // Navigate to appropriate view
      if (location.pathname.includes("raw")) {
        navigate("/view-all-datasets#raw");
      } else {
        navigate("/view-all-datasets#processed");
      }
    } catch (error) {
      console.error("Error in submitting data for preprocessing:", error);
      setIsSubmitted(false);
      toast.error("Failed to process dataset. Please try again.", {
        position: "bottom-center",
        autoClose: 3000,
      });
    }
  };
  return (
    <div className="bg-white rounded-xl p-2">
      <div className="p-4 border-b flex items-center justify-between bg-blue-50 rounded-t-xl">
        <div className="flex items-center gap-2 w-full">
          <WrenchIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-800 flex items-center justify-between w-full">
            Clean/Preprocess Data
            <a
              href="/preprocessing-docs"
              className="manage-data-guidelines flex items-center gap-2 text-md"
            >
              <InformationCircleIcon className="h-5 w-5" />
              Processing Guidelines
            </a>
          </h2>
        </div>
      </div>

      {/* Selected Operations */}
      {operations.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-gray-700 mt-4">
            Selected Operations:
            <span className="text-sm font-normal text-gray-500 ml-2">
              (Drag to reorder)
            </span>
          </h2>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={operations.map((_, index) => `operation-${index}`)}
              strategy={verticalListSortingStrategy}
            >
              <ul className="space-y-3">
                {operations.map((config, index) => (
                  <SortableOperationItem
                    key={`operation-${index}`}
                    config={config}
                    index={index}
                    onRemove={handleRemoveSelection}
                  />
                ))}
              </ul>
            </SortableContext>
          </DndContext>
        </div>
      )}

      {/* Configuration Banner */}
      <div
        className={`${isBannerFixed ? "fixed top-0 left-0 right-0" : "relative"
          } w-full bg-white border-b border-gray-200 shadow-sm p-4 grid grid-cols-1 md:grid-cols-4 gap-4 items-start z-50 transition-all`}
      >
        {/* Column Selector */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Column
          </label>
          <select
            value={selectedColumn}
            onChange={(e) => setSelectedColumn(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Columns</option>
            {Object.keys(columns).map((col) => (
              <option key={col} value={col}>
                {col}
              </option>
            ))}
          </select>
        </div>

        {/* Main Operation Dropdown */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700">
            Select Operation
          </label>
          <select
            value={selectedMainOperation}
            onChange={(e) => handleMainOperationChange(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">Select Operation</option>
            {getCurrentOptions().map((option) => (
              <option key={option.name} value={option.name}>
                {option.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sub-Operation Dropdown (always present but conditionally visible) */}
        <div className="space-y-2">
          <label
            className={`text-sm font-medium text-gray-700 ${selectedMainOperation && getSubOptions().length > 0
              ? ""
              : "invisible"
              }`}
          >
            Select Sub-Category
          </label>
          {selectedMainOperation && getSubOptions().length > 0 ? (
            <select
              value={selectedSubOperation}
              onChange={(e) => handleSubOperationChange(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select Sub-Category</option>
              {getSubOptions().map((subOption) => (
                <option key={subOption} value={subOption}>
                  {subOption}
                </option>
              ))}
            </select>
          ) : (
            <div className="w-full p-2" style={{ display: "none" }}>
              {/* Hidden placeholder to maintain layout */}
            </div>
          )}
        </div>

        {/* Add Button Group */}
        <div className="flex flex-col items-end gap-3 md:pt-7">
          <button
            onClick={handleAddSelection}
            className="w-full md:w-auto bg-emerald-500 text-white px-4 py-2 rounded-md hover:bg-emerald-600 transition-colors flex items-center justify-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Operation
          </button>
        </div>

        {/* Pin Button */}
        {/* <button
          className="absolute top-3 right-3 p-1.5 hover:bg-gray-100 rounded-md transition-colors"
          onClick={() => setIsBannerFixed(!isBannerFixed)}
        >
          {isBannerFixed ? (
            <CheckIcon className="h-4 w-4 text-gray-600" />
          ) : (
            <ArrowUpOnSquareIcon className="h-4 w-4 text-gray-600" />
          )}
        </button> */}

        {/* Submit Button */}
        {
          <div className="pt-4">
            <button
              onClick={handleSubmit}
              disabled={isSubmitted || operations.length === 0}
              className="bg-blue-600 text-white px-5 py-2.5 rounded-lg hover:bg-blue-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all flex items-center gap-2"
            >
              <CloudArrowUpIcon className="h-5 w-5" />
              {isSubmitted ? "Processing..." : "Start Preprocessing"}
            </button>
          </div>
        }
      </div>
      <div className="p-4">
        <p className="h-80"></p>
      </div>
    </div>
  );
};

export default PreprocessingDetails;
