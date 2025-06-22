from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

load_dotenv()

# Get the database path from the environment
DATABASE_URL = os.getenv("DB_URL")
# db_path = os.path.abspath("C:/Users/Lenovo/Desktop/Projects/Master_Thesis/FedClient/backend/app/storage/database.db")
# DATABASE_URL = f"sqlite:///{db_path}"

if not DATABASE_URL:
    raise ValueError("DB_URL is not set. Check .env file.")

print("Checkpoint 1 : ", DATABASE_URL)

engine = create_engine(DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
