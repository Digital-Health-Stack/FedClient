import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import LoaderButton from "../Common/LoaderButton";

import {
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
  CogIcon,
  ArrowDownTrayIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";

import {
  downloadModelParameters,
  submitPriceAcceptanceResponse,
  submitTrainingAcceptanceResponse,
} from "../../services/federatedService";

import {
  acceptClientFilenameTraining,
  createQPDataset,
  getDatasetDetails,
  getProcessedDatasets,
} from "../../services/privateService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ActionSection = ({ data, sessionId, onRefreshData }) => {
  const { register, handleSubmit } = useForm();
  const {
    training_status: trainingStatus,
    client_status: clientStatus,
    session_price: sessionPrice,
    federated_info: fedInfo,
    admin_id: adminId,
  } = data || {};
  const { api, user } = useAuth();
  const isAdmin = user?.id === adminId;
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [clientFilename, setClientFilename] = useState("");
  const [errorClient, setErrorClient] = useState(null);
  const [clientStats, setClientStats] = useState(null);
  const [loadingClient, setLoadingClient] = useState(false);
  const [processedDatasets, setProcessedDatasets] = useState([]);
  const [loadingDatasets, setLoadingDatasets] = useState(false);
  const [isAcceptingPrice, setIsAcceptingPrice] = useState(false);
  const [isRejectingPrice, setIsRejectingPrice] = useState(false);
  const [isAcceptingParticipation, setIsAcceptingParticipation] =
    useState(false);
  const [isRejectingParticipation, setIsRejectingParticipation] =
    useState(false);
  const [serverStats, _] = useState(fedInfo?.server_stats || null);

  // Fetch processed datasets
  const fetchProcessedDatasets = async () => {
    setLoadingDatasets(true);
    try {
      const response = await getProcessedDatasets(0, 100); // Fetch up to 100 datasets
      setProcessedDatasets(response.data.datasets || []);
    } catch (error) {
      console.error("Error fetching processed datasets:", error);
      setProcessedDatasets([]);
    } finally {
      setLoadingDatasets(false);
    }
  };

  // Fetch datasets when component mounts
  React.useEffect(() => {
    fetchProcessedDatasets();
  }, []);

  const onSubmitParticipationDecision = async (decision) => {
    const isAccepting = decision === "accepted";

    // Set the appropriate loading state
    if (isAccepting) {
      setIsAcceptingParticipation(true);
    } else {
      setIsRejectingParticipation(true);
    }

    const requestData = {
      session_id: sessionId,
      decision: isAccepting ? 1 : 0,
    };

    try {
      const response = await submitTrainingAcceptanceResponse(api, requestData);
      toast.success(response?.data?.message, {
        position: "bottom-center",
        autoClose: 4000,
      });

      // Refresh the data after successful submission
      if (onRefreshData) {
        await onRefreshData();
      }

      // Reload the page after a short delay
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (error) {
      console.error("Error submitting decision:", error);
      toast.error(
        "Failed to submit participation decision. Please try again.",
        {
          position: "bottom-center",
          autoClose: 4000,
        }
      );
    } finally {
      // Reset the appropriate loading state
      if (isAccepting) {
        setIsAcceptingParticipation(false);
      } else {
        setIsRejectingParticipation(false);
      }
    }
  };

  const fetchClientDatasetStats = async () => {
    if (!clientFilename) return;

    setLoadingClient(true);
    setErrorClient(null);

    try {
      const response = await getDatasetDetails(clientFilename);
      const data = response.data;

      if (data.details) {
        throw new Error(data.details);
      }

      setClientStats(data);
      // setValue("dataset_info.client_stats", data.datastats);
      setErrorClient(null);
    } catch (err) {
      const errorMessage =
        err.response?.data?.details ||
        err.message ||
        "Failed to fetch client dataset stats";
      setErrorClient(errorMessage);
      setClientStats(null);
      // setValue("dataset_info.client_stats", null);
    } finally {
      setLoadingClient(false);
    }
  };

  const onSubmitPriceAcceptance = async (data) => {
    const isAccepting = data.decision === "accepted";

    // Set the appropriate loading state
    if (isAccepting) {
      setIsAcceptingPrice(true);
    } else {
      setIsRejectingPrice(true);
    }

    try {
      // If accepting, first create QPD dataset automatically
      if (isAccepting) {
        // First, create QPD dataset
        const qpdDataRequest = {
          session_id: Number(sessionId),
          session_price: Number(sessionPrice),
          client_token: JSON.parse(localStorage.getItem("user")).access_token,
        };

        await createQPDataset(qpdDataRequest);
        toast.success("QPD dataset creation completed!", {
          position: "bottom-center",
          autoClose: 2000,
        });

        // Wait a moment for QPD creation to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      const requestData = {
        session_id: sessionId,
        decision: isAccepting ? 1 : 0,
      };
      const response = await submitPriceAcceptanceResponse(api, requestData);

      // Only call acceptClientFilenameTraining if accepting
      if (isAccepting) {
        const responseFilename = await acceptClientFilenameTraining({
          session_id: sessionId,
          client_filename: clientFilename,
        });
        toast.success(responseFilename?.data?.message, {
          position: "bottom-center",
          autoClose: 4000,
        });
      }

      toast.success(response?.data?.message, {
        position: "bottom-center",
        autoClose: 4000,
      });

      // Refresh the data after successful submission
      if (onRefreshData) {
        await onRefreshData();
      }

      navigate(`/trainings/${sessionId}`);
    } catch (error) {
      console.error("Error submitting price decision:", error);
      toast.error("Failed to submit price decision. Please try again.", {
        position: "bottom-center",
        autoClose: 4000,
      });
    } finally {
      // Reset the appropriate loading state
      if (isAccepting) {
        setIsAcceptingPrice(false);
      } else {
        setIsRejectingPrice(false);
      }
    }
  };

  const columnsMatch = () => {
    if (!clientStats || !serverStats) return false;
    const clientColumns = clientStats.datastats.columnStats.map((c) => c.name);
    const serverColumns = serverStats.columnStats.map((c) => c.name);
    return JSON.stringify(clientColumns) === JSON.stringify(serverColumns);
  };

  const renderPriceAcceptanceForm = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Set Training Price
      </h3>
      
      <div className="p-4 bg-gray-50 rounded-lg mb-3">
          <div>
            <h4 className="font-medium text-gray-700">Training Price (in Data Points)</h4>
            <p className="text-2xl font-bold text-blue-600 mt-1">
              {sessionPrice || 0} Data Points
            </p>
          </div>
        </div>
      {/* Client Dataset Section */}
      <div className="bg-white rounded-lg mb-3 shadow-sm border-gray-200">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-[1.1rem] text-gray-700">
            For training you need to pay this much. Pick a dataset to pay with.
          </label>
          <div className="flex space-x-2">
            <select
              value={clientFilename}
              onChange={(e) => setClientFilename(e.target.value)}
              disabled={loadingDatasets}
              className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option value="">
                {loadingDatasets
                  ? "Loading datasets..."
                  : "Select a processed dataset"}
              </option>
              {processedDatasets.map((dataset) => (
                <option
                  key={dataset.filename || dataset.name}
                  value={dataset.filename || dataset.name}
                >
                  {dataset.filename || dataset.name}
                </option>
              ))}
            </select>
            <button
              type="button"
              onClick={fetchClientDatasetStats}
              disabled={loadingClient || !clientFilename}
              className="px-4 py-2.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loadingClient ? (
                <ArrowPathIcon className="h-4 w-4 animate-spin" />
              ) : (
                <ArrowPathIcon className="h-4 w-4" />
              )}
              <span className="ml-2">Fetch</span>
            </button>
          </div>

          {errorClient && (
            <div className="mt-2 p-2 bg-red-50 text-red-600 text-sm rounded-md flex items-start">
              <ExclamationTriangleIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              {errorClient}
            </div>
          )}

          {clientStats && (
            <div className="mt-2 p-2 bg-green-50 text-green-700 text-sm rounded-md flex items-start">
              <CheckCircleIcon className="h-4 w-4 mt-0.5 mr-2 flex-shrink-0" />
              <span>
                Successfully loaded dataset with {clientStats.datastats.numRows}{" "}
                rows and {clientStats.datastats.numColumns} columns
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Column Matching Status */}
      {clientStats && serverStats && (
        <div
          className={`p-3 mb-3 rounded-md border ${
            columnsMatch()
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-yellow-50 border-yellow-200 text-yellow-800"
          }`}
        >
          <div className="flex items-start">
            {columnsMatch() ? (
              <CheckCircleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <ExclamationTriangleIcon className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <p className="font-medium">
                {columnsMatch()
                  ? "Column names match between client and server datasets"
                  : "Column names do not match between client and server datasets"}
              </p>
              {!columnsMatch() && (
                <p className="text-sm mt-1">
                  statistics for client and server datasets are different.
                  <br />
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-4">

        <div className="flex justify-start items-center gap-8">
          <label className="block text-gray-700 font-medium">
            Price Decision
          </label>
          <div className="flex space-x-3 justify-center">
            <LoaderButton
              type="button"
              disabled={
                !clientStats ||
                !columnsMatch() ||
                isAcceptingPrice ||
                isRejectingPrice
              }
              isLoading={isAcceptingPrice}
              loadingText="Accepting..."
              onClick={() => onSubmitPriceAcceptance({ decision: "accepted" })}
              className={`px-6 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                !clientStats ||
                !columnsMatch() ||
                isAcceptingPrice ||
                isRejectingPrice
                  ? "bg-gray-400 cursor-not-allowed focus:ring-gray-500"
                  : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
              }`}
            >
              Contribute and Accept
            </LoaderButton>

            <LoaderButton
              type="button"
              disabled={isAcceptingPrice || isRejectingPrice}
              isLoading={isRejectingPrice}
              loadingText="Rejecting..."
              onClick={() => onSubmitPriceAcceptance({ decision: "rejected" })}
              className={`px-6 py-1.5 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isAcceptingPrice || isRejectingPrice
                  ? "bg-gray-400 cursor-not-allowed focus:ring-gray-500"
                  : "bg-red-500 hover:bg-red-600 focus:ring-red-500"
              }`}
            >
              Reject
            </LoaderButton>
          </div>
        </div>
      </div>
    </div>
  );

  // Rest of the component remains the same
  const renderParticipationDecisionForm = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Join Training Session
      </h3>

      <div className="space-y-4">
        <div className="flex space-x-4 justify-center">
          <LoaderButton
            type="button"
            disabled={isAcceptingParticipation || isRejectingParticipation}
            isLoading={isAcceptingParticipation}
            loadingText="Accepting..."
            onClick={() => onSubmitParticipationDecision("accepted")}
            className={`px-8 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isAcceptingParticipation || isRejectingParticipation
                ? "bg-gray-400 cursor-not-allowed focus:ring-gray-500"
                : "bg-green-500 hover:bg-green-600 focus:ring-green-500"
            }`}
          >
            Accept Training
          </LoaderButton>

          <LoaderButton
            type="button"
            disabled={isAcceptingParticipation || isRejectingParticipation}
            isLoading={isRejectingParticipation}
            loadingText="Rejecting..."
            onClick={() => onSubmitParticipationDecision("rejected")}
            className={`px-8 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isAcceptingParticipation || isRejectingParticipation
                ? "bg-gray-400 cursor-not-allowed focus:ring-gray-500"
                : "bg-red-500 hover:bg-red-600 focus:ring-red-500"
            }`}
          >
            Reject Training
          </LoaderButton>
        </div>
      </div>
    </div>
  );

  const renderWaitingForClientConfirmation = () => (
    <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
      <div className="flex items-center">
        <CogIcon className="h-5 w-5 text-yellow-500 mr-2" />
        <h3 className="text-lg font-medium text-yellow-800">
          Sending Model Configurations
        </h3>
      </div>
      <p className="mt-2 text-sm text-yellow-700">
        Model configuration sent to interested clients. Waiting for them to
        acknowledge and prepare for training.
      </p>
    </div>
  );

  const renderTrainingInProgress = () => (
    <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded-lg">
      <div className="flex items-center">
        <ClockIcon className="h-5 w-5 text-purple-500 mr-2" />
        <h3 className="text-lg font-medium text-purple-800">
          Training In Progress
        </h3>
      </div>
      <p className="mt-2 text-sm text-purple-700">
        The training session is currently running.
      </p>
    </div>
  );

  const handleDownload = async () => {
    setIsDownloading(true);
    setError(null);

    try {
      const response = await downloadModelParameters(api, sessionId);

      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `model_parameters_${sessionId}.json`);
      document.body.appendChild(link);
      link.click();

      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      setError(
        err.response?.data?.detail || "Failed to download model parameters"
      );
    } finally {
      setIsDownloading(false);
    }
  };

  const renderTrainingCompleted = () => (
    <div className="bg-green-50 border-l-4 border-green-400 p-4 rounded-lg">
      <div className="flex items-center">
        <CheckCircleIcon className="h-5 w-5 text-green-500 mr-2" />
        <h3 className="text-lg font-medium text-green-800">
          Training Completed
        </h3>
      </div>
      <div className="mt-3">
        <p className="text-sm text-green-700 mb-3">
          The training is complete. You can download the model parameters as a
          json file.
        </p>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
            isDownloading ? "opacity-75 cursor-not-allowed" : ""
          }`}
        >
          {isDownloading ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Downloading...
            </>
          ) : (
            <>
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Download Model
            </>
          )}
        </button>
        {error && <p className="mt-2 text-sm text-red-600">Error: {error}</p>}
      </div>
    </div>
  );

  const ParticipationConfirmedAlert = () => {
    return (
      <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg shadow-sm">
        <div className="flex items-start">
          <div className="flex-shrink-0">
            <CheckCircleIcon className="h-6 w-6 text-green-600" />
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold text-green-800">
              Participation Confirmed
            </h3>
            <div className="mt-2 text-sm text-green-700">
              <p>
                Thank you for confirming your participation in this training
                session. Your spot has been secured.
              </p>
              <div className="mt-3 bg-green-100 border border-green-200 rounded-md p-3">
                <p className="text-sm text-green-700 font-medium">
                  <InformationCircleIcon className="h-5 w-5 inline mr-1.5 text-green-600" />
                  Other participants are still confirming their attendance. The
                  session will proceed once we reach the minimum required
                  participants.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };
  switch (trainingStatus) {
    case "PRICE_NEGOTIATION":
      // Only show price acceptance form to the admin/creator
      if (isAdmin) {
        return renderPriceAcceptanceForm();
      } else {
        return (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg">
            <div className="flex items-center">
              <InformationCircleIcon className="h-5 w-5 text-blue-500 mr-2" />
              <h3 className="text-lg font-medium text-blue-800">
                Waiting for Price Acceptance
              </h3>
            </div>
            <p className="mt-2 text-sm text-blue-700">
              The session creator is reviewing the training price. Please wait for
              them to accept or reject the price.
            </p>
          </div>
        );
      }

    // CHANGE HERE FOR SHOWING PARTICIPATION DECISION FORM ON OTHER CLIENTS
    case "ACCEPTING_CLIENTS":
      if (clientStatus === -1) {
        return renderParticipationDecisionForm();
      } else {
        return ParticipationConfirmedAlert();
      }
    case "STARTED":
      return renderTrainingInProgress();
    case "COMPLETED":
      return renderTrainingCompleted();
    case "FAILED":
      return (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ExclamationTriangleIcon className="h-5 w-5 text-red-500 mr-2" />
            <h3 className="text-lg font-medium text-red-800">
              Training Failed
            </h3>
          </div>
          <p className="mt-2 text-sm text-red-700">
            This session encountered an error and could not complete.
          </p>
        </div>
      );
    default:
      return (
        <div className="bg-gray-50 border-l-4 border-gray-400 p-4 rounded-lg">
          <div className="flex items-center">
            <ClockIcon className="h-5 w-5 text-gray-500 mr-2" />
            <h3 className="text-lg font-medium text-gray-800">
              Unknown Status
            </h3>
          </div>
          <p className="mt-2 text-sm text-gray-700">
            Unable to determine the current session status.
          </p>
        </div>
      );
  }
};

export default ActionSection;
