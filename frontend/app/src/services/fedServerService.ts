import { HTTPService } from "./config";

export const getDatasetOverview = (datasetId: string) => {
  return HTTPService.get(`dataset-details/${datasetId}`);
};

export const getDatasetTasksById = (datasetId: string) => {
  return HTTPService.get(`list-tasks-with-datasetid/${datasetId}`);
};
