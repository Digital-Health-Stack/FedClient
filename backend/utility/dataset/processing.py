import os
import uuid
from datetime import date, datetime
from pathlib import Path
from typing import Any, Dict, List

import numpy as np
import pandas as pd

from dotenv import load_dotenv

from utility.dataset import layout
from utility.dataset.storage import LocalStorageManager
from utility.dataset.helpers import All_Column_Operations, Column_Operations

load_dotenv()


def serialize_for_json(obj):
    """
    Convert non-JSON-serializable objects to JSON-compatible values.
    """
    if isinstance(obj, dict):
        return {key: serialize_for_json(value) for key, value in obj.items()}
    if isinstance(obj, list):
        return [serialize_for_json(item) for item in obj]
    if isinstance(obj, (date, datetime)):
        return obj.isoformat()
    if isinstance(obj, np.integer):
        return int(obj)
    if isinstance(obj, np.floating):
        if np.isnan(obj) or np.isinf(obj):
            return None
        return float(obj)
    if isinstance(obj, np.ndarray):
        return obj.tolist()
    if isinstance(obj, np.bool_):
        return bool(obj)
    if isinstance(obj, float):
        if np.isnan(obj) or obj == float("inf") or obj == float("-inf"):
            return None
        return obj
    return obj


class DataProcessingManager:
    """
    Pandas-based data processing manager replacing legacy implementation.
    Each dataset lives in storage/<folder>/dataset.parquet (+ metadata.json).
    """

    def __init__(self):
        self.local_storage = LocalStorageManager()

    @property
    def _base(self) -> str:
        return self.local_storage.base_dir

    def _parquet_path(self, api_filename: str) -> str:
        return layout.dataset_parquet_path(self._base, api_filename)

    def _dtype_name(self, dtype) -> str:
        if pd.api.types.is_integer_dtype(dtype):
            return "IntegerType()"
        if pd.api.types.is_float_dtype(dtype):
            return "DoubleType()"
        if pd.api.types.is_bool_dtype(dtype):
            return "BooleanType()"
        if pd.api.types.is_datetime64_any_dtype(dtype):
            return "TimestampType()"
        if pd.api.types.is_object_dtype(dtype) or pd.api.types.is_string_dtype(dtype):
            return "StringType()"
        if pd.api.types.is_categorical_dtype(dtype):
            return "StringType()"
        return str(dtype)

    async def delete_file(self, api_filename: str):
        fk = layout.folder_from_api_filename(api_filename)
        return await self.local_storage.delete_file(fk)

    async def _get_overview(self, df: pd.DataFrame, api_filename: str, tmp_deletion=True):
        if df is None or df.empty:
            return {"message": "Dataset not found.", "filename": api_filename}

        overview_rows: List[Dict[str, Any]] = []
        for col in df.columns:
            series = df[col]
            stats: Dict[str, Any] = {
                "name": col,
                "type": self._dtype_name(series.dtype),
                "entries": int(series.notna().sum()),
                "nullCount": int(series.isna().sum()),
            }

            try:
                if pd.api.types.is_numeric_dtype(series.dtype):
                    non_null = series.dropna()
                    if len(non_null) > 0:
                        stats.update(
                            {
                                "mean": serialize_for_json(non_null.mean()),
                                "stddev": serialize_for_json(non_null.std()),
                                "min": serialize_for_json(non_null.min()),
                                "max": serialize_for_json(non_null.max()),
                                "uniqueCount": int(non_null.nunique()),
                            }
                        )
                        q1 = float(non_null.quantile(0.25))
                        q2 = float(non_null.quantile(0.5))
                        q3 = float(non_null.quantile(0.75))
                        stats["quartiles"] = {
                            "Q1": q1,
                            "median": q2,
                            "Q3": q3,
                            "IQR": q3 - q1,
                        }

                        counts, edges = np.histogram(
                            non_null, bins=10, range=(non_null.min(), non_null.max() or 1)
                        )
                        stats["histogram"] = {
                            "bins": [serialize_for_json(v) for v in edges.tolist()],
                            "counts": [int(v) for v in counts.tolist()],
                        }
                    else:
                        stats.update(
                            {
                                "mean": None,
                                "stddev": None,
                                "min": None,
                                "max": None,
                                "uniqueCount": 0,
                                "quartiles": {"Q1": None, "median": None, "Q3": None, "IQR": None},
                                "histogram": {"bins": [], "counts": []},
                            }
                        )
                else:
                    stats["uniqueCount"] = int(series.nunique(dropna=True))
                    top_cats = series.value_counts(dropna=False).head(10)
                    stats["topCategories"] = [
                        {
                            "value": value,
                            "count": int(count),
                        }
                        for value, count in top_cats.items()
                    ]
            except Exception:
                pass

            overview_rows.append(serialize_for_json(stats))

        overview: Dict[str, Any] = {
            "numRows": int(len(df)),
            "numColumns": int(len(df.columns)),
            "columnStats": overview_rows,
            "filename": api_filename,
        }

        return overview

    def read_preview_rows(self, api_filename: str, n: int = 5) -> List[Dict[str, Any]]:
        source_path = self._parquet_path(api_filename)
        if not os.path.exists(source_path):
            raise FileNotFoundError(f"Dataset '{api_filename}' not found in local storage")
        df = pd.read_parquet(source_path)
        n = max(0, min(int(n), 500))
        if df.empty or n == 0:
            return []
        return serialize_for_json(df.head(n).to_dict(orient="records"))

    async def create_new_dataset(self, upload_filename: str, filetype: str):
        filetype = (filetype or "").lower()
        source_path = self.local_storage.get_path(upload_filename)
        if not os.path.exists(source_path):
            raise FileNotFoundError(f"File '{upload_filename}' not found in local storage")

        if filetype == "csv":
            df = pd.read_csv(source_path)
        elif filetype == "parquet":
            df = pd.read_parquet(source_path)
        else:
            raise ValueError(f"Unsupported file type '{filetype}'")

        stem = Path(upload_filename).stem
        folder_key = layout.unique_folder_key(self._base, stem)
        ddir = os.path.join(self._base, folder_key)
        os.makedirs(ddir, exist_ok=True)
        output_path = os.path.join(ddir, layout.PARQUET_NAME)
        df.to_parquet(output_path, index=False)
        await self.local_storage.delete_file(upload_filename)

        api = layout.api_filename_from_folder(folder_key)
        return await self._get_overview(df, api)

    async def preprocess_data(self, api_filename: str, operations: List[Dict[str, Any]]):
        source_path = self._parquet_path(api_filename)
        if not os.path.exists(source_path):
            raise FileNotFoundError(f"Dataset '{api_filename}' not found in local storage")

        df = pd.read_parquet(source_path)
        all_cols = list(df.columns)
        numeric_cols = [
            column for column in all_cols if pd.api.types.is_numeric_dtype(df[column].dtype)
        ]

        for step in operations:
            if not isinstance(step, dict):
                continue

            if step.get("operation") == "Exclude from All Columns list":
                column = step.get("column")
                if column in all_cols:
                    all_cols.remove(column)
                if column in numeric_cols:
                    numeric_cols.remove(column)
                continue

            if step.get("column") == "All Columns":
                try:
                    df = All_Column_Operations(df, step, numeric_cols, all_cols)
                except Exception:
                    pass
            else:
                try:
                    df = Column_Operations(df, step)
                except Exception:
                    pass

            all_cols = list(df.columns)
            numeric_cols = [
                column for column in all_cols if pd.api.types.is_numeric_dtype(df[column].dtype)
            ]

        src_folder = layout.folder_from_api_filename(api_filename)
        new_folder = layout.preprocess_output_folder_key(src_folder)
        ddir = os.path.join(self._base, new_folder)
        os.makedirs(ddir, exist_ok=True)
        output_path = os.path.join(ddir, layout.PARQUET_NAME)
        df.to_parquet(output_path, index=False)

        api_out = layout.api_filename_from_folder(new_folder)
        overview = await self._get_overview(df, api_out, tmp_deletion=False)
        overview["filename"] = api_out
        return overview

    async def refresh_overview_for_file(self, api_filename: str) -> Dict[str, Any]:
        source_path = self._parquet_path(api_filename)
        if not os.path.exists(source_path):
            return {"message": "Dataset not found.", "filename": api_filename}
        df = pd.read_parquet(source_path)
        return await self._get_overview(df, api_filename)

    async def create_qpd_dataset(self, api_filename: str, num_points: int):
        source_path = self._parquet_path(api_filename)
        if not os.path.exists(source_path):
            raise FileNotFoundError(f"Dataset '{api_filename}' not found in local storage")

        df = pd.read_parquet(source_path)
        num_points = int(num_points or 0)
        if num_points <= 0:
            raise ValueError("num_points must be > 0")

        sample_size = min(num_points, len(df))
        df_subset = df.sample(n=sample_size)
        folder_key = layout.unique_folder_key(
            self._base, f"qpd_{uuid.uuid4().hex[:12]}"
        )
        ddir = os.path.join(self._base, folder_key)
        os.makedirs(ddir, exist_ok=True)
        output_path = os.path.join(ddir, layout.PARQUET_NAME)
        df_subset.to_parquet(output_path, index=False)

        api_out = layout.api_filename_from_folder(folder_key)
        overview = await self._get_overview(df_subset, api_out)
        overview["datapath"] = output_path
        return overview
