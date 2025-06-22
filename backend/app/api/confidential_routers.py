from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from utility.db import get_db
from schemas.dataset import DatasetCreate
from crud.datasets_crud import create_dataset, create_raw_dataset
import subprocess
import os
from fastapi import HTTPException
from pyspark.sql import SparkSession
import os
from dotenv import load_dotenv

load_dotenv()

HADOOP_USER_NAME = os.getenv("HADOOP_USER_NAME")
HDFS_NAME_NODE_URL = os.getenv("HDFS_NAME_NODE_URL")
HDFS_RAW_DATASETS_DIR = os.getenv("HDFS_RAW_DATASETS_DIR")
HDFS_PROCESSED_DATASETS_DIR = os.getenv("HDFS_PROCESSED_DATASETS_DIR")
HDFS_FILE_READ_URL = f"hdfs://{HDFS_NAME_NODE_URL}/user/{HADOOP_USER_NAME}"
RECENTLY_UPLOADED_DATASETS_DIR = os.getenv("RECENTLY_UPLOADED_DATASETS_DIR")
SPARK_MASTER_URL = os.getenv("SPARK_MASTER_URL")


confidential_router = APIRouter(tags=["confidential"])


@confidential_router.post("/create-dataset", status_code=201)
def create_dataset_endpoint(dataset: DatasetCreate, db: Session = Depends(get_db)):
    return create_dataset(db, dataset)


@confidential_router.post("/create-raw-dataset", status_code=201)
def create_raw_dataset_endpoint(dataset: DatasetCreate, db: Session = Depends(get_db)):
    return create_raw_dataset(db, dataset)


@confidential_router.get("/start-spark-job")
def run_spark_job():
    try:
        result = subprocess.run(
            [
                "spark-submit",
                "--master",
                SPARK_MASTER_URL,
                "--deploy-mode",
                "client",
                "api/testjob.py",
            ],
            capture_output=True,
            text=True,
            check=False,
        )

        response = {
            "returncode": result.returncode,
            "stdout": result.stdout.strip(),
            "stderr": result.stderr.strip(),
        }

        print(response)

        if result.returncode != 0:
            raise HTTPException(status_code=500, detail=response)
        return response
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@confidential_router.get("/read-hdfs-file-from-spark")
def read_hdfs_file_from_spark(filename: str):
    try:
        spark = SparkSession.builder.getOrCreate()

        # print(f"Deploy mode: {spark.sparkContext.deployMode}")

        df = spark.read.csv(
            f"{HDFS_FILE_READ_URL}/{RECENTLY_UPLOADED_DATASETS_DIR}/{filename}",
            header=True,
            inferSchema=True,
        )
        df.show(5)
        print(f"Total rows: {df.count()}")
        return {"message": "File read successfully", "row_count": df.count()}
    except Exception as e:
        print(f"Error reading HDFS file: {e}")
        return {"error": str(e)}
