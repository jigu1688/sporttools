# 体育教学辅助网站 - 学年管理CRUD操作
# 提供学年的创建、查询、更新和删除功能

from sqlalchemy.orm import Session
from models import SchoolYear, SchoolYearStatusEnum
from datetime import datetime

class SchoolYearCRUD:
    """学年CRUD操作类"""
    
    @staticmethod
    def create_school_year(db: Session, school_year_data: dict) -> SchoolYear:
        """创建新学年"""
        db_school_year = SchoolYear(**school_year_data)
        db.add(db_school_year)
        db.commit()
        db.refresh(db_school_year)
        return db_school_year
    
    @staticmethod
    def get_school_year(db: Session, school_year_id: int) -> SchoolYear:
        """根据ID获取学年"""
        # 禁用关系加载，避免触发classes关联查询
        from sqlalchemy.orm import noload
        return db.query(SchoolYear).options(noload('*')).filter(SchoolYear.id == school_year_id).first()
    
    @staticmethod
    def get_school_year_by_academic_year(db: Session, academic_year: str) -> SchoolYear:
        """根据学年标识获取学年"""
        return db.query(SchoolYear).filter(SchoolYear.academic_year == academic_year).first()
    
    @staticmethod
    def get_active_school_year(db: Session, school_id: int = None) -> SchoolYear:
        """获取当前活跃的学年"""
        # 先尝试直接查询活跃状态的学年，不考虑school_id
        query = db.query(SchoolYear).filter(SchoolYear.status == SchoolYearStatusEnum.active)
        
        # 如果指定了school_id，再添加school_id过滤条件
        if school_id is not None:
            query = query.filter(SchoolYear.school_id == school_id)
        
        # 如果没有找到，尝试查询所有学年，按start_date降序排列，返回第一个
        result = query.first()
        if not result:
            # 尝试获取最新的学年，不管状态如何
            result = db.query(SchoolYear).order_by(SchoolYear.start_date.desc()).first()
            # 如果找到，将其设置为活跃状态
            if result:
                result.status = SchoolYearStatusEnum.active
                db.commit()
        
        return result
    
    @staticmethod
    def get_school_years(db: Session, school_id: int = None, status: str = None) -> list[SchoolYear]:
        """获取学年列表"""
        query = db.query(SchoolYear)
        if school_id:
            query = query.filter(SchoolYear.school_id == school_id)
        if status:
            query = query.filter(SchoolYear.status == status)
        return query.order_by(SchoolYear.start_date.desc()).all()
    
    @staticmethod
    def update_school_year(db: Session, school_year_id: int, school_year_data: dict) -> SchoolYear:
        """更新学年信息"""
        db_school_year = db.query(SchoolYear).filter(SchoolYear.id == school_year_id).first()
        if not db_school_year:
            return None
        
        for field, value in school_year_data.items():
            setattr(db_school_year, field, value)
        
        db_school_year.updated_at = datetime.utcnow()
        db.commit()
        db.refresh(db_school_year)
        return db_school_year
    
    @staticmethod
    def delete_school_year(db: Session, school_year_id: int) -> bool:
        """删除学年"""
        db_school_year = db.query(SchoolYear).filter(SchoolYear.id == school_year_id).first()
        if not db_school_year:
            return False
        
        try:
            # 直接删除学年，不依赖级联删除，因为数据库表结构可能不一致
            db.delete(db_school_year)
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            print(f"删除学年失败: {str(e)}")
            return False
    
    @staticmethod
    def set_active_school_year(db: Session, school_year_id: int) -> bool:
        """设置当前学年"""
        try:
            # 先将所有学年设置为非活跃状态
            db.query(SchoolYear).update({"status": SchoolYearStatusEnum.inactive})
            
            # 设置指定学年为活跃状态
            db_school_year = db.query(SchoolYear).filter(SchoolYear.id == school_year_id).first()
            if not db_school_year:
                return False
            
            db_school_year.status = SchoolYearStatusEnum.active
            db_school_year.updated_at = datetime.utcnow()
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            return False
    
    @staticmethod
    def complete_school_year(db: Session, school_year_id: int, completed_by: str) -> bool:
        """结束学年"""
        try:
            db_school_year = db.query(SchoolYear).filter(SchoolYear.id == school_year_id).first()
            if not db_school_year:
                return False
            
            db_school_year.status = SchoolYearStatusEnum.completed
            db_school_year.completed_at = datetime.utcnow()
            db_school_year.completed_by = completed_by
            db_school_year.updated_at = datetime.utcnow()
            db.commit()
            return True
        except Exception as e:
            db.rollback()
            return False

# 创建school_year_crud实例
school_year_crud = SchoolYearCRUD()
