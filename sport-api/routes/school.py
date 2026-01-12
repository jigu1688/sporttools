# 学校管理API路由
# 学校信息管理相关接口

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from crud import school_crud, class_crud, student_crud
from schemas import (
    SchoolCreate, SchoolUpdate, SchoolResponse, BaseResponse
)
from auth import get_current_user
from models import User

# 创建路由器
router = APIRouter(tags=["schools"])


# 获取学校列表
@router.get("", response_model=List[SchoolResponse])
async def get_schools(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取学校列表"""
    return school_crud.get_schools(db, skip=skip, limit=limit)


# 获取学校详情
@router.get("/{school_id}", response_model=SchoolResponse)
async def get_school(
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取学校详情"""
    school = school_crud.get_school(db, school_id)
    if not school:
        raise HTTPException(status_code=404, detail="学校不存在")
    return school


# 创建学校
@router.post("", response_model=SchoolResponse)
async def create_school(
    school: SchoolCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建学校"""
    return school_crud.create_school(db, school)


# 更新学校
@router.put("/{school_id}", response_model=SchoolResponse)
async def update_school(
    school_id: int,
    school: SchoolUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新学校"""
    result = school_crud.update_school(db, school_id, school)
    if not result:
        raise HTTPException(status_code=404, detail="学校不存在")
    return result


# 删除学校
@router.delete("/{school_id}", response_model=BaseResponse)
async def delete_school(
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除学校"""
    result = school_crud.delete_school(db, school_id)
    if not result:
        raise HTTPException(status_code=404, detail="学校不存在")
    return BaseResponse(message="学校已成功删除")


# 获取学校统计信息
@router.get("/{school_id}/statistics", response_model=dict)
async def get_school_statistics(
    school_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取学校统计信息"""
    school = school_crud.get_school(db, school_id)
    if not school:
        raise HTTPException(status_code=404, detail="学校不存在")
    
    # 获取班级数
    classes = class_crud.get_classes(db, school_id=school_id)
    class_count = len(classes) if classes else 0
    
    # 获取学生总数
    from schemas import StudentQueryParams
    params = StudentQueryParams(page=1, page_size=1)
    _, student_count = student_crud.get_students(db, params)
    
    return {
        "school_id": school_id,
        "school_name": school.school_name,
        "class_count": class_count,
        "student_count": student_count
    }
