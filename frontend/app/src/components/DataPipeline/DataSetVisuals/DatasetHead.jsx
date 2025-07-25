import React from "react";
import { TableCellsIcon } from "@heroicons/react/24/outline";

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

  return (
    <div className="bg-white rounded-xl shadow-sm p-2 mt-4">
      <div className="p-4 border-b flex items-center justify-between bg-blue-50 rounded-t-xl">
        <div className="flex items-center gap-2">
          <TableCellsIcon className="w-6 h-6 text-blue-600" />
          <h2 className="text-xl font-semibold text-blue-800">Sample Data</h2>
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
                  }`}
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
