import { PrivateHTTPService } from "./config";

const enc = (filename: string) => encodeURIComponent(filename);

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

/** List datasets from the private server (parquet-backed). */
export const listLocalDatasets = (skip = 0, limit = 5) => {
  return PrivateHTTPService.get(
    `/list-datasets?skip=${skip}&limit=${limit}`
  );
};

export const getMyDatasets = (skip = 0, limit = 5) => {
  return listLocalDatasets(skip, limit);
};

export const createQPDataset = (data: {
  session_id: number;
  session_price: number;
  client_token: string;
}) => {
  return PrivateHTTPService.post("/create-qpdataset", data);
};

/** Dataset overview from the private server (same storage as list-datasets). */
export const getDatasetDetails = (filename: string) => {
  return PrivateHTTPService.get(`/dataset-details/${enc(filename)}`);
};

export const getDatasetPreview = (filename: string, n = 5) => {
  return PrivateHTTPService.get(`/dataset-preview/${enc(filename)}`, {
    params: { n },
  });
};

export const createNewDataset = (data: { filename: string }) => {
  return PrivateHTTPService.post("/create-new-dataset", data);
};

export const preprocessDataset = (data: any) => {
  return PrivateHTTPService.post("/preprocess-dataset", data);
};

/** Flat storage listing (uploads + dataset folders). Use GET /file-upload/list-files. */
export const listStorageFiles = () => {
  return PrivateHTTPService.get("/file-upload/list-files");
};

export const deleteStorageFile = (filename: string) => {
  return PrivateHTTPService.delete(`/file-upload/delete/${enc(filename)}`);
};

export const saveToken = (token: string) => {
  return PrivateHTTPService.post("/save-token", { client_token: token });
};

export const removeToken = () => {
  return PrivateHTTPService.delete("/remove-token");
};

export const updateColumnDescription = (
  filename: string,
  descriptions: any
) => {
  return PrivateHTTPService.put(
    `/update-column-description/${enc(filename)}`,
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
