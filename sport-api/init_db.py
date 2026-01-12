#!/usr/bin/env python3
"""
数据库初始化脚本
用于创建所有数据表和基础数据
"""

import sys
import os
from sqlalchemy import create_engine, text
from database import Base, engine, SessionLocal
from models import (
    Student, Class, GenderEnum, 
    StudentClassRelation, PhysicalTest,
    School, User, FamilyInfo, DataChangeLog
)
from datetime import date

def create_tables():
    """创建所有数据表"""
    try:
        print("开始创建数据表...")
        
        # 导入所有模型以确保它们被注册
        import models
        
        # 创建所有表
        Base.metadata.create_all(bind=engine)
        
        print("✅ 所有数据表创建成功！")
        return True
        
    except Exception as e:
        print(f"❌ 创建数据表失败: {str(e)}")
        return False

def init_sample_data():
    """初始化示例数据"""
    try:
        print("开始初始化示例数据...")
        db = SessionLocal()
        
        try:
            # 检查是否已有学生数据
            existing_students = db.query(Student).count()
            if existing_students > 0:
                print(f"数据库中已有{existing_students}个学生，跳过示例数据初始化")
                return True
            
            # 获取或创建学校
            school = db.query(School).filter(School.school_code == "YGZX").first()
            if not school:
                school = School(
                    school_name="阳光中学",
                    school_code="YGZX",
                    address="北京市朝阳区阳光路123号",
                    contact_info="010-12345678"
                )
                db.add(school)
                db.commit()
                print("✅ 创建学校：阳光中学")
            else:
                print("✅ 使用现有学校：阳光中学")
            
            # 获取或创建班级
            class_701 = db.query(Class).filter(Class.class_name == "701班").first()
            if not class_701:
                class_701 = Class(
                    class_name="701班",
                    grade="七年级",
                    grade_level=7,
                    academic_year="2024-2025",
                    school_id=school.id,
                    start_date=date(2024, 9, 1)
                )
                db.add(class_701)
            
            class_702 = db.query(Class).filter(Class.class_name == "702班").first()
            if not class_702:
                class_702 = Class(
                    class_name="702班",
                    grade="七年级", 
                    grade_level=7,
                    academic_year="2024-2025",
                    school_id=school.id,
                    start_date=date(2024, 9, 1)
                )
                db.add(class_702)
            
            class_801 = db.query(Class).filter(Class.class_name == "801班").first()
            if not class_801:
                class_801 = Class(
                    class_name="801班",
                    grade="八年级",
                    grade_level=8,
                    academic_year="2024-2025",
                    school_id=school.id,
                    start_date=date(2024, 9, 1)
                )
                db.add(class_801)
            
            db.commit()
            print("✅ 班级数据准备完成")
            
            # 创建示例学生
            students = [
                Student(
                    student_no="20240701001",
                    real_name="张三",
                    gender=GenderEnum.male,
                    birth_date=date(2012, 3, 15),
                    enrollment_date=date(2024, 9, 1)
                ),
                Student(
                    student_no="20240701002",
                    real_name="李四",
                    gender=GenderEnum.female,
                    birth_date=date(2012, 7, 22),
                    enrollment_date=date(2024, 9, 1)
                ),
                Student(
                    student_no="20240701003",
                    real_name="王五",
                    gender=GenderEnum.male,
                    birth_date=date(2012, 11, 8),
                    enrollment_date=date(2024, 9, 1)
                ),
                Student(
                    student_no="20240801001",
                    real_name="赵六",
                    gender=GenderEnum.female,
                    birth_date=date(2011, 5, 12),
                    enrollment_date=date(2023, 9, 1)
                )
            ]
            
            db.add_all(students)
            db.commit()
            
            # 创建学生班级关联
            student_class_relations = [
                StudentClassRelation(
                    student_id=students[0].id,
                    class_id=class_701.id,
                    academic_year="2024-2025",
                    join_date=date(2024, 9, 1)
                ),
                StudentClassRelation(
                    student_id=students[1].id,
                    class_id=class_701.id,
                    academic_year="2024-2025",
                    join_date=date(2024, 9, 1)
                ),
                StudentClassRelation(
                    student_id=students[2].id,
                    class_id=class_702.id,
                    academic_year="2024-2025",
                    join_date=date(2024, 9, 1)
                ),
                StudentClassRelation(
                    student_id=students[3].id,
                    class_id=class_801.id,
                    academic_year="2024-2025",
                    join_date=date(2023, 9, 1)
                )
            ]
            
            db.add_all(student_class_relations)
            db.commit()
            
            print("✅ 示例数据初始化成功！")
            print(f"   - 创建了1个学校")
            print(f"   - 创建了3个班级")
            print(f"   - 创建了4个学生")
            print(f"   - 创建了4个学生班级关联")
            
            return True
            
        finally:
            db.close()
            
    except Exception as e:
        print(f"❌ 初始化示例数据失败: {str(e)}")
        return False

def check_database_connection():
    """检查数据库连接"""
    try:
        print("检查数据库连接...")
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ 数据库连接正常！")
            return True
    except Exception as e:
        print(f"❌ 数据库连接失败: {str(e)}")
        return False

def main():
    """主函数"""
    print("=" * 60)
    print(">>> 体育教学管理系统 - 数据库初始化")
    print("=" * 60)
    
    # 检查数据库连接
    if not check_database_connection():
        sys.exit(1)
    
    # 创建数据表
    if not create_tables():
        sys.exit(1)
    
    # 初始化示例数据
    if not init_sample_data():
        sys.exit(1)
    
    print("\n" + "=" * 60)
    print("[SUCCESS] 数据库初始化完成！")
    print("=" * 60)
    print("\n[INFO] 后续步骤:")
    print("1. 运行: python main.py 启动API服务器")
    print("2. 访问: http://localhost:8002/docs 查看API文档")
    print("3. 开始开发各个功能模块")

if __name__ == "__main__":
    main()