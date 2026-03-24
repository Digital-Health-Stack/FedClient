import { useState, useEffect, useRef } from "react";
import {
  ScaleIcon,
  ArrowTopRightOnSquareIcon,
  ChartBarIcon,
  TableCellsIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../contexts/AuthContext";
import { getLeaderboardByTaskId } from "../services/federatedService";
import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  Cell,
} from "recharts";
import { XMarkIcon } from "@heroicons/react/24/solid";
import html2canvas from "html2canvas";

const Leaderboard = () => {
  const { task_id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [error, setError] = useState(null);
  const { api } = useAuth();
  const [viewMode, setViewMode] = useState("table"); // 'table' or 'chart'
  const chartRef = useRef(null);

  useEffect(() => {
    const fetchLeaderboardHistory = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await getLeaderboardByTaskId(api, task_id);
        setLeaderboardData(response.data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
        setError("Failed to fetch leaderboard data. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeaderboardHistory();
  }, [api, task_id]);
  const formatTimestamp = (timestamp) => {
    try {
      const utcTimestamp = timestamp + "Z";
      const date = new Date(utcTimestamp);
      return date.toLocaleString("en-IN", {
        dateStyle: "medium",
        timeStyle: "short",
      });
    } catch (e) {
      return timestamp;
    }
  };

  const formatMetricValue = (value) => {
    if (value === null || value === undefined || isNaN(value)) {
      return "N/A";
    }

    // Handle zero
    if (value === 0) {
      return "0.0000";
    }

    const absValue = Math.abs(value);
    const isVerySmall = absValue > 0 && absValue < 0.0001;
    const isVeryLarge = absValue >= 10000;

    // Use scientific notation for very small or very large numbers
    if (isVerySmall || isVeryLarge) {
      try {
        // Convert to scientific notation
        const exp = Math.floor(Math.log10(absValue));
        const mantissa = value / Math.pow(10, exp);

        // Format mantissa to 2 decimal places
        const formattedMantissa = mantissa.toFixed(2);

        // Format exponent
        const expStr = exp.toString();

        return (
          <span>
            {formattedMantissa} × 10<sup>{expStr}</sup>
          </span>
        );
      } catch (e) {
        // Fallback to regular formatting if scientific notation fails
        return value.toFixed(4);
      }
    }

    // For normal numbers, use fixed decimal places
    return value.toFixed(4);
  };

  const downloadCSV = () => {
    if (!leaderboardData || !leaderboardData.sessions) return;

    // Prepare data for CSV
    const csvData = [
      // Add benchmark as first row if it exists
      ...(leaderboardData.benchmark
        ? [
          {
            rank: 1,
            client_name: "Benchmark",
            model_name: "Benchmark",
            metric_value: leaderboardData.benchmark,
            meets_benchmark: "Yes",
            date: formatTimestamp(leaderboardData.created_at),
            is_benchmark: "Yes",
          },
        ]
        : []),
      // Add all sessions
      ...leaderboardData.sessions.map((session, index) => {
        const isBetter =
          leaderboardData.benchmark &&
          (leaderboardData.metric === "mae" || leaderboardData.metric === "mse"
            ? session.metric_value <= leaderboardData.benchmark
            : session.metric_value >= leaderboardData.benchmark);

        return {
          rank: (leaderboardData.benchmark ? 2 : 1) + index,
          client_name: session.admin_username || "Unknown",
          model_name: session.model_name || "Unknown",
          metric_value: session.metric_value,
          meets_benchmark: isBetter ? "Yes" : "No",
          date: formatTimestamp(session.created_at),
          is_benchmark: "No",
        };
      }),
    ];

    // Sort data based on metric type
    csvData.sort((a, b) => {
      if (
        leaderboardData.metric === "mae" ||
        leaderboardData.metric === "mse"
      ) {
        return a.metric_value - b.metric_value;
      }
      return b.metric_value - a.metric_value;
    });

    // Update ranks after sorting
    csvData.forEach((row, index) => {
      row.rank = index + 1;
    });

    // Convert to CSV format
    const headers = [
      "Rank",
      "Client Name",
      "Model Used",
      leaderboardData.metric,
      "Meets Benchmark",
      "Date",
      "Is Benchmark",
    ];
    const csvContent = [
      headers.join(","),
      ...csvData.map((row) =>
        [
          row.rank,
          `"${row.client_name}"`,
          `"${row.model_name}"`,
          row.metric_value,
          row.meets_benchmark,
          `"${row.date}"`,
          row.is_benchmark,
        ].join(",")
      ),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `${leaderboardData.task_name}_leaderboard.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const downloadPNG = async () => {
    if (!chartRef.current || !leaderboardData) return;

    try {
      const canvas = await html2canvas(chartRef.current, {
        backgroundColor: "#ffffff",
        scale: 2, // Higher quality
        useCORS: true,
        allowTaint: true,
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `${leaderboardData.task_name}_leaderboard_chart.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error("Error generating PNG:", error);
    }
  };
  const CustomTooltip = ({ active, payload }) => {
    if (!active || !payload || !payload.length) return null;

    const data = payload[0].payload;
    if (!data) return null;

    if (data.isBenchmark) {
      return (
        <div className="bg-white p-4 border-2 border-pink-200 rounded-lg shadow-xl">
          <div className="flex items-center mb-2">
            <div className="w-3 h-3 bg-[#DD2780] rounded-full mr-2"></div>
            <p className="font-bold text-pink-800">Benchmark</p>
          </div>
          <div className="space-y-1 text-sm">
            <p className="text-gray-700">
              <span className="font-semibold">Value:</span>{" "}
              {formatMetricValue(data.metric_value)}
            </p>
            <p className="text-gray-600">
              <span className="font-semibold">Date:</span>{" "}
              {data.created_at
                ? new Date(data.created_at).toLocaleString("en-IN")
                : "N/A"}
            </p>
          </div>
        </div>
      );
    }

    return (
      <div className="bg-white p-4 border border-gray-200 rounded-lg shadow-xl">
        <p className="font-bold text-gray-900 mb-2">
          Session #{data.session_id || "N/A"}
        </p>
        <div className="space-y-1 text-sm">
          <p className="text-gray-700">
            <span className="font-semibold">Client:</span> {data.admin_username || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Model:</span> {data.model_name || "N/A"}
          </p>
          <p className="text-gray-700">
            <span className="font-semibold">Value:</span>{" "}
            {formatMetricValue(data.metric_value)}
          </p>
          <p className="text-gray-600">
            <span className="font-semibold">Date:</span>{" "}
            {data.created_at ? new Date(data.created_at).toLocaleString("en-IN") : "N/A"}
          </p>
        </div>
      </div>
    );
  };
  const processData = (sessions) => {
    if (!sessions) return [];

    // Sort sessions by date first (in ascending order)
    const sortedSessions = [...sessions].sort(
      (a, b) => new Date(a.created_at) - new Date(b.created_at)
    );

    return sortedSessions.map((session) => {
      const date = new Date(session.created_at);
      const month = date.getMonth() + 1; // Months are 0-indexed
      const year = date.getFullYear();
      return {
        ...session,
        date: new Date(session.created_at),
        monthYear: `${String(month).padStart(2, "0")}/${String(year).slice(
          -2
        )}`,
        formattedDate: date.toLocaleString("en-IN", {
          day: "2-digit",
          month: "short",
          year: "2-digit",
          timeZone: "Asia/Kolkata", // <-- Important for Indian time
        }),
      };
    });
  };
  const processedData = (() => {
    const sessionData = processData(leaderboardData?.sessions || []);

    // Add benchmark as a data point if it exists
    if (leaderboardData?.benchmark && leaderboardData?.created_at) {
      const benchmarkEntry = {
        session_id: "benchmark",
        model_name: "Benchmark",
        admin_username: "Benchmark",
        metric_value: leaderboardData.benchmark,
        created_at: leaderboardData.created_at,
        date: new Date(leaderboardData.created_at),
        formattedDate: new Date(leaderboardData.created_at).toLocaleString(
          "en-IN",
          {
            dateStyle: "short",
          }
        ),
        meets_benchmark: true, // Benchmark always "meets" itself
        isBenchmark: true, // Flag to identify this as benchmark
      };

      // Combine and sort by date
      return [...sessionData, benchmarkEntry].sort(
        (a, b) => new Date(a.created_at) - new Date(b.created_at)
      );
    }

    return sessionData;
  })();

  return (
    <div className="min-h-[calc(100vh-57px)] bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[300px]">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-lg font-medium text-gray-700">
              Loading leaderboard data...
            </p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-lg">
            <div className="flex items-center">
              <XMarkIcon className="h-5 w-5 text-red-500 mr-2" />
              <h3 className="text-lg font-medium text-red-800">{error}</h3>
            </div>
          </div>
        ) : leaderboardData ? (
          <div className="bg-white rounded-xl shadow-sm border-2 border-indigo-300 overflow-hidden">
            {/* Header Section */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-4 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <ScaleIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {leaderboardData.task_name} Leaderboard
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">
                      Compare performance metrics across training sessions
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setViewMode("table")}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "table"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    title="Table View"
                  >
                    <TableCellsIcon className="h-4 w-4 mr-2" />
                    Table
                  </button>
                  <button
                    onClick={() => setViewMode("chart")}
                    className={`inline-flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${viewMode === "chart"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50"
                      }`}
                    title="Chart View"
                  >
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Chart
                  </button>
                  <button
                    onClick={viewMode === "chart" ? downloadPNG : downloadCSV}
                    className="inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
                    title={viewMode === "chart" ? "Download PNG" : "Download CSV"}
                  >
                    <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
                    {viewMode === "chart" ? "PNG" : "CSV"}
                  </button>
                </div>
              </div>
            </div>

            {/* Content Section */}
            <div className="p-6">
              {viewMode === "table" ? (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          Rank
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          Client Name
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          Model Used
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-center text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          {leaderboardData.metric.toUpperCase()}
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider"
                        >
                          Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100 bg-white">
                      {/* Combined Sessions and Benchmark */}
                      {[
                        // Add benchmark as a special entry
                        {
                          isBenchmark: true,
                          metric_value: leaderboardData.benchmark,
                          created_at: leaderboardData.created_at,
                        },
                        // Add all sessions
                        ...leaderboardData.sessions.map((session) => ({
                          ...session,
                          isBenchmark: false,
                        })),
                      ]
                        .sort((a, b) => {
                          if (
                            leaderboardData.metric === "mae" ||
                            leaderboardData.metric === "mse"
                          ) {
                            return a.metric_value - b.metric_value;
                          }
                          return b.metric_value - a.metric_value;
                        })
                        .map((entry, index) => {
                          if (entry.isBenchmark) {
                            // Benchmark Row
                            return (
                              <tr key="benchmark" className="bg-pink-50 hover:bg-pink-100 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {index + 1}
                                    </span>
                                    <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-pink-200 text-pink-800">
                                      Benchmark
                                    </span>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm font-bold text-pink-700">
                                    Benchmark
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-400">—</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className="text-sm font-mono font-bold text-pink-700">
                                    {formatMetricValue(leaderboardData.benchmark)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end text-sm text-gray-500">
                                    <svg
                                      className="w-4 h-4 mr-1 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {formatTimestamp(leaderboardData.created_at)}
                                  </div>
                                </td>
                              </tr>
                            );
                          } else {
                            // Session Row
                            const isBetter =
                              leaderboardData.benchmark &&
                              (leaderboardData.metric === "mae" ||
                                leaderboardData.metric === "mse"
                                ? entry.metric_value <= leaderboardData.benchmark
                                : entry.metric_value >=
                                leaderboardData.benchmark);
                            return (
                              <tr
                                key={entry.session_id}
                                className="hover:bg-gray-50 transition-colors"
                              >
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <span className="text-sm font-semibold text-gray-900">
                                      {index + 1}
                                    </span>
                                    {isBetter && (
                                      <svg
                                        className="ml-2 w-4 h-4 text-blue-600"
                                        fill="currentColor"
                                        viewBox="0 0 20 20"
                                      >
                                        <path
                                          fillRule="evenodd"
                                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                          clipRule="evenodd"
                                        />
                                      </svg>
                                    )}
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`text-sm font-semibold ${isBetter ? "text-blue-700" : "text-yellow-700"}`}>
                                    {entry.admin_username || "Unknown"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="text-sm text-gray-600">
                                    {entry.model_name || "Unknown"}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-center">
                                  <span className={`text-sm font-mono font-semibold ${isBetter ? "text-blue-700" : "text-yellow-700"}`}>
                                    {formatMetricValue(entry.metric_value)}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right">
                                  <div className="flex items-center justify-end text-sm text-gray-500">
                                    <svg
                                      className="w-4 h-4 mr-1 text-gray-400"
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                      />
                                    </svg>
                                    {formatTimestamp(entry.created_at)}
                                  </div>
                                </td>
                              </tr>
                            );
                          }
                        })}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div ref={chartRef} className="space-y-6">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <ResponsiveContainer width="100%" height={500}>
                      <BarChart
                        data={processedData}
                        margin={{ top: 20, right: 100, bottom: 40, left: 100 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />

                        <XAxis
                          dataKey="formattedDate"
                          name="Date"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          label={{
                            value: "Date",
                            position: "insideBottom",
                            offset: -5,
                            style: { fill: "#374151", fontSize: 14, fontWeight: 500 },
                          }}
                        />

                        <YAxis
                          name="Value"
                          tick={{ fontSize: 12, fill: "#6b7280" }}
                          label={{
                            value: leaderboardData.metric?.toUpperCase() || "Value",
                            angle: -90,
                            position: "insideLeft",
                            style: { fill: "#374151", fontSize: 14, fontWeight: 500 },
                          }}
                        />

                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                          wrapperStyle={{ paddingTop: "20px" }}
                          iconType="circle"
                        />

                        {leaderboardData?.benchmark && (
                          <ReferenceLine
                            y={leaderboardData.benchmark}
                            stroke="#DD2780"
                            strokeWidth={2}
                            label={{
                              value: "Benchmark",
                              position: "right",
                              fill: "#DD2780",
                              fontSize: 12,
                              fontWeight: 600,
                            }}
                            strokeDasharray="5 5"
                          />
                        )}

                        <Bar dataKey="metric_value" name="Training Sessions" radius={[4, 4, 0, 0]}>
                          {processedData.map((entry, index) => (
                            <Cell
                              key={`cell-${index}`}
                              fill={
                                entry.isBenchmark
                                  ? "#DD2780"
                                  : entry.meets_benchmark
                                    ? "#638FFE"
                                    : "#FFB101"
                              }
                            />
                          ))}
                        </Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Legend */}
                  <div className="flex flex-wrap justify-center gap-6 pt-4 border-t border-gray-200">
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#DD2780] rounded mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">Benchmark</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#638FFE] rounded mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">Better than benchmark</span>
                    </div>
                    <div className="flex items-center">
                      <div className="w-4 h-4 bg-[#FFB101] rounded mr-2"></div>
                      <span className="text-sm font-medium text-gray-700">Worse than benchmark</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

export default Leaderboard;
