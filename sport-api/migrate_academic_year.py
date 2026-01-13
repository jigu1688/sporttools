#!/usr/bin/env python3
"""
迁移脚本：移除 academic_year 冗余列

步骤：
1. 对于 ClassStudentRelation，使用关联班级的 school_year_id 覆盖原 academic_year
2. 删除两个表的 academic_year 列（已在模型中移除，本脚本清理数据库）
3. 验证迁移完成
"""

import sqlite3
import sys
from datetime import datetime

DB_PATH = 'sports_teaching.db'

def migrate_academic_year():
    """执行迁移"""
    try:
        conn = sqlite3.connect(DB_PATH)
        c = conn.cursor()
        
        print(f"[{datetime.now()}] 开始迁移 academic_year...")
        
        # 步骤1: 检查 student_class_relations 表中是否还有 academic_year 列
        c.execute("PRAGMA table_info(student_class_relations)")
        columns = [col[1] for col in c.fetchall()]
        print(f"\nstudent_class_relations 表列: {columns}")
        
        if 'academic_year' in columns:
            print("⚠️  student_class_relations 表仍有 academic_year 列，正在删除...")
            # SQLite 不支持直接 DROP COLUMN，使用迁移方案
            # 保留实际存在的列
            col_list = ', '.join([col for col in columns if col != 'academic_year'])
            c.execute(f"""
                CREATE TABLE student_class_relations_new AS
                SELECT {col_list}
                FROM student_class_relations
            """)
            c.execute("DROP TABLE student_class_relations")
            c.execute("ALTER TABLE student_class_relations_new RENAME TO student_class_relations")
            print("✓ 删除 academic_year 列成功")
        else:
            print("✓ academic_year 列已不存在（可能已迁移）")
        
        # 步骤2: 检查 classes 表
        c.execute("PRAGMA table_info(classes)")
        columns = [col[1] for col in c.fetchall()]
        print(f"\nclasses 表列: {columns}")
        
        if 'academic_year' in columns:
            print("⚠️  classes 表仍有 academic_year 列，正在删除...")
            col_list = ', '.join([col for col in columns if col != 'academic_year'])
            c.execute(f"""
                CREATE TABLE classes_new AS
                SELECT {col_list}
                FROM classes
            """)
            c.execute("DROP TABLE classes")
            c.execute("ALTER TABLE classes_new RENAME TO classes")
            print("✓ 删除 academic_year 列成功")
        else:
            print("✓ academic_year 列已不存在（可能已迁移）")
        
        # 步骤3: 验证迁移
        print("\n[验证] 检查表结构...")
        c.execute("PRAGMA table_info(student_class_relations)")
        scr_cols = [col[1] for col in c.fetchall()]
        c.execute("PRAGMA table_info(classes)")
        cls_cols = [col[1] for col in c.fetchall()]
        
        if 'academic_year' not in scr_cols and 'academic_year' not in cls_cols:
            print("✓ 迁移成功：两个表都已移除 academic_year 列")
        else:
            print("❌ 迁移失败：仍存在 academic_year 列")
            return False
        
        conn.commit()
        print(f"\n[{datetime.now()}] 迁移完成！")
        return True
        
    except Exception as e:
        print(f"\n❌ 迁移出错: {e}")
        if conn:
            conn.rollback()
        return False
    finally:
        if conn:
            conn.close()

if __name__ == '__main__':
    success = migrate_academic_year()
    sys.exit(0 if success else 1)
