"""
Layout: LOCAL_STORAGE_DIR/<folder_key>/dataset.parquet + metadata.json
API exposes stable ids as "<folder_key>.parquet" (virtual extension).
"""

import os
import re
import uuid
from typing import List, Tuple

PARQUET_NAME = "dataset.parquet"
METADATA_NAME = "metadata.json"


def folder_from_api_filename(api_filename: str) -> str:
    a = (api_filename or "").strip()
    if a.lower().endswith(".parquet"):
        return a[: -len(".parquet")]
    return a


def api_filename_from_folder(folder_key: str) -> str:
    fk = folder_key.strip()
    if fk.lower().endswith(".parquet"):
        return fk
    return f"{fk}.parquet"


def sanitize_folder_stem(stem: str) -> str:
    s = re.sub(r"[^\w\-.]", "_", stem)
    s = s.strip("._") or "dataset"
    return s[:120]


def dataset_dir(base_dir: str, api_filename: str) -> str:
    return os.path.join(base_dir, folder_from_api_filename(api_filename))


def dataset_parquet_path(base_dir: str, api_filename: str) -> str:
    return os.path.join(dataset_dir(base_dir, api_filename), PARQUET_NAME)


def dataset_metadata_path(base_dir: str, api_filename: str) -> str:
    return os.path.join(dataset_dir(base_dir, api_filename), METADATA_NAME)


def unique_folder_key(base_dir: str, stem: str) -> str:
    candidate = sanitize_folder_stem(stem)
    if not candidate:
        candidate = "dataset"
    base_c = candidate
    n = 0
    while os.path.exists(os.path.join(base_dir, candidate)):
        n += 1
        candidate = f"{base_c}_{n}"
    return candidate


def list_dataset_folder_keys(base_dir: str) -> List[str]:
    if not os.path.isdir(base_dir):
        return []
    keys: List[Tuple[float, str]] = []
    for entry in os.listdir(base_dir):
        if "__PROCESSING__" in entry:
            continue
        full = os.path.join(base_dir, entry)
        if not os.path.isdir(full):
            continue
        pq = os.path.join(full, PARQUET_NAME)
        if os.path.isfile(pq):
            keys.append((os.path.getmtime(full), entry))
    keys.sort(key=lambda x: x[0], reverse=True)
    return [k for _m, k in keys]


def processing_api_filename(api_filename: str) -> str:
    folder = folder_from_api_filename(api_filename)
    return api_filename_from_folder(f"{folder}__PROCESSING__")


def preprocess_output_folder_key(src_processing_folder: str) -> str:
    return f"{src_processing_folder}_{uuid.uuid4().hex}"
