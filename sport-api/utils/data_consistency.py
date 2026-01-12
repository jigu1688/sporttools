# 体育教学辅助网站 - 数据一致性检查工具
# 用于检查和修复数据库中的数据一致性问题

from sqlalchemy.orm import Session
from models import (
    Student, Class, StudentClassRelation, PhysicalTest, 
    SportsMeet, Event, Registration, SchoolYear, StatusEnum
)
from typing import List, Dict, Any
from datetime import date

class DataConsistencyChecker:
    """数据一致性检查器"""
    
    def __init__(self, db: Session):
        self.db = db
        self.issues = []
        self.fixes = []
    
    def check_all(self) -> Dict[str, Any]:
        """执行所有数据一致性检查"""
        self.issues = []
        self.fixes = []
        
        # 检查学生班级关系
        self.check_student_class_relations()
        
        # 检查体测数据
        self.check_physical_test_data()
        
        # 检查运动会数据
        self.check_sports_meet_data()
        
        # 检查报名数据
        self.check_registration_data()
        
        # 检查学年数据
        self.check_school_year_data()
        
        return {
            "total_issues": len(self.issues),
            "total_fixes": len(self.fixes),
            "issues": self.issues,
            "fixes": self.fixes
        }
    
    def check_student_class_relations(self):
        """检查学生班级关系一致性"""
        # 检查学生是否有当前班级
        students = self.db.query(Student).filter(Student.status == StatusEnum.active).all()
        
        for student in students:
            current_relations = self.db.query(StudentClassRelation).filter(
                StudentClassRelation.student_id == student.id,
                StudentClassRelation.is_current == True
            ).all()
            
            if len(current_relations) == 0:
                self.issues.append({
                    "type": "student_no_current_class",
                    "severity": "high",
                    "description": f"学生{student.real_name}（ID: {student.id}）没有当前班级",
                    "table": "students",
                    "record_id": student.id
                })
            elif len(current_relations) > 1:
                self.issues.append({
                    "type": "student_multiple_current_classes",
                    "severity": "high",
                    "description": f"学生{student.real_name}（ID: {student.id}）有{len(current_relations)}个当前班级",
                    "table": "students",
                    "record_id": student.id
                })
        
        # 检查班级学生数量是否正确
        classes = self.db.query(Class).all()
        for class_obj in classes:
            actual_count = self.db.query(StudentClassRelation).filter(
                StudentClassRelation.class_id == class_obj.id,
                StudentClassRelation.is_current == True
            ).count()
            
            if class_obj.current_student_count != actual_count:
                self.issues.append({
                    "type": "class_student_count_mismatch",
                    "severity": "medium",
                    "description": f"班级{class_obj.class_name}（ID: {class_obj.id}）学生数量不匹配：记录{class_obj.current_student_count}，实际{actual_count}",
                    "table": "classes",
                    "record_id": class_obj.id,
                    "suggested_fix": {
                        "action": "update_count",
                        "new_value": actual_count
                    }
                })
    
    def check_physical_test_data(self):
        """检查体测数据一致性"""
        # 检查体测记录的学生是否存在
        tests = self.db.query(PhysicalTest).all()
        
        for test in tests:
            # 检查学生是否存在
            student = self.db.query(Student).filter(Student.id == test.student_id).first()
            if not student:
                self.issues.append({
                    "type": "physical_test_student_not_found",
                    "severity": "high",
                    "description": f"体测记录（ID: {test.id}）引用的学生不存在",
                    "table": "physical_tests",
                    "record_id": test.id
                })
            
            # 检查班级是否存在
            if test.class_id:
                class_obj = self.db.query(Class).filter(Class.id == test.class_id).first()
                if not class_obj:
                    self.issues.append({
                        "type": "physical_test_class_not_found",
                        "severity": "high",
                        "description": f"体测记录（ID: {test.id}）引用的班级不存在",
                        "table": "physical_tests",
                        "record_id": test.id
                    })
            
            # 检查成绩是否已计算
            if not test.total_score and all([
                test.height, test.weight, test.vital_capacity,
                test.run_50m, test.sit_and_reach, test.standing_long_jump
            ]):
                self.issues.append({
                    "type": "physical_test_score_not_calculated",
                    "severity": "low",
                    "description": f"体测记录（ID: {test.id}）数据完整但未计算成绩",
                    "table": "physical_tests",
                    "record_id": test.id,
                    "suggested_fix": {
                        "action": "calculate_score"
                    }
                })
    
    def check_sports_meet_data(self):
        """检查运动会数据一致性"""
        # 检查运动会项目数量统计
        sports_meets = self.db.query(SportsMeet).all()
        
        for meet in sports_meets:
            actual_event_count = self.db.query(Event).filter(
                Event.sports_meet_id == meet.id
            ).count()
            
            if meet.total_events != actual_event_count:
                self.issues.append({
                    "type": "sports_meet_event_count_mismatch",
                    "severity": "medium",
                    "description": f"运动会{meet.name}（ID: {meet.id}）项目数量不匹配：记录{meet.total_events}，实际{actual_event_count}",
                    "table": "sports_meets",
                    "record_id": meet.id,
                    "suggested_fix": {
                        "action": "update_count",
                        "new_value": actual_event_count
                    }
                })
            
            # 检查报名数量统计
            actual_reg_count = self.db.query(Registration).filter(
                Registration.sports_meet_id == meet.id
            ).count()
            
            if meet.total_registrations != actual_reg_count:
                self.issues.append({
                    "type": "sports_meet_registration_count_mismatch",
                    "severity": "medium",
                    "description": f"运动会{meet.name}（ID: {meet.id}）报名数量不匹配：记录{meet.total_registrations}，实际{actual_reg_count}",
                    "table": "sports_meets",
                    "record_id": meet.id,
                    "suggested_fix": {
                        "action": "update_count",
                        "new_value": actual_reg_count
                    }
                })
    
    def check_registration_data(self):
        """检查报名数据一致性"""
        # 检查报名记录的关联数据
        registrations = self.db.query(Registration).all()
        
        for reg in registrations:
            # 检查运动会是否存在
            sports_meet = self.db.query(SportsMeet).filter(
                SportsMeet.id == reg.sports_meet_id
            ).first()
            if not sports_meet:
                self.issues.append({
                    "type": "registration_sports_meet_not_found",
                    "severity": "high",
                    "description": f"报名记录（ID: {reg.id}）引用的运动会不存在",
                    "table": "registrations",
                    "record_id": reg.id
                })
            
            # 检查项目是否存在
            event = self.db.query(Event).filter(Event.id == reg.event_id).first()
            if not event:
                self.issues.append({
                    "type": "registration_event_not_found",
                    "severity": "high",
                    "description": f"报名记录（ID: {reg.id}）引用的项目不存在",
                    "table": "registrations",
                    "record_id": reg.id
                })
            
            # 检查学生是否存在
            student = self.db.query(Student).filter(Student.id == reg.student_id).first()
            if not student:
                self.issues.append({
                    "type": "registration_student_not_found",
                    "severity": "high",
                    "description": f"报名记录（ID: {reg.id}）引用的学生不存在",
                    "table": "registrations",
                    "record_id": reg.id
                })
            
            # 检查项目是否属于该运动会
            if sports_meet and event and event.sports_meet_id != reg.sports_meet_id:
                self.issues.append({
                    "type": "registration_event_mismatch",
                    "severity": "high",
                    "description": f"报名记录（ID: {reg.id}）的项目不属于该运动会",
                    "table": "registrations",
                    "record_id": reg.id
                })
    
    def check_school_year_data(self):
        """检查学年数据一致性"""
        # 检查学年日期逻辑
        school_years = self.db.query(SchoolYear).all()
        
        for sy in school_years:
            if sy.start_date > sy.end_date:
                self.issues.append({
                    "type": "school_year_invalid_dates",
                    "severity": "high",
                    "description": f"学年{sy.year_name}（ID: {sy.id}）的开始日期晚于结束日期",
                    "table": "school_years",
                    "record_id": sy.id
                })
            
            # 检查是否有多个当前学年
            if sy.status.value == "active":
                active_years = self.db.query(SchoolYear).filter(
                    SchoolYear.status.value == "active"
                ).count()
                
                if active_years > 1:
                    self.issues.append({
                        "type": "multiple_active_school_years",
                        "severity": "high",
                        "description": "存在多个激活状态的学年",
                        "table": "school_years",
                        "record_id": sy.id
                    })
    
    def auto_fix_issues(self, dry_run: bool = True) -> Dict[str, Any]:
        """自动修复可修复的问题"""
        fixed_count = 0
        skipped_count = 0
        
        for issue in self.issues:
            if "suggested_fix" in issue:
                fix = issue["suggested_fix"]
                
                if dry_run:
                    self.fixes.append({
                        "issue": issue,
                        "action": "dry_run",
                        "description": f"（模拟）将执行修复操作：{fix['action']}"
                    })
                    fixed_count += 1
                else:
                    try:
                        if fix["action"] == "update_count":
                            if issue["table"] == "classes":
                                class_obj = self.db.query(Class).filter(
                                    Class.id == issue["record_id"]
                                ).first()
                                if class_obj:
                                    class_obj.current_student_count = fix["new_value"]
                                    self.db.commit()
                                    fixed_count += 1
                            elif issue["table"] == "sports_meets":
                                meet = self.db.query(SportsMeet).filter(
                                    SportsMeet.id == issue["record_id"]
                                ).first()
                                if meet:
                                    if "event" in issue["description"]:
                                        meet.total_events = fix["new_value"]
                                    else:
                                        meet.total_registrations = fix["new_value"]
                                    self.db.commit()
                                    fixed_count += 1
                        elif fix["action"] == "calculate_score":
                            from crud.physical_test_crud import calculate_physical_test_score
                            result = calculate_physical_test_score(self.db, issue["record_id"])
                            if result:
                                fixed_count += 1
                    except Exception as e:
                        skipped_count += 1
                        self.fixes.append({
                            "issue": issue,
                            "action": "error",
                            "description": f"修复失败：{str(e)}"
                        })
            else:
                skipped_count += 1
        
        return {
            "fixed_count": fixed_count,
            "skipped_count": skipped_count,
            "fixes": self.fixes
        }
    
    def get_summary(self) -> Dict[str, Any]:
        """获取检查结果摘要"""
        severity_counts = {
            "high": 0,
            "medium": 0,
            "low": 0
        }
        
        for issue in self.issues:
            severity_counts[issue["severity"]] += 1
        
        return {
            "total_issues": len(self.issues),
            "severity_breakdown": severity_counts,
            "fixable_issues": len([i for i in self.issues if "suggested_fix" in i]),
            "tables_affected": list(set([i["table"] for i in self.issues]))
        }

def run_data_consistency_check(db: Session) -> Dict[str, Any]:
    """运行数据一致性检查"""
    checker = DataConsistencyChecker(db)
    result = checker.check_all()
    result["summary"] = checker.get_summary()
    return result

def fix_data_consistency_issues(db: Session, dry_run: bool = True) -> Dict[str, Any]:
    """修复数据一致性问题"""
    checker = DataConsistencyChecker(db)
    checker.check_all()
    result = checker.auto_fix_issues(dry_run=dry_run)
    result["summary"] = checker.get_summary()
    return result