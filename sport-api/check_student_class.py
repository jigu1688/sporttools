#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""检查学生和班级数据"""
import sqlite3

conn = sqlite3.connect('sports_teaching.db')
cursor = conn.cursor()

# 查看所有表
cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
print("所有表:", [t[0] for t in cursor.fetchall()])

# 检查students表
print("\n=== students表 ===")
try:
    cursor.execute("SELECT * FROM students LIMIT 3")
    columns = [description[0] for description in cursor.description]
    print("字段:", columns)
    rows = cursor.fetchall()
    for row in rows:
        print(dict(zip(columns, row)))
except Exception as e:
    print(f"错误: {e}")

# 检查classes表
print("\n=== classes表 ===")
try:
    cursor.execute("SELECT * FROM classes LIMIT 3")
    columns = [description[0] for description in cursor.description]
    print("字段:", columns)
    rows = cursor.fetchall()
    for row in rows:
        print(dict(zip(columns, row)))
except Exception as e:
    print(f"错误: {e}")

# 检查student_class_relations表
print("\n=== student_class_relations表 ===")
try:
    cursor.execute("SELECT * FROM student_class_relations LIMIT 3")
    columns = [description[0] for description in cursor.description]
    print("字段:", columns)
    rows = cursor.fetchall()
    for row in rows:
        print(dict(zip(columns, row)))
    cursor.execute("SELECT COUNT(*) FROM student_class_relations")
    print("记录数:", cursor.fetchone()[0])
except Exception as e:
    print(f"错误: {e}")

# 检查学生的年级和班级字段
print("\n=== 学生的年级/班级字段分布 ===")
cursor.execute("SELECT grade, class_name, current_class_id, COUNT(*) FROM students GROUP BY grade, class_name, current_class_id")
for row in cursor.fetchall():
    print(f"  grade={row[0]}, class_name={row[1]}, current_class_id={row[2]}, count={row[3]}")

conn.close()
