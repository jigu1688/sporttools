# 体育教学辅助网站 - 操作日志管理
# 提供详细的操作日志记录和查询功能

from sqlalchemy.orm import Session
from models import User, UserActivityLog, DataChangeLog
from typing import List, Dict, Any, Optional
from datetime import datetime, timedelta
from enum import Enum

class LogLevel(Enum):
    """日志级别枚举"""
    INFO = "info"
    WARNING = "warning"
    ERROR = "error"
    CRITICAL = "critical"

class OperationType(Enum):
    """操作类型枚举"""
    # 用户操作
    LOGIN = "login"
    LOGOUT = "logout"
    CHANGE_PASSWORD = "change_password"
    
    # 学生操作
    STUDENT_CREATE = "student_create"
    STUDENT_UPDATE = "student_update"
    STUDENT_DELETE = "student_delete"
    STUDENT_TRANSFER = "student_transfer"
    
    # 班级操作
    CLASS_CREATE = "class_create"
    CLASS_UPDATE = "class_update"
    CLASS_DELETE = "class_delete"
    CLASS_ASSIGN_STUDENT = "class_assign_student"
    
    # 体测操作
    PHYSICAL_TEST_CREATE = "physical_test_create"
    PHYSICAL_TEST_UPDATE = "physical_test_update"
    PHYSICAL_TEST_DELETE = "physical_test_delete"
    PHYSICAL_TEST_CALCULATE = "physical_test_calculate"
    
    # 运动会操作
    SPORTS_MEET_CREATE = "sports_meet_create"
    SPORTS_MEET_UPDATE = "sports_meet_update"
    SPORTS_MEET_DELETE = "sports_meet_delete"
    
    # 报名操作
    REGISTRATION_CREATE = "registration_create"
    REGISTRATION_UPDATE = "registration_update"
    REGISTRATION_DELETE = "registration_delete"
    REGISTRATION_APPROVE = "registration_approve"
    REGISTRATION_REJECT = "registration_reject"
    
    # 成绩操作
    RESULT_CREATE = "result_create"
    RESULT_UPDATE = "result_update"
    RESULT_DELETE = "result_delete"
    
    # 系统操作
    DATA_EXPORT = "data_export"
    DATA_IMPORT = "data_import"
    SYSTEM_CONFIG = "system_config"

class ActivityLogger:
    """活动日志记录器"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_activity(
        self,
        user_id: int,
        action: str,
        resource: str,
        details: Optional[str] = None,
        ip_address: Optional[str] = None,
        user_agent: Optional[str] = None,
        log_level: LogLevel = LogLevel.INFO
    ):
        """记录用户活动"""
        try:
            log = UserActivityLog(
                user_id=user_id,
                action=action,
                resource=resource,
                details=details,
                ip_address=ip_address,
                user_agent=user_agent
            )
            self.db.add(log)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"日志记录失败: {str(e)}")
    
    def log_login(self, user: User, ip_address: str, user_agent: str):
        """记录用户登录"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.LOGIN.value,
            resource="auth",
            details=f"用户 {user.username} 登录成功",
            ip_address=ip_address,
            user_agent=user_agent,
            log_level=LogLevel.INFO
        )
        
        # 更新用户最后登录时间
        user.last_login_at = datetime.now()
        self.db.commit()
    
    def log_logout(self, user: User, ip_address: str, user_agent: str):
        """记录用户登出"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.LOGOUT.value,
            resource="auth",
            details=f"用户 {user.username} 登出",
            ip_address=ip_address,
            user_agent=user_agent,
            log_level=LogLevel.INFO
        )
    
    def log_student_create(self, user: User, student_id: int, student_name: str):
        """记录创建学生"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.STUDENT_CREATE.value,
            resource="student",
            details=f"创建学生: {student_name} (ID: {student_id})",
            log_level=LogLevel.INFO
        )
    
    def log_student_update(self, user: User, student_id: int, student_name: str, changes: Dict[str, Any]):
        """记录更新学生"""
        change_details = ", ".join([f"{k}={v}" for k, v in changes.items()])
        self.log_activity(
            user_id=user.id,
            action=OperationType.STUDENT_UPDATE.value,
            resource="student",
            details=f"更新学生: {student_name} (ID: {student_id}), 修改: {change_details}",
            log_level=LogLevel.INFO
        )
    
    def log_student_delete(self, user: User, student_id: int, student_name: str):
        """记录删除学生"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.STUDENT_DELETE.value,
            resource="student",
            details=f"删除学生: {student_name} (ID: {student_id})",
            log_level=LogLevel.WARNING
        )
    
    def log_student_transfer(self, user: User, student_id: int, student_name: str, from_class: str, to_class: str):
        """记录学生转学"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.STUDENT_TRANSFER.value,
            resource="student",
            details=f"学生转学: {student_name} (ID: {student_id}), 从 {from_class} 转到 {to_class}",
            log_level=LogLevel.INFO
        )
    
    def log_physical_test_create(self, user: User, test_id: int, student_name: str):
        """记录创建体测"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.PHYSICAL_TEST_CREATE.value,
            resource="physical_test",
            details=f"创建体测记录: {student_name} (测试ID: {test_id})",
            log_level=LogLevel.INFO
        )
    
    def log_physical_test_calculate(self, user: User, test_id: int, student_name: str, score: float, grade: str):
        """记录计算体测成绩"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.PHYSICAL_TEST_CALCULATE.value,
            resource="physical_test",
            details=f"计算体测成绩: {student_name} (测试ID: {test_id}), 成绩: {score}, 等级: {grade}",
            log_level=LogLevel.INFO
        )
    
    def log_registration_approve(self, user: User, registration_id: int, student_name: str, event_name: str):
        """记录批准报名"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.REGISTRATION_APPROVE.value,
            resource="registration",
            details=f"批准报名: {student_name} 参加 {event_name} (报名ID: {registration_id})",
            log_level=LogLevel.INFO
        )
    
    def log_registration_reject(self, user: User, registration_id: int, student_name: str, event_name: str, reason: str):
        """记录拒绝报名"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.REGISTRATION_REJECT.value,
            resource="registration",
            details=f"拒绝报名: {student_name} 参加 {event_name} (报名ID: {registration_id}), 原因: {reason}",
            log_level=LogLevel.WARNING
        )
    
    def log_data_export(self, user: User, resource_type: str, record_count: int):
        """记录数据导出"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.DATA_EXPORT.value,
            resource="data",
            details=f"导出数据: {resource_type}, 记录数: {record_count}",
            log_level=LogLevel.INFO
        )
    
    def log_data_import(self, user: User, resource_type: str, record_count: int, success_count: int, failed_count: int):
        """记录数据导入"""
        self.log_activity(
            user_id=user.id,
            action=OperationType.DATA_IMPORT.value,
            resource="data",
            details=f"导入数据: {resource_type}, 总数: {record_count}, 成功: {success_count}, 失败: {failed_count}",
            log_level=LogLevel.INFO
        )
    
    def log_error(self, user_id: Optional[int], error_type: str, error_message: str, details: Optional[str] = None):
        """记录错误"""
        self.log_activity(
            user_id=user_id or 0,
            action="error",
            resource=error_type,
            details=f"{error_message}. {details or ''}",
            log_level=LogLevel.ERROR
        )

class DataChangeLogger:
    """数据变更日志记录器"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def log_change(
        self,
        table_name: str,
        record_id: int,
        operation: str,
        old_data: Optional[Dict[str, Any]] = None,
        new_data: Optional[Dict[str, Any]] = None,
        operator_id: Optional[int] = None,
        operator_name: Optional[str] = None,
        operation_reason: Optional[str] = None
    ):
        """记录数据变更"""
        try:
            log = DataChangeLog(
                table_name=table_name,
                record_id=record_id,
                operation=operation,
                old_data=old_data,
                new_data=new_data,
                operator_id=operator_id,
                operator_name=operator_name,
                operation_reason=operation_reason
            )
            self.db.add(log)
            self.db.commit()
        except Exception as e:
            self.db.rollback()
            print(f"数据变更日志记录失败: {str(e)}")
    
    def log_student_change(
        self,
        student_id: int,
        operation: str,
        old_data: Optional[Dict[str, Any]] = None,
        new_data: Optional[Dict[str, Any]] = None,
        operator_id: Optional[int] = None,
        operator_name: Optional[str] = None
    ):
        """记录学生数据变更"""
        self.log_change(
            table_name="students",
            record_id=student_id,
            operation=operation,
            old_data=old_data,
            new_data=new_data,
            operator_id=operator_id,
            operator_name=operator_name
        )
    
    def log_class_change(
        self,
        class_id: int,
        operation: str,
        old_data: Optional[Dict[str, Any]] = None,
        new_data: Optional[Dict[str, Any]] = None,
        operator_id: Optional[int] = None,
        operator_name: Optional[str] = None
    ):
        """记录班级数据变更"""
        self.log_change(
            table_name="classes",
            record_id=class_id,
            operation=operation,
            old_data=old_data,
            new_data=new_data,
            operator_id=operator_id,
            operator_name=operator_name
        )

class LogQueryService:
    """日志查询服务"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_activities(
        self,
        user_id: int,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        action: Optional[str] = None,
        resource: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """获取用户活动日志"""
        query = self.db.query(UserActivityLog).filter(UserActivityLog.user_id == user_id)
        
        if start_date:
            query = query.filter(UserActivityLog.created_at >= start_date)
        if end_date:
            query = query.filter(UserActivityLog.created_at <= end_date)
        if action:
            query = query.filter(UserActivityLog.action == action)
        if resource:
            query = query.filter(UserActivityLog.resource == resource)
        
        logs = query.order_by(UserActivityLog.created_at.desc()).limit(limit).all()
        
        return [{
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource": log.resource,
            "details": log.details,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "created_at": log.created_at
        } for log in logs]
    
    def get_all_activities(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        action: Optional[str] = None,
        resource: Optional[str] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """获取所有活动日志"""
        query = self.db.query(UserActivityLog)
        
        if start_date:
            query = query.filter(UserActivityLog.created_at >= start_date)
        if end_date:
            query = query.filter(UserActivityLog.created_at <= end_date)
        if action:
            query = query.filter(UserActivityLog.action == action)
        if resource:
            query = query.filter(UserActivityLog.resource == resource)
        
        logs = query.order_by(UserActivityLog.created_at.desc()).limit(limit).all()
        
        return [{
            "id": log.id,
            "user_id": log.user_id,
            "action": log.action,
            "resource": log.resource,
            "details": log.details,
            "ip_address": log.ip_address,
            "user_agent": log.user_agent,
            "created_at": log.created_at
        } for log in logs]
    
    def get_data_changes(
        self,
        table_name: Optional[str] = None,
        record_id: Optional[int] = None,
        operation: Optional[str] = None,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """获取数据变更日志"""
        query = self.db.query(DataChangeLog)
        
        if table_name:
            query = query.filter(DataChangeLog.table_name == table_name)
        if record_id:
            query = query.filter(DataChangeLog.record_id == record_id)
        if operation:
            query = query.filter(DataChangeLog.operation == operation)
        if start_date:
            query = query.filter(DataChangeLog.operation_time >= start_date)
        if end_date:
            query = query.filter(DataChangeLog.operation_time <= end_date)
        
        logs = query.order_by(DataChangeLog.operation_time.desc()).limit(limit).all()
        
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
    
    def get_activity_statistics(
        self,
        start_date: Optional[datetime] = None,
        end_date: Optional[datetime] = None
    ) -> Dict[str, Any]:
        """获取活动统计信息"""
        query = self.db.query(UserActivityLog)
        
        if start_date:
            query = query.filter(UserActivityLog.created_at >= start_date)
        if end_date:
            query = query.filter(UserActivityLog.created_at <= end_date)
        
        logs = query.all()
        
        # 按操作类型统计
        action_stats = {}
        for log in logs:
            action = log.action
            action_stats[action] = action_stats.get(action, 0) + 1
        
        # 按资源类型统计
        resource_stats = {}
        for log in logs:
            resource = log.resource
            resource_stats[resource] = resource_stats.get(resource, 0) + 1
        
        # 按用户统计
        user_stats = {}
        for log in logs:
            user_id = log.user_id
            user_stats[user_id] = user_stats.get(user_id, 0) + 1
        
        return {
            "total_activities": len(logs),
            "action_statistics": action_stats,
            "resource_statistics": resource_stats,
            "user_statistics": user_stats,
            "most_active_users": sorted(user_stats.items(), key=lambda x: x[1], reverse=True)[:10]
        }

class LogCleanupService:
    """日志清理服务"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def cleanup_old_logs(self, days: int = 90) -> Dict[str, int]:
        """清理旧日志"""
        cutoff_date = datetime.now() - timedelta(days=days)
        
        # 清理旧的活动日志
        old_activity_logs = self.db.query(UserActivityLog).filter(
            UserActivityLog.created_at < cutoff_date
        ).all()
        
        activity_count = len(old_activity_logs)
        for log in old_activity_logs:
            self.db.delete(log)
        
        # 清理旧的数据变更日志
        old_change_logs = self.db.query(DataChangeLog).filter(
            DataChangeLog.operation_time < cutoff_date
        ).all()
        
        change_count = len(old_change_logs)
        for log in old_change_logs:
            self.db.delete(log)
        
        self.db.commit()
        
        return {
            "activity_logs_deleted": activity_count,
            "change_logs_deleted": change_count,
            "total_deleted": activity_count + change_count
        }
    
    def archive_logs(self, start_date: datetime, end_date: datetime) -> Dict[str, Any]:
        """归档日志（简化版，实际应该导出到文件或归档表）"""
        # 获取需要归档的日志
        activity_logs = self.db.query(UserActivityLog).filter(
            UserActivityLog.created_at >= start_date,
            UserActivityLog.created_at <= end_date
        ).all()
        
        change_logs = self.db.query(DataChangeLog).filter(
            DataChangeLog.operation_time >= start_date,
            DataChangeLog.operation_time <= end_date
        ).all()
        
        return {
            "activity_logs_count": len(activity_logs),
            "change_logs_count": len(change_logs),
            "start_date": start_date,
            "end_date": end_date,
            "message": "日志归档功能需要进一步实现"
        }