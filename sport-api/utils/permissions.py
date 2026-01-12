# 体育教学辅助网站 - 权限管理系统
# 提供细粒度的权限控制功能

from enum import Enum
from typing import List, Dict, Set, Optional
from fastapi import HTTPException, status
from sqlalchemy.orm import Session
from models import User, UserRoleEnum, StudentClassRelation

class Permission(Enum):
    """权限枚举"""
    # 用户管理
    USER_VIEW = "user_view"
    USER_CREATE = "user_create"
    USER_UPDATE = "user_update"
    USER_DELETE = "user_delete"
    
    # 学生管理
    STUDENT_VIEW = "student_view"
    STUDENT_CREATE = "student_create"
    STUDENT_UPDATE = "student_update"
    STUDENT_DELETE = "student_delete"
    STUDENT_TRANSFER = "student_transfer"
    
    # 班级管理
    CLASS_VIEW = "class_view"
    CLASS_CREATE = "class_create"
    CLASS_UPDATE = "class_update"
    CLASS_DELETE = "class_delete"
    CLASS_ASSIGN_STUDENT = "class_assign_student"
    
    # 学校管理
    SCHOOL_VIEW = "school_view"
    SCHOOL_CREATE = "school_create"
    SCHOOL_UPDATE = "school_update"
    SCHOOL_DELETE = "school_delete"
    
    # 学年管理
    SCHOOL_YEAR_VIEW = "school_year_view"
    SCHOOL_YEAR_CREATE = "school_year_create"
    SCHOOL_YEAR_UPDATE = "school_year_update"
    SCHOOL_YEAR_DELETE = "school_year_delete"
    
    # 体测管理
    PHYSICAL_TEST_VIEW = "physical_test_view"
    PHYSICAL_TEST_CREATE = "physical_test_create"
    PHYSICAL_TEST_UPDATE = "physical_test_update"
    PHYSICAL_TEST_DELETE = "physical_test_delete"
    PHYSICAL_TEST_CALCULATE = "physical_test_calculate"
    
    # 运动会管理
    SPORTS_MEET_VIEW = "sports_meet_view"
    SPORTS_MEET_CREATE = "sports_meet_create"
    SPORTS_MEET_UPDATE = "sports_meet_update"
    SPORTS_MEET_DELETE = "sports_meet_delete"
    
    # 项目管理
    EVENT_VIEW = "event_view"
    EVENT_CREATE = "event_create"
    EVENT_UPDATE = "event_update"
    EVENT_DELETE = "event_delete"
    
    # 报名管理
    REGISTRATION_VIEW = "registration_view"
    REGISTRATION_CREATE = "registration_create"
    REGISTRATION_UPDATE = "registration_update"
    REGISTRATION_DELETE = "registration_delete"
    REGISTRATION_APPROVE = "registration_approve"
    
    # 成绩管理
    RESULT_VIEW = "result_view"
    RESULT_CREATE = "result_create"
    RESULT_UPDATE = "result_update"
    RESULT_DELETE = "result_delete"
    
    # 日志管理
    LOG_VIEW = "log_view"
    LOG_DELETE = "log_delete"
    
    # 系统管理
    SYSTEM_CONFIG = "system_config"
    DATA_EXPORT = "data_export"
    DATA_IMPORT = "data_import"

class RolePermissionManager:
    """角色权限管理器"""
    
    # 角色默认权限映射
    ROLE_PERMISSIONS: Dict[UserRoleEnum, Set[Permission]] = {
        UserRoleEnum.admin: {
            # 管理员拥有所有权限
            Permission.USER_VIEW, Permission.USER_CREATE, Permission.USER_UPDATE, Permission.USER_DELETE,
            Permission.STUDENT_VIEW, Permission.STUDENT_CREATE, Permission.STUDENT_UPDATE, Permission.STUDENT_DELETE, Permission.STUDENT_TRANSFER,
            Permission.CLASS_VIEW, Permission.CLASS_CREATE, Permission.CLASS_UPDATE, Permission.CLASS_DELETE, Permission.CLASS_ASSIGN_STUDENT,
            Permission.SCHOOL_VIEW, Permission.SCHOOL_CREATE, Permission.SCHOOL_UPDATE, Permission.SCHOOL_DELETE,
            Permission.SCHOOL_YEAR_VIEW, Permission.SCHOOL_YEAR_CREATE, Permission.SCHOOL_YEAR_UPDATE, Permission.SCHOOL_YEAR_DELETE,
            Permission.PHYSICAL_TEST_VIEW, Permission.PHYSICAL_TEST_CREATE, Permission.PHYSICAL_TEST_UPDATE, Permission.PHYSICAL_TEST_DELETE, Permission.PHYSICAL_TEST_CALCULATE,
            Permission.SPORTS_MEET_VIEW, Permission.SPORTS_MEET_CREATE, Permission.SPORTS_MEET_UPDATE, Permission.SPORTS_MEET_DELETE,
            Permission.EVENT_VIEW, Permission.EVENT_CREATE, Permission.EVENT_UPDATE, Permission.EVENT_DELETE,
            Permission.REGISTRATION_VIEW, Permission.REGISTRATION_CREATE, Permission.REGISTRATION_UPDATE, Permission.REGISTRATION_DELETE, Permission.REGISTRATION_APPROVE,
            Permission.RESULT_VIEW, Permission.RESULT_CREATE, Permission.RESULT_UPDATE, Permission.RESULT_DELETE,
            Permission.LOG_VIEW, Permission.LOG_DELETE,
            Permission.SYSTEM_CONFIG, Permission.DATA_EXPORT, Permission.DATA_IMPORT
        },
        
        UserRoleEnum.teacher: {
            # 教师权限
            Permission.USER_VIEW,
            Permission.STUDENT_VIEW, Permission.STUDENT_UPDATE,
            Permission.CLASS_VIEW, Permission.CLASS_UPDATE,
            Permission.SCHOOL_VIEW, Permission.SCHOOL_YEAR_VIEW,
            Permission.PHYSICAL_TEST_VIEW, Permission.PHYSICAL_TEST_CREATE, Permission.PHYSICAL_TEST_UPDATE, Permission.PHYSICAL_TEST_CALCULATE,
            Permission.SPORTS_MEET_VIEW, Permission.SPORTS_MEET_CREATE, Permission.SPORTS_MEET_UPDATE,
            Permission.EVENT_VIEW, Permission.EVENT_CREATE, Permission.EVENT_UPDATE,
            Permission.REGISTRATION_VIEW, Permission.REGISTRATION_CREATE, Permission.REGISTRATION_UPDATE, Permission.REGISTRATION_APPROVE,
            Permission.RESULT_VIEW, Permission.RESULT_CREATE, Permission.RESULT_UPDATE,
            Permission.DATA_EXPORT
        },
        
        UserRoleEnum.student: {
            # 学生权限
            Permission.USER_VIEW,
            Permission.STUDENT_VIEW,
            Permission.CLASS_VIEW,
            Permission.SCHOOL_VIEW, Permission.SCHOOL_YEAR_VIEW,
            Permission.PHYSICAL_TEST_VIEW,
            Permission.SPORTS_MEET_VIEW,
            Permission.EVENT_VIEW,
            Permission.REGISTRATION_VIEW, Permission.REGISTRATION_CREATE, Permission.REGISTRATION_UPDATE,
            Permission.RESULT_VIEW
        },
        
        UserRoleEnum.parent: {
            # 家长权限
            Permission.USER_VIEW,
            Permission.STUDENT_VIEW,
            Permission.CLASS_VIEW,
            Permission.SCHOOL_VIEW, Permission.SCHOOL_YEAR_VIEW,
            Permission.PHYSICAL_TEST_VIEW,
            Permission.SPORTS_MEET_VIEW,
            Permission.EVENT_VIEW,
            Permission.REGISTRATION_VIEW,
            Permission.RESULT_VIEW
        }
    }
    
    @classmethod
    def get_role_permissions(cls, role: UserRoleEnum) -> Set[Permission]:
        """获取角色的权限集合"""
        return cls.ROLE_PERMISSIONS.get(role, set())
    
    @classmethod
    def has_permission(cls, role: UserRoleEnum, permission: Permission) -> bool:
        """检查角色是否拥有指定权限"""
        return permission in cls.get_role_permissions(role)
    
    @classmethod
    def has_any_permission(cls, role: UserRoleEnum, permissions: List[Permission]) -> bool:
        """检查角色是否拥有任意一个指定权限"""
        role_permissions = cls.get_role_permissions(role)
        return any(perm in role_permissions for perm in permissions)
    
    @classmethod
    def has_all_permissions(cls, role: UserRoleEnum, permissions: List[Permission]) -> bool:
        """检查角色是否拥有所有指定权限"""
        role_permissions = cls.get_role_permissions(role)
        return all(perm in role_permissions for perm in permissions)

class PermissionChecker:
    """权限检查器"""
    
    def __init__(self, db: Session):
        self.db = db
    
    def check_permission(self, user: User, permission: Permission) -> bool:
        """检查用户是否拥有指定权限"""
        if not user:
            return False
        
        user_role = user.role if isinstance(user.role, UserRoleEnum) else UserRoleEnum(user.role)
        return RolePermissionManager.has_permission(user_role, permission)
    
    def check_class_access(self, user: User, class_id: int, required_permission: Permission) -> bool:
        """检查用户是否可以访问指定班级"""
        if not user:
            return False
        
        user_role = user.role if isinstance(user.role, UserRoleEnum) else UserRoleEnum(user.role)
        
        # 管理员可以访问所有班级
        if user_role == UserRoleEnum.admin:
            return True
        
        # 检查基础权限
        if not self.check_permission(user, required_permission):
            return False
        
        # 教师只能访问自己管理的班级
        if user_role == UserRoleEnum.teacher:
            from models import Class
            class_obj = self.db.query(Class).filter(Class.id == class_id).first()
            if class_obj and class_obj.class_teacher_id == user.id:
                return True
            return False
        
        # 学生只能访问自己的班级
        if user_role == UserRoleEnum.student:
            from models import Student
            student = self.db.query(Student).filter(Student.user_id == user.id).first()
            if student:
                current_relation = self.db.query(StudentClassRelation).filter(
                    StudentClassRelation.student_id == student.id,
                    StudentClassRelation.is_current == True
                ).first()
                if current_relation and current_relation.class_id == class_id:
                    return True
            return False
        
        # 家长只能访问自己孩子的班级
        if user_role == UserRoleEnum.parent:
            from models import Student, FamilyInfo
            # 获取家长关联的学生
            students = self.db.query(Student).join(FamilyInfo).filter(
                FamilyInfo.father_phone == user.phone or FamilyInfo.mother_phone == user.phone
            ).all()
            
            for student in students:
                current_relation = self.db.query(StudentClassRelation).filter(
                    StudentClassRelation.student_id == student.id,
                    StudentClassRelation.is_current == True
                ).first()
                if current_relation and current_relation.class_id == class_id:
                    return True
            return False
        
        return False
    
    def check_student_access(self, user: User, student_id: int, required_permission: Permission) -> bool:
        """检查用户是否可以访问指定学生"""
        if not user:
            return False
        
        user_role = user.role if isinstance(user.role, UserRoleEnum) else UserRoleEnum(user.role)
        
        # 管理员可以访问所有学生
        if user_role == UserRoleEnum.admin:
            return True
        
        # 检查基础权限
        if not self.check_permission(user, required_permission):
            return False
        
        # 教师可以访问自己班级的学生
        if user_role == UserRoleEnum.teacher:
            from models import Student, Class
            student = self.db.query(Student).filter(Student.id == student_id).first()
            if student:
                current_relation = self.db.query(StudentClassRelation).filter(
                    StudentClassRelation.student_id == student.id,
                    StudentClassRelation.is_current == True
                ).first()
                if current_relation:
                    class_obj = self.db.query(Class).filter(Class.id == current_relation.class_id).first()
                    if class_obj and class_obj.class_teacher_id == user.id:
                        return True
            return False
        
        # 学生只能访问自己的信息
        if user_role == UserRoleEnum.student:
            from models import Student
            student = self.db.query(Student).filter(Student.id == student_id).first()
            if student and student.user_id == user.id:
                return True
            return False
        
        # 家长只能访问自己的孩子
        if user_role == UserRoleEnum.parent:
            from models import Student, FamilyInfo
            student = self.db.query(Student).filter(Student.id == student_id).first()
            if student:
                family_info = self.db.query(FamilyInfo).filter(FamilyInfo.student_id == student.id).first()
                if family_info:
                    if family_info.father_phone == user.phone or family_info.mother_phone == user.phone:
                        return True
            return False
        
        return False
    
    def get_accessible_classes(self, user: User) -> List[int]:
        """获取用户可访问的班级ID列表"""
        if not user:
            return []
        
        user_role = user.role if isinstance(user.role, UserRoleEnum) else UserRoleEnum(user.role)
        
        # 管理员可以访问所有班级
        if user_role == UserRoleEnum.admin:
            from models import Class
            return [c.id for c in self.db.query(Class).all()]
        
        # 教师可以访问自己管理的班级
        if user_role == UserRoleEnum.teacher:
            from models import Class
            classes = self.db.query(Class).filter(Class.class_teacher_id == user.id).all()
            return [c.id for c in classes]
        
        # 学生只能访问自己的班级
        if user_role == UserRoleEnum.student:
            from models import Student
            student = self.db.query(Student).filter(Student.user_id == user.id).first()
            if student:
                current_relation = self.db.query(StudentClassRelation).filter(
                    StudentClassRelation.student_id == student.id,
                    StudentClassRelation.is_current == True
                ).first()
                if current_relation:
                    return [current_relation.class_id]
            return []
        
        # 家长只能访问自己孩子的班级
        if user_role == UserRoleEnum.parent:
            from models import Student, FamilyInfo
            students = self.db.query(Student).join(FamilyInfo).filter(
                FamilyInfo.father_phone == user.phone or FamilyInfo.mother_phone == user.phone
            ).all()
            
            class_ids = []
            for student in students:
                current_relation = self.db.query(StudentClassRelation).filter(
                    StudentClassRelation.student_id == student.id,
                    StudentClassRelation.is_current == True
                ).first()
                if current_relation:
                    class_ids.append(current_relation.class_id)
            return list(set(class_ids))
        
        return []
    
    def require_permission(self, user: User, permission: Permission):
        """要求用户拥有指定权限，否则抛出异常"""
        if not self.check_permission(user, permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"权限不足，需要权限: {permission.value}"
            )
    
    def require_class_access(self, user: User, class_id: int, required_permission: Permission):
        """要求用户可以访问指定班级，否则抛出异常"""
        if not self.check_class_access(user, class_id, required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"权限不足，无法访问班级: {class_id}"
            )
    
    def require_student_access(self, user: User, student_id: int, required_permission: Permission):
        """要求用户可以访问指定学生，否则抛出异常"""
        if not self.check_student_access(user, student_id, required_permission):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"权限不足，无法访问学生: {student_id}"
            )