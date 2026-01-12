# 体育教学辅助网站 - 运动会相关CRUD操作
# 提供运动会相关的数据访问功能

from sqlalchemy.orm import Session
from models import SportsMeet, Event, Venue, Registration, Schedule, EventResult, SportsMeetStatusEnum
from schemas import (
    SportsMeetCreate, SportsMeetUpdate, EventCreate, EventUpdate,
    VenueCreate, VenueUpdate, RegistrationCreate, RegistrationUpdate,
    ScheduleCreate, ScheduleUpdate, EventResultCreate, EventResultUpdate
)

# 运动会相关CRUD

def get_sports_meets(db: Session, skip: int = 0, limit: int = 100):
    """获取运动会列表"""
    return db.query(SportsMeet).offset(skip).limit(limit).all(), db.query(SportsMeet).count()

def get_sports_meet(db: Session, sports_meet_id: int):
    """根据ID获取运动会"""
    return db.query(SportsMeet).filter(SportsMeet.id == sports_meet_id).first()

def create_sports_meet(db: Session, sports_meet: SportsMeetCreate):
    """创建运动会"""
    db_sports_meet = SportsMeet(**sports_meet.dict())
    db.add(db_sports_meet)
    db.commit()
    db.refresh(db_sports_meet)
    return db_sports_meet

def update_sports_meet(db: Session, sports_meet_id: int, sports_meet: SportsMeetUpdate):
    """更新运动会"""
    db_sports_meet = get_sports_meet(db, sports_meet_id)
    if db_sports_meet:
        update_data = sports_meet.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_sports_meet, key, value)
        db.commit()
        db.refresh(db_sports_meet)
    return db_sports_meet

def delete_sports_meet(db: Session, sports_meet_id: int):
    """删除运动会"""
    db_sports_meet = get_sports_meet(db, sports_meet_id)
    if db_sports_meet:
        db.delete(db_sports_meet)
        db.commit()
    return db_sports_meet

def get_dashboard_data(db: Session):
    """获取运动会仪表盘数据"""
    # 总运动会数
    total_sports_meets = db.query(SportsMeet).count()
    
    # 即将举行的运动会数（状态为planning、registration或scheduled）
    from datetime import date
    upcoming_sports_meets = db.query(SportsMeet).filter(
        SportsMeet.status.in_([SportsMeetStatusEnum.planning, SportsMeetStatusEnum.registration, SportsMeetStatusEnum.scheduled]),
        SportsMeet.start_date >= date.today()
    ).count()
    
    # 总运动员数（去重统计）
    total_athletes = db.query(Registration.student_id).distinct().count()
    
    # 总项目数
    total_events = db.query(Event).count()
    
    # 总报名数
    total_registrations = db.query(Registration).count()
    
    return {
        "totalSportsMeets": total_sports_meets,
        "upcomingSportsMeets": upcoming_sports_meets,
        "totalAthletes": total_athletes,
        "totalEvents": total_events,
        "totalRegistrations": total_registrations
    }

# 项目相关CRUD

def get_events(db: Session, skip: int = 0, limit: int = 100):
    """获取项目列表"""
    return db.query(Event).offset(skip).limit(limit).all(), db.query(Event).count()

def get_events_by_sports_meet(db: Session, sports_meet_id: int, skip: int = 0, limit: int = 100):
    """根据运动会ID获取项目列表"""
    return db.query(Event).filter(Event.sports_meet_id == sports_meet_id).offset(skip).limit(limit).all()

def get_event(db: Session, event_id: int):
    """根据ID获取项目"""
    return db.query(Event).filter(Event.id == event_id).first()

def create_event(db: Session, event: EventCreate):
    """创建项目"""
    db_event = Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def update_event(db: Session, event_id: int, event: EventUpdate):
    """更新项目"""
    db_event = get_event(db, event_id)
    if db_event:
        update_data = event.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_event, key, value)
        db.commit()
        db.refresh(db_event)
    return db_event

def delete_event(db: Session, event_id: int):
    """删除项目"""
    db_event = get_event(db, event_id)
    if db_event:
        db.delete(db_event)
        db.commit()
    return db_event

# 场馆相关CRUD

def get_venues(db: Session, skip: int = 0, limit: int = 100):
    """获取场馆列表"""
    return db.query(Venue).offset(skip).limit(limit).all(), db.query(Venue).count()

def get_venue(db: Session, venue_id: int):
    """根据ID获取场馆"""
    return db.query(Venue).filter(Venue.id == venue_id).first()

def create_venue(db: Session, venue: VenueCreate):
    """创建场馆"""
    db_venue = Venue(**venue.dict())
    db.add(db_venue)
    db.commit()
    db.refresh(db_venue)
    return db_venue

def update_venue(db: Session, venue_id: int, venue: VenueUpdate):
    """更新场馆"""
    db_venue = get_venue(db, venue_id)
    if db_venue:
        update_data = venue.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_venue, key, value)
        db.commit()
        db.refresh(db_venue)
    return db_venue

def delete_venue(db: Session, venue_id: int):
    """删除场馆"""
    db_venue = get_venue(db, venue_id)
    if db_venue:
        db.delete(db_venue)
        db.commit()
    return db_venue

# 报名相关CRUD

def get_registrations(db: Session, skip: int = 0, limit: int = 100):
    """获取报名列表"""
    return db.query(Registration).offset(skip).limit(limit).all(), db.query(Registration).count()

def get_registrations_by_sports_meet(db: Session, sports_meet_id: int, skip: int = 0, limit: int = 100):
    """根据运动会ID获取报名列表"""
    registrations = db.query(Registration).filter(Registration.sports_meet_id == sports_meet_id).offset(skip).limit(limit).all()
    return [{
        "id": reg.id,
        "sports_meet_id": reg.sports_meet_id,
        "event_id": reg.event_id,
        "student_id": reg.student_id,
        "status": reg.status.value if reg.status else None,
        "assigned_number": reg.assigned_number,
        "registration_time": reg.registration_time,
        "final_result": reg.final_result,
        "rank": reg.rank,
        "is_winner": reg.is_winner,
        "created_at": reg.created_at,
        "updated_at": reg.updated_at
    } for reg in registrations]

def get_registration(db: Session, registration_id: int):
    """根据ID获取报名"""
    return db.query(Registration).filter(Registration.id == registration_id).first()

def create_registration(db: Session, registration: RegistrationCreate):
    """创建报名"""
    db_registration = Registration(**registration.dict())
    db.add(db_registration)
    db.commit()
    db.refresh(db_registration)
    return db_registration

def update_registration(db: Session, registration_id: int, registration: RegistrationUpdate):
    """更新报名"""
    db_registration = get_registration(db, registration_id)
    if db_registration:
        update_data = registration.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_registration, key, value)
        db.commit()
        db.refresh(db_registration)
    return db_registration

def delete_registration(db: Session, registration_id: int):
    """删除报名"""
    db_registration = get_registration(db, registration_id)
    if db_registration:
        db.delete(db_registration)
        db.commit()
    return db_registration

# 赛程相关CRUD

def get_schedules(db: Session, skip: int = 0, limit: int = 100):
    """获取赛程列表"""
    return db.query(Schedule).offset(skip).limit(limit).all(), db.query(Schedule).count()

def get_schedules_by_sports_meet(db: Session, sports_meet_id: int, skip: int = 0, limit: int = 100):
    """根据运动会ID获取赛程列表"""
    return db.query(Schedule).filter(Schedule.sports_meet_id == sports_meet_id).offset(skip).limit(limit).all()

def get_schedule(db: Session, schedule_id: int):
    """根据ID获取赛程"""
    return db.query(Schedule).filter(Schedule.id == schedule_id).first()

def create_schedule(db: Session, schedule: ScheduleCreate):
    """创建赛程"""
    db_schedule = Schedule(**schedule.dict())
    db.add(db_schedule)
    db.commit()
    db.refresh(db_schedule)
    return db_schedule

def update_schedule(db: Session, schedule_id: int, schedule: ScheduleUpdate):
    """更新赛程"""
    db_schedule = get_schedule(db, schedule_id)
    if db_schedule:
        update_data = schedule.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_schedule, key, value)
        db.commit()
        db.refresh(db_schedule)
    return db_schedule

def delete_schedule(db: Session, schedule_id: int):
    """删除赛程"""
    db_schedule = get_schedule(db, schedule_id)
    if db_schedule:
        db.delete(db_schedule)
        db.commit()
    return db_schedule

# 项目成绩相关CRUD

def get_event_results(db: Session, skip: int = 0, limit: int = 100):
    """获取项目成绩列表"""
    return db.query(EventResult).offset(skip).limit(limit).all(), db.query(EventResult).count()

def get_event_results_by_event(db: Session, event_id: int, skip: int = 0, limit: int = 100):
    """根据项目ID获取成绩列表"""
    return db.query(EventResult).filter(EventResult.event_id == event_id).offset(skip).limit(limit).all()

def get_event_result(db: Session, event_result_id: int):
    """根据ID获取项目成绩"""
    return db.query(EventResult).filter(EventResult.id == event_result_id).first()

def create_event_result(db: Session, event_result: EventResultCreate):
    """创建项目成绩"""
    db_event_result = EventResult(**event_result.dict())
    db.add(db_event_result)
    db.commit()
    db.refresh(db_event_result)
    return db_event_result

def update_event_result(db: Session, event_result_id: int, event_result: EventResultUpdate):
    """更新项目成绩"""
    db_event_result = get_event_result(db, event_result_id)
    if db_event_result:
        update_data = event_result.dict(exclude_unset=True)
        for key, value in update_data.items():
            setattr(db_event_result, key, value)
        db.commit()
        db.refresh(db_event_result)
    return db_event_result

def delete_event_result(db: Session, event_result_id: int):
    """删除项目成绩"""
    db_event_result = get_event_result(db, event_result_id)
    if db_event_result:
        db.delete(db_event_result)
        db.commit()
    return db_event_result

# 报名验证逻辑

def validate_registration(db: Session, sports_meet_id: int, event_id: int, student_id: int) -> dict:
    """验证学生是否可以报名参加某个项目"""
    from models import Student, Class, StudentClassRelation, RegistrationStatusEnum, SportsMeetStatusEnum
    from datetime import date
    
    # 检查运动会是否存在
    sports_meet = db.query(SportsMeet).filter(SportsMeet.id == sports_meet_id).first()
    if not sports_meet:
        return {"valid": False, "reason": "运动会不存在"}
    
    # 检查运动会状态
    if sports_meet.status != SportsMeetStatusEnum.registration:
        return {"valid": False, "reason": "运动会不在报名期间"}
    
    # 检查项目是否存在
    event = db.query(Event).filter(Event.id == event_id).first()
    if not event:
        return {"valid": False, "reason": "项目不存在"}
    
    # 检查项目是否属于该运动会
    if event.sports_meet_id != sports_meet_id:
        return {"valid": False, "reason": "项目不属于该运动会"}
    
    # 检查学生是否存在
    student = db.query(Student).filter(Student.id == student_id).first()
    if not student:
        return {"valid": False, "reason": "学生不存在"}
    
    # 检查学生状态
    if student.status.value not in ['active']:
        return {"valid": False, "reason": "学生状态不允许报名"}
    
    # 获取学生当前班级
    current_class_relation = db.query(StudentClassRelation).filter(
        StudentClassRelation.student_id == student_id,
        StudentClassRelation.is_current == True
    ).first()
    
    if not current_class_relation:
        return {"valid": False, "reason": "学生没有当前班级"}
    
    # 获取班级信息
    class_obj = db.query(Class).filter(Class.id == current_class_relation.class_id).first()
    if not class_obj:
        return {"valid": False, "reason": "班级信息不存在"}
    
    # 检查年级限制
    if event.min_grade and class_obj.grade_level < event.min_grade:
        return {"valid": False, "reason": f"年级不足，最低要求{event.min_grade}年级"}
    
    if event.max_grade and class_obj.grade_level > event.max_grade:
        return {"valid": False, "reason": f"年级超标，最高允许{event.max_grade}年级"}
    
    # 检查性别限制
    if event.gender and student.gender != event.gender:
        return {"valid": False, "reason": "性别不符合要求"}
    
    # 检查是否已经报名该项目
    existing_registration = db.query(Registration).filter(
        Registration.sports_meet_id == sports_meet_id,
        Registration.event_id == event_id,
        Registration.student_id == student_id,
        Registration.status.in_([RegistrationStatusEnum.pending, RegistrationStatusEnum.approved])
    ).first()
    
    if existing_registration:
        return {"valid": False, "reason": "已经报名过该项目"}
    
    # 检查该运动会中是否已经报名了其他项目
    other_registrations = db.query(Registration).filter(
        Registration.sports_meet_id == sports_meet_id,
        Registration.student_id == student_id,
        Registration.status.in_([RegistrationStatusEnum.pending, RegistrationStatusEnum.approved])
    ).count()
    
    if other_registrations >= 3:
        return {"valid": False, "reason": "每个学生最多只能报名3个项目"}
    
    # 检查项目是否已满员
    if event.total_participants >= 50:
        return {"valid": False, "reason": "该项目报名人数已满"}
    
    # 检查时间冲突
    if event.scheduled_time:
        conflicting_events = db.query(Event).join(Registration).filter(
            Registration.sports_meet_id == sports_meet_id,
            Registration.student_id == student_id,
            Registration.status.in_([RegistrationStatusEnum.pending, RegistrationStatusEnum.approved]),
            Event.scheduled_time == event.scheduled_time
        ).count()
        
        if conflicting_events > 0:
            return {"valid": False, "reason": "与已报名项目时间冲突"}
    
    # 检查学生健康状况
    if student.health_status and "严重" in student.health_status:
        return {"valid": False, "reason": "学生健康状况不适合参加比赛"}
    
    # 所有检查通过
    return {
        "valid": True,
        "reason": "验证通过",
        "student_info": {
            "name": student.real_name,
            "gender": student.gender.value,
            "class_name": class_obj.class_name,
            "grade_level": class_obj.grade_level
        },
        "event_info": {
            "name": event.name,
            "event_type": event.event_type.value,
            "scheduled_time": event.scheduled_time
        }
    }

def check_registration_conflicts(db: Session, sports_meet_id: int, student_id: int) -> dict:
    """检查学生的报名冲突"""
    from models import RegistrationStatusEnum
    
    # 获取该学生在该运动会的所有报名
    registrations = db.query(Registration).filter(
        Registration.sports_meet_id == sports_meet_id,
        Registration.student_id == student_id,
        Registration.status.in_([RegistrationStatusEnum.pending, RegistrationStatusEnum.approved])
    ).all()
    
    conflicts = []
    
    # 检查时间冲突
    for i, reg1 in enumerate(registrations):
        for reg2 in registrations[i+1:]:
            if (reg1.event.scheduled_time and reg2.event.scheduled_time and 
                reg1.event.scheduled_time == reg2.event.scheduled_time):
                conflicts.append({
                    "type": "time_conflict",
                    "events": [reg1.event.name, reg2.event.name],
                    "time": reg1.event.scheduled_time
                })
    
    # 检查项目类型冲突
    event_types = [reg.event.event_type.value for reg in registrations]
    if event_types.count("relay") > 1:
        conflicts.append({
            "type": "event_type_conflict",
            "message": "不能同时报名多个接力项目"
        })
    
    return {
        "has_conflicts": len(conflicts) > 0,
        "conflicts": conflicts,
        "total_registrations": len(registrations)
    }
