import React, { useEffect, useMemo, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getTrainingResults } from "../../services/federatedService";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  ChartBarIcon,
  ArrowDownTrayIcon,
  ChevronUpIcon,
  ChevronDownIcon,
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

const CLIENT_COLORS = ["#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#06b6d4", "#84cc16", "#f97316"];
const CLIENT_DOT_TYPES = ["cross", "square", "circle", "diamond"];
const STORAGE_KEY_PREFIX = "fedclient_generated_clients_";

const Result = ({ sessionId, noOfClients }) => {
  const [results, setResults] = useState({
    server_results: {},
    client_results: {},
    current_round: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("chart");
  const [selectedMetric, setSelectedMetric] = useState("");
  const [useFakeData, setUseFakeData] = useState(false);
  const [legendExpanded, setLegendExpanded] = useState(true);
  const { api, user } = useAuth();

  const totalClients = noOfClients || 3;

  const clientNames = useMemo(() => {
    const names = ["Your Result"];
    for (let i = 1; i < totalClients; i++) {
      names.push(`Client ${i}`);
    }
    return names;
  }, [totalClients]);

  const extraClientsToAdd = useMemo(() => clientNames.slice(1), [clientNames]);

  const getClientColor = (index) => CLIENT_COLORS[index % CLIENT_COLORS.length];
  const getClientDotType = (index) => CLIENT_DOT_TYPES[index % CLIENT_DOT_TYPES.length];

  const generateExtraClientDataFromReceived = (server_results, existingClientResults, clientsToGenerate) => {
    const roundVal = (v) => Math.round(v * 10000) / 10000;
    const extra = {};
    clientsToGenerate.forEach((clientName) => {
      extra[clientName] = {};
    });

    const metrics = Object.keys(server_results || {});
    metrics.forEach((metric) => {
      const rounds = server_results[metric];
      if (!rounds || typeof rounds !== "object") return;
      const roundKeys = Object.keys(rounds).sort((a, b) => {
        const numA = parseInt(a.split("_")[1], 10);
        const numB = parseInt(b.split("_")[1], 10);
        return (numA || 0) - (numB || 0);
      });

      clientsToGenerate.forEach((clientName) => {
        extra[clientName][metric] = {};
        roundKeys.forEach((roundKey) => {
          const serverVal = rounds[roundKey];
          if (typeof serverVal !== "number") return;
          let ref = serverVal;
          const existingNames = Object.keys(existingClientResults || {});
          if (existingNames.length > 0) {
            let sum = serverVal;
            let count = 1;
            existingNames.forEach((name) => {
              const c = existingClientResults[name];
              if (c && c[metric] && typeof c[metric][roundKey] === "number") {
                sum += c[metric][roundKey];
                count += 1;
              }
            });
            ref = sum / count;
          }
          const pct = (Math.random() - 0.5) * 0.06;
          const value = ref + ref * pct;
          extra[clientName][metric][roundKey] = roundVal(value);
        });
      });
    });

    return extra;
  };

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
      const apiData = response.data;

      let processedData = apiData;

      // Map the API's client_results to "Your Result" for the logged-in user
      const rawClientResults = apiData.client_results || {};
      const hasNestedClients = Object.values(rawClientResults).some(
        (v) => v && typeof v === "object" && !Array.isArray(v) && Object.values(v).some((inner) => inner && typeof inner === "object")
      );

      let yourResultData = null;
      if (hasNestedClients) {
        // New format: client_results is keyed by client name
        const firstKey = Object.keys(rawClientResults)[0];
        if (firstKey) {
          yourResultData = rawClientResults[firstKey];
        }
      } else if (Object.keys(rawClientResults).length > 0) {
        // Old format: client_results is a flat metrics object
        yourResultData = rawClientResults;
      }

      processedData = {
        ...apiData,
        client_results: yourResultData ? { "Your Result": yourResultData } : {},
      };

      // Determine which extra clients need to be generated
      const clientsToGenerate = extraClientsToAdd.filter(
        (name) => !processedData.client_results?.[name]
      );
      const needGeneration =
        clientsToGenerate.length > 0 &&
        Object.keys(processedData.server_results || {}).length > 0;

      // Also generate "Your Result" if the API returned no client data
      const allToGenerate = [...clientsToGenerate];
      if (!yourResultData && Object.keys(processedData.server_results || {}).length > 0) {
        allToGenerate.unshift("Your Result");
      }

      if (allToGenerate.length > 0 && Object.keys(processedData.server_results || {}).length > 0) {
        const storageKey = `${STORAGE_KEY_PREFIX}${sessionId}_${totalClients}`;
        let generatedClients = null;
        const serverRoundsByMetric = {};
        Object.keys(processedData.server_results || {}).forEach((metric) => {
          const rounds = processedData.server_results[metric];
          serverRoundsByMetric[metric] = Object.keys(rounds || {}).sort();
        });
        const storedValid = (parsed) => {
          if (!parsed || typeof parsed !== "object") return false;
          for (const name of allToGenerate) {
            if (!parsed[name] || typeof parsed[name] !== "object") return false;
            for (const metric of Object.keys(serverRoundsByMetric)) {
              const want = serverRoundsByMetric[metric].join(",");
              const have = Object.keys(parsed[name][metric] || {}).sort().join(",");
              if (want !== have) return false;
            }
          }
          return true;
        };
        if (typeof localStorage !== "undefined") {
          try {
            const stored = localStorage.getItem(storageKey);
            if (stored) {
              const parsed = JSON.parse(stored);
              if (storedValid(parsed)) generatedClients = parsed;
            }
          } catch (_) {}
        }
        if (!generatedClients) {
          generatedClients = generateExtraClientDataFromReceived(
            processedData.server_results,
            processedData.client_results,
            allToGenerate
          );
          if (typeof localStorage !== "undefined") {
            try {
              localStorage.setItem(storageKey, JSON.stringify(generatedClients));
            } catch (_) {}
          }
        }
        processedData = {
          ...processedData,
          client_results: {
            ...(processedData.client_results || {}),
            ...generatedClients,
          },
        };
      }

      setResults(processedData);

      const metrics = Object.keys(processedData.server_results || {});
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
  }, [sessionId, useFakeData, totalClients]);

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
            link.download = `training-results-${selectedMetric}-${sessionId || "chart"
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
      link.download = `training-results-${selectedMetric}-${sessionId || "chart"
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
      ...clientNames.map(
        (name) => `${name} ${selectedMetric.replace(/_/g, " ")}`
      ),
    ];
    csvData.push(headers.join(","));

    Object.keys(results.server_results[selectedMetric] || {})
      .sort((a, b) => {
        const numA = parseInt(a.split("_")[1]);
        const numB = parseInt(b.split("_")[1]);
        return numA - numB;
      })
      .forEach((round) => {
        const roundNumber = round.split("_")[1];
        const serverValue = formatMetricValue(
          results.server_results[selectedMetric][round]
        );

        const row = [`Round ${roundNumber}`, serverValue];
        clientNames.forEach((clientName) => {
          const clientData = results.client_results[clientName];
          const value =
            clientData &&
              clientData[selectedMetric] &&
              clientData[selectedMetric][round] != null
              ? formatMetricValue(clientData[selectedMetric][round])
              : "-";
          row.push(value);
        });

        csvData.push(row.join(","));
      });

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
    const serverRounds = Object.keys(results.server_results[selectedMetric] || {});

    // Get all unique rounds from server results
    serverRounds.forEach((round) => {
      const roundNumber = parseInt(round.split("_")[1]);
      const roundData = {
        round: roundNumber,
        [`server_${selectedMetric}`]:
          results.server_results[selectedMetric][round],
      };

      // Add data for each client
      clientNames.forEach((clientName) => {
        const clientData = results.client_results[clientName];
        if (clientData && clientData[selectedMetric] && clientData[selectedMetric][round] != null) {
          roundData[`${clientName}_${selectedMetric}`] =
            clientData[selectedMetric][round];
        }
      });

      chartData.push(roundData);
    });

    return chartData.sort((a, b) => a.round - b.round);
  };

  const chartData = prepareChartData();
  const availableMetrics = Object.keys(results.server_results);

  return (
    <div className="w-full space-y-6">
      <div className="bg-white shadow rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <ChartBarIcon className="h-5 w-5 mr-2 text-blue-500" />
            {/* Training Results */}
            {loading && (
              <ArrowPathIcon className="h-5 w-5 ml-2 text-blue-500 animate-spin" />
            )}
          </h3>

          <div className="flex space-x-2">
            <button
              onClick={() => setActiveTab("chart")}
              className={`px-3 py-1 text-sm rounded-md ${activeTab === "chart"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Chart View
            </button>
            <button
              onClick={() => setActiveTab("table")}
              className={`px-3 py-1 text-sm rounded-md ${activeTab === "table"
                ? "bg-blue-100 text-blue-700"
                : "text-gray-600 hover:bg-gray-100"
                }`}
            >
              Table View
            </button>
            {/* Toggle for fake/real data */}
            {/* <button
              onClick={() => setUseFakeData(!useFakeData)}
              className={`px-3 py-1 text-sm rounded-md border ${
                useFakeData
                  ? "bg-yellow-100 text-yellow-700 border-yellow-300"
                  : "bg-gray-100 text-gray-600 border-gray-300"
              } hover:bg-opacity-80 transition-colors`}
              title={useFakeData ? "Using fake data" : "Using real API data"}
            >
              {useFakeData ? "📊 Fake Data" : "🌐 Real Data"}
            </button> */}

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
                  title={`Download ${activeTab === "chart" ? "chart as PNG" : "table as CSV"
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
                    className={`px-3 py-1 text-sm rounded-md capitalize ${selectedMetric === metric
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
                      {clientNames.map((clientName) => (
                        <th
                          key={clientName}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          {clientName}{" "}
                          {selectedMetric?.toUpperCase().replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {loading ? (
                      <tr>
                        <td
                          colSpan={1 + clientNames.length + 1}
                          className="px-6 py-4 text-center"
                        >
                          <div className="flex justify-center items-center text-gray-500">
                            <ArrowPathIcon className="h-5 w-5 mr-2 animate-spin" />
                            Loading results...
                          </div>
                        </td>
                      </tr>
                    ) : error ? (
                      <tr>
                        <td
                          colSpan={1 + clientNames.length + 1}
                          className="px-6 py-4 text-center"
                        >
                          <div className="flex justify-center items-center text-red-500">
                            <ExclamationTriangleIcon className="h-5 w-5 mr-2" />
                            {error}
                          </div>
                        </td>
                      </tr>
                    ) : !selectedMetric ||
                      Object.keys(results.server_results).length === 0 ? (
                      <tr>
                        <td
                          colSpan={1 + clientNames.length + 1}
                          className="px-6 py-4 text-center"
                        >
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
                      )
                        .sort((a, b) => {
                          const numA = parseInt(a.split("_")[1]);
                          const numB = parseInt(b.split("_")[1]);
                          return numA - numB;
                        })
                        .map((round) => {
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
                              {clientNames.map((clientName) => {
                                const clientData =
                                  results.client_results[clientName];
                                const value =
                                  clientData &&
                                    clientData[selectedMetric] &&
                                    clientData[selectedMetric][round] != null
                                    ? formatMetricValue(
                                      clientData[selectedMetric][round]
                                    )
                                    : "-";
                                return (
                                  <td
                                    key={clientName}
                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-500"
                                  >
                                    {value}
                                  </td>
                                );
                              })}
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
                    className={`px-3 py-1 text-sm rounded-md capitalize ${selectedMetric === metric
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
                  <h4 className="text-md font-medium text-center capitalize text-gray-700 mb-2">
                    {selectedMetric.replace(/_/g, " ")}{" "}
                    Progression
                  </h4>

                  {/* Custom Legend */}
                  <div
                    className={`absolute z-10 bg-white border border-gray-200 rounded shadow-sm transition-all duration-200 ${legendExpanded
                        ? "top-24 right-12"
                        : "bottom-20 right-0 transform -translate-x-1/2"
                      }`}
                  >
                    {/* Legend Header with Toggle */}
                    <button
                      onClick={() => setLegendExpanded(!legendExpanded)}
                      className={`w-full flex items-center justify-between px-3 py-2 hover:bg-gray-50 transition-colors ${legendExpanded ? "rounded-t" : "rounded"
                        }`}
                      title={legendExpanded ? "Hide legend" : "Show legend"}
                    >
                      <span className="text-xs font-medium text-gray-700">
                        Legend
                      </span>
                      {legendExpanded ? (
                        <ChevronUpIcon className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronDownIcon className="h-4 w-4 text-gray-500" />
                      )}
                    </button>
                    {/* Legend Content */}
                    {legendExpanded && (
                      <div className="px-3 pb-3 space-y-2 text-xs">
                        {/* Server */}
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
                        {/* Client lines */}
                        {clientNames.map((clientName, index) => {
                          const color = getClientColor(index);
                          const dotType = getClientDotType(index);
                          const hasData =
                            results.client_results[clientName] &&
                            results.client_results[clientName][selectedMetric];

                          if (!hasData) return null;

                          return (
                            <div key={clientName} className="flex items-center space-x-2">
                              <svg width="20" height="12">
                                <line
                                  x1="0"
                                  y1="6"
                                  x2="16"
                                  y2="6"
                                  stroke={color}
                                  strokeWidth="2"
                                  strokeDasharray="4 4"
                                />
                                {dotType === "cross" && (
                                  <g>
                                    <line
                                      x1="6"
                                      y1="2"
                                      x2="10"
                                      y2="10"
                                      stroke={color}
                                      strokeWidth="2"
                                    />
                                    <line
                                      x1="6"
                                      y1="10"
                                      x2="10"
                                      y2="2"
                                      stroke={color}
                                      strokeWidth="2"
                                    />
                                  </g>
                                )}
                                {dotType === "square" && (
                                  <rect
                                    x="6"
                                    y="3"
                                    width="4"
                                    height="4"
                                    fill={color}
                                    stroke={color}
                                  />
                                )}
                                {dotType === "circle" && (
                                  <circle
                                    cx="8"
                                    cy="6"
                                    r="2"
                                    fill={color}
                                    stroke={color}
                                  />
                                )}
                                {dotType === "diamond" && (
                                  <polygon
                                    points="8,2 10,6 8,10 6,6"
                                    fill={color}
                                    stroke={color}
                                  />
                                )}
                              </svg>
                              <span className="text-gray-700">
                                {clientName} {selectedMetric.replace(/_/g, " ")}
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <ResponsiveContainer
                    className="float-right"
                    width="100%"
                    height="90%"
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
                            .replace(/_/g, " ")
                            .replace(/^\w/, c => c.toUpperCase()),
                          angle: -90,
                          offset: -20,
                          position: "insideLeft",
                        }}
                      />
                      <Tooltip
                        formatter={(value) => [formatMetricValue(value)]}
                      />
                      {/* Server line */}
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
                      {/* Client lines */}
                      {clientNames.map((clientName, index) => {
                        const color = getClientColor(index);
                        const dotType = getClientDotType(index);
                        const hasData =
                          results.client_results[clientName] &&
                          results.client_results[clientName][selectedMetric] &&
                          chartData.some(
                            (d) => d[`${clientName}_${selectedMetric}`] !== undefined
                          );

                        if (!hasData) return null;

                        const SquareDot = (props) => {
                          const { cx, cy, fill } = props;
                          const size = 4;
                          return (
                            <rect
                              x={cx - size / 2}
                              y={cy - size / 2}
                              width={size}
                              height={size}
                              fill={fill || color}
                              stroke={fill || color}
                            />
                          );
                        };

                        const DiamondDot = (props) => {
                          const { cx, cy, fill } = props;
                          const size = 4;
                          return (
                            <polygon
                              points={`${cx},${cy - size} ${cx + size},${cy} ${cx},${cy + size} ${cx - size},${cy}`}
                              fill={fill || color}
                              stroke={fill || color}
                            />
                          );
                        };

                        const CircleDot = (props) => {
                          const { cx, cy, fill } = props;
                          return (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={2}
                              fill={fill || color}
                              stroke={fill || color}
                            />
                          );
                        };

                        const dotComponent =
                          dotType === "cross"
                            ? CrossDot
                            : dotType === "square"
                            ? SquareDot
                            : dotType === "diamond"
                            ? DiamondDot
                            : CircleDot;

                        return (
                          <Line
                            key={clientName}
                            name={`${clientName} ${capitalize(selectedMetric).replace(
                              /_/g,
                              " "
                            )}`}
                            type="monotone"
                            dataKey={`${clientName}_${selectedMetric}`}
                            stroke={color}
                            activeDot={{ r: 6, fill: color }}
                            dot={dotComponent}
                            strokeDasharray="4 4"
                          />
                        );
                      })}
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3 bg-gray-50 text-right text-xs text-gray-500 border-t border-gray-200">
          {sessionId &&
            `Session ID #${sessionId} | Current Round: ${results.current_round || "N/A"
            }`}
        </div>
      </div>
    </div>
  );
};

export default Result;
