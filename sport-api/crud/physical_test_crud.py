# 体育教学辅助网站 - 体测数据CRUD操作
# 用于处理体测数据的数据库操作

from sqlalchemy.orm import Session, joinedload
from models import PhysicalTest, Student, Class, SchoolYear
from schemas import PhysicalTestCreate, PhysicalTestUpdate
from typing import List, Optional, Dict, Any

# 获取体测记录列表
def get_physical_tests(db: Session, skip: int = 0, limit: int = 100) -> List[dict]:
    """获取体测记录列表"""
    tests = db.query(PhysicalTest).offset(skip).limit(limit).all()
    return [{
        "id": test.id,
        "student_id": test.student_id,
        "studentName": test.student.real_name if test.student else "",
        "educationId": test.student.student_no if test.student else "",
        "class_id": test.class_id,
        "className": test.class_.class_name if test.class_ else "",
        "test_date": test.test_date,
        "testDate": test.test_date,
        "test_type": test.test_type,
        "height": test.height,
        "weight": test.weight,
        "vital_capacity": test.vital_capacity,
        "run_50m": test.run_50m,
        "run_800m": test.run_800m,
        "run_1000m": test.run_1000m,
        "sit_and_reach": test.sit_and_reach,
        "standing_long_jump": test.standing_long_jump,
        "pull_up": test.pull_up,
        "skip_rope": test.skip_rope,
        "total_score": test.total_score,
        "totalScore": test.total_score,
        "grade": test.grade,
        "gradeLevel": test.grade,
        "tester_name": test.tester_name,
        "test_notes": test.test_notes,
        "is_official": test.is_official,
        "created_at": test.created_at,
        "updated_at": test.updated_at
    } for test in tests]

# 根据学生ID获取体测记录
def get_physical_tests_by_student(db: Session, student_id: int) -> List[dict]:
    """根据学生ID获取体测记录"""
    tests = db.query(PhysicalTest).filter(PhysicalTest.student_id == student_id).all()
    return [{"id": test.id,
        "student_id": test.student_id,
        "studentName": test.student.real_name if test.student else "",
        "educationId": test.student.student_no if test.student else "",
        "class_id": test.class_id,
        "className": test.class_.class_name if test.class_ else "",
        "test_date": test.test_date,
        "testDate": test.test_date,
        "test_type": test.test_type,
        "height": test.height,
        "weight": test.weight,
        "vital_capacity": test.vital_capacity,
        "run_50m": test.run_50m,
        "run_800m": test.run_800m,
        "run_1000m": test.run_1000m,
        "sit_and_reach": test.sit_and_reach,
        "standing_long_jump": test.standing_long_jump,
        "pull_up": test.pull_up,
        "skip_rope": test.skip_rope,
        "total_score": test.total_score,
        "totalScore": test.total_score,
        "grade": test.grade,
        "gradeLevel": test.grade,
        "tester_name": test.tester_name,
        "test_notes": test.test_notes,
        "is_official": test.is_official,
        "created_at": test.created_at,
        "updated_at": test.updated_at
    } for test in tests]

# 根据班级ID获取体测记录
def get_physical_tests_by_class(db: Session, class_id: int) -> List[dict]:
    """根据班级ID获取体测记录"""
    tests = db.query(PhysicalTest).filter(PhysicalTest.class_id == class_id).all()
    return [{"id": test.id,
        "student_id": test.student_id,
        "studentName": test.student.real_name if test.student else "",
        "educationId": test.student.student_no if test.student else "",
        "class_id": test.class_id,
        "className": test.class_.class_name if test.class_ else "",
        "test_date": test.test_date,
        "testDate": test.test_date,
        "test_type": test.test_type,
        "height": test.height,
        "weight": test.weight,
        "vital_capacity": test.vital_capacity,
        "run_50m": test.run_50m,
        "run_800m": test.run_800m,
        "run_1000m": test.run_1000m,
        "sit_and_reach": test.sit_and_reach,
        "standing_long_jump": test.standing_long_jump,
        "pull_up": test.pull_up,
        "skip_rope": test.skip_rope,
        "total_score": test.total_score,
        "totalScore": test.total_score,
        "grade": test.grade,
        "gradeLevel": test.grade,
        "tester_name": test.tester_name,
        "test_notes": test.test_notes,
        "is_official": test.is_official,
        "created_at": test.created_at,
        "updated_at": test.updated_at
    } for test in tests]

# 获取单个体测记录
def get_physical_test(db: Session, physical_test_id: int) -> Optional[dict]:
    """获取单个体测记录"""
    test = db.query(PhysicalTest).filter(PhysicalTest.id == physical_test_id).first()
    if test:
        return {
            "id": test.id,
            "student_id": test.student_id,
            "studentName": test.student.real_name if test.student else "",
            "educationId": test.student.student_no if test.student else "",
            "class_id": test.class_id,
            "className": test.class_.class_name if test.class_ else "",
            "test_date": test.test_date,
            "testDate": test.test_date,
            "test_type": test.test_type,
            "height": test.height,
            "weight": test.weight,
            "vital_capacity": test.vital_capacity,
            "run_50m": test.run_50m,
            "run_800m": test.run_800m,
            "run_1000m": test.run_1000m,
            "sit_and_reach": test.sit_and_reach,
            "standing_long_jump": test.standing_long_jump,
            "pull_up": test.pull_up,
            "skip_rope": test.skip_rope,
            "total_score": test.total_score,
            "totalScore": test.total_score,
            "grade": test.grade,
            "gradeLevel": test.grade,
            "tester_name": test.tester_name,
            "test_notes": test.test_notes,
            "is_official": test.is_official,
            "created_at": test.created_at,
            "updated_at": test.updated_at
        }
    return None

# 创建体测记录
def create_physical_test(db: Session, physical_test: PhysicalTestCreate) -> PhysicalTest:
    """创建体测记录"""
    db_physical_test = PhysicalTest(**physical_test.model_dump())
    db.add(db_physical_test)
    db.commit()
    db.refresh(db_physical_test)
    return db_physical_test

# 更新体测记录
def update_physical_test(db: Session, physical_test_id: int, physical_test: PhysicalTestUpdate) -> bool:
    """更新体测记录"""
    # 直接查询数据库获取原始对象
    db_physical_test = db.query(PhysicalTest).filter(PhysicalTest.id == physical_test_id).first()
    if db_physical_test:
        update_data = physical_test.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_physical_test, field, value)
        db.commit()
        db.refresh(db_physical_test)
        return True
    return False

# 删除体测记录
def delete_physical_test(db: Session, physical_test_id: int) -> bool:
    """删除体测记录"""
    db_physical_test = get_physical_test(db, physical_test_id)
    if db_physical_test:
        db.delete(db_physical_test)
        db.commit()
        return True
    return False

# 获取体测历史数据，支持多条件过滤
def get_physical_test_history(db: Session, filters: Optional[Dict[str, Any]] = None, skip: int = 0, limit: int = 100) -> List[dict]:
    """获取体测历史数据，支持多条件过滤"""
    # 构建查询，使用joinedload预加载关联数据
    query = db.query(PhysicalTest).options(joinedload(PhysicalTest.student)).options(joinedload(PhysicalTest.class_))
    
    # 应用过滤条件
    if filters:
        if filters.get('student_id'):
            query = query.filter(PhysicalTest.student_id == filters['student_id'])
        
        if filters.get('class_id'):
            query = query.filter(PhysicalTest.class_id == filters['class_id'])
        
        if filters.get('grade'):
            # 通过班级关联过滤年级
            query = query.join(Class).filter(Class.grade == filters['grade'])
        
        if filters.get('academic_year'):
            # 通过班级关联过滤学年
            query = query.join(Class).filter(Class.academic_year == filters['academic_year'])
        
        if filters.get('school_year_id'):
            # 通过班级关联过滤学年ID
            query = query.join(Class).filter(Class.school_year_id == filters['school_year_id'])
        
        if filters.get('test_type'):
            query = query.filter(PhysicalTest.test_type == filters['test_type'])
        
        if filters.get('start_date'):
            query = query.filter(PhysicalTest.test_date >= filters['start_date'])
        
        if filters.get('end_date'):
            query = query.filter(PhysicalTest.test_date <= filters['end_date'])
    
    # 排序
    query = query.order_by(PhysicalTest.test_date.desc())
    
    # 应用分页
    if skip is not None and limit is not None:
        query = query.offset(skip).limit(limit)
    
    tests = query.all()
    
    # 构建返回结果
    return [{"id": test.id,
        "student_id": test.student_id,
        "studentName": test.student.real_name if test.student else "",
        "student_no": test.student.student_no if test.student else "",
        "class_id": test.class_id,
        "className": test.class_.class_name if test.class_ else "",
        "grade": test.class_.grade if test.class_ else "",
        "academic_year": test.class_.academic_year if test.class_ else "",
        "test_date": test.test_date,
        "testDate": test.test_date,
        "test_type": test.test_type,
        "height": test.height,
        "weight": test.weight,
        "vital_capacity": test.vital_capacity,
        "run_50m": test.run_50m,
        "run_800m": test.run_800m,
        "run_1000m": test.run_1000m,
        "sit_and_reach": test.sit_and_reach,
        "standing_long_jump": test.standing_long_jump,
        "pull_up": test.pull_up,
        "skip_rope": test.skip_rope,
        "total_score": test.total_score,
        "totalScore": test.total_score,
        "grade": test.grade,
        "gradeLevel": test.grade,
        "tester_name": test.tester_name,
        "test_notes": test.test_notes,
        "is_official": test.is_official,
        "created_at": test.created_at,
        "updated_at": test.updated_at
    } for test in tests]

# 获取体测统计数据
def get_physical_test_statistics(db: Session) -> dict:
    """获取体测统计数据"""
    # 获取总学生数
    total_students = db.query(Student).count()
    
    # 获取已测试学生数（去重）
    tested_students = db.query(PhysicalTest.student_id).distinct().count()
    
    # 获取所有体测记录
    all_tests = db.query(PhysicalTest).all()
    
    # 计算平均分
    if all_tests:
        total_score = sum(test.total_score or 0 for test in all_tests)
        average_score = total_score / len(all_tests)
    else:
        average_score = 0.0
    
    # 计算各等级比例
    if all_tests:
        # 优秀: >=90分
        excellent_count = len([test for test in all_tests if test.total_score and test.total_score >= 90])
        # 良好: 80-89分
        good_count = len([test for test in all_tests if test.total_score and 80 <= test.total_score < 90])
        # 及格: 60-79分
        pass_count = len([test for test in all_tests if test.total_score and 60 <= test.total_score < 80])
        # 不及格: <60分
        fail_count = len([test for test in all_tests if test.total_score and test.total_score < 60])
        
        excellent_rate = excellent_count / len(all_tests) * 100
        good_rate = good_count / len(all_tests) * 100
        pass_rate = pass_count / len(all_tests) * 100
        fail_rate = fail_count / len(all_tests) * 100
    else:
        excellent_rate = 0.0
        good_rate = 0.0
        pass_rate = 0.0
        fail_rate = 0.0
    
    return {
        "total_students": total_students,
        "tested_students": tested_students,
        "excellent_rate": excellent_rate,
        "good_rate": good_rate,
        "pass_rate": pass_rate,
        "fail_rate": fail_rate,
        "average_score": average_score
    }
