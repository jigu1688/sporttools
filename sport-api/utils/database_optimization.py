# 体育教学辅助网站 - 数据库索引优化
# 提供数据库索引创建和管理功能

from sqlalchemy import Index, create_engine, text
from sqlalchemy.orm import Session
from models import (
    Student, Class, StudentClassRelation, PhysicalTest,
    SportsMeet, Event, Registration, User, UserActivityLog,
    DataChangeLog, SchoolYear, FamilyInfo
)
from typing import List, Dict, Any

class DatabaseIndexOptimizer:
    """数据库索引优化器"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_indexes(self) -> Dict[str, Any]:
        """创建所有推荐的数据库索引"""
        results = {
            "created": [],
            "failed": [],
            "skipped": []
        }
        
        # 学生表索引
        indexes = [
            # 学生表索引
            Index('idx_student_student_no', Student.student_no),
            Index('idx_student_real_name', Student.real_name),
            Index('idx_student_gender', Student.gender),
            Index('idx_student_status', Student.status),
            Index('idx_student_user_id', Student.user_id),
            
            # 班级表索引
            Index('idx_class_school_id', Class.school_id),
            Index('idx_class_school_year_id', Class.school_year_id),
            Index('idx_class_grade', Class.grade),
            Index('idx_class_grade_level', Class.grade_level),
            Index('idx_class_status', Class.status),
            Index('idx_class_teacher_id', Class.class_teacher_id),
            
            # 学生班级关联表索引
            Index('idx_student_class_student_id', StudentClassRelation.student_id),
            Index('idx_student_class_class_id', StudentClassRelation.class_id),
            Index('idx_student_class_is_current', StudentClassRelation.is_current),
            Index('idx_student_class_status', StudentClassRelation.status),
            Index('idx_student_class_join_date', StudentClassRelation.join_date),
            Index('idx_student_class_student_class', StudentClassRelation.student_id, StudentClassRelation.class_id),
            Index('idx_student_class_student_current', StudentClassRelation.student_id, StudentClassRelation.is_current),
            
            # 体测表索引
            Index('idx_physical_test_student_id', PhysicalTest.student_id),
            Index('idx_physical_test_class_id', PhysicalTest.class_id),
            Index('idx_physical_test_test_date', PhysicalTest.test_date),
            Index('idx_physical_test_test_type', PhysicalTest.test_type),
            Index('idx_physical_test_total_score', PhysicalTest.total_score),
            Index('idx_physical_test_grade', PhysicalTest.grade),
            Index('idx_physical_test_student_date', PhysicalTest.student_id, PhysicalTest.test_date),
            
            # 运动会表索引
            Index('idx_sports_meet_school_id', SportsMeet.school_id),
            Index('idx_sports_meet_school_year_id', SportsMeet.school_year_id),
            Index('idx_sports_meet_status', SportsMeet.status),
            Index('idx_sports_meet_start_date', SportsMeet.start_date),
            Index('idx_sports_meet_end_date', SportsMeet.end_date),
            
            # 项目表索引
            Index('idx_event_sports_meet_id', Event.sports_meet_id),
            Index('idx_event_event_type', Event.event_type),
            Index('idx_event_gender', Event.gender),
            Index('idx_event_min_grade', Event.min_grade),
            Index('idx_event_max_grade', Event.max_grade),
            Index('idx_event_scheduled_time', Event.scheduled_time),
            Index('idx_event_meet_type', Event.sports_meet_id, Event.event_type),
            
            # 报名表索引
            Index('idx_registration_sports_meet_id', Registration.sports_meet_id),
            Index('idx_registration_event_id', Registration.event_id),
            Index('idx_registration_student_id', Registration.student_id),
            Index('idx_registration_status', Registration.status),
            Index('idx_registration_registration_time', Registration.registration_time),
            Index('idx_registration_meet_student', Registration.sports_meet_id, Registration.student_id),
            Index('idx_registration_meet_status', Registration.sports_meet_id, Registration.status),
            Index('idx_registration_event_student', Registration.event_id, Registration.student_id),
            
            # 用户表索引
            Index('idx_user_username', User.username),
            Index('idx_user_email', User.email),
            Index('idx_user_phone', User.phone),
            Index('idx_user_role', User.role),
            Index('idx_user_status', User.status),
            Index('idx_user_school_id', User.school_id),
            
            # 用户活动日志索引
            Index('idx_user_activity_user_id', UserActivityLog.user_id),
            Index('idx_user_activity_action', UserActivityLog.action),
            Index('idx_user_activity_resource', UserActivityLog.resource),
            Index('idx_user_activity_created_at', UserActivityLog.created_at),
            Index('idx_user_activity_user_date', UserActivityLog.user_id, UserActivityLog.created_at),
            
            # 数据变更日志索引
            Index('idx_data_change_table_name', DataChangeLog.table_name),
            Index('idx_data_change_record_id', DataChangeLog.record_id),
            Index('idx_data_change_operation', DataChangeLog.operation),
            Index('idx_data_change_operation_time', DataChangeLog.operation_time),
            Index('idx_data_change_operator_id', DataChangeLog.operator_id),
            Index('idx_data_change_table_record', DataChangeLog.table_name, DataChangeLog.record_id),
            
            # 学年表索引
            Index('idx_school_year_school_id', SchoolYear.school_id),
            Index('idx_school_year_status', SchoolYear.status),
            Index('idx_school_year_start_date', SchoolYear.start_date),
            Index('idx_school_year_end_date', SchoolYear.end_date),
            
            # 家庭信息表索引
            Index('idx_family_info_student_id', FamilyInfo.student_id),
            Index('idx_family_info_father_phone', FamilyInfo.father_phone),
            Index('idx_family_info_mother_phone', FamilyInfo.mother_phone),
        ]
        
        for index in indexes:
            try:
                index.create(self.db.bind, checkfirst=True)
                results["created"].append(index.name)
            except Exception as e:
                results["failed"].append({
                    "index": index.name,
                    "error": str(e)
                })
        
        return results
    
    def analyze_query_performance(self) -> Dict[str, Any]:
        """分析查询性能"""
        # 获取数据库连接信息
        engine = self.db.bind
        
        # 执行性能分析查询
        try:
            # 检查慢查询
            slow_queries = self.db.execute(text("""
                SELECT 
                    query,
                    calls,
                    total_time,
                    mean_time,
                    rows
                FROM pg_stat_statements
                WHERE mean_time > 100
                ORDER BY mean_time DESC
                LIMIT 10
            """)).fetchall()
            
            # 检查表大小
            table_sizes = self.db.execute(text("""
                SELECT 
                    schemaname,
                    tablename,
                    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
                FROM pg_tables
                WHERE schemaname = 'public'
                ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
                LIMIT 20
            """)).fetchall()
            
            # 检查索引使用情况
            index_usage = self.db.execute(text("""
                SELECT 
                    schemaname,
                    tablename,
                    indexname,
                    idx_scan,
                    idx_tup_read,
                    idx_tup_fetch
                FROM pg_stat_user_indexes
                WHERE schemaname = 'public'
                ORDER BY idx_scan DESC
                LIMIT 20
            """)).fetchall()
            
            return {
                "slow_queries": [dict(q) for q in slow_queries],
                "table_sizes": [dict(t) for t in table_sizes],
                "index_usage": [dict(i) for i in index_usage]
            }
        except Exception as e:
            return {
                "error": str(e),
                "message": "性能分析需要PostgreSQL数据库"
            }
    
    def optimize_tables(self) -> Dict[str, Any]:
        """优化数据库表"""
        results = {
            "optimized": [],
            "failed": []
        }
        
        tables = [
            'students', 'classes', 'student_class_relations', 'physical_tests',
            'sports_meets', 'events', 'registrations', 'users',
            'user_activity_logs', 'data_change_log', 'school_years', 'family_info'
        ]
        
        for table in tables:
            try:
                self.db.execute(text(f"VACUUM ANALYZE {table}"))
                self.db.commit()
                results["optimized"].append(table)
            except Exception as e:
                results["failed"].append({
                    "table": table,
                    "error": str(e)
                })
        
        return results
    
    def get_index_recommendations(self) -> List[Dict[str, Any]]:
        """获取索引建议"""
        recommendations = []
        
        # 基于查询模式分析，推荐创建的索引
        recommendations.append({
            "table": "registrations",
            "index": "idx_registration_meet_student_status",
            "columns": ["sports_meet_id", "student_id", "status"],
            "reason": "优化运动会学生报名查询"
        })
        
        recommendations.append({
            "table": "physical_tests",
            "index": "idx_physical_test_class_date_type",
            "columns": ["class_id", "test_date", "test_type"],
            "reason": "优化班级体测数据查询"
        })
        
        recommendations.append({
            "table": "student_class_relations",
            "index": "idx_student_class_class_status_current",
            "columns": ["class_id", "status", "is_current"],
            "reason": "优化班级学生列表查询"
        })
        
        recommendations.append({
            "table": "user_activity_logs",
            "index": "idx_user_activity_user_action_date",
            "columns": ["user_id", "action", "created_at"],
            "reason": "优化用户活动日志查询"
        })
        
        return recommendations

def create_database_indexes(db: Session) -> Dict[str, Any]:
    """创建数据库索引"""
    optimizer = DatabaseIndexOptimizer(db)
    return optimizer.create_indexes()

def optimize_database(db: Session) -> Dict[str, Any]:
    """优化数据库"""
    optimizer = DatabaseIndexOptimizer(db)
    
    results = {
        "indexes": optimizer.create_indexes(),
        "optimization": optimizer.optimize_tables(),
        "recommendations": optimizer.get_index_recommendations()
    }
    
    return results