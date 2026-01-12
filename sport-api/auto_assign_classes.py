#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
为已有学生自动分配班级
根据学籍号中的出生日期推断年级，然后分配到对应班级
"""
import sqlite3
from datetime import date, datetime

# 连接数据库
conn = sqlite3.connect('sports_teaching.db')
cursor = conn.cursor()

# 获取学校ID和学年ID
cursor.execute("SELECT id FROM schools LIMIT 1")
school_row = cursor.fetchone()
school_id = school_row[0] if school_row else 1

cursor.execute("SELECT id, academic_year FROM school_years ORDER BY id DESC LIMIT 1")
school_year_row = cursor.fetchone()
school_year_id = school_year_row[0] if school_year_row else 1
academic_year = school_year_row[1] if school_year_row else '2025-2026'

print(f"使用学校ID: {school_id}, 学年ID: {school_year_id}, 学年: {academic_year}")

# 年级定义（根据出生年份计算）
# 假设2026年1月，6岁入学一年级
# 出生年份 2019 -> 一年级 (7岁)
# 出生年份 2018 -> 二年级 (8岁)
# 出生年份 2017 -> 三年级 (9岁)
# 出生年份 2016 -> 四年级 (10岁)
# 出生年份 2015 -> 五年级 (11岁)
# 出生年份 2014 -> 六年级 (12岁)

def get_grade_from_birth_year(birth_year):
    """根据出生年份计算年级"""
    current_year = 2026
    age = current_year - birth_year
    
    if age <= 7:
        return '一年级', 1
    elif age == 8:
        return '二年级', 2
    elif age == 9:
        return '三年级', 3
    elif age == 10:
        return '四年级', 4
    elif age == 11:
        return '五年级', 5
    elif age == 12:
        return '六年级', 6
    elif age == 13:
        return '初一', 7
    elif age == 14:
        return '初二', 8
    elif age == 15:
        return '初三', 9
    elif age == 16:
        return '高一', 10
    elif age == 17:
        return '高二', 11
    elif age >= 18:
        return '高三', 12
    else:
        return '一年级', 1

# 获取所有学生
cursor.execute("SELECT id, student_no, real_name, birth_date FROM students")
students = cursor.fetchall()
print(f"\n数据库中共有 {len(students)} 个学生")

# 统计每个年级的学生数量
grade_students = {}
for student_id, student_no, real_name, birth_date in students:
    # 从出生日期或学籍号提取出生年份
    birth_year = None
    
    if birth_date:
        try:
            birth_year = int(birth_date[:4])
        except:
            pass
    
    if not birth_year and student_no and len(student_no) > 10:
        # 学籍号格式: G + 6位地区码 + 8位出生日期 + ...
        # 例如: G110106201404203323 -> 出生年份 2014
        try:
            birth_year = int(student_no[7:11])
        except:
            pass
    
    if not birth_year:
        birth_year = 2019  # 默认
    
    grade_name, grade_level = get_grade_from_birth_year(birth_year)
    
    if grade_name not in grade_students:
        grade_students[grade_name] = []
    grade_students[grade_name].append({
        'id': student_id,
        'name': real_name,
        'birth_year': birth_year
    })

print("\n按年级统计:")
for grade, students_list in sorted(grade_students.items(), key=lambda x: x[1][0]['birth_year'] if x[1] else 0):
    print(f"  {grade}: {len(students_list)} 人")

# 创建班级（每个年级一个班级）
class_id_map = {}  # grade_name -> class_id
grade_level_map = {
    '一年级': 1, '二年级': 2, '三年级': 3, '四年级': 4, '五年级': 5, '六年级': 6,
    '初一': 7, '初二': 8, '初三': 9, '高一': 10, '高二': 11, '高三': 12
}

for grade_name in grade_students.keys():
    # 检查班级是否已存在
    cursor.execute(
        "SELECT id FROM classes WHERE grade = ? AND class_name = ?",
        (grade_name, '主校区1班')
    )
    existing = cursor.fetchone()
    
    if existing:
        class_id_map[grade_name] = existing[0]
        print(f"班级已存在: {grade_name} 主校区1班 (ID: {existing[0]})")
    else:
        # 创建新班级
        grade_level = grade_level_map.get(grade_name, 1)
        today = date.today().isoformat()
        
        cursor.execute("""
            INSERT INTO classes (class_name, grade, grade_level, academic_year, 
                                school_id, school_year_id, status, start_date, 
                                max_student_count, current_student_count)
            VALUES (?, ?, ?, ?, ?, ?, 'active', ?, 60, 0)
        """, ('主校区1班', grade_name, grade_level, academic_year, school_id, school_year_id, today))
        
        class_id = cursor.lastrowid
        class_id_map[grade_name] = class_id
        print(f"创建班级: {grade_name} 主校区1班 (ID: {class_id})")

conn.commit()

# 为学生建立班级关联
students_assigned = 0
students_skipped = 0

for grade_name, students_list in grade_students.items():
    class_id = class_id_map.get(grade_name)
    if not class_id:
        continue
    
    for student in students_list:
        student_id = student['id']
        
        # 检查是否已有关联
        cursor.execute("""
            SELECT id FROM student_class_relations 
            WHERE student_id = ? AND is_current = 1
        """, (student_id,))
        
        if cursor.fetchone():
            students_skipped += 1
            continue
        
        # 创建关联
        today = date.today().isoformat()
        cursor.execute("""
            INSERT INTO student_class_relations 
            (student_id, class_id, academic_year, status, join_date, is_current)
            VALUES (?, ?, ?, 'active', ?, 1)
        """, (student_id, class_id, academic_year, today))
        students_assigned += 1

# 更新班级学生人数
for grade_name, class_id in class_id_map.items():
    cursor.execute("""
        UPDATE classes SET current_student_count = (
            SELECT COUNT(*) FROM student_class_relations 
            WHERE class_id = ? AND is_current = 1
        ) WHERE id = ?
    """, (class_id, class_id))

conn.commit()
conn.close()

print(f"\n修复完成!")
print(f"  成功分配班级: {students_assigned} 个学生")
print(f"  已有班级关联(跳过): {students_skipped} 个学生")
