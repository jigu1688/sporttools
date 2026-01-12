# 体育教学辅助网站 - 用户管理CRUD操作
# 提供用户的创建、查询、更新和删除功能

from sqlalchemy.orm import Session
from models import User, StatusEnum
from datetime import datetime, timezone

class UserCRUD:
    """用户CRUD操作类"""
    
    @staticmethod
    def create_user(db: Session, user_data: dict) -> User:
        """创建新用户"""
        db_user = User(**user_data)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def get_user(db: Session, user_id: int) -> User:
        """根据ID获取用户"""
        return db.query(User).filter(User.id == user_id).first()
    
    @staticmethod
    def get_user_by_username(db: Session, username: str) -> User:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()
    
    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User:
        """根据邮箱获取用户"""
        return db.query(User).filter(User.email == email).first()
    
    @staticmethod
    def get_users(db: Session, filters: dict = {}) -> tuple[list[User], int]:
        """获取用户列表，支持分页和过滤"""
        query = db.query(User)
        
        # 应用过滤条件
        if filters.get("search"):
            search = f"%{filters['search']}%"
            query = query.filter(
                User.username.like(search) | 
                User.real_name.like(search) | 
                User.email.like(search) | 
                User.phone.like(search)
            )
        
        if filters.get("role"):
            query = query.filter(User.role == filters["role"])
        
        if filters.get("status"):
            query = query.filter(User.status == filters["status"])
        
        # 计算总数
        total = query.count()
        
        # 应用分页
        if "skip" in filters and "limit" in filters:
            # 支持skip和limit参数
            offset = filters["skip"]
            limit = filters["limit"]
        else:
            # 支持page和page_size参数
            page = filters.get("page", 1)
            page_size = filters.get("page_size", 10)
            offset = (page - 1) * page_size
            limit = page_size
        
        users = query.offset(offset).limit(limit).all()
        
        return users, total
    
    @staticmethod
    def update_user(db: Session, user_id: int, user_data: dict) -> User:
        """更新用户信息"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None
        
        # 更新用户信息
        if hasattr(user_data, 'dict'):
            update_data = user_data.dict(exclude_unset=True)
        else:
            update_data = user_data
        
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db_user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user_status(db: Session, user_id: int, status: StatusEnum) -> User:
        """更新用户状态（禁用/启用）"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None
        
        db_user.status = status
        db_user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user_role(db: Session, user_id: int, role) -> User:
        """更新用户角色"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return None
        
        db_user.role = role
        db_user.updated_at = datetime.now(timezone.utc)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    @staticmethod
    def update_user_password(db: Session, user_id: int, new_password: str) -> bool:
        """更新用户密码"""
        from auth import AuthService
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        
        # 生成密码哈希
        hashed_password = AuthService.get_password_hash(new_password)
        db_user.hashed_password = hashed_password
        db_user.updated_at = datetime.now(timezone.utc)
        db.commit()
        return True
    
    @staticmethod
    def update_last_login(db: Session, user_id: int) -> bool:
        """更新最后登录时间"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        
        db_user.last_login_at = datetime.now(timezone.utc)
        db_user.updated_at = datetime.now(timezone.utc)
        db.commit()
        return True
    
    @staticmethod
    def delete_user(db: Session, user_id: int) -> bool:
        """删除用户"""
        db_user = db.query(User).filter(User.id == user_id).first()
        if not db_user:
            return False
        
        db.delete(db_user)
        db.commit()
        return True

# 创建user_crud实例
user_crud = UserCRUD()