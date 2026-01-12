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
        "academic_year": test.class_.school_year.academic_year if test.class_ and test.class_.school_year else "",
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

# 获取总分分布数据
def get_score_distribution(db: Session, class_id: int = None, grade: str = None, school_year_id: int = None) -> dict:
    """获取总分分布数据"""
    from sqlalchemy import func
    
    query = db.query(PhysicalTest)
    
    if class_id:
        query = query.filter(PhysicalTest.class_id == class_id)
    if grade:
        query = query.filter(PhysicalTest.grade == grade)
    if school_year_id:
        query = query.filter(PhysicalTest.school_year_id == school_year_id)
    
    tests = query.all()
    
    # 分数段分布
    distribution = {
        "0-59": 0,
        "60-69": 0,
        "70-79": 0,
        "80-89": 0,
        "90-100": 0
    }
    
    for test in tests:
        score = test.total_score or 0
        if score < 60:
            distribution["0-59"] += 1
        elif score < 70:
            distribution["60-69"] += 1
        elif score < 80:
            distribution["70-79"] += 1
        elif score < 90:
            distribution["80-89"] += 1
        else:
            distribution["90-100"] += 1
    
    return distribution

# 获取等级分布数据
def get_grade_distribution(db: Session, class_id: int = None, grade: str = None, school_year_id: int = None) -> dict:
    """获取等级分布数据"""
    query = db.query(PhysicalTest)
    
    if class_id:
        query = query.filter(PhysicalTest.class_id == class_id)
    if grade:
        query = query.filter(PhysicalTest.grade == grade)
    if school_year_id:
        query = query.filter(PhysicalTest.school_year_id == school_year_id)
    
    tests = query.all()
    total = len(tests)
    
    if total == 0:
        return {"excellent": 0, "good": 0, "pass": 0, "fail": 0}
    
    excellent = len([t for t in tests if t.total_score and t.total_score >= 90])
    good = len([t for t in tests if t.total_score and 80 <= t.total_score < 90])
    pass_count = len([t for t in tests if t.total_score and 60 <= t.total_score < 80])
    fail = len([t for t in tests if t.total_score and t.total_score < 60])
    
    return {
        "excellent": excellent,
        "good": good,
        "pass": pass_count,
        "fail": fail,
        "excellent_rate": round(excellent / total * 100, 2),
        "good_rate": round(good / total * 100, 2),
        "pass_rate": round(pass_count / total * 100, 2),
        "fail_rate": round(fail / total * 100, 2)
    }

# 获取年级成绩对比数据
def get_grade_comparison(db: Session, school_year_id: int = None) -> dict:
    """获取各年级成绩对比数据"""
    from sqlalchemy import func
    
    result = {}
    query = db.query(PhysicalTest)
    
    if school_year_id:
        query = query.filter(PhysicalTest.school_year_id == school_year_id)
    
    tests = query.all()
    
    # 按年级分组计算平均分
    grade_scores = {}
    for test in tests:
        grade_name = test.grade or "未知年级"
        if grade_name not in grade_scores:
            grade_scores[grade_name] = []
        if test.total_score:
            grade_scores[grade_name].append(test.total_score)
    
    for grade_name, scores in grade_scores.items():
        if scores:
            result[grade_name] = {
                "average": round(sum(scores) / len(scores), 2),
                "count": len(scores),
                "max": max(scores),
                "min": min(scores)
            }
    
    return result

# 获取性别成绩对比数据
def get_gender_comparison(db: Session, class_id: int = None, grade: str = None, school_year_id: int = None) -> dict:
    """获取男女生成绩对比数据"""
    from sqlalchemy.orm import joinedload
    
    query = db.query(PhysicalTest).options(joinedload(PhysicalTest.student))
    
    if class_id:
        query = query.filter(PhysicalTest.class_id == class_id)
    if grade:
        query = query.filter(PhysicalTest.grade == grade)
    if school_year_id:
        query = query.filter(PhysicalTest.school_year_id == school_year_id)
    
    tests = query.all()
    
    male_scores = []
    female_scores = []
    
    for test in tests:
        if test.total_score:
            if test.student and test.student.gender == 'male':
                male_scores.append(test.total_score)
            elif test.student and test.student.gender == 'female':
                female_scores.append(test.total_score)
    
    return {
        "male": {
            "average": round(sum(male_scores) / len(male_scores), 2) if male_scores else 0,
            "count": len(male_scores)
        },
        "female": {
            "average": round(sum(female_scores) / len(female_scores), 2) if female_scores else 0,
            "count": len(female_scores)
        }
    }

# 获取单项成绩分析数据
def get_item_analysis(db: Session, class_id: int = None, grade: str = None, school_year_id: int = None) -> dict:
    """获取各单项成绩分析数据"""
    query = db.query(PhysicalTest)
    
    if class_id:
        query = query.filter(PhysicalTest.class_id == class_id)
    if grade:
        query = query.filter(PhysicalTest.grade == grade)
    if school_year_id:
        query = query.filter(PhysicalTest.school_year_id == school_year_id)
    
    tests = query.all()
    
    items = ['height', 'weight', 'vital_capacity', 'run_50m', 'run_800m', 'run_1000m', 
             'sit_and_reach', 'standing_long_jump', 'pull_up', 'skip_rope']
    
    result = {}
    for item in items:
        scores = [getattr(test, item) for test in tests if getattr(test, item) is not None]
        if scores:
            result[item] = {
                "average": round(sum(scores) / len(scores), 2),
                "max": max(scores),
                "min": min(scores),
                "count": len(scores)
            }
        else:
            result[item] = {"average": 0, "max": 0, "min": 0, "count": 0}
    
    return result

# 计算体测成绩总分和等级
def calculate_physical_test_score(db: Session, physical_test_id: int) -> dict:
    """计算体测成绩总分和等级"""
    test = db.query(PhysicalTest).filter(PhysicalTest.id == physical_test_id).first()
    if not test:
        return None
    
    # 获取学生信息（用于性别和年级判断）
    student = db.query(Student).filter(Student.id == test.student_id).first()
    if not student:
        return None
    
    # 获取班级信息（用于年级判断）
    class_obj = db.query(Class).filter(Class.id == test.class_id).first()
    grade_level = class_obj.grade_level if class_obj else None
    
    # 计算各项得分（简化版，实际应根据国家体测标准）
    scores = {}
    
    # 身高体重指数BMI
    if test.height and test.weight:
        bmi = test.weight / ((test.height / 100) ** 2)
        scores['bmi'] = calculate_bmi_score(bmi, student.gender)
    else:
        scores['bmi'] = 0
    
    # 肺活量
    if test.vital_capacity:
        scores['vital_capacity'] = calculate_vital_capacity_score(test.vital_capacity, student.gender, grade_level)
    else:
        scores['vital_capacity'] = 0
    
    # 50米跑
    if test.run_50m:
        scores['run_50m'] = calculate_run_50m_score(test.run_50m, student.gender, grade_level)
    else:
        scores['run_50m'] = 0
    
    # 800米跑（女生）或1000米跑（男生）
    if student.gender == 'female' and test.run_800m:
        scores['run_long'] = calculate_run_800m_score(test.run_800m, grade_level)
    elif student.gender == 'male' and test.run_1000m:
        scores['run_long'] = calculate_run_1000m_score(test.run_1000m, grade_level)
    else:
        scores['run_long'] = 0
    
    # 坐位体前屈
    if test.sit_and_reach:
        scores['sit_and_reach'] = calculate_sit_and_reach_score(test.sit_and_reach, student.gender, grade_level)
    else:
        scores['sit_and_reach'] = 0
    
    # 立定跳远
    if test.standing_long_jump:
        scores['standing_long_jump'] = calculate_standing_long_jump_score(test.standing_long_jump, student.gender, grade_level)
    else:
        scores['standing_long_jump'] = 0
    
    # 引体向上（男生）或跳绳（女生）
    if student.gender == 'male' and test.pull_up:
        scores['strength'] = calculate_pull_up_score(test.pull_up, grade_level)
    elif student.gender == 'female' and test.skip_rope:
        scores['strength'] = calculate_skip_rope_score(test.skip_rope, grade_level)
    else:
        scores['strength'] = 0
    
    # 计算总分
    total_score = sum(scores.values())
    
    # 计算等级
    grade = calculate_grade(total_score)
    
    # 更新数据库
    test.total_score = total_score
    test.grade = grade
    db.commit()
    
    return {
        'total_score': total_score,
        'grade': grade,
        'item_scores': scores
    }

# 辅助函数：计算BMI得分
def calculate_bmi_score(bmi: float, gender: str) -> float:
    """计算BMI得分（简化版）"""
    if 18.5 <= bmi <= 23.9:
        return 10.0
    elif 17 <= bmi < 18.5 or 24 <= bmi <= 27:
        return 8.0
    elif 16 <= bmi < 17 or 27 < bmi <= 28:
        return 6.0
    else:
        return 4.0

# 辅助函数：计算肺活量得分
def calculate_vital_capacity_score(vital_capacity: int, gender: str, grade_level: int) -> float:
    """计算肺活量得分（简化版）"""
    if gender == 'male':
        if vital_capacity >= 4000:
            return 10.0
        elif vital_capacity >= 3500:
            return 8.0
        elif vital_capacity >= 3000:
            return 6.0
        else:
            return 4.0
    else:
        if vital_capacity >= 3000:
            return 10.0
        elif vital_capacity >= 2500:
            return 8.0
        elif vital_capacity >= 2000:
            return 6.0
        else:
            return 4.0

# 辅助函数：计算50米跑得分
def calculate_run_50m_score(time: float, gender: str, grade_level: int) -> float:
    """计算50米跑得分（简化版）"""
    if gender == 'male':
        if time <= 7.0:
            return 10.0
        elif time <= 7.5:
            return 8.0
        elif time <= 8.0:
            return 6.0
        else:
            return 4.0
    else:
        if time <= 8.0:
            return 10.0
        elif time <= 8.5:
            return 8.0
        elif time <= 9.0:
            return 6.0
        else:
            return 4.0

# 辅助函数：计算800米跑得分
def calculate_run_800m_score(time: int, grade_level: int) -> float:
    """计算800米跑得分（简化版）"""
    if time <= 240:
        return 10.0
    elif time <= 270:
        return 8.0
    elif time <= 300:
        return 6.0
    else:
        return 4.0

# 辅助函数：计算1000米跑得分
def calculate_run_1000m_score(time: int, grade_level: int) -> float:
    """计算1000米跑得分（简化版）"""
    if time <= 240:
        return 10.0
    elif time <= 270:
        return 8.0
    elif time <= 300:
        return 6.0
    else:
        return 4.0

# 辅助函数：计算坐位体前屈得分
def calculate_sit_and_reach_score(score: float, gender: str, grade_level: int) -> float:
    """计算坐位体前屈得分（简化版）"""
    if gender == 'male':
        if score >= 15:
            return 10.0
        elif score >= 10:
            return 8.0
        elif score >= 5:
            return 6.0
        else:
            return 4.0
    else:
        if score >= 18:
            return 10.0
        elif score >= 13:
            return 8.0
        elif score >= 8:
            return 6.0
        else:
            return 4.0

# 辅助函数：计算立定跳远得分
def calculate_standing_long_jump_score(score: int, gender: str, grade_level: int) -> float:
    """计算立定跳远得分（简化版）"""
    if gender == 'male':
        if score >= 240:
            return 10.0
        elif score >= 220:
            return 8.0
        elif score >= 200:
            return 6.0
        else:
            return 4.0
    else:
        if score >= 190:
            return 10.0
        elif score >= 170:
            return 8.0
        elif score >= 150:
            return 6.0
        else:
            return 4.0

# 辅助函数：计算引体向上得分
def calculate_pull_up_score(count: int, grade_level: int) -> float:
    """计算引体向上得分（简化版）"""
    if count >= 10:
        return 10.0
    elif count >= 7:
        return 8.0
    elif count >= 4:
        return 6.0
    else:
        return 4.0

# 辅助函数：计算跳绳得分
def calculate_skip_rope_score(count: int, grade_level: int) -> float:
    """计算跳绳得分（简化版）"""
    if count >= 160:
        return 10.0
    elif count >= 140:
        return 8.0
    elif count >= 120:
        return 6.0
    else:
        return 4.0

# 辅助函数：计算等级
def calculate_grade(total_score: float) -> str:
    """根据总分计算等级"""
    if total_score >= 90:
        return "A"
    elif total_score >= 80:
        return "B"
    elif total_score >= 60:
        return "C"
    else:
        return "D"

# 批量计算成绩
def batch_calculate_scores(db: Session, class_id: int = None, school_year_id: int = None) -> dict:
    """批量计算体测成绩"""
    query = db.query(PhysicalTest)
    
    if class_id:
        query = query.filter(PhysicalTest.class_id == class_id)
    if school_year_id:
        query = query.join(Class).filter(Class.school_year_id == school_year_id)
    
    tests = query.all()
    results = []
    
    for test in tests:
        result = calculate_physical_test_score(db, test.id)
        if result:
            results.append({
                'test_id': test.id,
                'student_id': test.student_id,
                'total_score': result['total_score'],
                'grade': result['grade']
            })
    
    return {
        'total': len(results),
        'results': results
    }
