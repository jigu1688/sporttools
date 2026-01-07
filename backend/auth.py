# 体育教学辅助网站 - 用户认证和权限管理
# 提供JWT认证、密码加密、用户管理等功能

from datetime import datetime, timedelta
from typing import Optional, Union
from jose import JWTError, jwt
from passlib.context import CryptContext
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import os

# 直接使用bcrypt库，避免passlib的bug
import bcrypt

# JWT配置
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-in-production-2024")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

class AuthService:
    """认证服务类"""
    
    @staticmethod
    def verify_password(plain_password: str, hashed_password: str) -> bool:
        """验证密码"""
        try:
            return bcrypt.checkpw(
                plain_password.encode('utf-8'),
                hashed_password.encode('utf-8')
            )
        except Exception as e:
            print(f"密码验证错误: {str(e)}")
            return False
    
    @staticmethod
    def get_password_hash(password: str) -> str:
        """获取密码哈希，自动截断超过72字节的密码"""
        # bcrypt限制密码长度为72字节
        password = password[:72]
        try:
            salt = bcrypt.gensalt()
            hashed = bcrypt.hashpw(
                password.encode('utf-8'),
                salt
            )
            return hashed.decode('utf-8')
        except Exception as e:
            print(f"密码哈希错误: {str(e)}")
            raise ValueError(f"密码哈希失败: {str(e)}")
    
    @staticmethod
    def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """创建JWT访问令牌"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        
        to_encode.update({"exp": expire})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_token(token: str) -> Optional[dict]:
        """验证JWT令牌"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            if user_id is None:
                return None
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def get_current_user(token: str, db) -> Optional[dict]:
        """从令牌获取当前用户信息"""
        payload = AuthService.verify_token(token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的令牌",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 从数据库获取用户信息
        from crud import user_crud
        user = user_crud.get_user(db, user_id=int(payload.get("sub")))
        if user is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户不存在",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        return user

# 权限类型枚举
from enum import Enum

class PermissionType(Enum):
    """权限类型枚举"""
    USER_MANAGE = "user_manage"  # 用户管理
    STUDENT_MANAGE = "student_manage"  # 学生管理
    CLASS_MANAGE = "class_manage"  # 班级管理
    SCHOOL_MANAGE = "school_manage"  # 学校管理
    SYSTEM_ADMIN = "system_admin"  # 系统管理员

# 权限装饰器
from functools import wraps
from fastapi import Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from database import SessionLocal

security = HTTPBearer()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """获取当前用户"""
    if not credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="缺少认证令牌",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    return AuthService.get_current_user(credentials.credentials, db)

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
):
    """可选的当前用户获取（如果令牌无效返回None）"""
    if not credentials:
        return None
    
    try:
        return AuthService.get_current_user(credentials.credentials, db)
    except HTTPException:
        return None

def require_role(required_roles: list):
    """角色权限装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从参数中获取current_user
            current_user = None
            if 'current_user' in kwargs:
                current_user = kwargs['current_user']
            elif 'db' in kwargs:
                # 如果没有current_user，尝试从kwargs中获取db和credentials
                pass
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="未认证"
                )
            
            user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
            if user_role not in required_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="权限不足"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

def require_permissions(required_permissions: list):
    """权限装饰器"""
    def decorator(func):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # 从参数中获取current_user
            current_user = None
            for arg in args:
                if hasattr(arg, 'role') and hasattr(arg, 'id'):
                    current_user = arg
                    break
            
            if not current_user:
                # 尝试从kwargs中获取
                current_user = kwargs.get('current_user')
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="未认证"
                )
            
            # 检查用户角色是否满足权限要求
            user_role = current_user.role.value if hasattr(current_user.role, 'value') else str(current_user.role)
            
            # 管理员拥有所有权限
            if user_role == 'admin':
                return await func(*args, **kwargs)
            
            # 检查具体权限
            # 这里可以根据实际需要实现更复杂的权限检查逻辑
            # 目前简化处理：根据角色映射权限
            role_permissions = {
                'teacher': ['student_manage', 'class_manage'],
                'student': [],
                'parent': ['student_manage']  # 家长只能管理自己孩子的信息
            }
            
            user_permissions = role_permissions.get(user_role, [])
            
            for required_permission in required_permissions:
                if required_permission.value not in user_permissions:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="权限不足"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator