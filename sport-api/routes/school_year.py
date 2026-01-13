# 体育教学辅助网站 - 学年管理API路由
# 提供学年的创建、查询、更新和删除功能

from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from crud import school_year_crud
from schemas import SchoolYearCreate, SchoolYearUpdate, SchoolYearResponse
from auth import get_current_user, require_permissions, PermissionType
from models import User, SchoolYearStatusEnum

# 创建路由器
router = APIRouter(tags=["school-years"])

# ============ 静态路由 (必须在动态路由之前) ============

# 获取当前活跃学年
@router.get("/active/current", response_model=SchoolYearResponse)
async def get_active_school_year(
    school_id: Optional[int] = Query(None, description="学校ID"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取当前活跃的学年"""
    try:
        school_year = school_year_crud.get_active_school_year(db, school_id)
        if not school_year:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="当前没有活跃的学年"
            )
        return school_year
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取当前学年失败: {str(e)}"
        )

# ============ 列表和创建路由 ============

# 获取学年列表
@router.get("", response_model=List[SchoolYearResponse])
async def get_school_years(
    school_id: Optional[int] = Query(None, description="学校ID"),
    status: Optional[str] = Query(None, description="学年状态"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取学年列表"""
    try:
        school_years = school_year_crud.get_school_years(db, school_id, status)
        return school_years
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取学年列表失败: {str(e)}"
        )

# 获取单个学年信息
@router.get("/{school_year_id}", response_model=SchoolYearResponse)
async def get_school_year(
    school_year_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取单个学年信息"""
    try:
        school_year = school_year_crud.get_school_year(db, school_year_id)
        if not school_year:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="学年不存在"
            )
        return school_year
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取学年信息失败: {str(e)}"
        )

# 创建新学年
@router.post("", response_model=SchoolYearResponse, status_code=status.HTTP_201_CREATED)
@require_permissions([PermissionType.USER_MANAGE])
async def create_school_year(
    school_year_data: SchoolYearCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建新学年"""
    try:
        # 检查同一学校内学年标识是否已存在
        existing_year = school_year_crud.get_school_year_by_academic_year(
            db, 
            school_year_data.academic_year,
            school_id=school_year_data.school_id
        )
        if existing_year:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="该学校的此学年标识已存在"
            )
        
        # 创建学年
        school_year = school_year_crud.create_school_year(db, school_year_data.dict())
        return school_year
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"创建学年失败: {str(e)}"
        )

# 更新学年信息
@router.put("/{school_year_id}", response_model=SchoolYearResponse)
@require_permissions([PermissionType.USER_MANAGE])
async def update_school_year(
    school_year_id: int,
    school_year_data: SchoolYearUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新学年信息"""
    try:
        # 检查学年是否存在
        existing_year = school_year_crud.get_school_year(db, school_year_id)
        if not existing_year:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="学年不存在"
            )
        
        # 更新学年
        school_year = school_year_crud.update_school_year(db, school_year_id, school_year_data.dict(exclude_unset=True))
        return school_year
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"更新学年失败: {str(e)}"
        )

# 删除学年
@router.delete("/{school_year_id}")
@require_permissions([PermissionType.USER_MANAGE])
async def delete_school_year(
    school_year_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除学年"""
    try:
        # 检查学年是否存在
        existing_year = school_year_crud.get_school_year(db, school_year_id)
        if not existing_year:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="学年不存在"
            )
        
        # 删除学年
        success = school_year_crud.delete_school_year(db, school_year_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="删除学年失败"
            )
        
        return {"message": "学年删除成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"删除学年失败: {str(e)}"
        )

# 设置当前学年
@router.put("/{school_year_id}/set-active")
@require_permissions([PermissionType.USER_MANAGE])
async def set_active_school_year(
    school_year_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """设置当前学年"""
    try:
        # 检查学年是否存在
        existing_year = school_year_crud.get_school_year(db, school_year_id)
        if not existing_year:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="学年不存在"
            )
        
        # 设置为当前学年
        success = school_year_crud.set_active_school_year(db, school_year_id)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="设置当前学年失败"
            )
        
        return {"message": "当前学年设置成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"设置当前学年失败: {str(e)}"
        )

# 结束当前学年
@router.put("/{school_year_id}/complete")
@require_permissions([PermissionType.USER_MANAGE])
async def complete_school_year(
    school_year_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """结束当前学年"""
    try:
        # 检查学年是否存在
        existing_year = school_year_crud.get_school_year(db, school_year_id)
        if not existing_year:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="学年不存在"
            )
        
        # 结束学年
        success = school_year_crud.complete_school_year(db, school_year_id, current_user.username)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="结束学年失败"
            )
        
        return {"message": "学年结束成功"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"结束学年失败: {str(e)}"
        )

# 学年升级 - 升级班级名称和学生年级
@router.post("/{school_year_id}/promote")
@require_permissions([PermissionType.USER_MANAGE])
async def promote_school_year(
    school_year_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    学年升级 - 将所有班级和学生升级到下一年级
    
    升级逻辑：
    - 一年级 -> 二年级 (grade_level: 1 -> 2)
    - 六年级 -> 七年级 (grade_level: 6 -> 7, 小升初)
    - 九年级学生 -> 标记为毕业
    """
    try:
        # 检查学年是否存在
        existing_year = school_year_crud.get_school_year(db, school_year_id)
        if not existing_year:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="学年不存在"
            )
        
        # 调用升级逻辑
        result = school_year_crud.promote_grades(db, school_year_id)
        
        return {
            "message": "学年升级成功",
            "promoted_classes": result.get("promoted_classes", 0),
            "promoted_students": result.get("promoted_students", 0),
            "graduated_students": result.get("graduated_students", 0)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"学年升级失败: {str(e)}"
        )


# 获取学年统计信息
@router.get("/{school_year_id}/statistics")
async def get_school_year_statistics(
    school_year_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取学年统计信息：班级数量、学生数量等"""
    from models import Class, Student, StudentClassRelation
    from sqlalchemy import func
    
    try:
        # 检查学年是否存在
        school_year = school_year_crud.get_school_year(db, school_year_id)
        if not school_year:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="学年不存在"
            )
        
        # 统计该学年的班级数量
        class_count = db.query(Class).filter(Class.school_year_id == school_year_id).count()
        
        # 统计该学年的学生数量（通过班级关联）
        student_count = db.query(StudentClassRelation).join(
            Class, StudentClassRelation.class_id == Class.id
        ).filter(Class.school_year_id == school_year_id).count()
        
        # 按年级统计班级数量
        grade_stats = db.query(
            Class.grade_level,
            func.count(Class.id).label('class_count')
        ).filter(Class.school_year_id == school_year_id).group_by(Class.grade_level).all()
        
        grades = {str(grade): count for grade, count in grade_stats}
        
        return {
            "school_year_id": school_year_id,
            "class_count": class_count,
            "student_count": student_count,
            "grades": grades
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"获取学年统计失败: {str(e)}"
        )
