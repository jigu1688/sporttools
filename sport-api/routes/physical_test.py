# 体育教学辅助网站 - 体测数据API路由
# 处理体测数据的HTTP请求

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import date
from database import get_db
from auth import get_current_user, require_role
from crud.physical_test_crud import (
    get_physical_tests,
    get_physical_tests_by_student,
    get_physical_tests_by_class,
    get_physical_test,
    create_physical_test,
    update_physical_test,
    delete_physical_test,
    get_physical_test_statistics,
    get_physical_test_history
)
from schemas import (
    PhysicalTestCreate,
    PhysicalTestUpdate,
    PhysicalTestResponse,
    PhysicalTestDetailResponse,
    PhysicalTestStatisticsResponse,
    BaseResponse
)
from models import UserRoleEnum

router = APIRouter(
    prefix="/api/v1/physical-tests",
    tags=["physical-tests"],
    responses={404: {"description": "Not found"}},
)

# 获取体测统计数据
@router.get("/statistics", response_model=PhysicalTestStatisticsResponse)
@require_role([UserRoleEnum.admin.value, UserRoleEnum.teacher.value])
async def get_statistics(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """获取体测统计数据"""
    
    stats = get_physical_test_statistics(db)
    # 直接返回统计数据，FastAPI会自动验证和转换为响应模型
    return stats

# 获取体测历史数据，支持多条件过滤
@router.get("/history", response_model=List[dict])
@require_role([UserRoleEnum.admin.value, UserRoleEnum.teacher.value])
async def get_physical_test_history_api(
    student_id: Optional[int] = Query(None, description="学生ID"),
    class_id: Optional[int] = Query(None, description="班级ID"),
    grade: Optional[str] = Query(None, description="年级"),
    academic_year: Optional[str] = Query(None, description="学年"),
    school_year_id: Optional[int] = Query(None, description="学年ID"),
    test_type: Optional[str] = Query(None, description="测试类型"),
    start_date: Optional[date] = Query(None, description="开始日期"),
    end_date: Optional[date] = Query(None, description="结束日期"),
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回的记录数"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """获取体测历史数据，支持多条件过滤"""
    
    # 构建过滤条件
    filters = {}
    if student_id:
        filters['student_id'] = student_id
    if class_id:
        filters['class_id'] = class_id
    if grade:
        filters['grade'] = grade
    if academic_year:
        filters['academic_year'] = academic_year
    if school_year_id:
        filters['school_year_id'] = school_year_id
    if test_type:
        filters['test_type'] = test_type
    if start_date:
        filters['start_date'] = start_date
    if end_date:
        filters['end_date'] = end_date
    
    # 获取体测历史数据
    history_data = get_physical_test_history(db, filters, skip, limit)
    return history_data

# 获取体测记录列表
@router.get("/", response_model=List[dict])
@require_role([UserRoleEnum.admin.value, UserRoleEnum.teacher.value])
async def read_physical_tests(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回的记录数"),
    student_id: Optional[int] = Query(None, description="学生ID"),
    class_id: Optional[int] = Query(None, description="班级ID"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """获取体测记录列表，可以按学生ID或班级ID过滤"""
    
    if student_id:
        return get_physical_tests_by_student(db, student_id)
    elif class_id:
        return get_physical_tests_by_class(db, class_id)
    else:
        return get_physical_tests(db, skip=skip, limit=limit)

# 获取单个体测记录
@router.get("/{physical_test_id}", response_model=dict)
@require_role([UserRoleEnum.admin.value, UserRoleEnum.teacher.value, UserRoleEnum.student.value])
async def read_physical_test(
    physical_test_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """获取单个体测记录的详细信息"""
    
    db_physical_test = get_physical_test(db, physical_test_id)
    if db_physical_test is None:
        raise HTTPException(status_code=404, detail="体测记录不存在")
    
    # 学生只能查看自己的体测记录
    if current_user["role"] == UserRoleEnum.student and current_user["id"] != db_physical_test["student_id"]:
        raise HTTPException(status_code=403, detail="没有权限查看此体测记录")
    
    return db_physical_test

# 创建体测记录
@router.post("/", response_model=dict)
@require_role([UserRoleEnum.admin.value, UserRoleEnum.teacher.value])
async def create_physical_test_api(
    physical_test: PhysicalTestCreate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """创建新的体测记录"""
    created_test = create_physical_test(db=db, physical_test=physical_test)
    # 查询完整的测试记录，包含关联的学生和班级信息
    return get_physical_test(db, created_test.id)

# 更新体测记录
@router.put("/{physical_test_id}", response_model=dict)
async def update_physical_test_api(
    physical_test_id: int,
    physical_test: PhysicalTestUpdate,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """更新体测记录"""
    
    success = update_physical_test(db, physical_test_id, physical_test)
    if not success:
        raise HTTPException(status_code=404, detail="体测记录不存在")
    
    # 查询更新后的完整测试记录
    return get_physical_test(db, physical_test_id)

# 删除体测记录
@router.delete("/{physical_test_id}", response_model=BaseResponse)
@require_role([UserRoleEnum.admin.value, UserRoleEnum.teacher.value])
async def delete_physical_test_api(
    physical_test_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """删除体测记录"""
    
    success = delete_physical_test(db, physical_test_id)
    if not success:
        raise HTTPException(status_code=404, detail="体测记录不存在")
    
    return BaseResponse(message="体测记录删除成功")
