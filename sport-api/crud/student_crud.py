from sqlalchemy.orm import Session, joinedload
from models import Student, StudentClassRelation, Class, PhysicalTest

class StudentCrud:
    def get_student(self, db: Session, student_id: int):
        return db.query(Student).filter(Student.id == student_id).first()

    def get_students(self, db: Session, params):
        """获取学生列表，支持分页和多条件过滤"""
        query = db.query(Student)
        
        # 应用过滤条件
        if params.search:
            search = f"%{params.search}%"
            query = query.filter(
                Student.real_name.like(search) | \
                Student.student_no.like(search) | \
                Student.id_card.like(search)
            )
        
        if params.class_id:
            # 这里需要通过学生班级关联表过滤，暂时简化处理
            pass
        
        if params.grade:
            # 这里需要通过班级关联过滤，暂时简化处理
            pass
        
        if params.gender:
            query = query.filter(Student.gender == params.gender)
        
        if params.status:
            query = query.filter(Student.status == params.status)
        
        if params.sports_level:
            query = query.filter(Student.sports_level == params.sports_level)
        
        # 计算总数
        total = query.count()
        
        # 应用分页
        skip = (params.page - 1) * params.page_size
        limit = params.page_size
        
        students = query.offset(skip).limit(limit).all()
        
        return students, total

    def get_student_by_student_no(self, db: Session, student_no: str):
        """根据学籍号获取学生"""
        return db.query(Student).filter(Student.student_no == student_no).first()

    def create_student(self, db: Session, student_data):
        """创建学生"""
        # 检查学生数据类型并转换为字典
        if hasattr(student_data, 'dict'):
            student_dict = student_data.dict()
        else:
            student_dict = student_data
        
        db_student = Student(**student_dict)
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student

    def update_student(self, db: Session, student_id: int, student_data):
        """更新学生信息"""
        db_student = self.get_student(db, student_id)
        if db_student:
            # 检查学生数据类型并获取更新字段
            if hasattr(student_data, 'dict'):
                update_data = student_data.dict(exclude_unset=True)
            else:
                update_data = student_data
            
            for key, value in update_data.items():
                setattr(db_student, key, value)
            db.commit()
            db.refresh(db_student)
        return db_student

    def get_student_classes(self, db: Session, student_id: int):
        """获取学生的班级历史"""
        # 通过学生班级关联表查询学生的班级历史
        relations = db.query(StudentClassRelation).join(Class, StudentClassRelation.class_id == Class.id).filter(StudentClassRelation.student_id == student_id).order_by(StudentClassRelation.join_date.desc()).all()
        
        # 构建返回结果
        result = []
        for relation in relations:
            result.append({
                'relation_id': relation.id,
                'class_id': relation.class_id,
                'class_name': relation.class_.class_name,
                'grade': relation.class_.grade,
                'grade_level': relation.class_.grade_level,
                'academic_year': relation.academic_year,
                'school_year_id': relation.class_.school_year_id,
                'join_date': relation.join_date,
                'leave_date': relation.leave_date,
                'is_current': relation.is_current,
                'status': relation.status.value
            })
        
        return result

    def assign_student_to_class(self, db: Session, student_id: int, class_id: int, academic_year: str, join_date):
        """将学生分配到班级"""
        # 这里需要创建学生班级关联记录，暂时返回True
        return True

    def remove_student_from_class(self, db: Session, student_id: int, class_id: int, academic_year: str, leave_date):
        """将学生从班级中移除"""
        # 这里需要更新学生班级关联记录，暂时返回True
        return True

    def delete_student(self, db: Session, student_id: int):
        """删除学生"""
        db_student = self.get_student(db, student_id)
        if db_student:
            db.delete(db_student)
            db.commit()
            return True
        return False

    def get_student_history(self, db: Session, student_id: int):
        """获取学生历史记录，包含基本信息和体测成绩"""
        # 获取学生基本信息
        student = self.get_student(db, student_id)
        if not student:
            return None
        
        # 获取学生的班级历史
        class_history = self.get_student_classes(db, student_id)
        
        # 获取学生的体测历史记录
        physical_tests = db.query(PhysicalTest).filter(PhysicalTest.student_id == student_id).order_by(PhysicalTest.test_date.desc()).all()
        
        # 构建体测成绩历史
        test_history = []
        for test in physical_tests:
            test_history.append({
                'test_id': test.id,
                'test_date': test.test_date,
                'test_type': test.test_type,
                'height': test.height,
                'weight': test.weight,
                'vital_capacity': test.vital_capacity,
                'run_50m': test.run_50m,
                'run_800m': test.run_800m,
                'run_1000m': test.run_1000m,
                'sit_and_reach': test.sit_and_reach,
                'standing_long_jump': test.standing_long_jump,
                'pull_up': test.pull_up,
                'skip_rope': test.skip_rope,
                'total_score': test.total_score,
                'grade': test.grade,
                'tester_name': test.tester_name,
                'test_notes': test.test_notes,
                'is_official': test.is_official,
                'created_at': test.created_at,
                'updated_at': test.updated_at
            })
        
        # 构建返回结果
        return {
            'student_id': student.id,
            'student_no': student.student_no,
            'real_name': student.real_name,
            'gender': student.gender.value,
            'birth_date': student.birth_date,
            'age': self._calculate_age(student.birth_date) if student.birth_date else None,
            'id_card': student.id_card,
            'health_status': student.health_status,
            'sports_level': student.sports_level.value if student.sports_level else None,
            'sports_specialty': student.sports_specialty,
            'status': student.status.value,
            'enrollment_date': student.enrollment_date,
            'graduation_date': student.graduation_date,
            'created_at': student.created_at,
            'updated_at': student.updated_at,
            'class_history': class_history,
            'test_history': test_history
        }
    
    def _calculate_age(self, birth_date):
        """计算年龄"""
        from datetime import date
        today = date.today()
        age = today.year - birth_date.year
        if (today.month, today.day) < (birth_date.month, birth_date.day):
            age -= 1
        return age

student_crud = StudentCrud()
