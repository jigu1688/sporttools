from sqlalchemy.orm import Session
from models import Class

class ClassCrud:
    def get_class(self, db: Session, class_id: int):
        return db.query(Class).filter(Class.id == class_id).first()

    def get_classes(self, db: Session, skip: int = 0, limit: int = 100):
        return db.query(Class).offset(skip).limit(limit).all()

    def create_class(self, db: Session, class_data: dict):
        db_class = Class(**class_data)
        db.add(db_class)
        db.commit()
        db.refresh(db_class)
        return db_class

    def update_class(self, db: Session, class_id: int, class_data: dict):
        db_class = self.get_class(db, class_id)
        if db_class:
            for key, value in class_data.items():
                setattr(db_class, key, value)
            db.commit()
            db.refresh(db_class)
        return db_class

    def delete_class(self, db: Session, class_id: int):
        db_class = self.get_class(db, class_id)
        if db_class:
            db.delete(db_class)
            db.commit()
        return db_class

class_crud = ClassCrud()
