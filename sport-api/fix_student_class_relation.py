#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
修复已有学生的班级关联
从Excel导入文件读取年级班级信息，为数据库中的学生建立班级关联
"""
import sqlite3
import pandas as pd
from datetime import date

# 读取导入的Excel文件
excel_path = '../导入导出/导入国家体质健康测试数据模板 (1).xlsx'
print(f"读取Excel文件: {excel_path}")
df = pd.read_excel(excel_path)
print(f"Excel文件包含 {len(df)} 条记录")
print(f"列名: {list(df.columns)}")

# 连接数据库
conn = sqlite3.connect('sports_teaching.db')
cursor = conn.cursor()

# 获取学校ID和学年ID（使用默认值或从数据库获取）
cursor.execute("SELECT id FROM schools LIMIT 1")
school_row = cursor.fetchone()
school_id = school_row[0] if school_row else 1

cursor.execute("SELECT id, academic_year FROM school_years ORDER BY id DESC LIMIT 1")
school_year_row = cursor.fetchone()
school_year_id = school_year_row[0] if school_year_row else 1
academic_year = school_year_row[1] if school_year_row else '2025-2026'

print(f"使用学校ID: {school_id}, 学年ID: {school_year_id}, 学年: {academic_year}")

# 年级编码映射
grade_code_mapping = {
    '一年级': 1, '二年级': 2, '三年级': 3, '四年级': 4, '五年级': 5, '六年级': 6,
    '初一': 7, '初二': 8, '初三': 9,
    '高一': 10, '高二': 11, '高三': 12
}

# 提取所有唯一的年级+班级组合
grade_class_set = set()
for _, row in df.iterrows():
    grade = row.get('年级', '')
    class_name = row.get('班级', '')
    if grade and class_name:
        grade_class_set.add((grade, class_name))

print(f"\n发现 {len(grade_class_set)} 个唯一的年级班级组合:")
for gc in sorted(grade_class_set):
    print(f"  {gc[0]} - {gc[1]}")

# 创建班级（如果不存在）
class_id_map = {}  # (grade, class_name) -> class_id

for grade, class_name in grade_class_set:
    # 检查班级是否已存在
    cursor.execute(
        "SELECT id FROM classes WHERE grade = ? AND class_name = ?",
        (grade, class_name)
    )
    existing = cursor.fetchone()
    
    if existing:
        class_id_map[(grade, class_name)] = existing[0]
        print(f"班级已存在: {grade} {class_name} (ID: {existing[0]})")
    else:
        # 创建新班级
        grade_level = grade_code_mapping.get(grade, 1)
        today = date.today().isoformat()
        
        cursor.execute("""
            INSERT INTO classes (class_name, grade, grade_level, academic_year, 
                                school_id, school_year_id, status, start_date, 
                                max_student_count, current_student_count)
            VALUES (?, ?, ?, ?, ?, ?, 'active', ?, 60, 0)
        """, (class_name, grade, grade_level, academic_year, school_id, school_year_id, today))
        
        class_id = cursor.lastrowid
        class_id_map[(grade, class_name)] = class_id
        print(f"创建班级: {grade} {class_name} (ID: {class_id})")

conn.commit()
print(f"\n共创建/获取 {len(class_id_map)} 个班级")

# 为学生建立班级关联
# 需要通过姓名匹配学生（因为学籍号可能不同）
students_updated = 0
students_already_assigned = 0
students_not_found = 0

for _, row in df.iterrows():
    student_name = row.get('姓名', '')
    grade = row.get('年级', '')
    class_name = row.get('班级', '')
    
    if not student_name or not grade or not class_name:
        continue
    
    # 查找学生
    cursor.execute("SELECT id FROM students WHERE real_name = ?", (student_name,))
    student_row = cursor.fetchone()
    
    if not student_row:
        print(f"学生不存在: {student_name}")
        students_not_found += 1
        continue
    
    student_id = student_row[0]
    class_id = class_id_map.get((grade, class_name))
    
    if not class_id:
        print(f"班级不存在: {grade} {class_name}")
        continue
    
    # 检查是否已有关联
    cursor.execute("""
        SELECT id FROM student_class_relations 
        WHERE student_id = ? AND is_current = 1
    """, (student_id,))
    
    if cursor.fetchone():
        students_already_assigned += 1
        continue
    
    # 创建关联
    today = date.today().isoformat()
    cursor.execute("""
        INSERT INTO student_class_relations 
        (student_id, class_id, academic_year, status, join_date, is_current)
        VALUES (?, ?, ?, 'active', ?, 1)
    """, (student_id, class_id, academic_year, today))
    students_updated += 1

# 更新班级学生人数
for (grade, class_name), class_id in class_id_map.items():
    cursor.execute("""
        UPDATE classes SET current_student_count = (
            SELECT COUNT(*) FROM student_class_relations 
            WHERE class_id = ? AND is_current = 1
        ) WHERE id = ?
    """, (class_id, class_id))

conn.commit()
conn.close()

print(f"\n修复完成!")
print(f"  成功分配班级: {students_updated} 个学生")
print(f"  已有班级关联: {students_already_assigned} 个学生")
print(f"  学生不存在: {students_not_found} 个")
