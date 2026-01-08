# 体育教学辅助网站 - 学生管理API路由
# 学生档案管理相关接口

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import SessionLocal
from crud import student_crud, class_crud, school_crud
from schemas import (
    StudentCreate, StudentUpdate, StudentResponse, StudentDetailResponse,
    StudentListResponse, StudentQueryParams, BaseResponse, ErrorResponse,
    ClassResponse, SchoolResponse
)
from models import GenderEnum, StatusEnum, SportsLevelEnum
import models

# 创建路由器
router = APIRouter(prefix="/api/v1/students", tags=["students"])

# 依赖注入：获取数据库会话
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@router.get("/", response_model=StudentListResponse)
async def get_students(
    page: int = Query(1, ge=1, description="页码"),
    page_size: int = Query(10, ge=1, le=100, description="每页数量"),
    search: Optional[str] = Query(None, description="搜索关键词（姓名、学籍号、身份证号）"),
    class_id: Optional[int] = Query(None, description="班级ID"),
    grade: Optional[str] = Query(None, description="年级"),
    gender: Optional[GenderEnum] = Query(None, description="性别"),
    status: Optional[StatusEnum] = Query(None, description="状态"),
    sports_level: Optional[SportsLevelEnum] = Query(None, description="体育水平"),
    db: Session = Depends(get_db)
):
    """
    获取学生列表
    
    支持分页、搜索和多条件过滤：
    - 搜索：按姓名、学籍号、身份证号模糊搜索
    - 班级过滤：按班级ID过滤
    - 年级过滤：按年级过滤
    - 性别过滤：按性别过滤
    - 状态过滤：按状态过滤
    - 体育水平过滤：按体育水平过滤
    """
    try:
        # 构建查询参数
        params = StudentQueryParams(
            page=page,
            page_size=page_size,
            search=search,
            class_id=class_id,
            grade=grade,
            gender=gender,
            status=status,
            sports_level=sports_level
        )
        
        # 获取学生列表和总数
        students, total = student_crud.get_students(db, params)
        
        # 计算分页信息
        total_pages = (total + page_size - 1) // page_size
        
        return StudentListResponse(
            total=total,
            page=page,
            page_size=page_size,
            total_pages=total_pages,
            items=[StudentResponse.model_validate(student) for student in students]
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取学生列表失败: {str(e)}")

@router.get("/{student_id}", response_model=StudentDetailResponse)
async def get_student(student_id: int, db: Session = Depends(get_db)):
    """
    获取学生详细信息
    
    返回学生的基本信息以及班级关联信息
    """
    try:
        student = student_crud.get_student(db, student_id)
        if not student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 获取学生详细信息（包括班级关联）
        student_detail = StudentDetailResponse.model_validate(student)
        
        # 获取学生的班级历史
        class_history = student_crud.get_student_classes(db, student_id)
        student_detail.class_relations = class_history
        
        return student_detail
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取学生信息失败: {str(e)}")

@router.post("/", response_model=StudentResponse, status_code=201)
async def create_student(student_data: StudentCreate, db: Session = Depends(get_db)):
    """
    创建新学生
    
    需要提供完整的 学生基本信息
    """
    try:
        # 检查学籍号是否已存在
        existing_student = student_crud.get_student_by_student_no(db, student_data.student_no)
        if existing_student:
            raise HTTPException(status_code=400, detail="学籍号已存在")
        
        # 创建学生
        new_student = student_crud.create_student(db, student_data)
        
        return StudentResponse.model_validate(new_student)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"创建学生失败: {str(e)}")

@router.put("/{student_id}", response_model=StudentResponse)
async def update_student(student_id: int, student_data: StudentUpdate, db: Session = Depends(get_db)):
    """
    更新学生信息
    
    可以部分更新学生信息，未提供的字段将保持不变
    """
    try:
        # 检查学生是否存在
        existing_student = student_crud.get_student(db, student_id)
        if not existing_student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 更新学生信息
        updated_student = student_crud.update_student(db, student_id, student_data)
        
        return StudentResponse.model_validate(updated_student)
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"更新学生信息失败: {str(e)}")

@router.delete("/{student_id}", response_model=BaseResponse)
async def delete_student(student_id: int, db: Session = Depends(get_db)):
    """
    删除学生
    
    删除学生及其所有相关的班级关联信息
    """
    try:
        # 检查学生是否存在
        existing_student = student_crud.get_student(db, student_id)
        if not existing_student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 删除学生
        success = student_crud.delete_student(db, student_id)
        if not success:
            raise HTTPException(status_code=500, detail="删除学生失败")
        
        return BaseResponse(message="学生删除成功")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"删除学生失败: {str(e)}")

@router.get("/{student_id}/classes", response_model=List[dict])
async def get_student_classes(student_id: int, db: Session = Depends(get_db)):
    """
    获取学生的班级历史
    
    返回学生曾经所属的所有班级信息
    """
    try:
        # 检查学生是否存在
        existing_student = student_crud.get_student(db, student_id)
        if not existing_student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 获取班级历史
        class_history = student_crud.get_student_classes(db, student_id)
        
        return class_history
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取学生班级历史失败: {str(e)}")

@router.post("/{student_id}/classes", response_model=BaseResponse)
async def assign_student_to_class(
    student_id: int,
    class_id: int,
    academic_year: str,
    join_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    将学生分配到班级
    
    - student_id: 学生ID
    - class_id: 班级ID
    - academic_year: 学年
    - join_date: 加入日期（可选，默认为今天）
    """
    try:
        from datetime import datetime
        
        # 检查学生是否存在
        existing_student = student_crud.get_student(db, student_id)
        if not existing_student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 检查班级是否存在
        class_obj = db.query(models.Class).filter(models.Class.id == class_id).first()
        if not class_obj:
            raise HTTPException(status_code=404, detail="班级不存在")
        
        # 解析加入日期
        if join_date:
            join_date_obj = datetime.strptime(join_date, "%Y-%m-%d").date()
        else:
            from datetime import date
            join_date_obj = date.today()
        
        # 分配到班级
        success = student_crud.assign_student_to_class(
            db, student_id, class_id, academic_year, join_date_obj
        )
        
        if not success:
            raise HTTPException(status_code=400, detail="学生已在该班级中")
        
        return BaseResponse(message="学生分配到班级成功")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"分配学生到班级失败: {str(e)}")

@router.delete("/{student_id}/classes/{class_id}", response_model=BaseResponse)
async def remove_student_from_class(
    student_id: int,
    class_id: int,
    academic_year: str,
    leave_date: Optional[str] = None,
    db: Session = Depends(get_db)
):
    """
    将学生从班级中移除
    
    - student_id: 学生ID
    - class_id: 班级ID
    - academic_year: 学年
    - leave_date: 离开日期（可选，默认为今天）
    """
    try:
        from datetime import datetime
        
        # 解析离开日期
        if leave_date:
            leave_date_obj = datetime.strptime(leave_date, "%Y-%m-%d").date()
        else:
            from datetime import date
            leave_date_obj = date.today()
        
        # 从班级中移除
        success = student_crud.remove_student_from_class(
            db, student_id, class_id, academic_year, leave_date_obj
        )
        
        if not success:
            raise HTTPException(status_code=404, detail="学生不在该班级中")
        
        return BaseResponse(message="学生从班级移除成功")
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"从班级移除学生失败: {str(e)}")

@router.get("/{student_id}/history")
async def get_student_history(student_id: int, db: Session = Depends(get_db)):
    """
    获取学生历史记录，包含基本信息和体测成绩
    
    返回学生的完整历史记录，包括：
    - 基本信息
    - 班级历史
    - 体测成绩历史
    """
    try:
        # 检查学生是否存在
        existing_student = student_crud.get_student(db, student_id)
        if not existing_student:
            raise HTTPException(status_code=404, detail="学生不存在")
        
        # 获取学生历史记录
        student_history = student_crud.get_student_history(db, student_id)
        
        return student_history
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"获取学生历史记录失败: {str(e)}")