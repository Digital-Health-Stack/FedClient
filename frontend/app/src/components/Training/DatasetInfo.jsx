import {
  InformationCircleIcon,
  ChartBarIcon,
  TableCellsIcon,
  DocumentTextIcon,
  ArrowTopRightOnSquareIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

const DatasetInfo = ({ data }) => {
  const datasetInfo = data?.server_stats;
  if (!datasetInfo) return null;
  const navigate = useNavigate();
  return (
    <div className="bg-white shadow rounded-lg border border-gray-200 p-6 mb-6">
      <h3 className="text-xl font-semibold mb-6 text-gray-800 border-b pb-2 flex items-center">
        <InformationCircleIcon className="h-5 w-5 text-indigo-700 mr-2" />
        Dataset Information
      </h3>

      {/* Combined Dataset Details and Output Columns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {/* Dataset Details */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <DocumentTextIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-700">
              Dataset Details
            </h4>
          </div>
          <div className="space-y-3">
            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-sm font-medium text-gray-500">
                Server Filename
              </span>
              <span
                title={data?.server_filename}
                className="col-span-2 text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded flex items-center justify-between"
              >
                {data?.server_filename.length > 40
                  ? `${data?.server_filename.substring(0, 40)}...`
                  : data?.server_filename}
                <ArrowTopRightOnSquareIcon
                  className="h-5 w-5 text-gray-600 cursor-pointer"
                  title="View Dataset Overview"
                  onClick={() => {
                    navigate(
                      `/testing-dataset-overview/${data?.server_filename}`
                    );
                  }}
                />
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-sm font-medium text-gray-500">
                Task Name
              </span>
              <span className="col-span-2 text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded">
                {data?.task_name}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-sm font-medium text-gray-500">Metric</span>
              <span className="col-span-2 text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded">
                {data?.metric}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-sm font-medium text-gray-500">Rows</span>
              <span className="col-span-2 text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded">
                {data?.server_stats?.numRows}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-4 items-center">
              <span className="text-sm font-medium text-gray-500">Columns</span>
              <span className="col-span-2 text-sm text-gray-800 bg-gray-100 px-3 py-2 rounded">
                {data?.server_stats?.numColumns}
              </span>
            </div>
          </div>
        </div>

        {/* Output Columns */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200">
          <div className="flex items-center mb-4">
            <TableCellsIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-700">
              Output Columns
            </h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {data?.output_columns?.map((col, idx) => (
              <span
                key={idx}
                className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center min-w-[100px]"
              >
                {col}
              </span>
            ))}
          </div>

          <div className="flex items-center mb-4 mt-6">
            <TableCellsIcon className="h-5 w-5 text-gray-600 mr-2" />
            <h4 className="text-lg font-medium text-gray-700">Input Columns</h4>
          </div>
          <div className="flex flex-wrap gap-3">
            {data?.input_columns?.map((col, idx) => (
              <span
                key={idx}
                className="bg-indigo-100 text-indigo-800 text-sm font-medium px-4 py-2 rounded-md flex items-center justify-center min-w-[100px]"
              >
                {col}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DatasetInfo;
