# 体育教学辅助网站 - CRUD操作
# 数据库增删改查操作

from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func
from typing import List, Optional, Tuple
from models import Student, Class, StudentClassRelation, School, User
from schemas import StudentCreate, StudentUpdate, StudentQueryParams, UserCreate, UserUpdate, UserResponse
from datetime import date, datetime, timezone
from auth import AuthService

class StudentCRUD:
    """学生管理CRUD操作"""
    
    def create_student(self, db: Session, student_data: StudentCreate) -> Student:
        """创建学生"""
        # 排除class_id和join_date，这些不是Student模型的字段
        student_dict = student_data.dict(exclude={'class_id', 'join_date'})
        db_student = Student(**student_dict)
        db.add(db_student)
        db.commit()
        db.refresh(db_student)
        return db_student
    
    def get_student(self, db: Session, student_id: int) -> Optional[Student]:
        """获取学生信息"""
        return db.query(Student).filter(Student.id == student_id).first()
    
    def get_student_by_student_no(self, db: Session, student_no: str) -> Optional[Student]:
        """根据学籍号获取学生"""
        return db.query(Student).filter(Student.student_no == student_no).first()
    
    def get_students(self, db: Session, params: StudentQueryParams) -> Tuple[List[Student], int]:
        """获取学生列表（支持分页和过滤）"""
        query = db.query(Student)
        
        # 搜索过滤
        if params.search:
            search_term = f"%{params.search}%"
            query = query.filter(
                or_(
                    Student.real_name.like(search_term),
                    Student.student_no.like(search_term),
                    Student.id_card.like(search_term)
                )
            )
        
        # 班级过滤
        if params.class_id:
            query = query.join(StudentClassRelation).filter(
                and_(
                    StudentClassRelation.student_id == Student.id,
                    StudentClassRelation.class_id == params.class_id,
                    StudentClassRelation.is_current == True
                )
            )
        
        # 年级过滤
        if params.grade:
            query = query.join(StudentClassRelation).join(Class).filter(
                and_(
                    StudentClassRelation.student_id == Student.id,
                    StudentClassRelation.is_current == True,
                    Class.grade == params.grade
                )
            )
        
        # 性别过滤
        if params.gender:
            query = query.filter(Student.gender == params.gender)
        
        # 状态过滤
        if params.status:
            query = query.filter(Student.status == params.status)
        
        # 体育水平过滤
        if params.sports_level:
            query = query.filter(Student.sports_level == params.sports_level)
        
        # 获取总数
        total = query.count()
        
        # 分页
        offset = (params.page - 1) * params.page_size
        students = query.order_by(Student.id).offset(offset).limit(params.page_size).all()
        
        return students, total
    
    def get_students_with_class(self, db: Session, params: StudentQueryParams) -> Tuple[List[dict], int]:
        """获取学生列表（包含当前班级信息）"""
        students, total = self.get_students(db, params)
        
        result = []
        for student in students:
            # 查询学生的当前班级
            current_relation = db.query(StudentClassRelation).filter(
                StudentClassRelation.student_id == student.id,
                StudentClassRelation.is_current == True
            ).first()
            
            student_dict = {
                'id': student.id,
                'student_no': student.student_no,
                'real_name': student.real_name,
                'gender': student.gender.value if student.gender else None,
                'birth_date': student.birth_date,
                'id_card': student.id_card,
                'photo_url': student.photo_url,
                'health_status': student.health_status,
                'allergy_info': student.allergy_info,
                'special_notes': student.special_notes,
                'sports_level': student.sports_level.value if student.sports_level else None,
                'sports_specialty': student.sports_specialty,
                'physical_limitations': student.physical_limitations,
                'status': student.status.value if student.status else 'active',
                'enrollment_date': student.enrollment_date,
                'graduation_date': student.graduation_date,
                'user_id': student.user_id,
                'created_at': student.created_at,
                'updated_at': student.updated_at,
                # 当前班级信息
                'current_class_id': None,
                'current_class_name': None,
                'current_grade': None,
                'current_academic_year': None
            }
            
            if current_relation and current_relation.class_:
                student_dict['current_class_id'] = current_relation.class_id
                student_dict['current_class_name'] = current_relation.class_.class_name
                student_dict['current_grade'] = current_relation.class_.grade
                student_dict['current_academic_year'] = current_relation.academic_year
            
            result.append(student_dict)
        
        return result, total
    
    def update_student(self, db: Session, student_id: int, student_data: StudentUpdate) -> Optional[Student]:
        """更新学生信息"""
        db_student = self.get_student(db, student_id)
        if not db_student:
            return None
        
        # 接受所有字段更新，包括空值（允许清空字段）
        update_data = student_data.dict()
        for field, value in update_data.items():
            if value is not None or field in ['photo_url', 'health_status', 'allergy_info', 
                                                'special_notes', 'sports_level', 'sports_specialty', 
                                                'physical_limitations', 'graduation_date']:
                setattr(db_student, field, value)
        
        db.commit()
        db.refresh(db_student)
        return db_student
    
    def delete_student(self, db: Session, student_id: int) -> bool:
        """删除学生"""
        db_student = self.get_student(db, student_id)
        if not db_student:
            return False
        
        # 删除相关的班级关联
        db.query(StudentClassRelation).filter(
            StudentClassRelation.student_id == student_id
        ).delete()
        
        # 删除学生
        db.delete(db_student)
        db.commit()
        return True
    
    def get_student_classes(self, db: Session, student_id: int) -> List[dict]:
        """获取学生的班级历史"""
        relations = db.query(StudentClassRelation).filter(
            StudentClassRelation.student_id == student_id
        ).join(Class).all()
        
        result = []
        for relation in relations:
            result.append({
                'relation_id': relation.id,
                'class_name': relation.class_.class_name,
                'grade': relation.class_.grade,
                'academic_year': relation.class_.school_year.academic_year if relation.class_.school_year else None,
                'join_date': relation.join_date,
                'leave_date': relation.leave_date,
                'is_current': relation.is_current,
                'status': relation.status.value
            })
        
        return result
    
    def assign_student_to_class(self, db: Session, student_id: int, class_id: int, 
                               join_date: date = None) -> bool:
        """将学生分配到班级"""
        if not join_date:
            join_date = date.today()
        
        # 获取目标班级信息（用于获取学年和检查容量）
        target_class = db.query(Class).filter(Class.id == class_id).first()
        if not target_class:
            return False
        
        # 检查班级容量
        if target_class.current_student_count >= target_class.max_student_count:
            return False  # 班级已满
        
        # 检查是否已在该班级
        existing = db.query(StudentClassRelation).filter(
            and_(
                StudentClassRelation.student_id == student_id,
                StudentClassRelation.class_id == class_id,
                StudentClassRelation.is_current == True
            )
        ).first()
        
        if existing:
            return False  # 已存在
        
        # 获取之前的班级ID（用于更新人数）
        old_relation = db.query(StudentClassRelation).filter(
            and_(
                StudentClassRelation.student_id == student_id,
                StudentClassRelation.is_current == True
            )
        ).first()
        old_class_id = old_relation.class_id if old_relation else None
        
        # 将之前的关联设为非当前
        if old_relation:
            old_relation.is_current = False
            old_relation.leave_date = join_date
        
        # 创建新的关联（自动填充学年信息）
        new_relation = StudentClassRelation(
            student_id=student_id,
            class_id=class_id,
            academic_year=target_class.academic_year,  # 从班级获取学年
            join_date=join_date,
            is_current=True
        )
        db.add(new_relation)
        db.commit()
        
        # 更新新班级的学生人数
        target_class.current_student_count = db.query(StudentClassRelation).filter(
            StudentClassRelation.class_id == class_id,
            StudentClassRelation.is_current == True
        ).count()
        
        # 更新旧班级的学生人数
        if old_class_id:
            old_class = db.query(Class).filter(Class.id == old_class_id).first()
            if old_class:
                old_class.current_student_count = db.query(StudentClassRelation).filter(
                    StudentClassRelation.class_id == old_class_id,
                    StudentClassRelation.is_current == True
                ).count()
        
        db.commit()
        return True
    
    def remove_student_from_class(self, db: Session, student_id: int, class_id: int, 
                                 leave_date: date = None) -> bool:
        """将学生从班级中移除"""
        if not leave_date:
            leave_date = date.today()
        
        relation = db.query(StudentClassRelation).filter(
            and_(
                StudentClassRelation.student_id == student_id,
                StudentClassRelation.class_id == class_id,
                StudentClassRelation.is_current == True
            )
        ).first()
        
        if not relation:
            return False
        
        relation.leave_date = leave_date
        relation.is_current = False
        db.commit()
        
        # 更新班级学生人数
        db_class = db.query(Class).filter(Class.id == class_id).first()
        if db_class:
            db_class.current_student_count = db.query(StudentClassRelation).filter(
                StudentClassRelation.class_id == class_id,
                StudentClassRelation.is_current == True
            ).count()
            db.commit()
        
        return True

class ClassCRUD:
    """班级管理CRUD操作"""
    
    def get_class(self, db: Session, class_id: int) -> Optional[Class]:
        """根据ID获取班级"""
        return db.query(Class).filter(Class.id == class_id).first()
    
    def get_classes(self, db: Session, school_id: int = None, school_year_id: int = None, grade: str = None) -> List[Class]:
        """获取班级列表"""
        query = db.query(Class)
        
        if school_id:
            query = query.filter(Class.school_id == school_id)
        
        if school_year_id:
            query = query.filter(Class.school_year_id == school_year_id)
        
        if grade:
            query = query.filter(Class.grade == grade)
        
        return query.filter(Class.status == "active").order_by(Class.grade_level, Class.class_name).all()
    
    def update_student_count(self, db: Session, class_id: int) -> int:
        """更新班级学生人数"""
        count = db.query(StudentClassRelation).filter(
            StudentClassRelation.class_id == class_id,
            StudentClassRelation.is_current == True
        ).count()
        
        db_class = self.get_class(db, class_id)
        if db_class:
            db_class.current_student_count = count
            db.commit()
        return count
    
    def create_class(self, db: Session, class_data: dict) -> Class:
        """创建班级"""
        # 检查班级名称是否已存在
        existing = db.query(Class).filter(
            Class.class_name == class_data.get("class_name"),
            Class.grade == class_data.get("grade"),
            Class.school_id == class_data.get("school_id"),
            Class.status == "active"
        ).first()
        
        if existing:
            raise ValueError("该班级已存在")
        
        # 创建班级
        new_class = Class(**class_data)
        db.add(new_class)
        db.commit()
        db.refresh(new_class)
        return new_class
    
    def update_class(self, db: Session, class_id: int, class_data: dict) -> Optional[Class]:
        """更新班级信息"""
        db_class = self.get_class(db, class_id)
        if not db_class:
            return None
        
        # 更新班级信息
        for field, value in class_data.items():
            setattr(db_class, field, value)
        
        db.commit()
        db.refresh(db_class)
        return db_class
    
    def delete_class(self, db: Session, class_id: int, force: bool = False) -> dict:
        """删除班级（软删除）
        
        Args:
            db: 数据库会话
            class_id: 班级ID
            force: 是否强制删除（即使有学生也删除）
            
        Returns:
            dict: 包含success、message和transferred_students字段
        """
        db_class = self.get_class(db, class_id)
        if not db_class:
            return {"success": False, "message": "班级不存在", "transferred_students": 0}
        
        # 检查是否有学生
        student_count = db.query(StudentClassRelation).filter(
            StudentClassRelation.class_id == class_id,
            StudentClassRelation.is_current == True
        ).count()
        
        if student_count > 0 and not force:
            return {
                "success": False, 
                "message": f"班级中还有 {student_count} 名学生，请先转移学生或使用强制删除",
                "transferred_students": 0
            }
        
        # 将所有学生关系设为非当前
        from models import StatusEnum
        db.query(StudentClassRelation).filter(
            StudentClassRelation.class_id == class_id,
            StudentClassRelation.is_current == True
        ).update({
            'is_current': False, 
            'leave_date': date.today(),
            'status': StatusEnum.inactive
        })
        
        # 软删除班级
        db_class.status = StatusEnum.inactive
        db_class.end_date = date.today()
        db.commit()
        
        return {"success": True, "message": "班级删除成功", "transferred_students": student_count}
    
    def get_class_students(self, db: Session, class_id: int) -> List[Student]:
        """获取班级学生列表"""
        query = db.query(Student).join(StudentClassRelation).filter(
            StudentClassRelation.student_id == Student.id,
            StudentClassRelation.class_id == class_id,
            StudentClassRelation.is_current == True
        )
        
        return query.order_by(Student.real_name).all()
    
    def get_class_history(self, db: Session, class_id: int) -> List[dict]:
        """获取班级历史信息（所有学生的加入/离开记录）"""
        db_class = self.get_class(db, class_id)
        if not db_class:
            return []
        
        # 获取所有学生关系历史
        relations = db.query(StudentClassRelation).filter(
            StudentClassRelation.class_id == class_id
        ).order_by(StudentClassRelation.join_date.desc()).all()
        
        history = []
        for relation in relations:
            student = db.query(Student).filter(Student.id == relation.student_id).first()
            if student:
                history.append({
                    'relation_id': relation.id,
                    'student_id': student.id,
                    'student_name': student.real_name,
                    'student_no': student.student_no,
                    'gender': student.gender.value if student.gender else None,
                    'join_date': relation.join_date,
                    'leave_date': relation.leave_date,
                    'is_current': relation.is_current,
                    'status': relation.status.value if relation.status else 'active',
                    'academic_year': relation.academic_year
                })
        
        return history
    
    def assign_teacher(self, db: Session, class_id: int, teacher_id: int, is_main_teacher: bool = True) -> bool:
        """分配教师到班级"""
        db_class = self.get_class(db, class_id)
        if not db_class:
            return False
        
        if is_main_teacher:
            db_class.class_teacher_id = teacher_id
        else:
            # 这里可以扩展为支持多个教师
            pass
        
        db.commit()
        return True

class SchoolCRUD:
    """学校管理CRUD操作"""
    
    def get_schools(self, db: Session) -> List[School]:
        """获取学校列表"""
        return db.query(School).filter(School.status == "active").order_by(School.school_name).all()
    
    def get_school_by_id(self, db: Session, school_id: int) -> Optional[School]:
        """根据ID获取学校"""
        return db.query(School).filter(School.id == school_id).first()

class UserCRUD:
    """用户管理CRUD操作"""
    
    def create_user(self, db: Session, user_data: dict) -> User:
        """创建用户"""
        # 检查用户名是否已存在
        existing_user = self.get_user_by_username(db, user_data.get("username"))
        if existing_user:
            raise ValueError("用户名已存在")
        
        # 检查邮箱是否已存在
        if user_data.get("email"):
            existing_email = self.get_user_by_email(db, user_data.get("email"))
            if existing_email:
                raise ValueError("邮箱已存在")
        
        # 创建用户
        db_user = User(**user_data)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        """根据ID获取用户"""
        return db.query(User).filter(User.id == user_id).first()
    
    def get_user_by_username(self, db: Session, username: str) -> Optional[User]:
        """根据用户名获取用户"""
        return db.query(User).filter(User.username == username).first()
    
    def get_user_by_email(self, db: Session, email: str) -> Optional[User]:
        """根据邮箱获取用户"""
        return db.query(User).filter(User.email == email).first()
    
    def get_users(self, db: Session, skip: int = 0, limit: int = 100) -> List[User]:
        """获取用户列表"""
        return db.query(User).offset(skip).limit(limit).all()
    
    def update_user(self, db: Session, user_id: int, user_data: UserUpdate) -> Optional[User]:
        """更新用户信息"""
        db_user = self.get_user(db, user_id)
        if not db_user:
            return None
        
        update_data = user_data.dict(exclude_unset=True)
        for field, value in update_data.items():
            setattr(db_user, field, value)
        
        db.commit()
        db.refresh(db_user)
        return db_user
    
    def update_user_password(self, db: Session, user_id: int, new_password: str) -> bool:
        """更新用户密码"""
        db_user = self.get_user(db, user_id)
        if not db_user:
            return False
        
        hashed_password = AuthService.get_password_hash(new_password)
        db_user.hashed_password = hashed_password
        db.commit()
        return True
    
    def delete_user(self, db: Session, user_id: int) -> bool:
        """删除用户"""
        db_user = self.get_user(db, user_id)
        if not db_user:
            return False
        
        db.delete(db_user)
        db.commit()
        return True
    
    def authenticate_user(self, db: Session, username: str, password: str) -> Optional[User]:
        """验证用户"""
        user = self.get_user_by_username(db, username)
        if not user:
            return None
        
        if not AuthService.verify_password(password, user.hashed_password):
            return None
        
        return user
    
    def update_last_login(self, db: Session, user_id: int) -> bool:
        """更新最后登录时间"""
        db_user = self.get_user(db, user_id)
        if not db_user:
            return False
        
        db_user.last_login_at = datetime.now(timezone.utc)
        db.commit()
        return True

# 创建CRUD实例
student_crud = StudentCRUD()
class_crud = ClassCRUD()
school_crud = SchoolCRUD()
user_crud = UserCRUD()

# 从 crud 包导入其他 crud 实例 (保持兼容性)
from crud.school_year_crud import school_year_crud
from crud.sports_meet_crud import sports_meet_crud
from crud.physical_test_crud import physical_test_crud
from crud.token_crud import token_crud