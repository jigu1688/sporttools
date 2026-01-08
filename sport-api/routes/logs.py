# 体育教学辅助网站 - 日志API路由
# 处理日志相关的HTTP请求

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from auth import get_current_user, require_role
from models import UserActivityLog, DataChangeLog
from schemas import UserActivityLogResponse
from models import UserRoleEnum

router = APIRouter(
    prefix="/api/v1/logs",
    tags=["logs"],
    responses={404: {"description": "Not found"}},
)

# 获取用户活动日志列表
@router.get("/user-activities", response_model=List[UserActivityLogResponse])
@require_role([UserRoleEnum.admin.value])
async def read_user_activity_logs(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回的记录数"),
    user_id: Optional[int] = Query(None, description="用户ID"),
    action: Optional[str] = Query(None, description="操作类型"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """获取用户活动日志列表"""
    
    query = db.query(UserActivityLog)
    
    if user_id:
        query = query.filter(UserActivityLog.user_id == user_id)
    if action:
        query = query.filter(UserActivityLog.action == action)
    
    return query.offset(skip).limit(limit).all()

# 获取数据变更日志列表
@router.get("/data-changes", response_model=List[dict])
@require_role([UserRoleEnum.admin.value])
async def read_data_change_logs(
    skip: int = Query(0, ge=0, description="跳过的记录数"),
    limit: int = Query(100, ge=1, le=1000, description="返回的记录数"),
    table_name: Optional[str] = Query(None, description="表名"),
    operation: Optional[str] = Query(None, description="操作类型"),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """获取数据变更日志列表"""
    
    query = db.query(DataChangeLog)
    
    if table_name:
        query = query.filter(DataChangeLog.table_name == table_name)
    if operation:
        query = query.filter(DataChangeLog.operation == operation)
    
    logs = query.offset(skip).limit(limit).all()
    return [{
        "id": log.id,
        "table_name": log.table_name,
        "record_id": log.record_id,
        "operation": log.operation,
        "old_data": log.old_data,
        "new_data": log.new_data,
        "operator_id": log.operator_id,
        "operator_name": log.operator_name,
        "operation_time": log.operation_time,
        "operation_reason": log.operation_reason
    } for log in logs]
