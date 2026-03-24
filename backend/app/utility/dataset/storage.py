import os
import shutil
from typing import Any, Dict, List

from dotenv import load_dotenv

from utility.dataset import layout

load_dotenv()


class LocalStorageManager:
    """
    Local filesystem replacement for the legacy remote manager.

    Dataset Parquet + metadata live under LOCAL_STORAGE_DIR/<folder>/.
    Ad-hoc uploads (e.g. CSV before ingest) use flat paths under base_dir.
    """

    def __init__(self):
        self.base_dir = os.getenv("LOCAL_STORAGE_DIR", "./storage")
        os.makedirs(self.base_dir, exist_ok=True)

    def get_path(self, filename: str) -> str:
        return os.path.join(self.base_dir, filename)

    def resolve_copy_source(self, source_name: str) -> str:
        """
        If source_name is a dataset API id (…parquet) and a dataset folder exists,
        return that folder path; otherwise the flat path under base_dir.
        """
        if (source_name or "").lower().endswith(".parquet"):
            fk = layout.folder_from_api_filename(source_name)
            folder = os.path.join(self.base_dir, fk)
            pq = os.path.join(folder, layout.PARQUET_NAME)
            if os.path.isdir(folder) and os.path.isfile(pq):
                return folder
        return self.get_path(source_name)

    async def save_file(self, source_path: str, filename: str) -> str:
        """
        Save an uploaded file into the local storage directory.

        Existing files are overwritten to preserve previous upload behavior.
        """
        destination = self.get_path(filename)
        os.makedirs(os.path.dirname(destination), exist_ok=True)
        shutil.copy2(source_path, destination)
        return destination

    def copy_to_local(self, source_name: str, dest_path: str) -> str:
        """
        Copy a file or directory from local storage to an arbitrary path.
        """
        source = self.resolve_copy_source(source_name)
        if not os.path.exists(source):
            raise FileNotFoundError(f"Source '{source_name}' not found in local storage")

        if os.path.isdir(source):
            if os.path.exists(dest_path):
                if os.path.isdir(dest_path):
                    shutil.rmtree(dest_path)
                else:
                    raise FileNotFoundError(
                        f"Cannot copy directory '{source_name}' to file '{dest_path}'"
                    )
            shutil.copytree(source, dest_path)
            return dest_path

        # Source is a file
        os.makedirs(os.path.dirname(os.path.abspath(dest_path)), exist_ok=True)
        shutil.copy2(source, dest_path)
        return dest_path

    async def list_files(self) -> Dict[str, Any]:
        """
        List all files/folders in storage in a structured payload.

        This keeps the old API-like shape so existing FE code that expects a
        content map continues to work.
        """
        contents: List[Dict[str, Any]] = []

        for entry in sorted(os.listdir(self.base_dir)):
            full_path = os.path.join(self.base_dir, entry)
            if os.path.isfile(full_path):
                size = os.path.getsize(full_path)
                contents.append(
                    {
                        "filename": entry,
                        "size": size,
                        "type": "FILE",
                        "modification_time": int(
                            os.path.getmtime(full_path) * 1000
                        ),
                        "permission": "",
                    }
                )
            elif os.path.isdir(full_path):
                total_size = self._get_directory_size(full_path)
                contents.append(
                    {
                        "filename": entry,
                        "size": total_size,
                        "type": "DIRECTORY",
                        "modification_time": int(
                            os.path.getmtime(full_path) * 1000
                        ),
                        "permission": "",
                    }
                )

        return {"contents": {"storage": contents}}

    def _get_directory_size(self, path: str) -> int:
        total_size = 0
        for root, _dirs, files in os.walk(path):
            for file_name in files:
                file_path = os.path.join(root, file_name)
                if os.path.isfile(file_path):
                    total_size += os.path.getsize(file_path)
        return total_size

    async def rename_file_or_folder(self, source_name: str, destination_name: str):
        """
        Rename/move a file or folder in the storage directory.
        """
        source = self.get_path(source_name)
        destination = self.get_path(destination_name)
        if not os.path.exists(source):
            raise FileNotFoundError(f"Source '{source_name}' does not exist")
        if source == destination:
            return
        if os.path.exists(destination):
            raise FileExistsError(f"Destination '{destination_name}' already exists")
        shutil.move(source, destination)

    async def delete_file(self, filename: str):
        """
        Delete a file or directory from storage.
        """
        path = self.get_path(filename)
        if not os.path.exists(path):
            raise FileNotFoundError(f"File '{filename}' not found in storage")

        if os.path.isdir(path):
            shutil.rmtree(path)
        else:
            os.remove(path)
