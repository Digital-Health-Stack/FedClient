import { HTTPService } from "./config";

export const getServerDatasets = () => {
  return HTTPService.get(`/list-datasets`);
};

export const getDatasetOverview = (datasetId: string) => {
  return HTTPService.get(`dataset-details/${datasetId}`);
};

export const getDatasetTasksById = (datasetId: string) => {
  return HTTPService.get(`list-tasks-with-datasetid/${datasetId}`);
};
