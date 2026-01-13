from sqlalchemy.orm import Session
from models import School

class SchoolCrud:
    def get_school(self, db: Session, school_id: int):
        return db.query(School).filter(School.id == school_id).first()

    def get_school_by_id(self, db: Session, school_id: int):
        """Alias for get_school for API compatibility"""
        return self.get_school(db, school_id)

    def get_schools(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(School).offset(skip).limit(limit).all()

    def create_school(self, db: Session, school_data: dict):
        db_school = School(**school_data)
        db.add(db_school)
        db.commit()
        db.refresh(db_school)
        return db_school

    def update_school(self, db: Session, school_id: int, school_data: dict):
        db_school = self.get_school(db, school_id)
        if db_school:
            for key, value in school_data.items():
                setattr(db_school, key, value)
            db.commit()
            db.refresh(db_school)
        return db_school

    def delete_school(self, db: Session, school_id: int):
        db_school = self.get_school(db, school_id)
        if db_school:
            db.delete(db_school)
            db.commit()
        return db_school

school_crud = SchoolCrud()
