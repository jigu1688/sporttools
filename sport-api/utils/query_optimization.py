# 体育教学辅助网站 - 查询优化工具
# 提供查询优化和N+1问题解决方案

from sqlalchemy.orm import Session, joinedload, selectinload, subqueryload, contains_eager
from sqlalchemy import func, and_, or_
from typing import List, Dict, Any, Optional, TypeVar, Generic
from models import (
    Student, Class, StudentClassRelation, PhysicalTest,
    SportsMeet, Event, Registration, User, SchoolYear
)

T = TypeVar('T')

class QueryOptimizer:
    """查询优化器"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_students_with_relations(
        self,
        class_id: Optional[int] = None,
        school_year_id: Optional[int] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """获取学生列表，预加载关联关系，避免N+1查询"""
        query = self.db.query(Student)
        
        # 使用joinedload预加载关联数据
        query = query.options(
            joinedload(Student.user),
            joinedload(Student.family_info),
            joinedload(Student.class_relations).joinedload(StudentClassRelation.class_)
        )
        
        # 应用过滤条件
        if class_id:
            query = query.join(StudentClassRelation).filter(
                StudentClassRelation.class_id == class_id,
                StudentClassRelation.is_current == True
            )
        
        if school_year_id:
            query = query.join(StudentClassRelation).join(Class).filter(
                Class.school_year_id == school_year_id,
                StudentClassRelation.is_current == True
            )
        
        # 应用分页
        students = query.offset(skip).limit(limit).all()
        
        # 构建返回结果
        results = []
        for student in students:
            current_class = None
            for rel in student.class_relations:
                if rel.is_current:
                    current_class = rel.class_
                    break
            
            results.append({
                "id": student.id,
                "student_no": student.student_no,
                "real_name": student.real_name,
                "gender": student.gender.value if student.gender else None,
                "birth_date": student.birth_date,
                "status": student.status.value if student.status else None,
                "current_class": {
                    "id": current_class.id if current_class else None,
                    "class_name": current_class.class_name if current_class else None,
                    "grade": current_class.grade if current_class else None
                } if current_class else None,
                "family_info": {
                    "father_name": student.family_info.father_name if student.family_info else None,
                    "mother_name": student.family_info.mother_name if student.family_info else None,
                    "address": student.family_info.address if student.family_info else None
                } if student.family_info else None
            })
        
        return results
    
    def get_physical_tests_with_relations(
        self,
        class_id: Optional[int] = None,
        school_year_id: Optional[int] = None,
        test_type: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """获取体测记录，预加载关联关系"""
        query = self.db.query(PhysicalTest)
        
        # 使用joinedload预加载关联数据
        query = query.options(
            joinedload(PhysicalTest.student),
            joinedload(PhysicalTest.class_).joinedload(Class.school_year)
        )
        
        # 应用过滤条件
        if class_id:
            query = query.filter(PhysicalTest.class_id == class_id)
        
        if school_year_id:
            query = query.join(Class).filter(Class.school_year_id == school_year_id)
        
        if test_type:
            query = query.filter(PhysicalTest.test_type == test_type)
        
        # 应用分页
        tests = query.offset(skip).limit(limit).all()
        
        # 构建返回结果
        results = []
        for test in tests:
            results.append({
                "id": test.id,
                "student_id": test.student_id,
                "student_name": test.student.real_name if test.student else None,
                "class_id": test.class_id,
                "class_name": test.class_.class_name if test.class_ else None,
                "school_year": test.class_.school_year.year_name if test.class_ and test.class_.school_year else None,
                "test_date": test.test_date,
                "test_type": test.test_type,
                "total_score": test.total_score,
                "grade": test.grade
            })
        
        return results
    
    def get_registrations_with_relations(
        self,
        sports_meet_id: Optional[int] = None,
        event_id: Optional[int] = None,
        student_id: Optional[int] = None,
        status: Optional[str] = None,
        skip: int = 0,
        limit: int = 100
    ) -> List[Dict[str, Any]]:
        """获取报名记录，预加载关联关系"""
        query = self.db.query(Registration)
        
        # 使用joinedload预加载关联数据
        query = query.options(
            joinedload(Registration.sports_meet),
            joinedload(Registration.event),
            joinedload(Registration.student).joinedload(Student.class_relations)
        )
        
        # 应用过滤条件
        if sports_meet_id:
            query = query.filter(Registration.sports_meet_id == sports_meet_id)
        
        if event_id:
            query = query.filter(Registration.event_id == event_id)
        
        if student_id:
            query = query.filter(Registration.student_id == student_id)
        
        if status:
            query = query.filter(Registration.status == status)
        
        # 应用分页
        registrations = query.offset(skip).limit(limit).all()
        
        # 构建返回结果
        results = []
        for reg in registrations:
            # 获取学生当前班级
            current_class = None
            for rel in reg.student.class_relations:
                if rel.is_current:
                    current_class = rel.class_
                    break
            
            results.append({
                "id": reg.id,
                "sports_meet_id": reg.sports_meet_id,
                "sports_meet_name": reg.sports_meet.name if reg.sports_meet else None,
                "event_id": reg.event_id,
                "event_name": reg.event.name if reg.event else None,
                "student_id": reg.student_id,
                "student_name": reg.student.real_name if reg.student else None,
                "class_name": current_class.class_name if current_class else None,
                "status": reg.status.value if reg.status else None,
                "registration_time": reg.registration_time,
                "final_result": reg.final_result,
                "rank": reg.rank
            })
        
        return results
    
    def get_class_statistics_batch(
        self,
        class_ids: List[int]
    ) -> Dict[int, Dict[str, Any]]:
        """批量获取班级统计信息，避免N+1查询"""
        if not class_ids:
            return {}
        
        # 批量查询学生数量
        student_counts = self.db.query(
            StudentClassRelation.class_id,
            func.count(StudentClassRelation.student_id).label('count')
        ).filter(
            StudentClassRelation.class_id.in_(class_ids),
            StudentClassRelation.is_current == True
        ).group_by(StudentClassRelation.class_id).all()
        
        # 批量查询体测记录数量
        test_counts = self.db.query(
            PhysicalTest.class_id,
            func.count(PhysicalTest.id).label('count')
        ).filter(
            PhysicalTest.class_id.in_(class_ids)
        ).group_by(PhysicalTest.class_id).all()
        
        # 构建结果字典
        student_count_dict = {c.class_id: c.count for c in student_counts}
        test_count_dict = {t.class_id: t.count for t in test_counts}
        
        results = {}
        for class_id in class_ids:
            results[class_id] = {
                "student_count": student_count_dict.get(class_id, 0),
                "test_count": test_count_dict.get(class_id, 0)
            }
        
        return results
    
    def get_student_statistics_batch(
        self,
        student_ids: List[int]
    ) -> Dict[int, Dict[str, Any]]:
        """批量获取学生统计信息"""
        if not student_ids:
            return {}
        
        # 批量查询体测记录
        tests = self.db.query(PhysicalTest).filter(
            PhysicalTest.student_id.in_(student_ids)
        ).all()
        
        # 批量查询报名记录
        registrations = self.db.query(Registration).filter(
            Registration.student_id.in_(student_ids)
        ).all()
        
        # 构建结果字典
        student_tests = {}
        for test in tests:
            if test.student_id not in student_tests:
                student_tests[test.student_id] = []
            student_tests[test.student_id].append(test)
        
        student_regs = {}
        for reg in registrations:
            if reg.student_id not in student_regs:
                student_regs[reg.student_id] = []
            student_regs[reg.student_id].append(reg)
        
        results = {}
        for student_id in student_ids:
            tests = student_tests.get(student_id, [])
            regs = student_regs.get(student_id, [])
            
            # 计算平均体测成绩
            avg_score = None
            if tests:
                scores = [t.total_score for t in tests if t.total_score is not None]
                if scores:
                    avg_score = sum(scores) / len(scores)
            
            results[student_id] = {
                "test_count": len(tests),
                "registration_count": len(regs),
                "average_test_score": avg_score
            }
        
        return results
    
    def get_sports_meet_statistics_batch(
        self,
        sports_meet_ids: List[int]
    ) -> Dict[int, Dict[str, Any]]:
        """批量获取运动会统计信息"""
        if not sports_meet_ids:
            return {}
        
        # 批量查询项目数量
        event_counts = self.db.query(
            Event.sports_meet_id,
            func.count(Event.id).label('count')
        ).filter(
            Event.sports_meet_id.in_(sports_meet_ids)
        ).group_by(Event.sports_meet_id).all()
        
        # 批量查询报名数量
        registration_counts = self.db.query(
            Registration.sports_meet_id,
            func.count(Registration.id).label('count')
        ).filter(
            Registration.sports_meet_id.in_(sports_meet_ids)
        ).group_by(Registration.sports_meet_id).all()
        
        # 批量查询运动员数量（去重）
        athlete_counts = self.db.query(
            Registration.sports_meet_id,
            func.count(func.distinct(Registration.student_id)).label('count')
        ).filter(
            Registration.sports_meet_id.in_(sports_meet_ids)
        ).group_by(Registration.sports_meet_id).all()
        
        # 构建结果字典
        event_count_dict = {e.sports_meet_id: e.count for e in event_counts}
        reg_count_dict = {r.sports_meet_id: r.count for r in registration_counts}
        athlete_count_dict = {a.sports_meet_id: a.count for a in athlete_counts}
        
        results = {}
        for meet_id in sports_meet_ids:
            results[meet_id] = {
                "event_count": event_count_dict.get(meet_id, 0),
                "registration_count": reg_count_dict.get(meet_id, 0),
                "athlete_count": athlete_count_dict.get(meet_id, 0)
            }
        
        return results
    
    def optimize_complex_query(
        self,
        base_query,
        eager_loads: List[str] = None,
        use_subquery: bool = False
    ):
        """优化复杂查询"""
        if eager_loads:
            for load in eager_loads:
                if use_subquery:
                    base_query = base_query.options(subqueryload(load))
                else:
                    base_query = base_query.options(joinedload(load))
        
        return base_query
    
    def get_paginated_results(
        self,
        query,
        page: int = 1,
        page_size: int = 20
    ) -> Dict[str, Any]:
        """获取分页结果"""
        # 计算总数
        total = query.count()
        
        # 计算分页信息
        total_pages = (total + page_size - 1) // page_size
        skip = (page - 1) * page_size
        
        # 执行查询
        results = query.offset(skip).limit(page_size).all()
        
        return {
            "items": results,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": total_pages,
            "has_next": page < total_pages,
            "has_prev": page > 1
        }

class BatchQueryExecutor:
    """批量查询执行器"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def batch_get_students(self, student_ids: List[int]) -> Dict[int, Student]:
        """批量获取学生"""
        students = self.db.query(Student).filter(
            Student.id.in_(student_ids)
        ).all()
        return {s.id: s for s in students}
    
    def batch_get_classes(self, class_ids: List[int]) -> Dict[int, Class]:
        """批量获取班级"""
        classes = self.db.query(Class).filter(
            Class.id.in_(class_ids)
        ).all()
        return {c.id: c for c in classes}
    
    def batch_get_users(self, user_ids: List[int]) -> Dict[int, User]:
        """批量获取用户"""
        users = self.db.query(User).filter(
            User.id.in_(user_ids)
        ).all()
        return {u.id: u for u in users}
    
    def batch_update_student_counts(self, class_ids: List[int]):
        """批量更新班级学生数量"""
        for class_id in class_ids:
            count = self.db.query(StudentClassRelation).filter(
                StudentClassRelation.class_id == class_id,
                StudentClassRelation.is_current == True
            ).count()
            
            self.db.query(Class).filter(Class.id == class_id).update({
                "current_student_count": count
            })
        
        self.db.commit()
    
    def batch_update_sports_meet_statistics(self, sports_meet_ids: List[int]):
        """批量更新运动会统计信息"""
        for meet_id in sports_meet_ids:
            # 更新项目数量
            event_count = self.db.query(Event).filter(
                Event.sports_meet_id == meet_id
            ).count()
            
            # 更新报名数量
            registration_count = self.db.query(Registration).filter(
                Registration.sports_meet_id == meet_id
            ).count()
            
            # 更新运动员数量
            athlete_count = self.db.query(
                func.count(func.distinct(Registration.student_id))
            ).filter(
                Registration.sports_meet_id == meet_id
            ).scalar()
            
            self.db.query(SportsMeet).filter(SportsMeet.id == meet_id).update({
                "total_events": event_count,
                "total_registrations": registration_count,
                "total_athletes": athlete_count
            })
        
        self.db.commit()