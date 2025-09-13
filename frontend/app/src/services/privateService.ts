import { PrivateHTTPService } from "./config";

export const initializeModel = (data: {
  session_id: number;
  client_token: any;
}) => {
  return PrivateHTTPService.post("initiate-model", data);
};

export const trainModelService = (data: {
  session_id: number;
  client_token: any;
}) => {
  return PrivateHTTPService.get(`/execute-round`, { params: data });
};

export const getRawDatasets = (skip = 0, limit = 5) => {
  return PrivateHTTPService.get(
    `/list-raw-datasets?skip=${skip}&limit=${limit}`
  );
};

export const getProcessedDatasets = (skip = 0, limit = 5) => {
  return PrivateHTTPService.get(`/list-datasets?skip=${skip}&limit=${limit}`);
};

export const createQPDataset = (data: {
  session_id: number;
  session_price: number;
  client_token: string;
}) => {
  return PrivateHTTPService.post("/create-qpdataset", data);
};

export const getRawDatasetDetails = (datasetId: string) => {
  return PrivateHTTPService.get(`/raw-dataset-details/${datasetId}`);
};

export const getDatasetDetails = (datasetId: string) => {
  return PrivateHTTPService.get(`/dataset-details/${datasetId}`);
};

export const createNewDataset = (data: { filename: string }) => {
  return PrivateHTTPService.post("/create-new-dataset", data);
};

export const preprocessDataset = (data: any) => {
  return PrivateHTTPService.post("/preprocess-dataset", data);
};

export const listRecentUploads = () => {
  return PrivateHTTPService.get("/list-recent-uploads");
};

export const deleteRecentUpload = (data: {
  directory: string;
  filename: string;
}) => {
  return PrivateHTTPService.delete("/delete-recent-uploaded-file", {
    params: data,
  });
};

export const saveToken = (token: string) => {
  return PrivateHTTPService.post("/save-token", { client_token: token });
};

export const removeToken = () => {
  return PrivateHTTPService.delete("/remove-token");
};

export const updateColumnDescriptionRaw = (
  filename: string,
  descriptions: any
) => {
  return PrivateHTTPService.put(
    `/update-column-description-raw/${filename}`,
    descriptions
  );
};

export const updateColumnDescriptionProcessed = (
  filename: string,
  descriptions: any
) => {
  return PrivateHTTPService.put(
    `/update-column-description-processed/${filename}`,
    descriptions
  );
};

export const acceptClientFilenameTraining = ({
  session_id,
  client_filename,
}: {
  session_id: number;
  client_filename: string;
}) => {
  return PrivateHTTPService.post("/accept-client-filename-training", {
    session_id,
    client_filename,
  });
};
