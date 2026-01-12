# 运动会管理API路由
# 运动会、项目、报名、日程等相关接口

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from database import get_db
from crud import sports_meet_crud
from schemas import (
    SportsMeetCreate, SportsMeetUpdate, SportsMeetResponse,
    EventCreate, EventUpdate, EventResponse,
    VenueCreate, VenueUpdate, VenueResponse,
    RegistrationCreate, RegistrationUpdate, RegistrationResponse,
    ScheduleCreate, ScheduleUpdate, ScheduleResponse,
    EventResultCreate, EventResultUpdate, EventResultResponse
)
from auth import get_current_user, require_role
from models import User, UserRoleEnum

# 创建路由器
router = APIRouter(tags=["sports_meets"])


# 运动会仪表盘
@router.get("/dashboard", response_model=dict)
def get_dashboard(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取运动会仪表盘数据"""
    return sports_meet_crud.get_dashboard_data(db)


# 运动会列表
@router.get("", response_model=List[SportsMeetResponse])
def get_sports_meets(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=500),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取运动会列表"""
    items, total = sports_meet_crud.get_sports_meets(db, skip=skip, limit=limit)
    return items


# 获取运动会详情
@router.get("/{sports_meet_id}", response_model=SportsMeetResponse)
def get_sports_meet(
    sports_meet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取运动会详情"""
    sports_meet = sports_meet_crud.get_sports_meet(db, sports_meet_id)
    if not sports_meet:
        raise HTTPException(status_code=404, detail="运动会不存在")
    return sports_meet


# 创建运动会
@router.post("", response_model=SportsMeetResponse)
@require_role([UserRoleEnum.admin.value, UserRoleEnum.teacher.value])
def create_sports_meet(
    sports_meet: SportsMeetCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建运动会"""
    return sports_meet_crud.create_sports_meet(db, sports_meet)


# 更新运动会
@router.put("/{sports_meet_id}", response_model=SportsMeetResponse)
@require_role([UserRoleEnum.admin.value, UserRoleEnum.teacher.value])
def update_sports_meet(
    sports_meet_id: int,
    sports_meet: SportsMeetUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新运动会"""
    result = sports_meet_crud.update_sports_meet(db, sports_meet_id, sports_meet)
    if not result:
        raise HTTPException(status_code=404, detail="运动会不存在")
    return result


# 删除运动会
@router.delete("/{sports_meet_id}", response_model=dict)
@require_role([UserRoleEnum.admin.value, UserRoleEnum.teacher.value])
def delete_sports_meet(
    sports_meet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除运动会"""
    result = sports_meet_crud.delete_sports_meet(db, sports_meet_id)
    if not result:
        raise HTTPException(status_code=404, detail="运动会不存在")
    return {"message": "运动会已删除"}


# 项目相关接口

# 获取项目列表
@router.get("/{sports_meet_id}/events", response_model=List[EventResponse])
def get_events(
    sports_meet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取运动会的所有项目"""
    return sports_meet_crud.get_events(db, sports_meet_id=sports_meet_id)


# 创建项目
@router.post("/{sports_meet_id}/events", response_model=EventResponse)
def create_event(
    sports_meet_id: int,
    event: EventCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建项目"""
    event_data = event.dict()
    event_data['sports_meet_id'] = sports_meet_id
    return sports_meet_crud.create_event(db, EventCreate(**event_data))


# 更新项目
@router.put("/{sports_meet_id}/events/{event_id}", response_model=EventResponse)
def update_event(
    sports_meet_id: int,
    event_id: int,
    event: EventUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新项目"""
    result = sports_meet_crud.update_event(db, event_id, event)
    if not result:
        raise HTTPException(status_code=404, detail="项目不存在")
    return result


# 删除项目
@router.delete("/{sports_meet_id}/events/{event_id}", response_model=dict)
def delete_event(
    sports_meet_id: int,
    event_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除项目"""
    result = sports_meet_crud.delete_event(db, event_id)
    if not result:
        raise HTTPException(status_code=404, detail="项目不存在")
    return {"message": "项目已删除"}


# 报名相关接口

# 获取报名列表
@router.get("/{sports_meet_id}/registrations", response_model=List[RegistrationResponse])
def get_registrations(
    sports_meet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取运动会的所有报名"""
    return sports_meet_crud.get_registrations(db, sports_meet_id=sports_meet_id)


# 创建报名
@router.post("/{sports_meet_id}/registrations", response_model=RegistrationResponse)
def create_registration(
    sports_meet_id: int,
    registration: RegistrationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建报名"""
    reg_data = registration.dict()
    reg_data['sports_meet_id'] = sports_meet_id
    return sports_meet_crud.create_registration(db, RegistrationCreate(**reg_data))


# 更新报名
@router.put("/{sports_meet_id}/registrations/{registration_id}", response_model=RegistrationResponse)
def update_registration(
    sports_meet_id: int,
    registration_id: int,
    registration: RegistrationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新报名"""
    result = sports_meet_crud.update_registration(db, registration_id, registration)
    if not result:
        raise HTTPException(status_code=404, detail="报名不存在")
    return result


# 删除报名
@router.delete("/{sports_meet_id}/registrations/{registration_id}", response_model=dict)
def delete_registration(
    sports_meet_id: int,
    registration_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除报名"""
    result = sports_meet_crud.delete_registration(db, registration_id)
    if not result:
        raise HTTPException(status_code=404, detail="报名不存在")
    return {"message": "报名已删除"}


# 场地相关接口

# 获取场地列表
@router.get("/{sports_meet_id}/venues", response_model=List[VenueResponse])
def get_venues(
    sports_meet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取运动会的所有场地"""
    return sports_meet_crud.get_venues(db, sports_meet_id=sports_meet_id)


# 创建场地
@router.post("/{sports_meet_id}/venues", response_model=VenueResponse)
def create_venue(
    sports_meet_id: int,
    venue: VenueCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建场地"""
    venue_data = venue.dict()
    venue_data['sports_meet_id'] = sports_meet_id
    return sports_meet_crud.create_venue(db, VenueCreate(**venue_data))


# 更新场地
@router.put("/{sports_meet_id}/venues/{venue_id}", response_model=VenueResponse)
def update_venue(
    sports_meet_id: int,
    venue_id: int,
    venue: VenueUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新场地"""
    result = sports_meet_crud.update_venue(db, venue_id, venue)
    if not result:
        raise HTTPException(status_code=404, detail="场地不存在")
    return result


# 删除场地
@router.delete("/{sports_meet_id}/venues/{venue_id}", response_model=dict)
def delete_venue(
    sports_meet_id: int,
    venue_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除场地"""
    result = sports_meet_crud.delete_venue(db, venue_id)
    if not result:
        raise HTTPException(status_code=404, detail="场地不存在")
    return {"message": "场地已删除"}


# 日程相关接口

# 获取日程列表
@router.get("/{sports_meet_id}/schedules", response_model=List[ScheduleResponse])
def get_schedules(
    sports_meet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取运动会的所有日程"""
    return sports_meet_crud.get_schedules(db, sports_meet_id=sports_meet_id)


# 创建日程
@router.post("/{sports_meet_id}/schedules", response_model=ScheduleResponse)
def create_schedule(
    sports_meet_id: int,
    schedule: ScheduleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """创建日程"""
    schedule_data = schedule.dict()
    schedule_data['sports_meet_id'] = sports_meet_id
    return sports_meet_crud.create_schedule(db, ScheduleCreate(**schedule_data))


# 更新日程
@router.put("/{sports_meet_id}/schedules/{schedule_id}", response_model=ScheduleResponse)
def update_schedule(
    sports_meet_id: int,
    schedule_id: int,
    schedule: ScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新日程"""
    result = sports_meet_crud.update_schedule(db, schedule_id, schedule)
    if not result:
        raise HTTPException(status_code=404, detail="日程不存在")
    return result


# 删除日程
@router.delete("/{sports_meet_id}/schedules/{schedule_id}", response_model=dict)
def delete_schedule(
    sports_meet_id: int,
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除日程"""
    result = sports_meet_crud.delete_schedule(db, schedule_id)
    if not result:
        raise HTTPException(status_code=404, detail="日程不存在")
    return {"message": "日程已删除"}


# 成绩相关接口

# 获取成绩列表
@router.get("/{sports_meet_id}/results", response_model=List[EventResultResponse])
def get_results(
    sports_meet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """获取运动会的所有成绩"""
    return sports_meet_crud.get_event_results(db, sports_meet_id=sports_meet_id)


# 录入成绩
@router.post("/{sports_meet_id}/results", response_model=EventResultResponse)
def create_result(
    sports_meet_id: int,
    result: EventResultCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """录入成绩"""
    return sports_meet_crud.create_event_result(db, result)


# 更新成绩
@router.put("/{sports_meet_id}/results/{result_id}", response_model=EventResultResponse)
def update_result(
    sports_meet_id: int,
    result_id: int,
    result: EventResultUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """更新成绩"""
    updated = sports_meet_crud.update_event_result(db, result_id, result)
    if not updated:
        raise HTTPException(status_code=404, detail="成绩不存在")
    return updated


# 删除成绩
@router.delete("/{sports_meet_id}/results/{result_id}", response_model=dict)
def delete_result(
    sports_meet_id: int,
    result_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """删除成绩"""
    result = sports_meet_crud.delete_event_result(db, result_id)
    if not result:
        raise HTTPException(status_code=404, detail="成绩不存在")
    return {"message": "成绩已删除"}
