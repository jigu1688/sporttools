# 体育教学辅助网站 - 数据模型定义

from sqlalchemy import Column, Integer, String, Date, Text, Boolean, DateTime, Enum, ForeignKey, Float, JSON, UniqueConstraint
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base
import enum
from datetime import datetime

# 枚举类型定义
class GenderEnum(str, enum.Enum):
    """性别枚举"""
    male = "male"
    female = "female"

class StatusEnum(str, enum.Enum):
    """状态枚举"""
    active = "active"
    inactive = "inactive"
    graduated = "graduated"
    transferred = "transferred"
    suspended = "suspended"

class SchoolYearStatusEnum(str, enum.Enum):
    """学年状态枚举"""
    active = "active"  # 当前学年
    completed = "completed"  # 已完成学年
    inactive = "inactive"  # 未激活学年

class SportsLevelEnum(str, enum.Enum):
    """体育水平枚举"""
    excellent = "excellent"
    good = "good"
    average = "average"
    poor = "poor"

class UserRoleEnum(str, enum.Enum):
    """用户角色枚举"""
    admin = "admin"
    teacher = "teacher"
    student = "student"
    parent = "parent"

class RegistrationStatusEnum(str, enum.Enum):
    """报名状态枚举"""
    pending = "pending"  # 待审核
    approved = "approved"  # 已批准
    rejected = "rejected"  # 已拒绝
    withdrawn = "withdrawn"  # 已撤回
    completed = "completed"  # 已完成

# 学校信息模型
class School(Base):
    """学校信息表"""
    __tablename__ = "schools"
    
    id = Column(Integer, primary_key=True, index=True)
    school_name = Column(String(200), nullable=False, comment="学校名称/全称")
    short_name = Column(String(100), comment="学校简称")
    school_code = Column(String(50), unique=True, comment="学校代码")
    area = Column(String(100), comment="所属区域")
    school_level = Column(String(50), comment="学段信息: primary/middle/high/primary-middle/middle-high/all")
    teacher_count = Column(Integer, default=0, comment="教师人数")
    registered_student_count = Column(Integer, default=0, comment="在籍学生人数")
    current_student_count = Column(Integer, default=0, comment="在学学生人数")
    principal = Column(String(100), comment="校长姓名")
    phone = Column(String(50), comment="联系电话")
    email = Column(String(100), comment="邮箱")
    address = Column(Text, comment="学校地址")
    contact_info = Column(String(200), comment="联系方式(旧字段)")
    logo_url = Column(String(500), comment="学校logo地址")
    website = Column(String(200), comment="学校网站")
    description = Column(Text, comment="学校简介")
    
    # 状态信息
    status = Column(Enum(StatusEnum), default=StatusEnum.active, comment="状态")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    classes = relationship("Class", back_populates="school", cascade="all, delete-orphan")
    users = relationship("User", back_populates="school")
    school_years = relationship("SchoolYear", back_populates="school", cascade="all, delete-orphan")

# 学年信息模型
class SchoolYear(Base):
    """学年信息表"""
    __tablename__ = "school_years"
    
    # 联合唯一约束：同一学校的学年标识唯一
    __table_args__ = (
        UniqueConstraint('school_id', 'academic_year', name='uq_school_academic_year'),
    )
    
    id = Column(Integer, primary_key=True, index=True)
    school_id = Column(Integer, ForeignKey("schools.id"), comment="所属学校ID")
    year_name = Column(String(50), nullable=False, comment="学年名称")
    start_date = Column(Date, nullable=False, comment="起始日期")
    end_date = Column(Date, nullable=False, comment="结束日期")
    academic_year = Column(String(20), nullable=False, index=True, comment="学年标识")
    
    # 状态信息
    status = Column(Enum(SchoolYearStatusEnum), default=SchoolYearStatusEnum.inactive, comment="状态")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    completed_at = Column(DateTime, nullable=True, comment="完成时间")
    completed_by = Column(String(50), nullable=True, comment="完成人")
    imported_at = Column(DateTime, nullable=True, comment="导入时间")
    imported_by = Column(String(50), nullable=True, comment="导入人")
    
    # 乐观锁版本号
    version = Column(Integer, default=1, nullable=False, comment="版本号(乐观锁)")
    
    # 关联关系
    school = relationship("School", back_populates="school_years")
    classes = relationship("Class", back_populates="school_year", cascade="all, delete-orphan")

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
    id_card = Column(String(18), unique=True, comment="身份证号")
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
    tokens = relationship("Token", back_populates="user", cascade="all, delete-orphan")
    activity_logs = relationship("UserActivityLog", back_populates="user", cascade="all, delete-orphan")
    password_history = relationship("PasswordHistory", back_populates="user", cascade="all, delete-orphan")
    preferences = relationship("UserPreference", back_populates="user", cascade="all, delete-orphan")

# 令牌模型
class Token(Base):
    """令牌表，用于管理刷新令牌和黑名单"""
    __tablename__ = "tokens"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), comment="所属用户ID")
    access_token = Column(String(1000), unique=True, comment="访问令牌")
    refresh_token = Column(String(1000), unique=True, comment="刷新令牌")
    expires_at = Column(DateTime, comment="访问令牌过期时间")
    refresh_expires_at = Column(DateTime, comment="刷新令牌过期时间")
    revoked = Column(Boolean, default=False, comment="是否已撤销")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    
    # 关联关系
    user = relationship("User", back_populates="tokens")

# 用户活动日志模型
class UserActivityLog(Base):
    """用户活动日志表，记录用户的重要操作"""
    __tablename__ = "user_activity_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), comment="用户ID")
    action = Column(String(100), comment="操作类型")
    resource = Column(String(100), comment="操作资源")
    ip_address = Column(String(50), comment="IP地址")
    user_agent = Column(String(500), comment="用户代理")
    details = Column(Text, comment="操作详情")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    
    # 关联关系
    user = relationship("User", back_populates="activity_logs")

# 密码历史记录模型
class PasswordHistory(Base):
    """密码历史记录表，防止密码重复使用"""
    __tablename__ = "password_history"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), comment="用户ID")
    hashed_password = Column(String(255), comment="加密密码")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    
    # 关联关系
    user = relationship("User", back_populates="password_history")

# 用户偏好设置模型
class UserPreference(Base):
    """用户偏好设置表，支持个性化配置"""
    __tablename__ = "user_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, comment="用户ID")
    preferences = Column(JSON, default={}, comment="偏好设置JSON")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    user = relationship("User", back_populates="preferences")

# 班级信息模型
class Class(Base):
    """班级信息表"""
    __tablename__ = "classes"
    
    id = Column(Integer, primary_key=True, index=True, autoincrement=True)
    class_name = Column(String(100), nullable=False, comment="班级名称")
    grade = Column(String(20), nullable=False, comment="年级")
    grade_level = Column(Integer, nullable=False, comment="年级级别(1-12)")
    
    # 教师信息
    class_teacher_id = Column(Integer, ForeignKey("users.id"), comment="班主任ID")
    class_teacher_name = Column(String(100), comment="班主任姓名")
    assistant_teacher_name = Column(String(100), comment="副班主任姓名")
    
    # 班级统计
    max_student_count = Column(Integer, default=60, comment="最大学生数")
    current_student_count = Column(Integer, default=0, comment="当前学生数")
    
    # 学校和学年关联
    school_id = Column(Integer, ForeignKey("schools.id"), comment="所属学校ID")
    school_year_id = Column(Integer, ForeignKey("school_years.id"), comment="所属学年ID")
    
    # 状态信息
    status = Column(Enum(StatusEnum), default=StatusEnum.active, comment="状态")
    start_date = Column(Date, nullable=False, comment="班级开始日期")
    end_date = Column(Date, comment="班级结束日期")
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    school = relationship("School", back_populates="classes")
    school_year = relationship("SchoolYear", back_populates="classes")
    students = relationship("StudentClassRelation", back_populates="class_", cascade="all, delete-orphan")
    physical_tests = relationship("PhysicalTest", back_populates="class_", cascade="all, delete-orphan")

# 学生信息模型
class Student(Base):
    """学生信息表"""
    __tablename__ = "students"
    
    id = Column(Integer, primary_key=True, index=True)
    student_no = Column(String(50), unique=True, nullable=False, comment="学籍号")
    real_name = Column(String(100), nullable=False, comment="姓名")
    gender = Column(Enum(GenderEnum), nullable=False, comment="性别")
    birth_date = Column(Date, nullable=False, comment="出生日期")
    id_card = Column(String(18), unique=True, comment="身份证号")
    photo_url = Column(String(500), comment="照片地址")
    
    # 教育和联系信息
    education_id = Column(String(100), comment="教育ID")
    phone = Column(String(20), comment="电话号码")
    address = Column(Text, comment="家庭地址")
    
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
    
    # 乐观锁版本号
    version = Column(Integer, default=1, nullable=False, comment="版本号(乐观锁)")
    
    # 关联关系
    user = relationship("User", back_populates="student_profiles")
    class_relations = relationship("StudentClassRelation", back_populates="student", cascade="all, delete-orphan")
    family_info = relationship("FamilyInfo", back_populates="student", uselist=False, cascade="all, delete-orphan")
    physical_tests = relationship("PhysicalTest", back_populates="student", cascade="all, delete-orphan")
    registrations = relationship("Registration", back_populates="student", cascade="all, delete-orphan")

# 学生班级关联模型
class StudentClassRelation(Base):
    """学生班级关联表"""
    __tablename__ = "student_class_relations"
    
    id = Column(Integer, primary_key=True, index=True)
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, comment="学生ID")
    class_id = Column(Integer, ForeignKey("classes.id"), nullable=False, comment="班级ID")
    
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
    run_800m = Column(Float, comment="800米跑(秒)")  # 改为Float支持小数
    run_1000m = Column(Float, comment="1000米跑(秒)")  # 改为Float支持小数
    
    # 柔韧性项目
    sit_and_reach = Column(Float, comment="坐位体前屈(cm)")
    
    # 力量项目
    standing_long_jump = Column(Integer, comment="立定跳远(cm)")
    pull_up = Column(Integer, comment="引体向上(个)")
    skip_rope = Column(Integer, comment="跳绳(个/分钟)")
    sit_ups = Column(Integer, comment="一分钟仰卧起坐(个)")
    
    # 小学特有项目
    run_50m_8 = Column(Float, comment="50米×8往返跑(秒)")
    
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

# 运动会相关模型

# 运动会状态枚举
class SportsMeetStatusEnum(enum.Enum):
    """运动会状态枚举"""
    planning = "planning"  # 规划中
    registration = "registration"  # 报名中
    scheduled = "scheduled"  # 已编排
    ongoing = "ongoing"  # 进行中
    completed = "completed"  # 已完成
    canceled = "canceled"  # 已取消

# 运动会信息模型
class SportsMeet(Base):
    """运动会信息表"""
    __tablename__ = "sports_meets"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, comment="运动会名称")
    start_date = Column(Date, nullable=False, comment="开始日期")
    end_date = Column(Date, nullable=False, comment="结束日期")
    location = Column(String(200), comment="举办地点")
    description = Column(Text, comment="运动会描述")
    status = Column(Enum(SportsMeetStatusEnum), default=SportsMeetStatusEnum.planning, comment="运动会状态")
    
    # 统计信息
    total_events = Column(Integer, default=0, comment="总项目数")
    total_athletes = Column(Integer, default=0, comment="总运动员数")
    total_registrations = Column(Integer, default=0, comment="总报名数")
    
    # 组织信息
    organizer_id = Column(Integer, ForeignKey("users.id"), comment="组织者ID")
    organizer_name = Column(String(100), comment="组织者姓名")
    school_id = Column(Integer, ForeignKey("schools.id"), comment="所属学校ID")
    school_year_id = Column(Integer, ForeignKey("school_years.id"), comment="所属学年ID")
    
    # 时间信息
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    completed_at = Column(DateTime, nullable=True, comment="完成时间")
    
    # 关联关系
    events = relationship("Event", back_populates="sports_meet")
    registrations = relationship("Registration", back_populates="sports_meet")
    schedules = relationship("Schedule", back_populates="sports_meet")
    school = relationship("School", back_populates="sports_meets")
    school_year = relationship("SchoolYear", back_populates="sports_meets")

# 项目类型枚举
class EventTypeEnum(enum.Enum):
    """项目类型枚举"""
    track = "track"  # 径赛
    field = "field"  # 田赛
    relay = "relay"  # 接力
    team = "team"  # 团体项目

# 项目信息模型
class Event(Base):
    """项目信息表"""
    __tablename__ = "events"
    
    id = Column(Integer, primary_key=True, index=True)
    sports_meet_id = Column(Integer, ForeignKey("sports_meets.id"), nullable=False, comment="所属运动会ID")
    name = Column(String(100), nullable=False, comment="项目名称")
    event_type = Column(Enum(EventTypeEnum), nullable=False, comment="项目类型")
    gender = Column(Enum(GenderEnum), comment="性别限制")
    min_grade = Column(Integer, comment="最低年级")
    max_grade = Column(Integer, comment="最高年级")
    description = Column(Text, comment="项目描述")
    rules = Column(Text, comment="比赛规则")
    
    # 时间地点
    venue_id = Column(Integer, ForeignKey("venues.id"), comment="场馆ID")
    scheduled_time = Column(DateTime, comment="预定时间")
    
    # 组织信息
    referee_id = Column(Integer, ForeignKey("users.id"), comment="裁判ID")
    
    # 统计信息
    total_participants = Column(Integer, default=0, comment="总参与人数")
    
    # 时间信息
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    sports_meet = relationship("SportsMeet", back_populates="events")
    venue = relationship("Venue", back_populates="events")
    registrations = relationship("Registration", back_populates="event")
    schedules = relationship("Schedule", back_populates="event")
    results = relationship("EventResult", back_populates="event")

# 场馆信息模型
class Venue(Base):
    """场馆信息表"""
    __tablename__ = "venues"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False, comment="场馆名称")
    description = Column(Text, comment="场馆描述")
    capacity = Column(Integer, comment="容纳人数")
    location = Column(String(200), comment="场馆位置")
    facilities = Column(JSON, comment="场馆设施")
    
    # 时间信息
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    events = relationship("Event", back_populates="venue")
    schedules = relationship("Schedule", back_populates="venue")

# 报名信息模型
class Registration(Base):
    """报名信息表"""
    __tablename__ = "registrations"
    
    id = Column(Integer, primary_key=True, index=True)
    sports_meet_id = Column(Integer, ForeignKey("sports_meets.id"), nullable=False, comment="所属运动会ID")
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, comment="所属项目ID")
    student_id = Column(Integer, ForeignKey("students.id"), nullable=False, comment="学生ID")
    
    # 报名信息
    registration_time = Column(DateTime, server_default=func.now(), comment="报名时间")
    status = Column(Enum(RegistrationStatusEnum), default=RegistrationStatusEnum.pending, comment="报名状态")
    assigned_number = Column(String(20), comment="分配编号")
    
    # 成绩信息
    final_result = Column(String(20), comment="最终成绩")
    rank = Column(Integer, comment="排名")
    is_winner = Column(Boolean, default=False, comment="是否获奖")
    
    # 时间信息
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    sports_meet = relationship("SportsMeet", back_populates="registrations")
    event = relationship("Event", back_populates="registrations")
    student = relationship("Student")

# 赛程信息模型
class Schedule(Base):
    """赛程信息表"""
    __tablename__ = "schedules"
    
    id = Column(Integer, primary_key=True, index=True)
    sports_meet_id = Column(Integer, ForeignKey("sports_meets.id"), nullable=False, comment="所属运动会ID")
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, comment="所属项目ID")
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False, comment="场馆ID")
    
    # 时间信息
    start_time = Column(DateTime, nullable=False, comment="开始时间")
    end_time = Column(DateTime, nullable=False, comment="结束时间")
    
    # 分组信息
    group_name = Column(String(20), comment="组别名称")
    group_number = Column(Integer, comment="组别编号")
    
    # 状态信息
    status = Column(Enum(StatusEnum), default=StatusEnum.active, comment="状态")
    
    # 时间信息
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    sports_meet = relationship("SportsMeet", back_populates="schedules")
    event = relationship("Event", back_populates="schedules")
    venue = relationship("Venue", back_populates="schedules")

# 项目成绩模型
class EventResult(Base):
    """项目成绩表"""
    __tablename__ = "event_results"
    
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False, comment="所属项目ID")
    registration_id = Column(Integer, ForeignKey("registrations.id"), comment="报名ID")
    
    # 成绩信息
    result_value = Column(String(20), comment="成绩值")
    result_type = Column(String(20), comment="成绩类型(时间/距离/数量等)")
    rank = Column(Integer, comment="排名")
    is_final = Column(Boolean, default=False, comment="是否决赛成绩")
    
    # 轮次信息
    round_name = Column(String(20), comment="轮次名称")
    round_number = Column(Integer, comment="轮次编号")
    
    # 时间信息
    created_at = Column(DateTime, server_default=func.now(), comment="创建时间")
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now(), comment="更新时间")
    
    # 关联关系
    event = relationship("Event", back_populates="results")
    registration = relationship("Registration")

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

# 添加School和SchoolYear的关联关系
School.sports_meets = relationship("SportsMeet", back_populates="school")
SchoolYear.sports_meets = relationship("SportsMeet", back_populates="school_year")