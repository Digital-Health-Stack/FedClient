import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import {
  ChartBarIcon,
  InformationCircleIcon,
  TableCellsIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import SummaryStats from "./SummaryStats.jsx";
import ColumnDetails from "./ColumnDetails.jsx";
import PreprocessingDetails from "./PreprocessingDetails.jsx";
import DatasetLayout from "./ProcessingComponents/DatasetLayout.jsx";
import {
  getDatasetDetails,
  updateColumnDescriptionProcessed,
} from "../../../services/privateService";
import DatasetHead from "./DatasetHead.jsx";
// const PROCESSED_DATASET_DETAILS_URL =
//   process.env.REACT_APP_PROCESSED_OVERVIEW_PATH;

const DataSetOverview = () => {
  const [data, setData] = useState(null);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);
  const filename = useParams().filename;

  const sections = [
    {
      id: "summary",
      title: "Overview",
      icon: <InformationCircleIcon className="w-5 h-5" />,
    },
    // {
    //   id: "head",
    //   title: "Dataset Head",
    //   icon: <TableCellsIcon className="w-5 h-5" />,
    // },
    {
      id: "columns",
      title: "View Summary",
      icon: <ChartBarIcon className="w-5 h-5" />,
    },
    {
      id: "preprocessing",
      title: "Clean/Preprocess Data",
      icon: <WrenchIcon className="w-5 h-5" />,
    },
  ];

  useEffect(() => {
    const loadData = async () => {
      const overview = await getDatasetDetails(filename);
      setData(overview.data.datastats);
    };

    loadData();
  }, []);

  if (!data) return <p>Loading...</p>;
  if (data.error) return <p>{data.error}</p>;

  const columnDetails = {};
  data.columnStats.forEach((column) => {
    columnDetails[column.name] = column.type;
  });

  const sendToBackend = (editedDescriptions) => {
    updateColumnDescriptionProcessed(filename, editedDescriptions);
  };

  return (
    <DatasetLayout sections={sections}>
      <section id="summary" className="scroll-mt-20">
        <SummaryStats
          filename={filename}
          numRows={data.numRows}
          numCols={data.numColumns}
        />
      </section>
      {data.datasetHead && (
        <section id="head" className="scroll-mt-20 mt-12">
          <DatasetHead
            datasetHead={data.datasetHead}
            onColumnHeaderClick={(col, idx) => setSelectedColumnIndex(idx)}
            selectedColumnIndex={selectedColumnIndex}
            columnDescriptions={Object.fromEntries(
              data.columnStats.map((col) => [col.name, col.description])
            )}
          />
        </section>
      )}
      <section id="columns" className="scroll-mt-20 mt-12">
        {data?.columnStats && (
          <ColumnDetails
            columnStats={data.columnStats}
            selectedColumnIndex={selectedColumnIndex}
            sendToBackend={sendToBackend}
          />
        )}
      </section>
      <section id="preprocessing" className="scroll-mt-20 mt-12">
        <PreprocessingDetails
          columns={columnDetails}
          filename={filename}
          directory="processed"
        />
      </section>
    </DatasetLayout>
  );
};

export default DataSetOverview;
