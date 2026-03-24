import json
import os
from typing import Any, Dict, List, Optional, Tuple

from utility.dataset import layout

from dotenv import load_dotenv

load_dotenv()


def _strip_dataset_head(datastats: Optional[dict]) -> Optional[dict]:
    if not datastats:
        return datastats
    out = dict(datastats)
    out.pop("datasetHead", None)
    return out


def load_meta(base_dir: str, api_filename: str) -> Optional[Dict[str, Any]]:
    path = layout.dataset_metadata_path(base_dir, api_filename)
    if not os.path.isfile(path):
        return None
    try:
        with open(path, encoding="utf-8") as f:
            return json.load(f)
    except (OSError, json.JSONDecodeError):
        return None


def save_meta(
    base_dir: str, api_filename: str, description: Optional[str], datastats: Optional[dict]
) -> None:
    ddir = layout.dataset_dir(base_dir, api_filename)
    os.makedirs(ddir, exist_ok=True)
    path = layout.dataset_metadata_path(base_dir, api_filename)
    doc = {
        "filename": api_filename,
        "description": description,
        "datastats": _strip_dataset_head(datastats),
    }
    with open(path, "w", encoding="utf-8") as f:
        json.dump(doc, f, indent=2, default=str)


def delete_meta(base_dir: str, api_filename: str) -> None:
    path = layout.dataset_metadata_path(base_dir, api_filename)
    if os.path.isfile(path):
        try:
            os.remove(path)
        except OSError:
            pass


def bump_api_in_doc(doc: Dict[str, Any], new_api: str) -> Dict[str, Any]:
    out = dict(doc)
    out["filename"] = new_api
    if out.get("datastats") and isinstance(out["datastats"], dict):
        ds = dict(out["datastats"])
        ds["filename"] = new_api
        out["datastats"] = ds
    return out


def update_column_descriptions(
    base_dir: str, api_filename: str, col_to_desc: dict
) -> Tuple[bool, Optional[str]]:
    doc = load_meta(base_dir, api_filename)
    if not doc or not doc.get("datastats"):
        return False, "Dataset not found."
    stats = doc["datastats"]
    column_stats = stats.get("columnStats")
    if not isinstance(column_stats, list):
        return False, "Invalid datastats."
    for item in column_stats:
        if isinstance(item, dict) and item.get("name") in col_to_desc:
            item["description"] = col_to_desc[item["name"]]
    save_meta(base_dir, api_filename, doc.get("description"), stats)
    return True, None


def list_dataset_summaries(
    base_dir: str, skip: int = 0, limit: int = 100
) -> Dict[str, Any]:
    all_keys = layout.list_dataset_folder_keys(base_dir)
    total = len(all_keys)
    page = all_keys[skip : skip + limit]
    datasets: List[Dict[str, Any]] = []
    for fk in page:
        api = layout.api_filename_from_folder(fk)
        meta = load_meta(base_dir, api)
        datasets.append(
            {
                "filename": api,
                "description": (meta or {}).get("description"),
            }
        )
    return {"datasets": datasets, "total": total}
