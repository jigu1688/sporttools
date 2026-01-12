#!/usr/bin/env python
# -*- coding: utf-8 -*-
import sqlite3
import os

db_path = 'sports_teaching.db'

if not os.path.exists(db_path):
    print(f'数据库文件不存在: {db_path}')
    exit(1)

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# 检查列是否存在
cursor.execute("PRAGMA table_info(students)")
columns = [row[1] for row in cursor.fetchall()]
print('现有列:', columns)
print()

# 添加缺失的列
try:
    if 'education_id' not in columns:
        cursor.execute('ALTER TABLE students ADD COLUMN education_id VARCHAR(100)')
        print('✓ 已添加 education_id 列')
    else:
        print('✓ education_id 列已存在')
except Exception as e:
    print(f'添加 education_id 列失败: {e}')
    
try:
    if 'phone' not in columns:
        cursor.execute('ALTER TABLE students ADD COLUMN phone VARCHAR(20)')
        print('✓ 已添加 phone 列')
    else:
        print('✓ phone 列已存在')
except Exception as e:
    print(f'添加 phone 列失败: {e}')
    
try:
    if 'address' not in columns:
        cursor.execute('ALTER TABLE students ADD COLUMN address TEXT')
        print('✓ 已添加 address 列')
    else:
        print('✓ address 列已存在')
except Exception as e:
    print(f'添加 address 列失败: {e}')

conn.commit()

# 再次检查
cursor.execute("PRAGMA table_info(students)")
columns = [row[1] for row in cursor.fetchall()]
print()
print('更新后的列:', columns)

conn.close()
print()
print('✓ 数据库迁移完成')
