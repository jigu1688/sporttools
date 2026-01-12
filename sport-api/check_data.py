from database import SessionLocal
from models import Student, Class

session = SessionLocal()

try:
    # 检查班级
    print("=" * 60)
    print("数据库班级数据:")
    print("=" * 60)
    classes = session.query(Class).all()
    print(f'总班级数: {len(classes)}')
    if classes:
        for cls in classes[:5]:
            print(f'  ✓ ID:{cls.id:3d} | {cls.grade:6s} | {cls.className:15s} | 学生数:{cls.studentCount}')
        if len(classes) > 5:
            print(f'  ... 还有 {len(classes) - 5} 个班级')
    
    # 检查学生
    print("\n" + "=" * 60)
    print("数据库学生数据:")
    print("=" * 60)
    students = session.query(Student).all()
    print(f'总学生数: {len(students)}')
    if students:
        for student in students[:5]:
            print(f'  ✓ ID:{student.id:4d} | {student.studentName:10s} | 性别:{student.gender:4s} | 班级ID:{student.classId}')
        if len(students) > 5:
            print(f'  ... 还有 {len(students) - 5} 个学生')
    
except Exception as e:
    print(f'错误: {e}')
    import traceback
    traceback.print_exc()
finally:
    session.close()
