#!/usr/bin/env python3
from database import SessionLocal
from models import Student, StudentClassRelation, Class

db = SessionLocal()

# 查询所有学生
all_students = db.query(Student).count()
print(f'所有学生总数: {all_students}')

# 查询有班级关系的学生
students_with_class = db.query(Student).join(
    StudentClassRelation, 
    Student.id == StudentClassRelation.student_id
).count()
print(f'有班级关系的学生: {students_with_class}')

# 查询没有班级关系的学生
students_without_class = all_students - students_with_class
print(f'没有班级关系的学生: {students_without_class}')

# 查询班级总数
classes = db.query(Class).count()
print(f'班级总数: {classes}')

# 查询student_class_relations总数
relations = db.query(StudentClassRelation).count()
print(f'学生-班级关系总数: {relations}')

db.close()
