import React, { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getTrainingResults } from "../../services/federatedService";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

// Custom Cross Shape Component (rotated 45 degrees to make an X)
const CrossDot = (props) => {
  const { cx, cy, fill } = props;
  const size = 6;
  return (
    <g>
      <line
        x1={cx - size}
        y1={cy - size}
        x2={cx + size}
        y2={cy + size}
        stroke={fill}
        strokeWidth="2"
      />
      <line
        x1={cx - size}
        y1={cy + size}
        x2={cx + size}
        y2={cy - size}
        stroke={fill}
        strokeWidth="2"
      />
    </g>
  );
};

const Result = ({ sessionId }) => {
  const [results, setResults] = useState({
    server_results: {},
    client_results: {},
    current_round: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("chart");
  const [selectedMetric, setSelectedMetric] = useState("");
  const { api } = useAuth();

  const fetchResultsData = async () => {
    if (!sessionId) {
      setResults({
        server_results: {},
        client_results: {},
        current_round: 0,
      });
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const response = await getTrainingResults(api, sessionId);
      setResults(response.data);

      // Set first available metric as default selection
      const metrics = Object.keys(response.data.server_results);
      if (metrics.length > 0) {
        setSelectedMetric(metrics[0]);
      }
    } catch (err) {
      console.error("Error fetching training results:", err);
      setError("Failed to fetch training results. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResultsData();
  }, [sessionId]);

  const formatMetricValue = (value) => {
    return typeof value === "number" ? value.toFixed(4) : value;
  };

  const capitalize = (str) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Download chart as PNG
  const downloadChartAsPNG = () => {
    const chartContainer = document.querySelector(".h-96.relative");
    if (!chartContainer) return;

    // Use html2canvas to capture the entire chart container including the legend
    import("html2canvas")
      .then((html2canvas) => {
        html2canvas
          .default(chartContainer, {
            backgroundColor: "white",
            scale: 2, // Higher resolution
            useCORS: true,
            allowTaint: true,
          })
          .then((canvas) => {
            const link = document.createElement("a");
            link.download = `training-results-${selectedMetric}-${
              sessionId || "chart"
            }.png`;
            link.href = canvas.toDataURL("image/png");
            link.click();
          })
          .catch((error) => {
            console.error("Error generating PNG:", error);
            // Fallback to original method
            downloadChartAsPNGFallback();
          });
      })
      .catch((error) => {
        console.error("html2canvas not available:", error);
        // Fallback to original method
        downloadChartAsPNGFallback();
      });
  };

  // Fallback method (original implementation)
  const downloadChartAsPNGFallback = () => {
    const chartElement = document.querySelector(".recharts-wrapper svg");
    if (!chartElement) return;

    const svgData = new XMLSerializer().serializeToString(chartElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    canvas.width = chartElement.width.baseVal.value;
    canvas.height = chartElement.height.baseVal.value;

    img.onload = () => {
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const link = document.createElement("a");
      link.download = `training-results-${selectedMetric}-${
        sessionId || "chart"
      }.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  // Download table as CSV
  const downloadTableAsCSV = () => {
    if (!selectedMetric || Object.keys(results.server_results).length === 0)
      return;

    const csvData = [];
    const headers = [
      "Round",
      `Server ${selectedMetric.replace(/_/g, " ")}`,
      `Your ${selectedMetric.replace(/_/g, " ")}`,
    ];
    csvData.push(headers.join(","));

    Object.keys(results.server_results[selectedMetric] || {}).forEach(
      (round) => {
        const roundNumber = round.split("_")[1];
        const serverValue = formatMetricValue(
          results.server_results[selectedMetric][round]
        );
        const clientValue = results.client_results[selectedMetric]?.[round]
          ? formatMetricValue(results.client_results[selectedMetric][round])
          : "-";

        csvData.push(
          [`Round ${roundNumber}`, serverValue, clientValue].join(",")
        );
      }
    );

    const csvContent = csvData.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");

    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute(
        "download",
        `training-results-${selectedMetric}-${sessionId || "table"}.csv`
      );
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  // Prepare data for charts for the selected metric
  const prepareChartData = () => {
    if (!selectedMetric || !results.server_results[selectedMetric]) return [];

    const chartData = [];
    const rounds = Object.keys(results.client_results[selectedMetric]);
    rounds.forEach((round) => {
      const roundNumber = parseInt(round.split("_")[1]);
      const roundData = {
        round: roundNumber,
        [`server_${selectedMetric}`]:
          results.server_results[selectedMetric][round],
        [`client_${selectedMetric}`]:
          results.client_results[selectedMetric]?.[round],
      };

      chartData.push(roundData);
    });

    return chartData;
  };

  const chartData = prepareChartData();
  const availableMetrics = Object.keys(results.server_results);

  return (
    <div className="w-full space-y-6">
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
            Training Results
            {loading && (
              <ArrowPathIcon className="h-5 w-5 ml-2 text-blue-500 animate-spin" />
            )}
          </h3>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("chart")}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === "chart"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Chart View
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`px-3 py-1 text-sm rounded-md ${
                activeTab === "table"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              Table View
            </button>

            {/* Download button */}
            {selectedMetric &&
              Object.keys(results.server_results).length > 0 &&
              !loading &&
              !error && (
                <button
                  onClick={
                    activeTab === "chart"
                      ? downloadChartAsPNG
                      : downloadTableAsCSV
                  }
                  className="flex items-center px-3 py-1 text-sm rounded-md bg-green-100 text-green-700 hover:bg-green-200 transition-colors"
                  title={`Download ${
                    activeTab === "chart" ? "chart as PNG" : "table as CSV"
                  }`}
                >
                  <ArrowDownTrayIcon className="h-4 w-4 mr-1" />
                  Download {activeTab === "chart" ? "PNG" : "CSV"}
                </button>
              )}
          </div>
        </div>

        <div className="p-4">
          {activeTab === "table" ? (
            <div className="overflow-hidden">
              <div className="flex flex-wrap gap-2 mb-4">
                {availableMetrics.map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 text-sm rounded-md capitalize ${
                      selectedMetric === metric
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {metric.replace(/_/g, " ")}
                  </button>
                ))}
              </div>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Round
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Server{" "}
                        {selectedMetric?.toUpperCase().replace(/_/g, " ")}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Your {selectedMetric?.toUpperCase().replace(/_/g, " ")}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center text-gray-500">
                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                            Loading results...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center text-red-500">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                            {error}
                          </div>
                        </td>
                      </tr>
                    ) : !selectedMetric ||
                      Object.keys(results.server_results).length === 0 ? (
                      <tr>
                        <td colSpan={3} className="px-6 py-4 text-center">
                          <div className="flex justify-center items-center text-gray-500">
                            <InformationCircleIcon className="h-5 w-5 mr-2" />
                            {sessionId
                              ? "No results available yet"
                              : "Select a session to view results"}
                          </div>
                        </td>
                      </tr>
                    ) : (
                      Object.keys(
                        results.server_results[selectedMetric] || {}
                      ).map((round) => {
                        const roundNumber = round.split("_")[1];
                        return (
                          <tr key={round} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              Round {roundNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatMetricValue(
                                results.server_results[selectedMetric][round]
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {results.client_results[selectedMetric]?.[round]
                                ? formatMetricValue(
                                    results.client_results[selectedMetric][
                                      round
                                    ]
                                  )
                                : "-"}
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap gap-2 mb-4">
                {availableMetrics.map((metric) => (
                  <button
                    key={metric}
                    onClick={() => setSelectedMetric(metric)}
                    className={`px-3 py-1 text-sm rounded-md capitalize ${
                      selectedMetric === metric
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {metric.replace(/_/g, " ")}
                  </button>
                ))}
              </div>

              {loading ? (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  <ArrowPathIcon className="h-8 w-8 mr-2 animate-spin" />
                  Loading charts...
                </div>
              ) : error ? (
                <div className="flex justify-center items-center h-64 text-red-500">
                  <ExclamationTriangleIcon className="h-8 w-8 mr-2" />
                  {error}
                </div>
              ) : !selectedMetric ||
                Object.keys(results.server_results).length === 0 ? (
                <div className="flex justify-center items-center h-64 text-gray-500">
                  <InformationCircleIcon className="h-8 w-8 mr-2" />
                  {sessionId
                    ? "No results available for charts"
                    : "Select a session to view charts"}
                </div>
              ) : (
                <div className="h-96 relative">
                  <h4 className="text-md font-medium text-gray-700 mb-2">
                    {selectedMetric.toUpperCase().replace(/_/g, " ")}{" "}
                    Progression
                  </h4>

                  {/* Custom Legend */}
                  <div className="absolute top-24 right-12 z-10 bg-white bg-opacity-10 border border-gray-200 rounded p-2 shadow-sm">
                    <div className="space-y-1 text-xs">
                      <div className="flex items-center space-x-2">
                        <svg width="20" height="12">
                          <line
                            x1="0"
                            y1="6"
                            x2="16"
                            y2="6"
                            stroke="#3b82f6"
                            strokeWidth="2"
                          />
                          <circle
                            cx="8"
                            cy="6"
                            r="2"
                            fill="#3b82f6"
                            stroke="#3b82f6"
                            strokeWidth="1"
                          />
                        </svg>
                        <span className="text-gray-700">
                          Server {selectedMetric.replace(/_/g, " ")}
                        </span>
                      </div>
                      {results.client_results[selectedMetric] && (
                        <div className="flex items-center space-x-2">
                          <svg width="20" height="12">
                            <line
                              x1="0"
                              y1="6"
                              x2="16"
                              y2="6"
                              stroke="#10b981"
                              strokeWidth="2"
                              strokeDasharray="3 3"
                            />
                            <g>
                              <line
                                x1="2"
                                y1="2"
                                x2="14"
                                y2="10"
                                stroke="#10b981"
                                strokeWidth="2"
                              />
                              <line
                                x1="2"
                                y1="10"
                                x2="14"
                                y2="2"
                                stroke="#10b981"
                                strokeWidth="2"
                              />
                            </g>
                          </svg>
                          <span className="text-gray-700">
                            Your {selectedMetric.replace(/_/g, " ")}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <ResponsiveContainer
                    className="float-right"
                    width="100%"
                    height="100%"
                  >
                    <LineChart
                      data={chartData}
                      margin={{ top: 25, right: 30, left: 35, bottom: 30 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="round"
                        type="category"
                        label={{
                          value: "Rounds",
                          position: "insideBottom",
                          offset: -2,
                        }}
                      />
                      <YAxis
                        label={{
                          value: selectedMetric
                            .toUpperCase()
                            .replace(/_/g, " "),
                          angle: -90,
                          offset: -20,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [formatMetricValue(value)]}
                      />
                      <Line
                        name={`Server ${capitalize(selectedMetric).replace(
                          /_/g,
                          " "
                        )}`}
                        type="monotone"
                        dataKey={`server_${selectedMetric}`}
                        stroke="#3b82f6"
                        activeDot={{ r: 6, fill: "#3b82f6" }}
                        dot={{
                          r: 2,
                          fill: "#3b82f6",
                          stroke: "#3b82f6",
                          strokeWidth: 1,
                        }}
                      />
                      {results.client_results[selectedMetric] && (
                        <Line
                          name={`Your ${capitalize(selectedMetric).replace(
                            /_/g,
                            " "
                          )}`}
                          type="monotone"
                          dataKey={`client_${selectedMetric}`}
                          stroke="#10b981"
                          activeDot={{ r: 6, fill: "#10b981" }}
                          dot={<CrossDot fill="#10b981" />}
                          strokeDasharray="5 5"
                        />
                      )}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50 text-right text-xs text-gray-500 border-t border-gray-200">
          {sessionId &&
            `Session ID #${sessionId} | Current Round: ${
              results.current_round || "N/A"
            }`}
        </div>
      </div>
    </div>
  );
};

export default Result;
