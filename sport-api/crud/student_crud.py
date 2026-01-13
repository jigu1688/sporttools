from sqlalchemy.orm import Session, joinedload
from models import Student, StudentClassRelation, Class, PhysicalTest
from typing import List, Tuple

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

    def get_students_with_class(self, db: Session, params) -> Tuple[List[dict], int]:
        """获取学生列表，包含当前班级信息"""
        query = db.query(Student)
        
        # 如果有班级ID或年级筛选，需要join班级关系表
        if params.class_id or params.grade:
            query = query.join(
                StudentClassRelation,
                (StudentClassRelation.student_id == Student.id) & (StudentClassRelation.is_current == True)
            ).join(
                Class,
                Class.id == StudentClassRelation.class_id
            )
            
            if params.class_id:
                query = query.filter(Class.id == params.class_id)
            
            if params.grade:
                query = query.filter(Class.grade == params.grade)
        
        # 应用过滤条件
        if params.search:
            search = f"%{params.search}%"
            query = query.filter(
                Student.real_name.like(search) | \
                Student.student_no.like(search) | \
                Student.id_card.like(search)
            )
        
        if params.gender:
            query = query.filter(Student.gender == params.gender)
        
        if params.status:
            query = query.filter(Student.status == params.status)
        
        # 计算总数
        total = query.count()
        
        # 应用分页
        skip = (params.page - 1) * params.page_size
        limit = params.page_size
        
        students = query.offset(skip).limit(limit).all()
        
        # 获取每个学生的当前班级信息
        result = []
        for student in students:
            # 获取当前班级关系
            current_relation = db.query(StudentClassRelation).filter(
                StudentClassRelation.student_id == student.id,
                StudentClassRelation.is_current == True
            ).first()
            
            # 构建学生信息字典
            student_dict = {
                'id': student.id,
                'student_no': student.student_no,
                'real_name': student.real_name,
                'gender': student.gender.value if student.gender else None,
                'birth_date': student.birth_date.isoformat() if student.birth_date else None,
                'id_card': student.id_card,
                'education_id': student.education_id,
                'phone': student.phone,
                'address': student.address,
                'health_status': student.health_status,
                'sports_level': student.sports_level.value if student.sports_level else None,
                'sports_specialty': student.sports_specialty,
                'status': student.status.value if student.status else None,
                'enrollment_date': student.enrollment_date.isoformat() if student.enrollment_date else None,
                'graduation_date': student.graduation_date.isoformat() if student.graduation_date else None,
                'created_at': student.created_at.isoformat() if student.created_at else None,
                'updated_at': student.updated_at.isoformat() if student.updated_at else None,
            }
            
            # 添加班级信息
            if current_relation:
                class_obj = db.query(Class).filter(Class.id == current_relation.class_id).first()
                if class_obj:
                    student_dict['current_class_id'] = class_obj.id
                    student_dict['current_class_name'] = class_obj.class_name
                    student_dict['current_grade'] = class_obj.grade
                    student_dict['current_grade_level'] = class_obj.grade_level
                    student_dict['current_school_year_id'] = class_obj.school_year_id
                    if class_obj.school_year:
                        student_dict['current_academic_year'] = class_obj.school_year.academic_year
                    else:
                        student_dict['current_academic_year'] = None
                else:
                    student_dict['current_class_id'] = None
                    student_dict['current_class_name'] = None
                    student_dict['current_grade'] = None
                    student_dict['current_grade_level'] = None
                    student_dict['current_school_year_id'] = None
                    student_dict['current_academic_year'] = None
            else:
                student_dict['current_class_id'] = None
                student_dict['current_class_name'] = None
                student_dict['current_grade'] = None
                student_dict['current_grade_level'] = None
                student_dict['current_school_year_id'] = None
                student_dict['current_academic_year'] = None
            
            result.append(student_dict)
        
        return result, total

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
        
        # 移除 class_id 和 join_date 字段（不属于 Student 模型，通过 StudentClassRelation 管理）
        student_dict.pop('class_id', None)
        student_dict.pop('join_date', None)
        
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
            
            # 定义允许更新的字段白名单
            allowed_fields = {
                'student_no', 'real_name', 'gender', 'birth_date', 'id_card',
                'photo_url', 'education_id', 'phone', 'address',
                'health_status', 'allergy_info', 'special_notes',
                'sports_level', 'sports_specialty', 'physical_limitations',
                'status', 'enrollment_date', 'graduation_date'
            }
            
            # 过滤掉不允许更新的字段
            filtered_data = {k: v for k, v in update_data.items() if k in allowed_fields}
            
            for key, value in filtered_data.items():
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
                'school_year_id': relation.class_.school_year_id,
                'academic_year': relation.class_.school_year.academic_year if relation.class_.school_year else None,
                'join_date': relation.join_date,
                'leave_date': relation.leave_date,
                'is_current': relation.is_current,
                'status': relation.status.value
            })
        
        return result

    def assign_student_to_class(self, db: Session, student_id: int, class_id: int, join_date=None):
        """将学生分配到班级。学年信息从班级关联的 school_year 获取，避免重复存储。"""
        from models import StudentClassRelation, StatusEnum
        from datetime import date
        
        if join_date is None:
            join_date = date.today()
        
        # 检查班级是否存在
        class_obj = db.query(Class).filter(Class.id == class_id).first()
        if not class_obj:
            return False
        
        # 检查是否已经存在当前班级关系
        existing_relation = db.query(StudentClassRelation).filter(
            StudentClassRelation.student_id == student_id,
            StudentClassRelation.class_id == class_id,
            StudentClassRelation.is_current == True
        ).first()
        
        if existing_relation:
            return False
        
        # 将该学生的其他当前班级关系设置为非当前
        db.query(StudentClassRelation).filter(
            StudentClassRelation.student_id == student_id,
            StudentClassRelation.is_current == True
        ).update({
            'is_current': False,
            'leave_date': join_date,
            'status': StatusEnum.transferred
        })
        
        # 创建新的班级关系
        new_relation = StudentClassRelation(
            student_id=student_id,
            class_id=class_id,
            join_date=join_date,
            status=StatusEnum.active,
            is_current=True
        )
        db.add(new_relation)
        db.commit()
        return True

    def remove_student_from_class(self, db: Session, student_id: int, class_id: int, leave_date):
        """将学生从班级中移除"""
        from datetime import date
        from models import StudentClassRelation, StatusEnum
        existing_relation = db.query(StudentClassRelation).filter(
            StudentClassRelation.student_id == student_id,
            StudentClassRelation.class_id == class_id,
            StudentClassRelation.is_current == True
        ).first()
        
        if not existing_relation:
            return False
        
        existing_relation.leave_date = leave_date
        existing_relation.is_current = False
        existing_relation.status = StatusEnum.transferred
        db.commit()
        return True

    def transfer_student(self, db: Session, student_id: int, from_class_id: int, to_class_id: int, transfer_date, reason: str = None):
        """学生转学处理"""
        from models import StudentClassRelation, StatusEnum, DataChangeLog
        from datetime import datetime
        
        # 检查学生是否存在
        student = self.get_student(db, student_id)
        if not student:
            return False, "学生不存在"
        
        # 检查原班级是否存在
        from_class = db.query(Class).filter(Class.id == from_class_id).first()
        if not from_class:
            return False, "原班级不存在"
        
        # 检查目标班级是否存在
        to_class = db.query(Class).filter(Class.id == to_class_id).first()
        if not to_class:
            return False, "目标班级不存在"
        
        # 获取原班级关系
        from_relation = db.query(StudentClassRelation).filter(
            StudentClassRelation.student_id == student_id,
            StudentClassRelation.class_id == from_class_id,
            StudentClassRelation.is_current == True
        ).first()
        
        if not from_relation:
            return False, "学生不在原班级中"
        
        # 更新原班级关系
        from_relation.leave_date = transfer_date
        from_relation.is_current = False
        from_relation.status = StatusEnum.transferred
        
        # 创建新班级关系
        to_relation = StudentClassRelation(
            student_id=student_id,
            class_id=to_class_id,
            join_date=transfer_date,
            status=StatusEnum.active,
            is_current=True
        )
        db.add(to_relation)
        
        # 更新学生状态
        student.status = StatusEnum.transferred
        
        # 记录数据变更日志
        change_log = DataChangeLog(
            table_name="students",
            record_id=student_id,
            operation="UPDATE",
            old_data={"class_id": from_class_id, "status": "active"},
            new_data={"class_id": to_class_id, "status": "transferred"},
            operation_reason=reason or f"学生从班级{from_class.class_name}转学到班级{to_class.class_name}"
        )
        db.add(change_log)
        
        db.commit()
        return True, "转学成功"

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
