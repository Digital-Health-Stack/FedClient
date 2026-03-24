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
import {
  getDatasetDetails,
  getDatasetPreview,
  updateColumnDescription,
} from "../../../services/privateService";
import DatasetHead from "./DatasetHead.jsx";

// const RAW_DATASET_DETAILS_URL = process.env.REACT_APP_RAW_OVERVIEW_PATH;

const DataSetOverview = () => {
  const [data, setData] = useState(null);
  const [previewRows, setPreviewRows] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(true);
  const [selectedColumnIndex, setSelectedColumnIndex] = useState(0);
  const headRef = useRef(null);
  const columnsRef = useRef(null);
  const filename = useParams().filename;
  const sections = [
    {
      id: "summary",
      title: "Overview",
      icon: <InformationCircleIcon className="w-5 h-5 " />,
    },
    {
      id: "head",
      title: "View Top Rows",
      icon: <TableCellsIcon className="w-5 h-5 " />,
    },
    {
      id: "columns",
      title: "View Summary",
      icon: <ChartBarIcon className="w-5 h-5 " />,
    },
    {
      id: "preprocessing",
      title: "Clean/Preprocess Data",
      icon: <WrenchIcon className="w-5 h-5 " />,
    },
  ];
  useEffect(() => {
    if (!filename) return;

    const loadData = async () => {
      setPreviewLoading(true);
      setPreviewRows(null);
      try {
        const overview = await getDatasetDetails(filename);
        setData(overview.data.datastats);
      } catch (e) {
        console.error(e);
        setData({ error: "Failed to load dataset details" });
      }
      try {
        const prev = await getDatasetPreview(filename, 5);
        setPreviewRows(prev.data?.datasetHead ?? []);
      } catch (e) {
        console.error(e);
        setPreviewRows([]);
      } finally {
        setPreviewLoading(false);
      }
    };

    loadData();
  }, [filename]);

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

  const sendToBackend = (editedDescriptions) => {
    updateColumnDescription(data.filename, editedDescriptions);
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
          datasetHead={previewRows}
          previewLoading={previewLoading}
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
            sendToBackend={sendToBackend}
          />
        )}
      </section>
      <section id="preprocessing" className="scroll-mt-20 mt-12">
        <PreprocessingDetails
          columns={columnDetails}
          filename={filename}
          directory="raw"
        />
      </section>
    </DatasetLayout>
  );
};

export default DataSetOverview;
