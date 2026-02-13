import { AxiosInstance } from "axios";

export const createSession = async (
  api: AxiosInstance,
  session_data: {
    fed_info: any;
  }
) => {
  // console.log("session_data", session_data);
  return api.post("/v2/create-federated-session", session_data.fed_info);
};

export const getAllSessions = async (
  api,
  page = 1,
  perPage = 6,
  filters = {} as {
    sortOrder?: string;
    trainingStatus?: string;
    search?: string;
  }
) => {
  const params = new URLSearchParams({
    page: page.toString(),
    per_page: perPage.toString(),
  });

  // Add filter parameters if they exist
  if (filters.sortOrder) {
    params.append('sort_order', filters.sortOrder);
  }
  if (filters.trainingStatus) {
    params.append('training_status', filters.trainingStatus);
  }
  if (filters.search) {
    params.append('search', filters.search);
  }

  return api.get(`/get-all-federated-sessions?${params.toString()}`);
};

export const getFederatedSession = (api: AxiosInstance, session_id) => {
  return api.get(`v2/get-federated-session/${session_id}`);
};

export const getFederatedSessionStatus = (api: AxiosInstance, session_id) => {
  return api.get(`/session/${session_id}/status`);
};

export const downloadModelParameters = (
  api: AxiosInstance,
  session_id: number
) => {
  return api.get(`/download-model-parameters/${session_id}`, {
    responseType: "blob", // This is crucial for file downloads
  });
};

export const submitTrainingAcceptanceResponse = (
  api: AxiosInstance,
  data: { session_id: number; decision: number }
) => {
  return api.post("/v2/accept-training/", data);
};

export const submitPriceAcceptanceResponse = (
  api: AxiosInstance,
  data: { session_id: number; decision: number }
) => {
  return api.post("/v2/submit-client-price-acceptance", data);
};

export const submitWaitTime = (
  api: AxiosInstance,
  data: { session_id: number; wait_time: number }
) => {
  return api.post("/v2/submit-wait-time", data);
};

// export const sendModelInitiation = (
//   api: AxiosInstance,
//   data: { session_id: number }
// ) => {
//   return api.post("client-initialize-model", data);
// };

export const getUserInitiatedSessions = (api: AxiosInstance) => {
  return api.get("get-all-initiated-sessions");
};

export const getLogsSession = (api: AxiosInstance, session_id) => {
  return api.get(`logs/${session_id}`);
};

export const getTrainingResults = (api: AxiosInstance, session_id) => {
  return api.get(`training-result/${session_id}`);
};
export const getLeaderboardByTaskId = (api: AxiosInstance, task_id: number) => {
  return api.get(`/leaderboard/${task_id}`);
};
