from fastapi import APIRouter, HTTPException, Depends, Query, status, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi import Request
from sqlalchemy.orm import Session
from typing import List
import asyncio
import os
import tempfile
import shutil
from concurrent.futures import ThreadPoolExecutor

from schemas.dataset import (
    DatasetCreate,
    RawDatasetListResponse,
    DatasetListResponse,
    Operation,
    DatasetUpdate,
)

from crud.datasets_crud import (
    create_raw_dataset,
    delete_raw_dataset,
    rename_raw_dataset,
    list_raw_datasets,
    get_raw_dataset_stats,
    create_dataset,
    delete_dataset,
    rename_dataset,
    list_datasets,
    get_dataset_stats,
    get_data_filename_by_id,
    get_raw_data_filename_by_id,
    edit_dataset_details,
    edit_raw_dataset_details,
    handle_file_renaming_during_processing,
    update_column_description,
    update_column_description_in_dataset,
)

from utility.db import get_db
from utility.hdfs_services import HDFSServiceManager
from utility.spark_services import SparkSessionManager
from dotenv import load_dotenv

load_dotenv()

executor = ThreadPoolExecutor(max_workers=os.cpu_count())

dataset_router = APIRouter(tags=["Dataset"])

HDFS_RAW_DATASETS_DIR = os.getenv("HDFS_RAW_DATASETS_DIR")
HDFS_PROCESSED_DATASETS_DIR = os.getenv("HDFS_PROCESSED_DATASETS_DIR")
RECENTLY_UPLOADED_DATASETS_DIR = os.getenv("RECENTLY_UPLOADED_DATASETS_DIR")
HDFS_NEW_TARGET_PATH = (
    f"/user/{os.getenv('HADOOP_USER_NAME')}/{os.getenv('HDFS_RAW_DATASETS_DIR')}"
)
HDFS_TARGET_PATH = f"/user/{os.getenv('HADOOP_USER_NAME')}/{os.getenv('RECENTLY_UPLOADED_DATASETS_DIR')}"

hdfs_client = HDFSServiceManager()
spark_client = SparkSessionManager()


###################### Background processing tasks ######################
async def process_create_dataset(filename: str, filetype: str):
    db = next(get_db())
    print("Processing dataset: ", filename, filetype)
    try:
        source_path = f"{HDFS_TARGET_PATH}/{filename}"
        # processing_path = f"{source_path}__PROCESSING__"
        # await hdfs_client.rename_file_or_folder(source_path, processing_path)
        dataset_overview = await spark_client.create_new_dataset(
            f"{filename}", filetype
        )
        description = f"Raw dataset created from {filename}"
        print(
            f"Overview of dataset: {dataset_overview['numRows']} rows, {dataset_overview['numColumns']} columns"
        )

        dataset_obj = DatasetCreate(
            filename=dataset_overview["filename"],
            description=description,
            datastats=dataset_overview,
        )

        # Create raw dataset entry
        crud_result = create_raw_dataset(db, dataset_obj)
        if isinstance(crud_result, dict) and "error" in crud_result:
            raise HTTPException(status_code=400, detail=crud_result["error"])
        return {"message": "Dataset created successfully"}
    except Exception as e:
        print("Error in processing the data is: ", str(e))
        return {"error": str(e)}
    finally:
        db.close()


async def process_preprocessing(
    directory: str, filename: str, operations: List[Operation]
):
    db = next(get_db())
    try:
        processing_path = f"{directory}/{filename}__PROCESSING__"
        await hdfs_client.rename_file_or_folder(
            f"{directory}/{filename}", processing_path
        )

        renaming_result = handle_file_renaming_during_processing(
            db, filename, f"{filename}__PROCESSING__", directory
        )
        if isinstance(renaming_result, dict) and "error" in renaming_result:
            raise HTTPException(status_code=400, detail=renaming_result["error"])

        # Process data and get new filename
        processed_info = await spark_client.preprocess_data(
            directory, f"{filename}__PROCESSING__", operations
        )

        # Create new dataset entry
        new_dataset = DatasetCreate(
            filename=processed_info["filename"],
            description=f"Processed version of {filename}",
            datastats=processed_info,
        )
        crud_result = create_dataset(db, dataset=new_dataset)
        if isinstance(crud_result, dict) and "error" in crud_result:
            raise HTTPException(status_code=400, detail=crud_result["error"])

        await hdfs_client.rename_file_or_folder(
            processing_path, f"{directory}/{filename}"
        )

        renaming_result = handle_file_renaming_during_processing(
            db, f"{filename}__PROCESSING__", filename, directory
        )
        if isinstance(renaming_result, dict) and "error" in renaming_result:
            raise HTTPException(status_code=400, detail=renaming_result["error"])
        return {"message": "Preprocessing completed successfully"}

    except Exception as e:
        await hdfs_client.rename_file_or_folder(
            processing_path, f"{directory}/{filename}", ignore_missing=True
        )
        handle_file_renaming_during_processing(
            db, f"{filename}__PROCESSING__", filename, directory
        )
        print("Error in preprocessing the data is: ", str(e))
        return {"error": str(e)}
    finally:
        db.close()


######################## Dataset Routes #######################


@dataset_router.get("/preprocessing", summary="Test server connection")
def hello_server():
    return {"message": "Preprocessing router operational"}


############ Raw Dataset Management Routes
@dataset_router.get("/list-raw-datasets", response_model=List[RawDatasetListResponse])
def list_raw_datasets_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    try:
        result = list_raw_datasets(db, skip=skip, limit=limit)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        print("Error in listing raw datasets: ", str(e))
        return {"error": str(e)}


@dataset_router.get("/raw-dataset-details/{filename}", response_model=dict)
def get_raw_dataset_overview(filename: str, db: Session = Depends(get_db)):
    try:
        result = get_raw_dataset_stats(db, filename=filename)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except Exception as e:
        print("Error in getting raw dataset overview: ", str(e))
        return {"error": str(e)}


# later change this to old_dataset_id and new filename
@dataset_router.put("/rename-raw-dataset-file")
async def rename_raw_dataset_file(
    old_file_name: str = Query(...),
    new_file_name: str = Query(...),
    db: Session = Depends(get_db),
):
    try:
        # Rename the file in HDFS
        await hdfs_client.rename_file_or_folder(
            f"{HDFS_RAW_DATASETS_DIR}/{old_file_name}",
            f"{HDFS_RAW_DATASETS_DIR}/{new_file_name}",
        )

        # Update the filename in the database
        result = rename_raw_dataset(db, old_file_name, new_file_name)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result

    except Exception as e:
        print("Error in renaming raw dataset: ", str(e))
        return {"error": str(e)}


@dataset_router.put("/edit-raw-dataset-details")
async def edit_raw_dataset(newdetails: DatasetUpdate, db: Session = Depends(get_db)):
    try:
        # get dataset name and edit on hdfs
        old_file_name = get_raw_data_filename_by_id(db, newdetails.dataset_id)
        if isinstance(old_file_name, dict) and "error" in old_file_name:
            raise HTTPException(status_code=404, detail=old_file_name["error"])

        if old_file_name != newdetails.filename:
            await hdfs_client.rename_file_or_folder(
                f"{HDFS_RAW_DATASETS_DIR}/{old_file_name}",
                f"{HDFS_RAW_DATASETS_DIR}/{newdetails.filename}",
            )

        result = edit_raw_dataset_details(db, newdetails)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return {"message": "Raw dataset details updated successfully"}
    except Exception as e:
        print("Error in editing raw dataset details: ", str(e))
        return {"error": str(e)}


@dataset_router.delete("/delete-raw-dataset-file")
async def delete_raw_dataset_file(
    dataset_id: str = Query(...), db: Session = Depends(get_db)
):
    try:
        # Delete the file from HDFS
        filename = get_raw_data_filename_by_id(db, dataset_id)
        if isinstance(filename, dict) and "error" in filename:
            raise HTTPException(status_code=404, detail=filename["error"])

        await hdfs_client.delete_file_from_hdfs(HDFS_RAW_DATASETS_DIR, filename)

        result = delete_raw_dataset(db, dataset_id)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except Exception as e:
        print("Error in deleting raw dataset: ", str(e))
        return {"error": str(e)}


@dataset_router.post("/create-new-dataset", status_code=status.HTTP_202_ACCEPTED)
async def create_new_dataset(file: UploadFile = File(...)):
    # async def create_new_dataset(request: Request):
    try:
        print(f"Upload started for file: {file.filename}")
        filename = file.filename
        filetype = filename.split(".")[-1].lower()

        if filetype not in ["csv", "parquet"]:
            raise HTTPException(
                status_code=400,
                detail="Invalid file type. Supported formats: CSV, Parquet",
            )
        # Create a temporary file to store the uploaded content
        with tempfile.NamedTemporaryFile(
            delete=False, suffix=os.path.splitext(file.filename)[1]
        ) as temp_file:
            # Write the uploaded file content to temporary file
            shutil.copyfileobj(file.file, temp_file)
            temp_file_path = temp_file.name

        try:
            # Use the existing HDFS service to upload the file
            hdfs_path = f"{HDFS_TARGET_PATH}/{file.filename}"

            # Upload using the HDFS client - pass the file path, not the file object
            def upload_to_hdfs(client):
                client.upload(hdfs_path, temp_file_path, overwrite=True)
                print(f"File uploaded to HDFS: {hdfs_path}")
                return {"message": "File uploaded successfully", "hdfs_path": hdfs_path}

            result = hdfs_client._with_hdfs_client(upload_to_hdfs)
            executor.submit(asyncio.run, process_create_dataset(filename, filetype))
            return JSONResponse(
                status_code=200,
                content={
                    "message": "✅ File uploaded to HDFS successfully! and dataset processing started",
                    "filename": file.filename,
                    "hdfs_path": hdfs_path,
                    "file_size": file.size,
                },
            )

        finally:
            # Clean up the temporary file
            if os.path.exists(temp_file_path):
                os.unlink(temp_file_path)

    except Exception as e:
        print(f"Error during file upload: {str(e)}")
        raise HTTPException(status_code=500, detail=f"❌ Upload failed: {str(e)}")
    # data = await request.json()
    # filename = data.get("fileName")
    # filetype = filename.split(".")[-1].lower()

    # if filetype not in ["csv", "parquet"]:
    #     raise HTTPException(
    #         status_code=400, detail="Invalid file type. Supported formats: CSV, Parquet"
    #     )

    # executor.submit(asyncio.run, process_create_dataset(filename, filetype))
    # return {"message": "Dataset processing started"}


############ Processed Dataset Management Routes
@dataset_router.get("/list-datasets", response_model=List[DatasetListResponse])
def list_datasets_endpoint(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    db: Session = Depends(get_db),
):
    try:
        result = list_datasets(db, skip=skip, limit=limit)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        print("Error in listing processed datasets: ", str(e))
        return {"error": str(e)}


@dataset_router.get("/dataset-details/{filename}", response_model=dict)
def get_dataset_overview(filename: str, db: Session = Depends(get_db)):
    try:
        result = get_dataset_stats(db, filename=filename)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=404, detail=result["error"])
        return result
    except Exception as e:
        print("Error in getting processed dataset overview: ", str(e))
        return {"error": str(e)}


@dataset_router.put("/rename-dataset-file")
async def rename_processed_dataset_file(
    dataset_id: int = Query(...),
    new_name: str = Query(...),
    db: Session = Depends(get_db),
):
    try:
        # Rename the file in HDFS
        filename = get_data_filename_by_id(db, dataset_id)
        if isinstance(filename, dict) and "error" in filename:
            raise HTTPException(status_code=404, detail=filename["error"])

        await hdfs_client.rename_file_or_folder(
            f"{HDFS_PROCESSED_DATASETS_DIR}/{filename}",
            f"{HDFS_PROCESSED_DATASETS_DIR}/{new_name}",
        )

        result = rename_dataset(db, filename, new_name)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return result
    except Exception as e:
        print("Error in renaming processed dataset: ", str(e))
        return {"error": str(e)}


@dataset_router.put("/edit-dataset-details")
async def edit_raw_dataset(newdetails: DatasetUpdate, db: Session = Depends(get_db)):
    try:
        # get dataset name and edit on hdfs
        old_file_name = get_data_filename_by_id(db, newdetails.dataset_id)
        if isinstance(old_file_name, dict) and "error" in old_file_name:
            raise HTTPException(status_code=404, detail=old_file_name["error"])

        if old_file_name != newdetails.filename:
            await hdfs_client.rename_file_or_folder(
                f"{HDFS_PROCESSED_DATASETS_DIR}/{old_file_name}",
                f"{HDFS_PROCESSED_DATASETS_DIR}/{newdetails.filename}",
            )

        result = edit_dataset_details(db, newdetails)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])

        return {"message": "Dataset details updated successfully"}
    except Exception as e:
        print("Error in editing dataset details: ", str(e))
        return {"error": str(e)}


@dataset_router.delete("/delete-dataset-file")
async def delete_processed_dataset_file(
    dataset_id: int = Query(...), db: Session = Depends(get_db)
):
    try:
        # Delete the file from HDFS
        filename = get_data_filename_by_id(db, dataset_id)
        if isinstance(filename, dict) and "error" in filename:
            raise HTTPException(status_code=404, detail=filename["error"])

        await hdfs_client.delete_file_from_hdfs(HDFS_PROCESSED_DATASETS_DIR, filename)

        result = delete_dataset(db, dataset_id)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        print("Error in deleting processed dataset: ", str(e))
        return {"error": str(e)}


@dataset_router.post("/preprocess-dataset", status_code=status.HTTP_202_ACCEPTED)
async def preprocess_dataset_endpoint(request: Request):
    data = await request.json()
    executor.submit(
        asyncio.run,
        process_preprocessing(data["directory"], data["filename"], data["operations"]),
    )
    return {"message": "Preprocessing initiated"}


@dataset_router.get("/list-recent-uploads")
async def list_recent_uploads():
    return await hdfs_client.list_recent_uploads()


@dataset_router.delete("/delete-recent-uploaded-file")
async def delete_raw_dataset_file(
    directory: str = Query(...),
    filename: str = Query(...),
    db: Session = Depends(get_db),
):
    if not directory or not filename:
        raise HTTPException(status_code=400, detail="Invalid Delete Request")
    try:
        await hdfs_client.delete_file_from_hdfs(directory, filename)
        return {"message": "File deleted successfully"}
    except Exception as e:
        print("Error in deleting recent upload: ", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@dataset_router.put("/update-column-description-raw/{filename}")
async def update_column_description_raw(
    filename: str, description: dict, db: Session = Depends(get_db)
):
    try:
        result = update_column_description(db, filename, description)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        print("Error in updating column description: ", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


@dataset_router.put("/update-column-description-processed/{filename}")
async def update_description(
    filename: str, description: dict, db: Session = Depends(get_db)
):
    try:
        result = update_column_description_in_dataset(db, filename, description)
        if isinstance(result, dict) and "error" in result:
            raise HTTPException(status_code=400, detail=result["error"])
        return result
    except Exception as e:
        print("Error in updating description: ", str(e))
        raise HTTPException(status_code=500, detail=str(e)) from e


# from fastapi import APIRouter, HTTPException
# from fastapi import Request, Query, HTTPException
# from dotenv import load_dotenv
# from utilityspark_services import SparkSessionManager
# from utilitydatabase_services import DatabaseManager
# from utilityhdfs_services import HDFSServiceManager
# import json
# import asyncio
# import os
# from concurrent.futures import ThreadPoolExecutor

# load_dotenv()
# executor = ThreadPoolExecutor(max_workers=os.cpu_count())

# router = APIRouter(tags=["Preprocessing"])

# HDFS_RAW_DATASETS_DIR = os.getenv("HDFS_RAW_DATASETS_DIR")
# HDFS_PROCESSED_DATASETS_DIR = os.getenv("HDFS_PROCESSED_DATASETS_DIR")
# RECENTLY_UPLOADED_DATASETS_DIR = os.getenv("RECENTLY_UPLOADED_DATASETS_DIR")

# # Initialize the database
# db_client = DatabaseManager()
# hdfs_client = HDFSServiceManager()
# spark_client = SparkSessionManager()

# async def create_dataset(filename: str, filetype: str):
#     try:
#         # rename the hdfs file with suffix __PROCESSING__, not prefix (spark can't read files with starting __)
#         source_path = f"{RECENTLY_UPLOADED_DATASETS_DIR}/{filename}"
#         destination_path = f"{RECENTLY_UPLOADED_DATASETS_DIR}/{filename}__PROCESSING__"
#         await hdfs_client.rename_file_or_folder(source_path, destination_path)
#         newfilename = f"{filename}__PROCESSING__"
#         dataset_overview = await spark_client.create_new_dataset(newfilename, filetype)
#         filename = filename.replace("csv", "parquet")
#         await db_client.add_dataset(HDFS_RAW_DATASETS_DIR, filename, dataset_overview)
#         # hdfs_client.delete_file_from_hdfs(RECENTLY_UPLOADED_DATASETS_DIR, newfilename)
#         await hdfs_client.rename_file_or_folder(destination_path,source_path)
#     except Exception as e:
#         source_path = f"{RECENTLY_UPLOADED_DATASETS_DIR}/{filename}"
#         destination_path = f"{RECENTLY_UPLOADED_DATASETS_DIR}/{filename}__PROCESSING__"
#         await hdfs_client.rename_file_or_folder(destination_path,source_path)
#         print("Error in processing the data is: ", str(e))


# async def preprocess_dataset(directory: str, filename: str, operations: list):
#     try:
#         # rename the file with __PROCESSING__ suffix
#         await db_client.rename_dataset(directory,filename, f"{filename}__PROCESSING__")
#         dataset_overview =  await spark_client.preprocess_data(directory, filename, operations)
#         await db_client.rename_dataset(directory, f"{filename}__PROCESSING__",filename)
#         await db_client.add_dataset(HDFS_PROCESSED_DATASETS_DIR, dataset_overview["fileName"], dataset_overview)
#     except Exception as e:
#         await db_client.rename_dataset(directory, f"{filename}__PROCESSING__",filename)
#         # can't delete the file, it will delete prev if not written currently
#         # hdfs_client.delete_file_from_hdfs(HDFS_PROCESSED_DATASETS_DIR, filename)
#         print("Error in preprocessing the data is: ", str(e))

# @router.get("/preprocessing")
# def hello_server():
#     return {"message": "Hello, this is preprocessing router!"}

# @router.get("/testing_list_all_datasets")
# async def testing_list_all_datasets():
#     return await hdfs_client.testing_list_all_datasets()

# @router.get("/list-recent-uploads")
# async def list_recent_uploads():
#     return await hdfs_client.list_recent_uploads()

# @router.get("/list-all-datasets")
# async def list_all_datasets():
#     return await db_client.list_all_datasets()

# @router.get("/dataset-overview/{path}/{dataset_id}")
# async def get_overview(path: str, dataset_id: str):
#     try:
#         return await db_client.get_dataset(path, dataset_id)
#     except Exception as e:
#         return {"error": str(e)}

# @router.get("/processed-dataset-overview/{filename}")
# async def get_processed_overview(filename: str):
#     try:
#         datastats = await db_client.get_dataset(HDFS_PROCESSED_DATASETS_DIR,filename)
#         return {"filename": filename, "datastats": datastats}
#     except Exception as e:
#         return {"error": str(e)}

# @router.post("/create-new-dataset")
# async def create_new_dataset(request: Request):
#     data = await request.json()
#     # directory not needed, it is known that directory will be RECENTLY_UPLOADED_DATASETS_DIR from env file
#     filename = data.get("fileName")
#     filetype = filename.split(".")[-1]
#     if filetype not in ["csv", "parquet"]:
#         print("Invalid file type")
#         return {"error": "Invalid file type. Please upload a CSV or Parquet file."}
#     # background_tasks.add_task(create_dataset, filename, filetype)  #this is blocking the server
#     executor.submit(lambda filename,filetype: asyncio.run(create_dataset(filename,filetype)),filename,filetype)

#     return {"message": "Dataset creation started..."}

# @router.post("/preprocess-dataset")
# async def process_dataset(request: Request):
#     data = await request.json()
#     directory = data.get("directory")
#     filename = data.get("fileName")
#     operations = data.get("operations")
#     print(f"Started processing {filename}...")

#     executor.submit(lambda directory,filename,operations: asyncio.run(preprocess_dataset(directory, filename, operations)), directory,filename,operations)
#     return {"message": "Dataset preprocessed successfully"}

# @router.put("/rename-file")
# async def rename_file(directory: str = Query(...), oldFileName: str = Query(...), newFileName: str = Query(...)):
#     try:
#         await hdfs_client.rename_file_or_folder(f"{directory}/{oldFileName}", f"{directory}/{newFileName}")
#         await db_client.rename_dataset(directory, oldFileName, newFileName)
#         return {"message": "File renamed successfully!"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))

# @router.delete("/delete-file")
# async def delete_file(directory: str = Query(...), fileName: str = Query(...)):
#     # async because it's not more CPU bound task it's more of I/O bound
#     try:
#         hdfs_client.delete_file_from_hdfs(directory, fileName)
#         await db_client.delete_dataset(directory, fileName)
#         return {"message": "File deleted successfully!"}
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=str(e))


# from pydantic import BaseModel
# class Dataset(BaseModel):
#     filename: str
#     datastats: dict

# # delete this later (if used, may ccause inconsistency with hdfs)
# @router.post("/create-dataset-in-processed")
# async def create_dataset_in_processed(dataset: Dataset):
#     filename = dataset.filename
#     datastats = dataset.datastats
#     directory = "processed"
#     await db_client.add_dataset(directory, filename, datastats)
#     return {"message": "Dataset created in processed folder successfully!"}
