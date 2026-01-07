# 体育教学辅助网站 - 用户认证API路由
# 提供登录、注册、用户管理等功能

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta

from database import SessionLocal
from schemas import (
    UserCreate, UserLogin, UserResponse, UserUpdate,
    TokenResponse, ChangePasswordRequest
)
from crud import user_crud
from auth import AuthService, get_current_user, require_permissions, PermissionType
from models import UserRoleEnum

# 创建路由器
router = APIRouter(prefix="/api/v1/auth", tags=["auth"])

# 依赖注入：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 依赖：获取当前用户
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    db: Session = Depends(get_db)
):
    """获取当前用户"""
    return AuthService.get_current_user(credentials.credentials, db)

@router.post("/login", response_model=TokenResponse)
async def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    """
    用户登录
    
    输入用户名和密码，返回JWT令牌
    """
    try:
        # 查找用户
        user = user_crud.get_user_by_username(db, user_credentials.username)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 验证密码
        if not AuthService.verify_password(user_credentials.password, user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户名或密码错误",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 检查用户状态
        if user.status.value != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户账户已禁用",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 创建访问令牌
        access_token_expires = timedelta(minutes=30)
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "username": user.username},
            expires_delta=access_token_expires
        )
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer",
            expires_in=1800,  # 30分钟
            user_info={
                "id": user.id,
                "username": user.username,
                "real_name": user.real_name,
                "role": user.role.value,
                "status": user.status.value
            }
        )
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"登录失败: {str(e)}"
        )

@router.post("/register", response_model=UserResponse, status_code=201)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    用户注册
    
    创建新用户账户
    """
    try:
        # 检查用户名是否已存在
        existing_user = user_crud.get_user_by_username(db, user_data.username)
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="用户名已存在"
            )
        
        # 检查邮箱是否已存在
        if user_data.email:
            existing_email = user_crud.get_user_by_email(db, user_data.email)
            if existing_email:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="邮箱已被使用"
                )
        
        # 加密密码
        hashed_password = AuthService.get_password_hash(user_data.password)
        user_data_dict = user_data.dict(exclude={"password"})
        user_data_dict["hashed_password"] = hashed_password
        
        # 创建用户
        new_user = user_crud.create_user(db, user_data_dict)
        
        return UserResponse.model_validate(new_user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"注册失败: {str(e)}"
        )

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user = Depends(get_current_user)):
    """
    获取当前用户信息
    
    需要有效的JWT令牌
    """
    try:
        return UserResponse.model_validate(current_user)
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取用户信息失败: {str(e)}"
        )

@router.put("/me", response_model=UserResponse)
async def update_current_user_info(
    user_data: UserUpdate,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    更新当前用户信息
    
    需要有效的JWT令牌
    """
    try:
        # 更新用户信息
        updated_user = user_crud.update_user(db, current_user.id, user_data)
        
        return UserResponse.model_validate(updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新用户信息失败: {str(e)}"
        )

@router.post("/change-password")
async def change_password(
    password_data: ChangePasswordRequest,
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    修改密码
    
    需要验证当前密码，然后设置新密码
    """
    try:
        # 验证当前密码
        if not AuthService.verify_password(password_data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="当前密码错误"
            )
        
        # 加密新密码
        new_hashed_password = AuthService.get_password_hash(password_data.new_password)
        
        # 更新密码
        success = user_crud.update_user_password(db, current_user.id, new_hashed_password)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="密码更新失败"
            )
        
        return {"message": "密码修改成功"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"修改密码失败: {str(e)}"
        )

@router.post("/logout")
async def logout(current_user = Depends(get_current_user)):
    """
    用户登出
    
    在实际应用中，这里可能需要将令牌加入黑名单
    """
    return {"message": "登出成功"}

# 管理员专用路由
@router.get("/users")
async def get_users(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    role: Optional[UserRoleEnum] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(lambda: require_permissions([PermissionType.USER_MANAGE]))
):
    """
    获取用户列表（管理员专用）
    
    需要admin角色权限
    """
    try:
        users, total = user_crud.get_users(db, {
            "page": page,
            "page_size": page_size,
            "search": search,
            "role": role,
            "status": status
        })
        
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size,
            "items": [UserResponse.model_validate(user) for user in users]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取用户列表失败: {str(e)}"
        )

@router.put("/users/{user_id}/role")
async def update_user_role(
    user_id: int,
    role: UserRoleEnum,
    db: Session = Depends(get_db),
    current_user = Depends(lambda: require_permissions([PermissionType.USER_MANAGE]))
):
    """
    更新用户角色（管理员专用）
    
    需要admin角色权限
    """
    try:
        # 检查目标用户是否存在
        target_user = user_crud.get_user_by_id(db, user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        # 更新用户角色
        updated_user = user_crud.update_user_role(db, user_id, role)
        
        return UserResponse.model_validate(updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新用户角色失败: {str(e)}"
        )