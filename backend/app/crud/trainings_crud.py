from sqlalchemy.orm import Session
from sqlalchemy.exc import SQLAlchemyError, IntegrityError, NoResultFound
from models.Trainings import CurrentTrainings
from schemas.trainings import CreateTraining


def create_training(db: Session, training_details: CreateTraining):
    try:
        db_training = CurrentTrainings(
            **training_details
        )  # or .model_dump() for Pydantic v2
        db.add(db_training)
        db.commit()
        db.refresh(db_training)
        return db_training
    except IntegrityError:
        db.rollback()
        return {"error": "Training with this ID already exists."}
    except SQLAlchemyError as e:
        db.rollback()
        return {"error": f"Database error: {str(e)}"}


def get_training_details(db: Session, session_id: int):
    try:
        db_training = (
            db.query(CurrentTrainings)
            .filter(CurrentTrainings.session_id == session_id)
            .one()
        )
        return db_training.as_dict()
    except NoResultFound:
        return {"error": "Training not found."}
    except SQLAlchemyError as e:
        return {"error": f"Database error: {e}"}
