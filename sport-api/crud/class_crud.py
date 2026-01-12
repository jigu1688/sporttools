from sqlalchemy.orm import Session
from sqlalchemy import and_, or_
from sqlalchemy.orm import joinedload
from models import Class

class ClassCrud:
    def get_class(self, db: Session, class_id: int):
        return db.query(Class).filter(Class.id == class_id).first()

    def get_classes(self, db: Session, school_id: int = None, school_year_id: int = None, grade: str = None, skip: int = 0, limit: int = 100):
        query = db.query(Class).options(joinedload(Class.school_year))
        
        # 添加筛选条件
        if school_id:
            query = query.filter(Class.school_id == school_id)
        if school_year_id:
            query = query.filter(Class.school_year_id == school_year_id)
        if grade:
            query = query.filter(Class.grade == grade)
        
        return query.offset(skip).limit(limit).all()

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

    def delete_class(self, db: Session, class_id: int, force: bool = False):
        """删除班级
        
        Args:
            db: 数据库会话
            class_id: 班级ID
            force: 是否强制删除（即使班级中有学生）
        
        Returns:
            dict: 包含 success 和 message 字段
        """
        from models import StudentClassRelation
        
        db_class = self.get_class(db, class_id)
        if not db_class:
            return {"success": False, "message": "班级不存在"}
        
        # 检查是否有学生
        student_count = db.query(StudentClassRelation).filter(
            StudentClassRelation.class_id == class_id,
            StudentClassRelation.is_current == True
        ).count()
        
        if student_count > 0 and not force:
            return {
                "success": False, 
                "message": f"班级中还有 {student_count} 名学生，无法删除。如需强制删除，请使用 force=true 参数"
            }
        
        try:
            # 删除关联的学生班级关系
            db.query(StudentClassRelation).filter(StudentClassRelation.class_id == class_id).delete()
            
            # 删除关联的体测数据
            from models import PhysicalTest
            db.query(PhysicalTest).filter(PhysicalTest.class_id == class_id).delete()
            
            # 删除班级
            db.delete(db_class)
            db.commit()
            return {"success": True, "message": "班级删除成功"}
        except Exception as e:
            db.rollback()
            return {"success": False, "message": f"删除失败: {str(e)}"}

class_crud = ClassCrud()
