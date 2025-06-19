import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";

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

import { createQPDataset, getDatasetDetails } from "../../services/privateService";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

const ActionSection = ({ data, sessionId }) => {
  const { register, handleSubmit } = useForm();
  const [isQpdCreated, setIsQpdCreated] = useState(false);
  const {
    training_status: trainingStatus,
    client_status: clientStatus,
    session_price: sessionPrice,
    federated_info: fedInfo,
  } = data || {};
  const { api } = useAuth();
  const navigate = useNavigate();
  const [isDownloading, setIsDownloading] = useState(false);
  const [error, setError] = useState(null);
  const [clientFilename, setClientFilename] = useState("");
  const [errorClient, setErrorClient] = useState(null);
  const [clientStats, setClientStats] = useState(null);
  const [loadingClient, setLoadingClient] = useState(false);
  const [serverStats, _] = useState(fedInfo?.dataset_info.server_stats || null);

  const handleCreateQpd = async () => {
    try {
      const qpdDataRequest = {
        session_id: Number(sessionId),
        session_price: Number(sessionPrice),
        client_token: JSON.parse(localStorage.getItem("user")).access_token,
      };

      console.log("QPD Data Request:", qpdDataRequest);
      await createQPDataset(qpdDataRequest);
      // alert("QPD dataset created successfully!");
      toast.success("QPD dataset creation started !!", {
        position: "bottom-center",
        autoClose: 4000,
      });
      setIsQpdCreated(true);
    } catch (error) {
      // alert("Error creating QPD dataset. Please try again.");
      toast.error("Error creating QPD dataset. Please try again.", {
        position: "bottom-center",
        autoClose: 4000,
      });
      console.error("Error creating QPD dataset:", error);
    }
  };

  const onSubmitParticipationDecision = async (data) => {
    const requestData = {
      session_id: sessionId,
      decision: data.decision === "accepted" ? 1 : 0,
    };
    try {
      submitTrainingAcceptanceResponse(api, requestData).then((response) => {
        // alert(response?.data?.message);
        toast.success(response?.data?.message, {
          position: "bottom-center",
          autoClose: 4000,
        });
        navigate(`/trainings/${sessionId}`);
      });
    } catch (error) {
      console.error("Error submitting decision:", error);
    }
  };

  const fetchClientDatasetStats = async () => {
    if (!clientFilename) return;

    setLoadingClient(true);
    setErrorClient(null);

    try {
      const response = await getDatasetDetails(clientFilename);
      const data = response.data;

      console.log("Client dataset stats received: ", data);

      if (data.details) {
        throw new Error(data.details);
      }

      setClientStats(data);
      // setValue("dataset_info.client_stats", data.datastats);
      setErrorClient(null);
    } catch (err) {
      const errorMessage = err.response?.data?.details || err.message || "Failed to fetch client dataset stats";
      setErrorClient(errorMessage);
      setClientStats(null);
      // setValue("dataset_info.client_stats", null);
    } finally {
      setLoadingClient(false);
    }
  };

  const onSubmitPriceAcceptance = async (data) => {
    try {
      const requestData = {
        session_id: sessionId,
        decision: data.decision === "accepted" ? 1 : 0,
      };
      const response = await submitPriceAcceptanceResponse(api, requestData);
      // alert(response?.data?.message);
      toast.success(response?.data?.message, {
        position: "bottom-center",
        autoClose: 4000,
      });
      navigate(`/trainings/${sessionId}`);
    } catch (error) {
      console.error("Error submitting price decision:", error);
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
      {/* Client Dataset Section */}
      <div className="bg-white p-4 rounded-lg mb-3 shadow-sm border border-gray-200">
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">
            Client Dataset
          </label>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Enter client filename"
              value={clientFilename}
              onChange={(e) => setClientFilename(e.target.value)}
              className="flex-1 p-2.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
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
                Successfully loaded dataset with{" "}
                {clientStats.datastats.numRows} rows and{" "}
                {clientStats.datastats.numColumns} columns
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Column Matching Status */}
      {console.log(serverStats, clientStats)}
      {clientStats && serverStats && <div
        className={`p-3 mb-3 rounded-md border ${columnsMatch()
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
      </div>}

      <form onSubmit={handleSubmit(onSubmitPriceAcceptance)}>
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg flex justify-between items-center">
            <div>
              <h4 className="font-medium text-gray-700">Training Price</h4>
              <p className="text-2xl font-bold text-blue-600 mt-1">
                {sessionPrice || 0} Data Points
              </p>
            </div>
            <button
              type="button"
              disabled={!clientStats || !columnsMatch()}
              onClick={handleCreateQpd}
              className="h-fit py-2 px-4 disabled:cursor-not-allowed disabled:bg-blue-300 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
            >
              Contribute Dataset
            </button>
          </div>

          <div className="space-y-2">
            <label className="block text-gray-700 font-medium">Decision</label>
            <div className="flex items-center space-x-4">
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="accepted"
                  {...register("decision", { required: true })}
                  className="form-radio text-blue-600"
                  disabled={!isQpdCreated}
                />
                <span className="ml-2 text-gray-700">Accept</span>
              </label>
              <label className="inline-flex items-center">
                <input
                  type="radio"
                  value="rejected"
                  {...register("decision", { required: true })}
                  className="form-radio text-red-600"
                  disabled={!isQpdCreated}
                />
                <span className="ml-2 text-gray-700">Reject</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={!isQpdCreated}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isQpdCreated
              ? "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
              : "bg-gray-400 cursor-not-allowed focus:ring-gray-500"
              } focus:outline-none focus:ring-2 focus:ring-offset-2`}
          >
            Submit Price Decision
          </button>
        </div>
      </form>
    </div>
  );

  // Rest of the component remains the same
  const renderParticipationDecisionForm = () => (
    <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">
        Join Training Session
      </h3>

      <form onSubmit={handleSubmit(onSubmitParticipationDecision)}>
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="accepted"
                {...register("decision", { required: true })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500"
              />
              <span className="ml-2 text-gray-700">Accept</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                value="rejected"
                {...register("decision", { required: true })}
                className="h-4 w-4 text-red-600 focus:ring-red-500"
              />
              <span className="ml-2 text-gray-700">Reject</span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Submit Response
          </button>
        </div>
      </form>
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
        <p className="text-sm text-green-700 mb-3">The training is complete.</p>
        <button
          onClick={handleDownload}
          disabled={isDownloading}
          className={`inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${isDownloading ? "opacity-75 cursor-not-allowed" : ""
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
    case 1:
      return renderPriceAcceptanceForm();
    case 2:
      if (clientStatus === -1) {
        return renderParticipationDecisionForm();
      }
      return ParticipationConfirmedAlert();
    case 3:
      return renderWaitingForClientConfirmation();
    case 4:
      return renderTrainingInProgress();
    case 5:
      return renderTrainingCompleted();
    case -1:
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
