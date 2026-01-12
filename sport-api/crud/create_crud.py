content = '''# 体育教学辅助网站 - 学年管理CRUD操作
from sqlalchemy.orm import Session
from models import SchoolYear, SchoolYearStatusEnum
from datetime import datetime, timezone

class SchoolYearCRUD:
    @staticmethod
    def create_school_year(db: Session, school_year_data: dict) -> SchoolYear:
        db_school_year = SchoolYear(**school_year_data)
        db.add(db_school_year)
        db.commit()
        db.refresh(db_school_year)
        return db_school_year
    
    @staticmethod
    def get_school_year(db: Session, school_year_id: int) -> SchoolYear:
        from sqlalchemy.orm import noload
        return db.query(SchoolYear).options(noload('*')).filter(SchoolYear.id == school_year_id).first()
    
    @staticmethod
    def get_school_year_by_academic_year(db: Session, academic_year: str) -> SchoolYear:
        return db.query(SchoolYear).filter(SchoolYear.academic_year == academic_year).first()
    
    @staticmethod
    def get_active_school_year(db: Session, school_id: int = None) -> SchoolYear:
        query = db.query(SchoolYear).filter(SchoolYear.status == SchoolYearStatusEnum.active)
        if school_id is not None:
            query = query.filter(SchoolYear.school_id == school_id)
        result = query.first()
        if not result:
            result = db.query(SchoolYear).order_by(SchoolYear.start_date.desc()).first()
            if result:
                result.status = SchoolYearStatusEnum.active
                db.commit()
        return result
    
    @staticmethod
    def get_school_years(db: Session, school_id: int = None, status: str = None) -> list[SchoolYear]:
        query = db.query(SchoolYear)
        if school_id:
            query = query.filter(SchoolYear.school_id == school_id)
        if status:
            query = query.filter(SchoolYear.status == status)
        return query.order_by(SchoolYear.start_date.desc()).all()
    
    @staticmethod
    def update_school_year(db: Session, school_year_id: int, school_year_data: dict) -> SchoolYear:
        db_school_year = db.query(SchoolYear).filter(SchoolYear.id == school_year_id).first()
        if not db_school_year:
            return None
        for field, value in school_year_data.items():
            setattr(db_school_year, field, value)
        db_school_year.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_school_year)
        return db_school_year
    
    @staticmethod
    def delete_school_year(db: Session, school_year_id: int) -> bool:
        db_school_year = db.query(SchoolYear).filter(SchoolYear.id == school_year_id).first()
        if not db_school_year:
            return False
        try:
            db.delete(db_school_year)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            return False
    
    @staticmethod
    def set_active_school_year(db: Session, school_year_id: int) -> bool:
        try:
            db.query(SchoolYear).update({"status": SchoolYearStatusEnum.inactive})
            db_school_year = db.query(SchoolYear).filter(SchoolYear.id == school_year_id).first()
            if not db_school_year:
                return False
            db_school_year.status = SchoolYearStatusEnum.active
            db_school_year.updated_at = datetime.now(timezone.utc)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            return False
    
    @staticmethod
    def complete_school_year(db: Session, school_year_id: int, completed_by: str) -> bool:
        try:
            db_school_year = db.query(SchoolYear).filter(SchoolYear.id == school_year_id).first()
            if not db_school_year:
                return False
            db_school_year.status = SchoolYearStatusEnum.completed
            db_school_year.completed_at = datetime.now(timezone.utc)
            db_school_year.completed_by = completed_by
            db_school_year.updated_at = datetime.now(timezone.utc)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            return False
    
    @staticmethod
    def promote_grades(db: Session, school_year_id: int) -> dict:
        from models import Class, Student, StudentClassRelation, StatusEnum
        GRADE_MAP = {
            "一年级": ("二年级", 2), "二年级": ("三年级", 3), "三年级": ("四年级", 4),
            "四年级": ("五年级", 5), "五年级": ("六年级", 6), "六年级": ("七年级", 7),
            "七年级": ("八年级", 8), "八年级": ("九年级", 9), "九年级": (None, None),
        }
        promoted_classes = 0
        promoted_students = 0
        graduated_students = 0
        try:
            classes = db.query(Class).filter(Class.school_year_id == school_year_id).all()
            for cls in classes:
                old_grade = cls.grade
                if old_grade in GRADE_MAP:
                    new_grade, new_level = GRADE_MAP[old_grade]
                    if new_grade is None:
                        student_relations = db.query(StudentClassRelation).filter(
                            StudentClassRelation.class_id == cls.id, StudentClassRelation.is_current == True).all()
                        for relation in student_relations:
                            student = db.query(Student).filter(Student.id == relation.student_id).first()
                            if student:
                                student.status = StatusEnum.inactive
                                student.graduation_date = datetime.now(timezone.utc).date()
                                graduated_students += 1
                            relation.is_current = False
                            relation.end_date = datetime.now(timezone.utc).date()
                    else:
                        cls.grade = new_grade
                        cls.grade_level = new_level
                        if old_grade in cls.class_name:
                            cls.class_name = cls.class_name.replace(old_grade, new_grade)
                        promoted_classes += 1
                        student_count = db.query(StudentClassRelation).filter(
                            StudentClassRelation.class_id == cls.id, StudentClassRelation.is_current == True).count()
                        promoted_students += student_count
            db.commit()
            return {"promoted_classes": promoted_classes, "promoted_students": promoted_students, "graduated_students": graduated_students}
        except Exception as e:
            db.rollback()
            raise e

school_year_crud = SchoolYearCRUD()
'''

with open('d:/Projects/sporttools/sporttools/sport-api/crud/school_year_crud.py', 'w', encoding='utf-8') as f:
    f.write(content)
print('OK')
