import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import SummaryStats from "./SummaryStats.jsx";
import ColumnDetails from "./ColumnDetails.jsx";
import PreprocessingDetails from "./PreprocessingDetails.jsx";
import DatasetLayout from "./ProcessingComponents/DatasetLayout.jsx";
import {
  ChartBarIcon,
  InformationCircleIcon,
  TableCellsIcon,
  WrenchIcon,
} from "@heroicons/react/24/outline";
import { getRawDatasetDetails } from "../../../services/privateService";
import DatasetHead from "./DatasetHead.jsx";

// const RAW_DATASET_DETAILS_URL = process.env.REACT_APP_RAW_OVERVIEW_PATH;

const DataSetOverview = () => {
  const [data, setData] = useState(null);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);
  const headRef = useRef(null);
  const columnsRef = useRef(null);
  const filename = useParams().filename;
  const sections = [
    {
      id: "summary",
      title: "Overview",
      icon: <InformationCircleIcon className="w-5 h-5" />,
    },
    {
      id: "head",
      title: "Sample Data",
      icon: <TableCellsIcon className="w-5 h-5" />,
    },
    {
      id: "columns",
      title: "Column Analysis",
      icon: <ChartBarIcon className="w-5 h-5" />,
    },
    {
      id: "preprocessing",
      title: "Data Preprocessing",
      icon: <WrenchIcon className="w-5 h-5" />,
    },
  ];
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

  // Handler for column click that scrolls both sections into view
  const handleColumnHeaderClick = (col, idx) => {
    setSelectedColumnIndex(idx);
    if (columnsRef.current)
      columnsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    if (headRef.current)
      headRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
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
      <section id="head" className="scroll-mt-20 mt-12" ref={headRef}>
        <DatasetHead
          datasetHead={data.datasetHead}
          onColumnHeaderClick={handleColumnHeaderClick}
          selectedColumnIndex={selectedColumnIndex}
          columnDescriptions={Object.fromEntries(
            data.columnStats.map((col) => [col.name, col.description])
          )}
        />
      </section>
      <section id="columns" className="scroll-mt-20 mt-12" ref={columnsRef}>
        {data?.columnStats && (
          <ColumnDetails
            columnStats={data.columnStats}
            selectedColumnIndex={selectedColumnIndex}
          />
        )}
      </section>
      <section id="preprocessing" className="scroll-mt-20 mt-12">
        <PreprocessingDetails
          columns={columnDetails}
          filename={filename}
          directory={process.env.REACT_APP_HDFS_RAW_DATASETS_DIR}
        />
      </section>
    </DatasetLayout>
  );
};

export default DataSetOverview;
