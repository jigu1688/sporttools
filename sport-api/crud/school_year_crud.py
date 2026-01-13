# 体育教学辅助网站 - 学年管理CRUD操作
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
    def get_school_year_by_academic_year(db: Session, academic_year: str, school_id: int = None) -> SchoolYear:
        """根据学年标识查询学年，可选按学校过滤"""
        query = db.query(SchoolYear).filter(SchoolYear.academic_year == academic_year)
        if school_id is not None:
            query = query.filter(SchoolYear.school_id == school_id)
        return query.first()
    
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
        from datetime import timedelta
        
        GRADE_MAP = {
            "一年级": ("二年级", 2), "二年级": ("三年级", 3), "三年级": ("四年级", 4),
            "四年级": ("五年级", 5), "五年级": ("六年级", 6), "六年级": ("七年级", 7),
            "七年级": ("八年级", 8), "八年级": ("九年级", 9), "九年级": (None, None),
        }
        
        promoted_classes = 0
        promoted_students = 0
        graduated_students = 0
        new_school_year = None
        
        try:
            # 获取当前学年信息
            current_year = db.query(SchoolYear).filter(SchoolYear.id == school_year_id).first()
            if not current_year:
                raise ValueError("学年不存在")
            
            # 1. 完成当前学年
            current_year.status = SchoolYearStatusEnum.completed
            current_year.completed_at = datetime.now(timezone.utc)
            
            # 2. 获取当前学年的班级
            classes = db.query(Class).filter(Class.school_year_id == school_year_id).all()
            
            # 3. 计算新学年的日期
            start_year = current_year.start_date.year + 1
            new_start_date = current_year.start_date.replace(year=start_year)
            new_end_date = current_year.end_date.replace(year=start_year)
            
            # 4. 创建新学年
            new_academic_year = f"{start_year}-{start_year + 1}"
            new_year_name = f"{start_year}-{start_year + 1}学年"
            
            new_school_year = SchoolYear(
                school_id=current_year.school_id,
                year_name=new_year_name,
                academic_year=new_academic_year,
                start_date=new_start_date,
                end_date=new_end_date,
                status=SchoolYearStatusEnum.active
            )
            db.add(new_school_year)
            db.flush()  # 获取新学年的ID
            
            # 5. 处理班级升级
            for cls in classes:
                old_grade = cls.grade
                if old_grade in GRADE_MAP:
                    new_grade, new_level = GRADE_MAP[old_grade]
                    
                    if new_grade is None:
                        # 九年级：标记学生为毕业
                        student_relations = db.query(StudentClassRelation).filter(
                            StudentClassRelation.class_id == cls.id,
                            StudentClassRelation.is_current == True
                        ).all()
                        for relation in student_relations:
                            student = db.query(Student).filter(Student.id == relation.student_id).first()
                            if student:
                                student.status = StatusEnum.inactive
                                student.graduation_date = datetime.now(timezone.utc).date()
                                graduated_students += 1
                            relation.is_current = False
                            relation.end_date = datetime.now(timezone.utc).date()
                    else:
                        # 其他年级：复制到新学年并升级
                        # 复制班级到新学年
                        new_class = Class(
                            school_id=cls.school_id,
                            school_year_id=new_school_year.id,
                            class_name=cls.class_name.replace(old_grade, new_grade),
                            grade=new_grade,
                            grade_level=new_level,
                            academic_year=new_academic_year,
                            class_teacher_id=cls.class_teacher_id,
                            class_teacher_name=cls.class_teacher_name,
                            assistant_teacher_name=cls.assistant_teacher_name,
                            max_student_count=cls.max_student_count,
                            status=cls.status
                        )
                        db.add(new_class)
                        db.flush()
                        
                        # 复制学生关系到新班级
                        student_relations = db.query(StudentClassRelation).filter(
                            StudentClassRelation.class_id == cls.id,
                            StudentClassRelation.is_current == True
                        ).all()
                        
                        for relation in student_relations:
                            new_relation = StudentClassRelation(
                                student_id=relation.student_id,
                                class_id=new_class.id,
                                academic_year=new_academic_year,
                                status=relation.status,
                                join_date=datetime.now(timezone.utc).date(),
                                is_current=True,
                                user_id=relation.user_id
                            )
                            db.add(new_relation)
                            promoted_students += 1
                        
                        promoted_classes += 1
                        
                        # 标记原班级的关系为已结束
                        for relation in student_relations:
                            relation.is_current = False
                            relation.end_date = datetime.now(timezone.utc).date()
            
            db.commit()
            
            return {
                "success": True,
                "new_school_year": {
                    "id": new_school_year.id,
                    "year_name": new_school_year.year_name,
                    "academic_year": new_school_year.academic_year,
                    "start_date": new_school_year.start_date.isoformat(),
                    "end_date": new_school_year.end_date.isoformat()
                },
                "promoted_classes": promoted_classes,
                "promoted_students": promoted_students,
                "graduated_students": graduated_students
            }
        except Exception as e:
            db.rollback()
            raise e

school_year_crud = SchoolYearCRUD()
