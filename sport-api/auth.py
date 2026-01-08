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
REFRESH_TOKEN_EXPIRE_DAYS = 7

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
    def validate_password_strength(password: str) -> tuple[bool, str]:
        """验证密码强度
        
        返回值：
        - bool: 密码是否符合强度要求
        - str: 密码强度提示或错误信息
        """
        if len(password) < 8:
            return False, "密码长度至少为8个字符"
        
        # 检查是否包含大写字母
        if not any(c.isupper() for c in password):
            return False, "密码必须包含至少一个大写字母"
        
        # 检查是否包含小写字母
        if not any(c.islower() for c in password):
            return False, "密码必须包含至少一个小写字母"
        
        # 检查是否包含数字
        if not any(c.isdigit() for c in password):
            return False, "密码必须包含至少一个数字"
        
        # 检查是否包含特殊字符
        special_chars = "!@#$%^&*()_+-=[]{}|;:,.<>?"
        if not any(c in special_chars for c in password):
            return False, "密码必须包含至少一个特殊字符"
        
        # 检查是否包含空格
        if ' ' in password:
            return False, "密码不能包含空格"
        
        return True, "密码强度符合要求"
    
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
        
        # 检查令牌是否在黑名单中
        from crud import token_crud
        if token_crud.is_token_revoked(db, token):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="令牌已被撤销",
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
    
    @staticmethod
    def create_refresh_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
        """创建刷新令牌"""
        to_encode = data.copy()
        if expires_delta:
            expire = datetime.utcnow() + expires_delta
        else:
            expire = datetime.utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        to_encode.update({"exp": expire, "type": "refresh"})
        encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
        return encoded_jwt
    
    @staticmethod
    def verify_refresh_token(token: str) -> Optional[dict]:
        """验证刷新令牌"""
        try:
            payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
            user_id: str = payload.get("sub")
            token_type: str = payload.get("type")
            if user_id is None or token_type != "refresh":
                return None
            return payload
        except JWTError:
            return None
    
    @staticmethod
    def revoke_token(token: str, db) -> bool:
        """撤销令牌"""
        from crud import token_crud
        return token_crud.revoke_token(db, token)
    
    @staticmethod
    def is_token_valid(token: str, db) -> bool:
        """检查令牌是否有效（未过期且未撤销）"""
        payload = AuthService.verify_token(token)
        if not payload:
            return False
        
        from crud import token_crud
        return not token_crud.is_token_revoked(db, token)

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
            
            # 从kwargs中获取current_user
            if 'current_user' in kwargs:
                current_user = kwargs['current_user']
            
            # 如果还是没有current_user，尝试从args中查找
            if not current_user:
                for arg in args:
                    if hasattr(arg, 'role') or isinstance(arg, dict):
                        current_user = arg
                        break
            
            if not current_user:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="未认证"
                )
            
            # 处理不同类型的current_user
            if isinstance(current_user, dict):
                user_role = current_user.get('role')
            else:
                # 处理User对象的role属性，确保获取到字符串值
                if hasattr(current_user.role, 'value'):
                    user_role = current_user.role.value
                elif isinstance(current_user.role, str):
                    user_role = current_user.role
                else:
                    user_role = str(current_user.role)
            
            # 确保required_roles是字符串列表
            required_roles_str = [str(role) for role in required_roles]
            
            if user_role not in required_roles_str:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"权限不足，当前角色: {user_role}, 所需角色: {required_roles_str}"
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
                # required_permission已经是PermissionType枚举的value，所以直接比较
                if required_permission not in user_permissions:
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="权限不足"
                    )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator