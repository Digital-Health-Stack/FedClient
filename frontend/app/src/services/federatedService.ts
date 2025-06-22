import { AxiosInstance } from "axios";

export const createSession = async (
  api: AxiosInstance,
  session_data: {
    fed_info: any;
  },
) => {
  return api.post("/v2/create-federated-session/", session_data);
};

export const getAllSessions = async (api, page = 1, perPage = 6) => {
  return api.get(
    `/get-all-federated-sessions?page=${page}&per_page=${perPage}`,
  );
};

export const getFederatedSession = (api: AxiosInstance, session_id) => {
  return api.get(`get-federated-session/${session_id}`);
};

export const getFederatedSessionStatus = (api: AxiosInstance, session_id) => {
  return api.get(`/session/${session_id}/status`);
};

export const downloadModelParameters = (
  api: AxiosInstance,
  session_id: number,
) => {
  return api.get(`/download-model-parameters/${session_id}`, {
    responseType: "blob", // This is crucial for file downloads
  });
};

export const submitTrainingAcceptanceResponse = (
  api: AxiosInstance,
  data: { session_id: number; decision: number },
) => {
  return api.post("submit-client-training-acceptance-response", data);
};

export const submitPriceAcceptanceResponse = (
  api: AxiosInstance,
  data: { session_id: number; decision: number },
) => {
  return api.post("/v2/submit-client-price-acceptance/", data);
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
