# 体育教学辅助网站 - 数据模型定义

from sqlalchemy import Column, Integer, String, Date, Text, Boolean, DateTime, Enum, ForeignKey, Float, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
from datetime import datetime

# 枚举类型定义
class GenderEnum(enum.Enum):
    """性别枚举"""
    male = "male"
    female = "female"

class StatusEnum(enum.Enum):
    """状态枚举"""
    active = "active"
    inactive = "inactive"
    graduated = "graduated"
    transferred = "transferred"
    suspended = "suspended"

class SportsLevelEnum(enum.Enum):
    """体育水平枚举"""
    excellent = "excellent"
    good = "good"
    average = "average"
    poor = "poor"

class UserRoleEnum(enum.Enum):
    """用户角色枚举"""
    admin = "admin"
    teacher = "teacher"
    student = "student"
    parent = "parent"

# 学校信息模型
class School(Base):
    """学校信息表"""
    __tablename__ = "schools"
    
    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(String(200), nullable=False, comment="学校名称")
    school_code = Column(String(50), unique=True, comment="学校代码")
    address = Column(Text, comment="学校地址")
    contact_info = Column(String(200), comment="联系方式")
    logo_url = Column(String(500), comment="学校logo地址")
    website = Column(String(200), comment="学校网站")
    
    # 状态信息
    status = Column(Enum(StatusEnum), default=StatusEnum.active, comment="状态")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    classes = relationship("Class", back_populates="school")
    users = relationship("User", back_populates="school")

# 用户信息模型
class User(Base):
    """用户信息表"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, comment="用户名")
    email = Column(String(100), unique=True, comment="邮箱")
    phone = Column(String(20), comment="电话号码")
    
    # 认证信息
    hashed_password = Column(String(255), comment="加密密码")
    
    # 基本信息
    real_name = Column(String(100), nullable=False, comment="真实姓名")
    gender = Column(Enum(GenderEnum), comment="性别")
    birth_date = Column(Date, comment="出生日期")
    id_card = Column(String(18), comment="身份证号")
    photo_url = Column(String(500), comment="照片地址")
    
    # 用户角色
    role = Column(Enum(UserRoleEnum), default=UserRoleEnum.student, comment="用户角色")
    
    # 学校关联
    school_id = Column(Integer, ForeignKey("schools.id"), comment="所属学校ID")
    
    # 状态信息
    status = Column(Enum(StatusEnum), default=StatusEnum.active, comment="状态")
    last_login_at = Column(DateTime, comment="最后登录时间")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    school = relationship("School", back_populates="users")
    student_profiles = relationship("Student", back_populates="user")
    class_relations = relationship("StudentClassRelation", back_populates="user")

# 班级信息模型
class Class(Base):
    """班级信息表"""
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True)
    class_name = Column(String(100), nullable=False, comment="班级名称")
    grade = Column(String(20), nullable=False, comment="年级")
    grade_level = Column(Integer, nullable=False, comment="年级级别(1-12)")
    academic_year = Column(String(20), nullable=False, comment="学年")
    
    # 教师信息
    class_teacher_id = Column(Integer, ForeignKey("users.id"), comment="班主任ID")
    class_teacher_name = Column(String(100), comment="班主任姓名")
    assistant_teacher_name = Column(String(100), comment="副班主任姓名")
    
    # 班级统计
    max_student_count = Column(Integer, default=60, comment="最大学生数")
    current_student_count = Column(Integer, default=0, comment="当前学生数")
    
    # 学校关联
    school_id = Column(Integer, ForeignKey("schools.id"), comment="所属学校ID")
    
    # 状态信息
    status = Column(Enum(StatusEnum), default=StatusEnum.active, comment="状态")
    start_date = Column(Date, nullable=False, comment="班级开始日期")
    end_date = Column(Date, comment="班级结束日期")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    school = relationship("School", back_populates="classes")
    students = relationship("StudentClassRelation", back_populates="class_")
    physical_tests = relationship("PhysicalTest", back_populates="class_")

# 学生信息模型
class Student(Base):
    """学生信息表"""
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    student_no = Column(String(50), unique=True, nullable=False, comment="学籍号")
    real_name = Column(String(100), nullable=False, comment="姓名")
    gender = Column(Enum(GenderEnum), nullable=False, comment="性别")
    birth_date = Column(Date, nullable=False, comment="出生日期")
    id_card = Column(String(18), comment="身份证号")
    photo_url = Column(String(500), comment="照片地址")
    
    # 健康状况
    health_status = Column(Text, comment="健康状况描述")
    allergy_info = Column(Text, comment="过敏信息")
    special_notes = Column(Text, comment="特殊情况说明")
    
    # 体育能力
    sports_level = Column(Enum(SportsLevelEnum), comment="体育水平")
    sports_specialty = Column(String(200), comment="运动特长")
    physical_limitations = Column(Text, comment="身体限制说明")
    
    # 状态信息
    status = Column(Enum(StatusEnum), default=StatusEnum.active, comment="状态")
    enrollment_date = Column(Date, nullable=False, comment="入学日期")
    graduation_date = Column(Date, comment="毕业日期")
    
    # 用户关联（可选，用于学生登录）
    user_id = Column(Integer, ForeignKey("users.id"), comment="关联用户ID")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    user = relationship("User", back_populates="student_profiles")
    class_relations = relationship("StudentClassRelation", back_populates="student")
    family_info = relationship("FamilyInfo", back_populates="student", uselist=False)
    physical_tests = relationship("PhysicalTest", back_populates="student")

# 学生班级关联模型
class StudentClassRelation(Base):
    """学生班级关联表"""
    __tablename__ = "student_class_relations"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, comment="学生ID")
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False, comment="班级ID")
    academic_year = Column(String(20), nullable=False, comment="学年")
    
    # 关联状态
    status = Column(Enum(StatusEnum), default=StatusEnum.active, comment="状态")
    join_date = Column(Date, nullable=False, comment="加入班级日期")
    leave_date = Column(Date, comment="离开班级日期")
    is_current = Column(Boolean, default=True, comment="是否为当前班级")
    
    # 用户关联（班主任查看权限）
    user_id = Column(Integer, ForeignKey("users.id"), comment="班主任用户ID")
    
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    
    # 关联关系
    student = relationship("Student", back_populates="class_relations")
    class_ = relationship("Class", back_populates="students")
    user = relationship("User", back_populates="class_relations")

# 家庭信息模型
class FamilyInfo(Base):
    """家庭信息表"""
    __tablename__ = "family_info"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, unique=True, comment="学生ID")
    
    # 父亲信息
    father_name = Column(String(100), comment="父亲姓名")
    father_phone = Column(String(20), comment="父亲电话")
    father_work_unit = Column(String(200), comment="父亲工作单位")
    father_id_card = Column(String(18), comment="父亲身份证")
    father_email = Column(String(100), comment="父亲邮箱")
    
    # 母亲信息
    mother_name = Column(String(100), comment="母亲姓名")
    mother_phone = Column(String(20), comment="母亲电话")
    mother_work_unit = Column(String(200), comment="母亲工作单位")
    mother_id_card = Column(String(18), comment="母亲身份证")
    mother_email = Column(String(100), comment="母亲邮箱")
    
    # 家庭住址
    address = Column(Text, comment="家庭住址")
    address_postcode = Column(String(10), comment="邮编")
    
    # 紧急联系人
    emergency_contact_name = Column(String(100), comment="紧急联系人姓名")
    emergency_contact_phone = Column(String(20), comment="紧急联系人电话")
    emergency_contact_relation = Column(String(50), comment="紧急联系人关系")
    
    # 接送人员（JSON格式存储多个接送人员信息）
    pickup_persons = Column(JSON, comment="接送人员信息")
    
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    student = relationship("Student", back_populates="family_info")

# 体测数据模型
class PhysicalTest(Base):
    """学生体测数据表"""
    __tablename__ = "physical_tests"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, comment="学生ID")
    class_id = Column(Integer, ForeignKey("classes.id"), comment="班级ID")
    test_date = Column(Date, nullable=False, comment="测试日期")
    test_type = Column(String(50), comment="测试类型(期中/期末/日常)")
    
    # 基本体测项目
    height = Column(Float, comment="身高(cm)")
    weight = Column(Float, comment="体重(kg)")
    vital_capacity = Column(Integer, comment="肺活量(ml)")
    
    # 跑步项目
    run_50m = Column(Float, comment="50米跑(秒)")
    run_800m = Column(Integer, comment="800米跑(秒)")
    run_1000m = Column(Integer, comment="1000米跑(秒)")
    
    # 柔韧性项目
    sit_and_reach = Column(Float, comment="坐位体前屈(cm)")
    
    # 力量项目
    standing_long_jump = Column(Integer, comment="立定跳远(cm)")
    pull_up = Column(Integer, comment="引体向上(个)")
    skip_rope = Column(Integer, comment="跳绳(个/分钟)")
    
    # 评分和等级
    total_score = Column(Float, comment="总分")
    grade = Column(String(10), comment="等级(A/B/C/D)")
    
    # 测试信息
    tester_name = Column(String(100), comment="测试员姓名")
    test_notes = Column(Text, comment="测试备注")
    is_official = Column(Boolean, default=True, comment="是否正式测试")
    
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    student = relationship("Student", back_populates="physical_tests")
    class_ = relationship("Class", back_populates="physical_tests")

# 数据变更日志模型
class DataChangeLog(Base):
    """数据变更日志表"""
    __tablename__ = "data_change_log"
    
    id = Column(Integer, primary_key=True, index=True)
    table_name = Column(String(50), nullable=False, comment="表名")
    record_id = Column(Integer, nullable=False, comment="记录ID")
    operation = Column(String(10), nullable=False, comment="操作类型(INSERT/UPDATE/DELETE)")
    old_data = Column(JSON, comment="修改前数据")
    new_data = Column(JSON, comment="修改后数据")
    
    # 操作人信息
    operator_id = Column(Integer, ForeignKey("users.id"), comment="操作人ID")
    operator_name = Column(String(100), comment="操作人姓名")
    
    operation_time = Column(DateTime, server_default=func.now(), comment="操作时间")
    operation_reason = Column(Text, comment="操作原因")
    
    # 关联关系
    operator = relationship("User")