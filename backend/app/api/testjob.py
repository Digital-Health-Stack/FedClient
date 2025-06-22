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

filename = "health.csv"
# spark = SparkSession.builder \
#     .master(SPARK_MASTER_URL) \
#     .appName("RowCounter") \
#     .getOrCreate()

spark = SparkSession.builder.getOrCreate()

print(f"Deploy mode: {spark.sparkContext.deployMode}")

df = spark.read.csv(
    f"{HDFS_FILE_READ_URL}/{RECENTLY_UPLOADED_DATASETS_DIR}/{filename}",
    header=True,
    inferSchema=True,
)
df.show(5)
print(f"Total rows: {df.count()}")
