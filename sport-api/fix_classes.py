#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
修复班级数据和学生班级关联
"""

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')
from database import SessionLocal
from models import Student, Class, StudentClassRelation, School, SchoolYear, StatusEnum
from datetime import date

def fix_classes_and_relations():
    """修复班级和学生班级关系"""
    session = SessionLocal()
    
    try:
        # 获取或创建学校
        school = session.query(School).first()
        if not school:
            print("❌ 数据库中没有学校数据，请先初始化学校")
            return False
        
        print(f"✓ 使用学校: {school.school_name}")
        
        # 获取或创建学年
        school_year = session.query(SchoolYear).first()
        if not school_year:
            print("❌ 数据库中没有学年数据")
            return False
        
        print(f"✓ 使用学年: {school_year.year_name}")
        
        # 获取所有学生
        students = session.query(Student).all()
        print(f"✓ 找到 {len(students)} 个学生")
        
        if not students:
            print("❌ 没有学生数据")
            return False
        
        # 分析学生的班级分布（根据学号推断班级）
        class_map = {}
        for student in students:
            # 从学号中提取班级信息（学号格式: XX20240XXYY）
            student_no = student.student_no
            if len(student_no) >= 8:
                # 提取班级代码 (通常是学号的倒数第两位)
                class_code = student_no[-3:-1]  # 取倒数第3和2位
                if class_code not in class_map:
                    class_map[class_code] = []
                class_map[class_code].append(student)
        
        print(f"\n✓ 发现 {len(class_map)} 个班级")
        
        # 创建班级
        created_classes = {}
        for class_code, students_in_class in class_map.items():
            # 检查班级是否已存在
            existing_class = session.query(Class).filter(
                Class.class_name == f"班级{class_code}"
            ).first()
            
            if existing_class:
                created_classes[class_code] = existing_class
                print(f"  ✓ 班级 {class_code} 已存在 (学生数: {len(students_in_class)})")
            else:
                # 推断年级
                try:
                    grade_level = int(class_code[0])
                    grade_map = {
                        1: "一年级", 2: "二年级", 3: "三年级", 4: "四年级", 5: "五年级", 6: "六年级",
                        7: "初一", 8: "初二", 9: "初三",
                        10: "高一", 11: "高二", 12: "高三"
                    }
                    grade = grade_map.get(grade_level, f"年级{grade_level}")
                except:
                    grade = "未知年级"
                
                new_class = Class(
                    class_name=f"班级{class_code}",
                    grade=grade,
                    grade_level=int(class_code[0]) if class_code[0].isdigit() else 7,
                    academic_year=school_year.academic_year,
                    class_teacher_name=f"教师{class_code}",
                    school_id=school.id,
                    school_year_id=school_year.id,
                    status=StatusEnum.active,
                    start_date=date(2024, 9, 1),
                    max_student_count=60,
                    current_student_count=len(students_in_class)
                )
                session.add(new_class)
                session.flush()
                created_classes[class_code] = new_class
                print(f"  ✓ 创建班级 {class_code} - {grade} (学生数: {len(students_in_class)})")
        
        session.commit()
        
        # 创建学生班级关联
        print("\n开始创建学生班级关联...")
        relation_count = 0
        
        for class_code, students_in_class in class_map.items():
            class_obj = created_classes[class_code]
            
            for student in students_in_class:
                # 检查关联是否已存在
                existing_relation = session.query(StudentClassRelation).filter(
                    StudentClassRelation.student_id == student.id,
                    StudentClassRelation.class_id == class_obj.id
                ).first()
                
                if not existing_relation:
                    relation = StudentClassRelation(
                        student_id=student.id,
                        class_id=class_obj.id,
                        academic_year=school_year.academic_year,
                        join_date=date(2024, 9, 1),
                        status=StatusEnum.active
                    )
                    session.add(relation)
                    relation_count += 1
        
        session.commit()
        print(f"✓ 创建了 {relation_count} 条学生班级关联")
        
        # 验证结果
        print("\n" + "=" * 60)
        print("验证结果:")
        print("=" * 60)
        
        classes = session.query(Class).all()
        print(f"✓ 班级总数: {len(classes)}")
        
        relations = session.query(StudentClassRelation).all()
        print(f"✓ 学生班级关联总数: {len(relations)}")
        
        # 显示班级统计
        print("\n班级详情:")
        for cls in classes[:10]:
            student_count = session.query(StudentClassRelation).filter(
                StudentClassRelation.class_id == cls.id
            ).count()
            print(f"  • {cls.class_name} ({cls.grade}): {student_count} 名学生")
        
        if len(classes) > 10:
            print(f"  ... 还有 {len(classes) - 10} 个班级")
        
        print("\n✅ 修复完成！")
        return True
        
    except Exception as e:
        session.rollback()
        print(f"❌ 错误: {e}")
        import traceback
        traceback.print_exc()
        return False
    finally:
        session.close()

if __name__ == "__main__":
    fix_classes_and_relations()
