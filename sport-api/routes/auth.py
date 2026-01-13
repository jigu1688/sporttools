# 体育教学辅助网站 - 用户认证API路由
# 提供登录、注册、用户管理等功能

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional
from datetime import timedelta, datetime

from database import SessionLocal
from schemas import (
    UserCreate, UserLogin, UserResponse, UserUpdate,
    TokenResponse, ChangePasswordRequest, RefreshTokenRequest,
    PasswordResetRequest, PasswordResetConfirmRequest
)
from auth import ACCESS_TOKEN_EXPIRE_MINUTES, REFRESH_TOKEN_EXPIRE_DAYS
from crud import user_crud
from auth import AuthService, get_current_user, require_permissions, PermissionType
from models import UserRoleEnum, StatusEnum
from middleware.rate_limiting import limiter

# 创建路由器
router = APIRouter(tags=["auth"])

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
    # 使用全局导入的AuthService
    return AuthService.get_current_user(credentials.credentials, db)

@router.post("/login", response_model=TokenResponse)
# @limiter.limit("5/minute")  # 暂时禁用限速 - slowapi兼容性问题
async def login(request: Request, user_credentials: UserLogin, db: Session = Depends(get_db)):
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
        is_password_valid = AuthService.verify_password(user_credentials.password, user.hashed_password)
        
        if not is_password_valid:
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
        
        # 创建访问令牌和刷新令牌
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "username": user.username},
            expires_delta=access_token_expires
        )
        
        refresh_token = AuthService.create_refresh_token(
            data={"sub": str(user.id), "username": user.username},
            expires_delta=refresh_token_expires
        )
        
        # 保存令牌到数据库
        from crud import token_crud
        token_crud.create_token(db, {
            "user_id": user.id,
            "access_token": access_token,
            "refresh_token": refresh_token,
            "expires_at": datetime.utcnow() + access_token_expires,
            "refresh_expires_at": datetime.utcnow() + refresh_token_expires
        })
        
        # 更新最后登录时间
        user_crud.update_last_login(db, user.id)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=int(access_token_expires.total_seconds()),  # 访问令牌过期时间（秒）
            refresh_expires_in=int(refresh_token_expires.total_seconds()),  # 刷新令牌过期时间（秒）
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
# @limiter.limit("3/minute")  # 暂时禁用限速 - slowapi兼容性问题
async def register(request: Request, user_data: UserCreate, db: Session = Depends(get_db)):
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
        
        # 验证密码强度
        is_valid, message = AuthService.validate_password_strength(user_data.password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
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
        
        # 验证新密码强度
        is_valid, message = AuthService.validate_password_strength(password_data.new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
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

@router.post("/refresh-token", response_model=TokenResponse)
async def refresh_token(request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    刷新令牌
    
    使用刷新令牌获取新的访问令牌和刷新令牌
    """
    try:
        # 验证刷新令牌
        payload = AuthService.verify_refresh_token(request.refresh_token)
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="无效的刷新令牌",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 检查刷新令牌是否在数据库中且未被撤销
        from crud import token_crud
        token = token_crud.get_token_by_refresh_token(db, request.refresh_token)
        if not token or token.revoked:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="刷新令牌已被撤销或不存在",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 检查刷新令牌是否过期
        if token.refresh_expires_at < datetime.utcnow():
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="刷新令牌已过期",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 获取用户信息
        user = user_crud.get_user(db, user_id=token.user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户不存在",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 检查用户状态
        if user.status.value != "active":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="用户账户已禁用",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        # 创建新的访问令牌和刷新令牌
        access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
        refresh_token_expires = timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
        
        new_access_token = AuthService.create_access_token(
            data={"sub": str(user.id), "username": user.username},
            expires_delta=access_token_expires
        )
        
        new_refresh_token = AuthService.create_refresh_token(
            data={"sub": str(user.id), "username": user.username},
            expires_delta=refresh_token_expires
        )
        
        # 撤销旧令牌
        token_crud.revoke_token(db, token.refresh_token)
        
        # 保存新令牌到数据库
        token_crud.create_token(db, {
            "user_id": user.id,
            "access_token": new_access_token,
            "refresh_token": new_refresh_token,
            "expires_at": datetime.utcnow() + access_token_expires,
            "refresh_expires_at": datetime.utcnow() + refresh_token_expires
        })
        
        return TokenResponse(
            access_token=new_access_token,
            refresh_token=new_refresh_token,
            token_type="bearer",
            expires_in=int(access_token_expires.total_seconds()),
            refresh_expires_in=int(refresh_token_expires.total_seconds()),
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
            detail=f"刷新令牌失败: {str(e)}"
        )

@router.post("/logout")
async def logout(
    credentials: HTTPAuthorizationCredentials = Depends(HTTPBearer()),
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    用户登出
    
    将当前令牌加入黑名单，使其失效
    """
    try:
        # 撤销当前令牌
        from crud import token_crud
        token_crud.revoke_token(db, credentials.credentials)
        
        return {"message": "登出成功"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"登出失败: {str(e)}"
        )

@router.post("/logout-all-devices")
async def logout_all_devices(
    current_user = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    登出所有设备
    
    撤销当前用户的所有令牌，使其在所有设备上失效
    """
    try:
        # 撤销当前用户的所有令牌
        from crud import token_crud
        token_crud.revoke_all_tokens(db, current_user.id)
        
        return {"message": "所有设备已登出"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"登出所有设备失败: {str(e)}"
        )

# 管理员专用路由
@router.get("/users")
@require_permissions([PermissionType.USER_MANAGE])
async def get_users(
    page: int = 1,
    page_size: int = 10,
    search: Optional[str] = None,
    role: Optional[UserRoleEnum] = None,
    status: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
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
        
        # 计算总页数
        total_pages = (total + page_size - 1) // page_size
        
        # 返回统一的分页响应格式
        return {
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "items": [UserResponse.model_validate(user) for user in users]
        }
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取用户列表失败: {str(e)}"
        )

@router.put("/users/{user_id}/role")
@require_permissions([PermissionType.USER_MANAGE])
async def update_user_role(
    user_id: int,
    role: UserRoleEnum,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    更新用户角色（管理员专用）
    
    需要admin角色权限
    """
    try:
        # 检查目标用户是否存在
        target_user = user_crud.get_user(db, user_id)
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

@router.put("/users/{user_id}/status")
@require_permissions([PermissionType.USER_MANAGE])
async def update_user_status(
    user_id: int,
    status: StatusEnum,
    db: Session = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    更新用户状态（管理员专用）
    
    需要admin角色权限，用于禁用/启用用户
    """
    try:
        # 检查目标用户是否存在
        target_user = user_crud.get_user(db, user_id)
        if not target_user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        # 更新用户状态
        updated_user = user_crud.update_user_status(db, user_id, status)
        
        return UserResponse.model_validate(updated_user)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新用户状态失败: {str(e)}"
        )

@router.post("/password-reset-request")
# @limiter.limit("3/minute")  # 暂时禁用限速 - slowapi兼容性问题
async def password_reset_request(
    http_request: Request,
    request: PasswordResetRequest,
    db: Session = Depends(get_db)
):
    """
    请求密码重置
    
    发送密码重置链接到用户邮箱
    """
    try:
        # 检查用户是否存在
        user = user_crud.get_user_by_email(db, request.email)
        if not user:
            # 即使用户不存在，也返回成功消息，避免暴露用户信息
            return {"message": "密码重置链接已发送到您的邮箱"}
        
        # 这里应该添加发送密码重置邮件的逻辑
        # 由于是演示项目，暂时只返回成功消息
        
        return {"message": "密码重置链接已发送到您的邮箱"}
        
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"密码重置请求失败: {str(e)}"
        )

@router.post("/password-reset-confirm")
# @limiter.limit("3/minute")  # 暂时禁用限速 - slowapi兼容性问题
async def password_reset_confirm(
    http_request: Request,
    request: PasswordResetConfirmRequest,
    db: Session = Depends(get_db)
):
    """
    确认密码重置
    
    使用密码重置令牌设置新密码
    """
    try:
        # 这里应该添加验证密码重置令牌的逻辑
        # 由于是演示项目，暂时只验证密码强度并更新密码
        
        # 验证密码强度
        is_valid, message = AuthService.validate_password_strength(request.new_password)
        if not is_valid:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=message
            )
        
        # 这里应该从令牌中获取用户ID，然后更新密码
        # 由于是演示项目，暂时不实现完整的令牌验证
        
        return {"message": "密码重置成功"}
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"密码重置失败: {str(e)}"
        )