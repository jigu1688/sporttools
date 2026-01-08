#!/usr/bin/env python3
"""检查数据库状态"""

from database import engine, SessionLocal
from models import School, Student, Class
from sqlalchemy import text

def check_database():
    print("检查数据库状态...")
    
    # 检查表是否存在
    with engine.connect() as conn:
        try:
            result = conn.execute(text("SELECT COUNT(*) FROM schools"))
            school_count = result.scalar()
            print(f"学校数量: {school_count}")
        except:
            print("学校表不存在或为空")
            
        try:
            result = conn.execute(text("SELECT COUNT(*) FROM students"))
            student_count = result.scalar()
            print(f"学生数量: {student_count}")
        except:
            print("学生表不存在或为空")
            
        try:
            result = conn.execute(text("SELECT COUNT(*) FROM classes"))
            class_count = result.scalar()
            print(f"班级数量: {class_count}")
        except:
            print("班级表不存在或为空")

if __name__ == "__main__":
    check_database()