import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import SummaryStats from "./SummaryStats.jsx";
import ColumnDetails from "./ColumnDetails.jsx";
import PreprocessingDetails from "./PreprocessingDetails.jsx";
import { getRawDatasetDetails } from "../../../services/privateService";
import DatasetHead from "./DatasetHead.jsx";

// const RAW_DATASET_DETAILS_URL = process.env.REACT_APP_RAW_OVERVIEW_PATH;

const DataSetOverview = () => {
  const [data, setData] = useState(null);
  const filename = useParams().filename;

  useEffect(() => {
    const loadData = async () => {
      const overview = await getRawDatasetDetails(filename);
      setData(overview.data.datastats);
      // console.log("filename:", overview.data.datastats.filename);
    };

    loadData();
  }, []);

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p>{data.error}</p>;

  const columnDetails = {};
  data.columnStats.forEach((column) => {
    columnDetails[column.name] = column.type;
  });

  return (
    <div>
      <SummaryStats
        filename={filename}
        numRows={data.numRows}
        numCols={data.numColumns}
      />
      <DatasetHead datasetHead={data.datasetHead} />
      <ColumnDetails columnStats={data.columnStats} />
      <PreprocessingDetails
        columns={columnDetails}
        filename={filename}
        directory="uploads"
      />
    </div>
  );
};

export default DataSetOverview;
