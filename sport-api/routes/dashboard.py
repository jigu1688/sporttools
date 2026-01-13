# 体育教学辅助网站 - 主仪表盘API路由
# 提供系统概览数据

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from datetime import datetime, timedelta
from database import get_db
from auth import get_current_user
from models import Student, Class, User, PhysicalTest

router = APIRouter(tags=["dashboard"])

@router.get("/overview")
async def get_dashboard_overview(
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    获取主仪表盘概览数据
    
    返回班级数、学生数、用户数、体测完成情况等统计
    """
    # 统计总数
    total_classes = db.query(Class).count()
    total_students = db.query(Student).count()
    total_users = db.query(User).count()
    
    # 体测统计
    tested_students = db.query(PhysicalTest.student_id).distinct().count()
    
    # 今日新增
    today = datetime.now().date()
    today_new_students = db.query(Student).filter(
        func.date(Student.created_at) == today
    ).count()
    
    return {
        "totalClasses": total_classes,
        "totalStudents": total_students,
        "totalUsers": total_users,
        "testedStudents": tested_students,
        "todayNewStudents": today_new_students,
        "testCompletionRate": round(tested_students / total_students * 100, 1) if total_students > 0 else 0
    }


@router.get("/recent-activities")
async def get_recent_activities(
    limit: int = 10,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    获取近期活动记录
    
    基于最近的体测记录和学生变动生成活动列表
    """
    activities = []
    
    # 获取最近的体测记录
    recent_tests = db.query(PhysicalTest).order_by(PhysicalTest.created_at.desc()).limit(limit).all()
    
    for test in recent_tests:
        time_diff = datetime.now() - test.created_at
        if time_diff.days > 0:
            time_str = f"{time_diff.days}天前"
        elif time_diff.seconds > 3600:
            time_str = f"{time_diff.seconds // 3600}小时前"
        elif time_diff.seconds > 60:
            time_str = f"{time_diff.seconds // 60}分钟前"
        else:
            time_str = "刚刚"
        
        # 获取学生和班级信息
        student = db.query(Student).filter(Student.id == test.student_id).first()
        student_name = student.real_name if student else "未知学生"
        
        activities.append({
            "id": test.id,
            "title": f"{student_name} 完成体测",
            "time": time_str,
            "status": "success",
            "timestamp": test.created_at.isoformat()
        })
    
    # 获取最近新增的学生
    recent_students = db.query(Student).order_by(Student.created_at.desc()).limit(5).all()
    
    for student in recent_students:
        time_diff = datetime.now() - student.created_at
        if time_diff.days > 0:
            time_str = f"{time_diff.days}天前"
        elif time_diff.seconds > 3600:
            time_str = f"{time_diff.seconds // 3600}小时前"
        elif time_diff.seconds > 60:
            time_str = f"{time_diff.seconds // 60}分钟前"
        else:
            time_str = "刚刚"
        
        activities.append({
            "id": f"student_{student.id}",
            "title": f"新增学生: {student.real_name}",
            "time": time_str,
            "status": "info",
            "timestamp": student.created_at.isoformat()
        })
    
    # 按时间排序并限制数量
    activities.sort(key=lambda x: x['timestamp'], reverse=True)
    return activities[:limit]


@router.get("/class-ranking")
async def get_class_ranking(
    limit: int = 5,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    """
    获取班级排名数据
    
    基于学生数量和体测完成率计算活跃度
    """
    # 获取所有班级
    classes = db.query(Class).all()
    
    ranking = []
    for cls in classes:
        # 获取班级学生数
        student_count = db.query(Student).filter(Student.class_id == cls.id).count()
        
        # 获取班级已测试学生数
        tested_count = db.query(PhysicalTest.student_id).filter(
            PhysicalTest.class_id == cls.id
        ).distinct().count()
        
        # 计算体测完成率作为活跃度指标
        completion_rate = round(tested_count / student_count * 100) if student_count > 0 else 0
        
        ranking.append({
            "id": cls.id,
            "name": f"{cls.grade} {cls.class_name}",
            "students": student_count,
            "testedStudents": tested_count,
            "rate": completion_rate
        })
    
    # 按学生数排序，取前N名
    ranking.sort(key=lambda x: x['students'], reverse=True)
    return ranking[:limit]
