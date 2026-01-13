"""修复classes表的主键配置"""
import sqlite3
from datetime import datetime

def fix_classes_table():
    conn = sqlite3.connect('sports_teaching.db')
    c = conn.cursor()
    
    print("开始修复classes表...")
    
    # 1. 备份现有数据
    c.execute("SELECT * FROM classes")
    existing_data = c.fetchall()
    print(f"备份了 {len(existing_data)} 条班级数据")
    
    # 2. 删除旧表
    c.execute("DROP TABLE IF EXISTS classes")
    print("✓ 删除旧classes表")
    
    # 3. 创建新表（正确的主键配置）
    c.execute("""
        CREATE TABLE classes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            class_name TEXT NOT NULL,
            grade TEXT NOT NULL,
            grade_level INTEGER NOT NULL,
            class_teacher_id INTEGER,
            class_teacher_name TEXT,
            assistant_teacher_name TEXT,
            max_student_count INTEGER DEFAULT 60,
            current_student_count INTEGER DEFAULT 0,
            school_id INTEGER,
            school_year_id INTEGER,
            status TEXT DEFAULT 'active',
            start_date DATE NOT NULL,
            end_date DATE,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (class_teacher_id) REFERENCES users (id),
            FOREIGN KEY (school_id) REFERENCES schools (id),
            FOREIGN KEY (school_year_id) REFERENCES school_years (id)
        )
    """)
    print("✓ 创建新classes表（带AUTOINCREMENT主键）")
    
    # 4. 恢复数据（如果有）
    if existing_data:
        # 获取列数
        columns_count = len(existing_data[0])
        placeholders = ','.join(['?' for _ in range(columns_count)])
        
        # 插入数据
        for row in existing_data:
            c.execute(f"INSERT INTO classes VALUES ({placeholders})", row)
        print(f"✓ 恢复了 {len(existing_data)} 条班级数据")
    
    conn.commit()
    
    # 5. 验证修复
    c.execute("PRAGMA table_info(classes)")
    table_info = c.fetchall()
    id_column = [col for col in table_info if col[1] == 'id'][0]
    if id_column[5] == 1:  # 第6个字段是主键标志
        print("✓ 主键配置验证成功")
    else:
        print("❌ 主键配置验证失败")
    
    conn.close()
    print("\n✓ classes表修复完成！")

if __name__ == "__main__":
    fix_classes_table()
