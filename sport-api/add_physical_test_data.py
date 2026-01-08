#!/usr/bin/env python3
"""
添加体测历史数据到数据库
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import PhysicalTest, Student, Class
from datetime import date

# 创建数据库引擎
engine = create_engine('sqlite:///./sports_teaching.db')

# 创建会话工厂
Session = sessionmaker(bind=engine)

# 创建会话
db = Session()

try:
    # 查询现有学生和班级数据
    students = db.query(Student).all()
    classes = db.query(Class).all()
    
    print(f"现有学生: {len(students)}个")
    print(f"现有班级: {len(classes)}个")
    
    if not students or not classes:
        print("数据库中没有学生或班级数据，无法添加体测数据")
        exit(1)
    
    # 准备体测数据
    physical_test_data = [
        {
            "student_id": 1,
            "class_id": 1,
            "test_date": date(2024, 10, 15),
            "test_type": "期中测试",
            "height": 165.5,
            "weight": 55.0,
            "vital_capacity": 3500,
            "run_50m": 8.2,
            "run_800m": 240,
            "run_1000m": None,
            "sit_and_reach": 18.5,
            "standing_long_jump": 210,
            "pull_up": None,
            "skip_rope": 150,
            "total_score": 85.5,
            "grade": "B",
            "tester_name": "张老师",
            "test_notes": "表现良好",
            "is_official": True
        },
        {
            "student_id": 2,
            "class_id": 1,
            "test_date": date(2024, 10, 15),
            "test_type": "期中测试",
            "height": 158.0,
            "weight": 48.0,
            "vital_capacity": 3200,
            "run_50m": 8.8,
            "run_800m": 255,
            "run_1000m": None,
            "sit_and_reach": 22.0,
            "standing_long_jump": 195,
            "pull_up": None,
            "skip_rope": 165,
            "total_score": 82.0,
            "grade": "B",
            "tester_name": "张老师",
            "test_notes": "表现良好",
            "is_official": True
        },
        {
            "student_id": 3,
            "class_id": 2,
            "test_date": date(2024, 10, 16),
            "test_type": "期中测试",
            "height": 170.0,
            "weight": 60.0,
            "vital_capacity": 4000,
            "run_50m": 7.5,
            "run_800m": None,
            "run_1000m": 260,
            "sit_and_reach": 15.5,
            "standing_long_jump": 230,
            "pull_up": 5,
            "skip_rope": 140,
            "total_score": 88.0,
            "grade": "B",
            "tester_name": "李老师",
            "test_notes": "表现优秀",
            "is_official": True
        },
        {
            "student_id": 4,
            "class_id": 3,
            "test_date": date(2024, 10, 17),
            "test_type": "期中测试",
            "height": 162.0,
            "weight": 52.0,
            "vital_capacity": 3400,
            "run_50m": 8.5,
            "run_800m": 245,
            "run_1000m": None,
            "sit_and_reach": 20.0,
            "standing_long_jump": 205,
            "pull_up": None,
            "skip_rope": 155,
            "total_score": 84.0,
            "grade": "B",
            "tester_name": "王老师",
            "test_notes": "表现良好",
            "is_official": True
        },
        {
            "student_id": 1,
            "class_id": 1,
            "test_date": date(2024, 5, 20),
            "test_type": "期末测试",
            "height": 164.0,
            "weight": 54.5,
            "vital_capacity": 3450,
            "run_50m": 8.3,
            "run_800m": 242,
            "run_1000m": None,
            "sit_and_reach": 18.0,
            "standing_long_jump": 205,
            "pull_up": None,
            "skip_rope": 145,
            "total_score": 83.0,
            "grade": "B",
            "tester_name": "张老师",
            "test_notes": "表现良好",
            "is_official": True
        }
    ]
    
    # 添加体测数据到数据库
    for data in physical_test_data:
        physical_test = PhysicalTest(**data)
        db.add(physical_test)
    
    # 提交事务
    db.commit()
    
    print(f"成功添加了 {len(physical_test_data)} 条体测历史数据")
    
    # 查询并打印添加的数据
    added_tests = db.query(PhysicalTest).all()
    print(f"现在数据库中共有 {len(added_tests)} 条体测历史数据")
    
    for test in added_tests[:3]:
        print(f"\n体测数据 #{test.id}:")
        print(f"  学生ID: {test.student_id}")
        print(f"  班级ID: {test.class_id}")
        print(f"  测试日期: {test.test_date}")
        print(f"  测试类型: {test.test_type}")
        print(f"  总分: {test.total_score}")
        print(f"  等级: {test.grade}")
        
except Exception as e:
    print(f"添加体测数据失败：{e}")
    db.rollback()
finally:
    # 关闭会话
    db.close()
