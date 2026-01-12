import sqlite3
conn = sqlite3.connect('sports_teaching.db')
cursor = conn.cursor()
cursor.execute("PRAGMA table_info(student_class_relations)")
columns = cursor.fetchall()
print('student_class_relations 表的列:')
for col in columns:
    print(f'  {col[1]:25s} {col[2]:15s} NOT NULL={col[3]}')
conn.close()
