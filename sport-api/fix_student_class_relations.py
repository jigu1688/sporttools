"""修复student_class_relations表的主键配置"""
import sqlite3

def fix_student_class_relations_table():
    conn = sqlite3.connect('sports_teaching.db')
    c = conn.cursor()
    
    print("开始修复student_class_relations表...")
    
    # 1. 备份现有数据
    c.execute("SELECT * FROM student_class_relations")
    existing_data = c.fetchall()
    print(f"备份了 {len(existing_data)} 条学生-班级关联数据")
    
    # 2. 删除旧表
    c.execute("DROP TABLE IF EXISTS student_class_relations")
    print("✓ 删除旧student_class_relations表")
    
    # 3. 创建新表（正确的主键配置）
    c.execute("""
        CREATE TABLE student_class_relations (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            student_id INTEGER NOT NULL,
            class_id INTEGER NOT NULL,
            status TEXT DEFAULT 'active',
            join_date DATE NOT NULL,
            leave_date DATE,
            is_current INTEGER DEFAULT 1,
            user_id INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (student_id) REFERENCES students (id),
            FOREIGN KEY (class_id) REFERENCES classes (id),
            FOREIGN KEY (user_id) REFERENCES users (id)
        )
    """)
    print("✓ 创建新student_class_relations表（带AUTOINCREMENT主键）")
    
    # 4. 恢复数据（如果有）
    if existing_data:
        columns_count = len(existing_data[0])
        placeholders = ','.join(['?' for _ in range(columns_count)])
        
        for row in existing_data:
            c.execute(f"INSERT INTO student_class_relations VALUES ({placeholders})", row)
        print(f"✓ 恢复了 {len(existing_data)} 条关联数据")
    
    conn.commit()
    
    # 5. 验证修复
    c.execute("PRAGMA table_info(student_class_relations)")
    table_info = c.fetchall()
    id_column = [col for col in table_info if col[1] == 'id'][0]
    if id_column[5] == 1:
        print("✓ 主键配置验证成功")
    else:
        print("❌ 主键配置验证失败")
    
    conn.close()
    print("\n✓ student_class_relations表修复完成！")

if __name__ == "__main__":
    fix_student_class_relations_table()
