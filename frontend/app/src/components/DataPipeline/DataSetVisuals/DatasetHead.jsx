import React, { useRef, useEffect } from "react";
import { TableCellsIcon } from "@heroicons/react/24/outline";

// Helper function to convert RGB array string to canvas image
const createImageFromRGBArray = (rgbString, width = 150, height = 150) => {
  try {
    // Parse the string into array of numbers
    const arr = rgbString
      .replace(/[\[\]]/g, "")
      .split(",")
      .map(Number);

    // Create canvas
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    // Create ImageData
    const imgData = ctx.createImageData(width, height);

    // Convert RGB to RGBA
    for (let i = 0, j = 0; i < arr.length; i += 3, j += 4) {
      imgData.data[j] = arr[i]; // R
      imgData.data[j + 1] = arr[i + 1]; // G
      imgData.data[j + 2] = arr[i + 2]; // B
      imgData.data[j + 3] = 255; // A (opaque)
    }

    // Put image data on canvas
    ctx.putImageData(imgData, 0, 0);

    return canvas.toDataURL();
  } catch (error) {
    console.error("Error creating image from RGB array:", error);
    return null;
  }
};

// Component to render image cell
const ImageCell = ({ rgbData, width = 60, height = 60 }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && rgbData) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext("2d");

      try {
        // Parse the string into array of numbers
        const arr = rgbData
          .replace(/[\[\]]/g, "")
          .split(",")
          .map(Number);

        // Set canvas dimensions
        canvas.width = width;
        canvas.height = height;

        // Calculate original image dimensions (assuming square image)
        const originalSize = Math.sqrt(arr.length / 3);

        // Create ImageData for original size
        const tempCanvas = document.createElement("canvas");
        const tempCtx = tempCanvas.getContext("2d");
        tempCanvas.width = originalSize;
        tempCanvas.height = originalSize;

        const imgData = tempCtx.createImageData(originalSize, originalSize);

        // Convert RGB to RGBA
        for (let i = 0, j = 0; i < arr.length; i += 3, j += 4) {
          imgData.data[j] = arr[i]; // R
          imgData.data[j + 1] = arr[i + 1]; // G
          imgData.data[j + 2] = arr[i + 2]; // B
          imgData.data[j + 3] = 255; // A (opaque)
        }

        // Put image data on temp canvas
        tempCtx.putImageData(imgData, 0, 0);

        // Draw scaled image on display canvas
        ctx.drawImage(
          tempCanvas,
          0,
          0,
          originalSize,
          originalSize,
          0,
          0,
          width,
          height
        );
      } catch (error) {
        console.error("Error rendering image:", error);
        // Draw error placeholder
        ctx.fillStyle = "#f3f4f6";
        ctx.fillRect(0, 0, width, height);
        ctx.fillStyle = "#6b7280";
        ctx.font = "12px Arial";
        ctx.textAlign = "center";
        ctx.fillText("Error", width / 2, height / 2);
      }
    }
  }, [rgbData, width, height]);

  return (
    <canvas
      ref={canvasRef}
      className="border border-gray-200 rounded"
      style={{ maxWidth: "100%", height: "auto" }}
    />
  );
};

const DatasetHead = ({
  ref,
  datasetHead,
  maxRows = 5,
  onColumnHeaderClick,
  selectedColumnIndex,
  columnDescriptions = {},
}) => {
  // Get column names from the first row
  const columns = Object.keys(datasetHead[0]);

  // Limit the number of rows to display
  const displayData = datasetHead.slice(0, maxRows);

  // Helper function to check if a column contains image data
  const isImageColumn = (columnName) => {
    return columnName.toLowerCase().includes("image");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm p-2 mt-4">
      <div className="p-4 border-b flex items-center justify-between bg-blue-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <TableCellsIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-800">View Top Rows</h2>
        </div>
      </div>

      <div className="overflow-x-auto border-gray-200 rounded-b-lg">
        <table className="w-full table-auto">
          <thead className="bg-blue-600">
            <tr>
              {columns.map((column, index) => (
                <th
                  key={index}
                  className={`px-6 py-4 text-left text-sm font-semibold text-white border-r border-blue-400 last:border-r-0 cursor-pointer hover:bg-blue-400 ${
                    selectedColumnIndex === index ? "bg-blue-700" : ""
                  } ${isImageColumn(column) ? "min-w-[120px]" : ""}`}
                  onClick={() =>
                    onColumnHeaderClick && onColumnHeaderClick(column, index)
                  }
                  title={
                    columnDescriptions[column] || "No description available"
                  }
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white">
            {displayData.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className={`hover:bg-blue-50 transition-all duration-200 ${
                  rowIndex % 2 === 0 ? "bg-gray-50" : "bg-white"
                }`}
              >
                {columns.map((column, colIndex) => (
                  <td
                    key={colIndex}
                    className={`px-6 py-4 text-sm text-gray-800 border-r last:border-r-0 border-b border-gray-200 last:border-b-0 cursor-pointer ${
                      selectedColumnIndex === colIndex ? "bg-blue-100" : ""
                    }`}
                    onClick={() =>
                      onColumnHeaderClick &&
                      onColumnHeaderClick(column, colIndex)
                    }
                  >
                    {isImageColumn(column) ? (
                      <div className="flex justify-center">
                        {row[column] ? (
                          <ImageCell
                            rgbData={row[column]}
                            width={80}
                            height={80}
                          />
                        ) : (
                          <div className="w-20 h-20 bg-gray-200 border border-gray-300 rounded flex items-center justify-center text-gray-500 text-xs">
                            No Image
                          </div>
                        )}
                      </div>
                    ) : (
                      <div
                        className="max-w-xs truncate font-medium"
                        title={row[column]}
                      >
                        {row[column] ? (
                          row[column]
                        ) : row[column] == 0 ? (
                          0
                        ) : (
                          <span className="text-gray-400 italic font-normal">
                            null
                          </span>
                        )}
                      </div>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {datasetHead.length > maxRows && (
        <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <p className="text-sm text-gray-600 text-center">
            Showing first {maxRows} rows. Total rows: {datasetHead.length}
          </p>
        </div>
      )}
    </div>
  );
};

export default DatasetHead;
