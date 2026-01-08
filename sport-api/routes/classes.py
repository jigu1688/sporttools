# 班级管理API路由
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from crud import class_crud, school_crud
from schemas import ClassCreate, ClassResponse, BaseResponse
from auth import get_current_user, require_permissions, PermissionType
from models import User

router = APIRouter(prefix="/api/v1/classes", tags=["classes"])

# 依赖注入：获取数据库会话
def get_db():
    from database import SessionLocal
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 获取班级列表
@router.get("", response_model=List[ClassResponse])
async def get_classes(
    school_id: Optional[int] = Query(None, description="学校ID"),
    grade: Optional[str] = Query(None, description="年级"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取班级列表"""
    try:
        classes = class_crud.get_classes(db, school_id=school_id, grade=grade)
        return classes
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取班级列表失败: {str(e)}"
        )

# 获取单个班级信息
@router.get("/{class_id}", response_model=ClassResponse)
async def get_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单个班级信息"""
    try:
        class_info = class_crud.get_class(db, class_id)
        if not class_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="班级不存在"
            )
        return class_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取班级信息失败: {str(e)}"
        )

# 创建班级（需要管理员权限）
@router.post("", response_model=ClassResponse, status_code=status.HTTP_201_CREATED)
async def create_class(
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions([PermissionType.CLASS_MANAGE]))
):
    """创建班级"""
    try:
        # 检查学校是否存在
        school = school_crud.get_school_by_id(db, class_data.school_id)
        if not school:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="所属学校不存在"
            )
        
        # 创建班级
        new_class = class_crud.create_class(db, class_data.dict())
        return ClassResponse.model_validate(new_class)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建班级失败: {str(e)}"
        )

# 更新班级信息（需要管理员权限）
@router.put("/{class_id}", response_model=ClassResponse)
async def update_class(
    class_id: int,
    class_data: ClassCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions([PermissionType.CLASS_MANAGE]))
):
    """更新班级信息"""
    try:
        # 检查班级是否存在
        existing_class = class_crud.get_class(db, class_id)
        if not existing_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="班级不存在"
            )
        
        # 更新班级信息
        updated_class = class_crud.update_class(db, class_id, class_data.dict())
        if not updated_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="班级不存在"
            )
        
        return ClassResponse.model_validate(updated_class)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新班级信息失败: {str(e)}"
        )

# 删除班级（需要管理员权限）
@router.delete("/{class_id}", response_model=BaseResponse)
async def delete_class(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions([PermissionType.CLASS_MANAGE]))
):
    """删除班级"""
    try:
        # 检查班级是否存在
        existing_class = class_crud.get_class(db, class_id)
        if not existing_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="班级不存在"
            )
        
        # 删除班级
        success = class_crud.delete_class(db, class_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="删除班级失败"
            )
        
        return {"message": "班级删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除班级失败: {str(e)}"
        )

# 获取班级学生列表
@router.get("/{class_id}/students")
async def get_class_students(
    class_id: int,
    academic_year: Optional[str] = Query(None, description="学年"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取班级学生列表"""
    try:
        # 检查班级是否存在
        existing_class = class_crud.get_class(db, class_id)
        if not existing_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="班级不存在"
            )
        
        # 获取班级学生
        students = class_crud.get_class_students(db, class_id, academic_year=academic_year)
        return students
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取班级学生列表失败: {str(e)}"
        )

# 分配教师到班级（需要管理员权限）
@router.post("/{class_id}/teachers")
async def assign_teacher_to_class(
    class_id: int,
    teacher_id: int = Query(..., description="教师ID"),
    is_main_teacher: bool = Query(True, description="是否为主班主任"),
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permissions([PermissionType.CLASS_MANAGE]))
):
    """分配教师到班级"""
    try:
        # 检查班级是否存在
        existing_class = class_crud.get_class(db, class_id)
        if not existing_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="班级不存在"
            )
        
        # 检查教师是否存在
        from crud import user_crud
        teacher = user_crud.get_user(db, teacher_id)
        if not teacher:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="教师不存在"
            )
        
        # 检查教师角色
        if teacher.role.value != "teacher":
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="只有教师角色才能分配到班级"
            )
        
        # 分配教师
        success = class_crud.assign_teacher(db, class_id, teacher_id, is_main_teacher)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="分配教师失败"
            )
        
        return {"message": "教师分配成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"分配教师失败: {str(e)}"
        )

# 获取班级历史信息
@router.get("/{class_id}/history")
async def get_class_history(
    class_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取班级历史信息"""
    try:
        # 检查班级是否存在
        existing_class = class_crud.get_class(db, class_id)
        if not existing_class:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="班级不存在"
            )
        
        # 获取班级历史
        history = class_crud.get_class_history(db, class_id)
        return history
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取班级历史失败: {str(e)}"
        )