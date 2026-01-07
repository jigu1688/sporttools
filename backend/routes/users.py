# 用户管理API路由
from fastapi import APIRouter, Depends, HTTPException, status, Query
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from crud import user_crud
from schemas import UserCreate, UserUpdate, UserResponse, ChangePasswordRequest, UserLogin, TokenResponse
from auth import AuthService, get_current_user, require_permissions, PermissionType
from models import User

router = APIRouter(prefix="/api/v1/users", tags=["users"])

# 获取用户列表（需要管理员权限）
@router.get("", response_model=List[UserResponse])
async def get_users(
    skip: int = Query(0, ge=0, description="跳过数量"),
    limit: int = Query(100, ge=1, le=100, description="返回数量限制"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions([PermissionType.USER_MANAGE]))
):
    """获取用户列表"""
    try:
        users = user_crud.get_users(db, skip=skip, limit=limit)
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取用户列表失败: {str(e)}"
        )

# 获取单个用户信息
@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取用户信息"""
    try:
        user = user_crud.get_user(db, user_id=user_id)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取用户信息失败: {str(e)}"
        )

# 创建新用户（需要管理员权限）
@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions([PermissionType.USER_MANAGE]))
):
    """创建新用户"""
    try:
        user = user_crud.create_user(db, user_data)
        return user
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建用户失败: {str(e)}"
        )

# 更新用户信息
@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新用户信息"""
    try:
        # 检查权限：用户只能更新自己的信息，管理员可以更新任何用户信息
        if current_user.id != user_id and PermissionType.USER_MANAGE not in current_user.role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有权限修改此用户信息"
            )
        
        user = user_crud.update_user(db, user_id=user_id, user_data=user_data)
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        return user
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新用户信息失败: {str(e)}"
        )

# 修改密码
@router.put("/{user_id}/password")
async def change_password(
    user_id: int,
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """修改密码"""
    try:
        # 检查权限：用户只能修改自己的密码，管理员可以重置任何用户密码
        if current_user.id != user_id and PermissionType.USER_MANAGE not in current_user.role.value:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="没有权限修改此用户密码"
            )
        
        # 如果不是管理员，需要验证当前密码
        if current_user.id == user_id:
            if not AuthService.verify_password(password_data.current_password, current_user.hashed_password):
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="当前密码错误"
                )
        
        # 更新密码
        success = user_crud.update_user_password(db, user_id=user_id, new_password=password_data.new_password)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        return {"message": "密码修改成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"修改密码失败: {str(e)}"
        )

# 删除用户（需要管理员权限）
@router.delete("/{user_id}")
async def delete_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions([PermissionType.USER_MANAGE]))
):
    """删除用户"""
    try:
        # 不能删除自己
        if current_user.id == user_id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="不能删除自己的账户"
            )
        
        success = user_crud.delete_user(db, user_id=user_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="用户不存在"
            )
        
        return {"message": "用户删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除用户失败: {str(e)}"
        )

# 获取当前用户信息
@router.get("/me/profile", response_model=UserResponse)
async def get_current_user_profile(
    current_user: User = Depends(get_current_user)
):
    """获取当前用户个人信息"""
    return current_user

# 更新当前用户个人信息
@router.put("/me/profile", response_model=UserResponse)
async def update_current_user_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新当前用户个人信息"""
    try:
        user = user_crud.update_user(db, user_id=current_user.id, user_data=user_data)
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新个人信息失败: {str(e)}"
        )

# 修改当前用户密码
@router.put("/me/password")
async def change_current_password(
    password_data: ChangePasswordRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """修改当前用户密码"""
    try:
        # 验证当前密码
        if not AuthService.verify_password(password_data.current_password, current_user.hashed_password):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="当前密码错误"
            )
        
        # 更新密码
        success = user_crud.update_user_password(db, user_id=current_user.id, new_password=password_data.new_password)
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

# 登出（可选的前端功能）
@router.post("/logout")
async def logout(current_user: User = Depends(get_current_user)):
    """用户登出"""
    # 在JWT实现中，前端只需要删除本地存储的令牌即可
    # 这里可以记录登出日志等
    return {"message": "登出成功"}