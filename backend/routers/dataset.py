"""Local dataset ingest, listing, details, preview, preprocessing, metadata."""

from concurrent.futures import ThreadPoolExecutor
from fastapi import APIRouter, Body, HTTPException, Query, status, UploadFile, File, Request
from fastapi.responses import JSONResponse
from typing import List, Tuple
import asyncio
import os
import tempfile
import shutil

from schemas.dataset import (
    DatasetCreate,
    DatasetListWithCountResponse,
    Operation,
    DatasetUpdate,
)
from utility.dataset.storage import LocalStorageManager
from utility.dataset.processing import DataProcessingManager
from utility.dataset import metadata as meta
from utility.dataset import layout
from dotenv import load_dotenv

load_dotenv()

executor = ThreadPoolExecutor(max_workers=os.cpu_count())

dataset_router = APIRouter(tags=["Dataset"])
file_upload_router = APIRouter(prefix="/file-upload", tags=["File Upload Router"])

storage_client = LocalStorageManager()
data_client = DataProcessingManager()


def _base() -> str:
    return storage_client.base_dir


async def _write_upload_to_temp_file(file: UploadFile) -> Tuple[str, str]:
    """Stream upload to a temp path. Caller must unlink the returned path."""
    uploaded_name = file.filename or "upload"
    _, suffix = os.path.splitext(uploaded_name)
    with tempfile.NamedTemporaryFile(
        delete=False, suffix=suffix if suffix else ""
    ) as temp_file:
        shutil.copyfileobj(file.file, temp_file)
        return temp_file.name, uploaded_name


async def process_create_dataset(filename: str, filetype: str):
    try:
        dataset_overview = await data_client.create_new_dataset(filename, filetype)
        description = f"Dataset created from {filename}"
        print(
            f"Overview of dataset: {dataset_overview['numRows']} rows, {dataset_overview['numColumns']} columns"
        )

        meta.save_meta(
            _base(),
            dataset_overview["filename"],
            description,
            dataset_overview,
        )
        return {"message": "Dataset created successfully"}
    except Exception as e:
        print("Error in processing the data is: ", str(e))
        return {"error": str(e)}


async def process_preprocessing(filename: str, operations: List[Operation]):
    base = _base()
    processing_api = layout.processing_api_filename(filename)
    try:
        doc_before = meta.load_meta(base, filename)

        await storage_client.rename_file_or_folder(
            layout.folder_from_api_filename(filename),
            layout.folder_from_api_filename(processing_api),
        )

        if doc_before:
            doc_p = meta.bump_api_in_doc(doc_before, processing_api)
            meta.save_meta(
                base, processing_api, doc_p.get("description"), doc_p.get("datastats")
            )
        else:
            meta.save_meta(
                base, processing_api, None, {"filename": processing_api}
            )

        processed_info = await data_client.preprocess_data(
            processing_api, [op.model_dump() for op in operations]
        )

        meta.save_meta(
            base,
            processed_info["filename"],
            f"Processed version of {filename}",
            processed_info,
        )

        doc_proc = meta.load_meta(base, processing_api)
        await storage_client.rename_file_or_folder(
            layout.folder_from_api_filename(processing_api),
            layout.folder_from_api_filename(filename),
        )
        if doc_proc:
            doc_back = meta.bump_api_in_doc(doc_proc, filename)
            meta.save_meta(
                base, filename, doc_back.get("description"), doc_back.get("datastats")
            )

        return {"message": "Preprocessing completed successfully"}
    except Exception as e:
        try:
            await storage_client.rename_file_or_folder(
                layout.folder_from_api_filename(processing_api),
                layout.folder_from_api_filename(filename),
            )
        except Exception:
            pass
        print("Error in preprocessing the data is: ", str(e))
        return {"error": str(e)}


async def _dataset_detail_payload(filename: str) -> dict:
    base = _base()
    pq = layout.dataset_parquet_path(base, filename)
    if not os.path.isfile(pq):
        raise HTTPException(status_code=404, detail="File not found")
    m = meta.load_meta(base, filename)
    if not m or not m.get("datastats"):
        overview = await data_client.refresh_overview_for_file(filename)
        if overview.get("message") == "Dataset not found.":
            raise HTTPException(status_code=404, detail="File not found")
        desc = (m or {}).get("description")
        meta.save_meta(base, filename, desc, overview)
        m = meta.load_meta(base, filename)
    return {
        "filename": m["filename"],
        "description": m.get("description"),
        "datastats": m.get("datastats"),
    }


@dataset_router.get("/preprocessing", summary="Test server connection")
def hello_server():
    return {"message": "Preprocessing router operational"}


def _list_result(skip: int, limit: int):
    result = meta.list_dataset_summaries(_base(), skip=skip, limit=limit)
    if isinstance(result, dict) and "error" in result:
        raise HTTPException(status_code=400, detail=result["error"])
    return result


@dataset_router.get("/list-datasets", response_model=DatasetListWithCountResponse)
def list_datasets_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    try:
        return _list_result(skip, limit)
    except Exception as e:
        print("Error in listing datasets: ", str(e))
        return {"error": str(e)}


@dataset_router.get("/dataset-details/{filename}", response_model=dict)
async def get_dataset_overview(filename: str):
    try:
        return await _dataset_detail_payload(filename)
    except HTTPException:
        raise
    except Exception as e:
        print("Error in getting dataset overview: ", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@dataset_router.get("/dataset-preview/{filename}", response_model=dict)
def get_dataset_preview(
    filename: str,
    n: int = Query(5, ge=0, le=500),
):
    try:
        rows = data_client.read_preview_rows(filename, n=n)
        return {"datasetHead": rows}
    except FileNotFoundError as e:
        raise HTTPException(status_code=404, detail=str(e)) from e
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


@dataset_router.put("/rename-dataset-file")
async def rename_dataset_file(
    old_file_name: str = Query(...),
    new_file_name: str = Query(...),
):
    try:
        base = _base()
        doc = meta.load_meta(base, old_file_name)
        await storage_client.rename_file_or_folder(
            layout.folder_from_api_filename(old_file_name),
            layout.folder_from_api_filename(new_file_name),
        )
        if doc:
            doc = meta.bump_api_in_doc(doc, new_file_name)
            meta.save_meta(
                base, new_file_name, doc.get("description"), doc.get("datastats")
            )
        return {"message": "Dataset renamed successfully."}
    except Exception as e:
        print("Error in renaming dataset: ", str(e))
        return {"error": str(e)}


@dataset_router.put("/edit-dataset-details")
async def edit_dataset_details_endpoint(newdetails: DatasetUpdate):
    try:
        base = _base()
        old_file_name = newdetails.old_filename
        if old_file_name != newdetails.filename:
            doc = meta.load_meta(base, old_file_name)
            await storage_client.rename_file_or_folder(
                layout.folder_from_api_filename(old_file_name),
                layout.folder_from_api_filename(newdetails.filename),
            )
            if doc:
                doc = meta.bump_api_in_doc(doc, newdetails.filename)
                doc["description"] = newdetails.description
                meta.save_meta(
                    base,
                    newdetails.filename,
                    newdetails.description,
                    doc.get("datastats"),
                )
            else:
                meta.save_meta(
                    base,
                    newdetails.filename,
                    newdetails.description,
                    {"filename": newdetails.filename},
                )
        else:
            doc = meta.load_meta(base, old_file_name)
            if doc:
                meta.save_meta(
                    base,
                    old_file_name,
                    newdetails.description,
                    doc.get("datastats"),
                )
            else:
                meta.save_meta(
                    base,
                    old_file_name,
                    newdetails.description,
                    {"filename": old_file_name},
                )

        return {"message": "Dataset details updated successfully"}
    except Exception as e:
        print("Error in editing dataset details: ", str(e))
        return {"error": str(e)}


@dataset_router.delete("/delete-dataset-file")
async def delete_dataset_file(filename: str = Query(...)):
    try:
        try:
            await storage_client.delete_file(layout.folder_from_api_filename(filename))
        except Exception as e:
            print("Failed to delete dataset folder from local storage (continuing):", str(e))

        return {"message": "Dataset deleted successfully."}
    except Exception as e:
        print("Error in deleting dataset: ", str(e))
        return {"error": str(e)}


@dataset_router.post("/create-new-dataset", status_code=status.HTTP_202_ACCEPTED)
async def create_new_dataset(file: UploadFile = File(...)):
    try:
        filename = file.filename
        filetype = filename.split(".")[-1].lower()

        if filetype not in ["csv", "parquet"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Supported formats: CSV, Parquet",
            )

        temp_file_path, _ = await _write_upload_to_temp_file(file)

        try:
            await storage_client.save_file(temp_file_path, filename)
            executor.submit(asyncio.run, process_create_dataset(filename, filetype))
            return JSONResponse(
                status_code=200,
                content={
                    "message": "✅ File uploaded successfully and dataset processing started",
                    "filename": filename,
                    "file_size": file.size,
                },
            )
        finally:
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error during file upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"❌ Upload failed: {str(e)}")


@dataset_router.post("/preprocess-dataset", status_code=status.HTTP_202_ACCEPTED)
async def preprocess_dataset_endpoint(request: Request):
    data = await request.json()
    fname = data.get("filename")
    if not fname:
        raise HTTPException(status_code=400, detail="filename is required")
    ops = data.get("operations") or []
    operations: List[Operation] = []
    for o in ops:
        if isinstance(o, dict):
            operations.append(Operation(**o))
        elif isinstance(o, Operation):
            operations.append(o)
    executor.submit(asyncio.run, process_preprocessing(fname, operations))
    return {"message": "Preprocessing initiated"}


@dataset_router.put("/update-column-description/{filename}")
async def update_column_description(
    filename: str, description: dict = Body(...)
):
    try:
        ok, err = meta.update_column_descriptions(_base(), filename, description)
        if not ok:
            raise HTTPException(status_code=400, detail=err or "Update failed")
        return {"message": "Column descriptions updated successfully."}
    except HTTPException:
        raise
    except Exception as e:
        print("Error in updating column description: ", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@dataset_router.post("/create-dataset", status_code=201)
def create_dataset_metadata_endpoint(dataset: DatasetCreate):
    try:
        meta.save_meta(
            _base(),
            dataset.filename,
            dataset.description,
            dataset.datastats,
        )
        return {"message": "Dataset metadata saved", "filename": dataset.filename}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e)) from e


# Legacy URL aliases (hidden from OpenAPI). Prefer canonical routes above.
@dataset_router.get(
    "/list-raw-datasets",
    response_model=DatasetListWithCountResponse,
    include_in_schema=False,
    deprecated=True,
)
def list_raw_datasets_legacy(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
):
    return list_datasets_endpoint(skip=skip, limit=limit)


@dataset_router.get(
    "/raw-dataset-details/{filename}",
    response_model=dict,
    include_in_schema=False,
    deprecated=True,
)
async def get_raw_dataset_details_legacy(filename: str):
    return await get_dataset_overview(filename)


@dataset_router.put("/rename-raw-dataset-file", include_in_schema=False, deprecated=True)
async def rename_raw_dataset_legacy(
    old_file_name: str = Query(...),
    new_file_name: str = Query(...),
):
    return await rename_dataset_file(
        old_file_name=old_file_name, new_file_name=new_file_name
    )


@dataset_router.put("/edit-raw-dataset-details", include_in_schema=False, deprecated=True)
async def edit_raw_dataset_details_legacy(newdetails: DatasetUpdate):
    return await edit_dataset_details_endpoint(newdetails)


@dataset_router.delete("/delete-raw-dataset-file", include_in_schema=False, deprecated=True)
async def delete_raw_dataset_legacy(filename: str = Query(...)):
    return await delete_dataset_file(filename)


@dataset_router.put("/update-column-description-raw/{filename}", include_in_schema=False, deprecated=True)
async def update_column_description_raw_legacy(
    filename: str, description: dict = Body(...)
):
    return await update_column_description(filename, description)


@dataset_router.put("/update-column-description-processed/{filename}", include_in_schema=False, deprecated=True)
async def update_column_description_processed_legacy(
    filename: str, description: dict = Body(...)
):
    return await update_column_description(filename, description)


@dataset_router.post("/create-raw-dataset", status_code=201, include_in_schema=False, deprecated=True)
def create_raw_dataset_legacy(dataset: DatasetCreate):
    return create_dataset_metadata_endpoint(dataset)


@dataset_router.get("/list-recent-uploads", include_in_schema=False, deprecated=True)
async def list_recent_uploads_legacy():
    return await storage_client.list_files()


@dataset_router.delete("/delete-recent-uploaded-file", include_in_schema=False, deprecated=True)
async def delete_recent_uploaded_file_legacy(
    directory: str = Query(...),
    filename: str = Query(...),
):
    _ = directory  # legacy param; never used
    await storage_client.delete_file(filename)
    return {"message": "File deleted successfully"}


@file_upload_router.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        temp_file_path, uploaded_name = await _write_upload_to_temp_file(file)

        try:
            saved_path = await storage_client.save_file(temp_file_path, uploaded_name)
            return JSONResponse(
                status_code=200,
                content={
                    "message": "✅ File uploaded successfully!",
                    "filename": uploaded_name,
                    "storage_path": saved_path,
                    "file_size": file.size,
                },
            )
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                os.unlink(temp_file_path)
    except Exception as e:
        print(f"Error during file upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"❌ Upload failed: {str(e)}")


@file_upload_router.get("/list-files")
async def list_uploaded_files():
    try:
        result = await storage_client.list_files()
        return JSONResponse(status_code=200, content=result)
    except Exception as e:
        print(f"Error listing files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")


@file_upload_router.delete("/delete/{filename}")
async def delete_uploaded_file(filename: str):
    try:
        await storage_client.delete_file(filename)
        return JSONResponse(
            status_code=200,
            content={
                "message": f"✅ File {filename} deleted from storage successfully!",
                "filename": filename,
            },
        )

    except Exception as e:
        print(f"Error deleting file: {str(e)}")
        raise HTTPException(
            status_code=500, detail=f"❌ Failed to delete file: {str(e)}"
        )
