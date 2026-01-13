# 体育教学辅助网站 - API数据模型
# 用于API请求和响应的Pydantic模型

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from enum import Enum
from models import GenderEnum, StatusEnum, SportsLevelEnum, UserRoleEnum

# 运动会相关Schema

# 运动会状态枚举
class SportsMeetStatusEnum(str, Enum):
    """运动会状态枚举"""
    planning = "planning"  # 规划中
    registration = "registration"  # 报名中
    scheduled = "scheduled"  # 已编排
    ongoing = "ongoing"  # 进行中
    completed = "completed"  # 已完成
    canceled = "canceled"  # 已取消

# 项目类型枚举
class EventTypeEnum(str, Enum):
    """项目类型枚举"""
    track = "track"  # 径赛
    field = "field"  # 田赛
    relay = "relay"  # 接力
    team = "team"  # 团体项目

# 运动会信息基础模型
class SportsMeetBase(BaseModel):
    """运动会信息基础模型"""
    name: str
    start_date: date
    end_date: date
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[SportsMeetStatusEnum] = SportsMeetStatusEnum.planning
    organizer_id: Optional[int] = None
    school_id: Optional[int] = None
    school_year_id: Optional[int] = None

# 运动会创建模型
class SportsMeetCreate(SportsMeetBase):
    """运动会创建模型"""
    pass

# 运动会更新模型
class SportsMeetUpdate(BaseModel):
    """运动会更新模型"""
    name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    location: Optional[str] = None
    description: Optional[str] = None
    status: Optional[SportsMeetStatusEnum] = None
    organizer_id: Optional[int] = None
    school_id: Optional[int] = None
    school_year_id: Optional[int] = None

# 运动会响应模型
class SportsMeetResponse(SportsMeetBase):
    """运动会响应模型"""
    id: int
    total_events: int = 0
    total_athletes: int = 0
    total_registrations: int = 0
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# 项目信息基础模型
class EventBase(BaseModel):
    """项目信息基础模型"""
    name: str
    event_type: EventTypeEnum
    gender: Optional[GenderEnum] = None
    min_grade: Optional[int] = None
    max_grade: Optional[int] = None
    description: Optional[str] = None
    rules: Optional[str] = None
    venue_id: Optional[int] = None
    scheduled_time: Optional[datetime] = None
    referee_id: Optional[int] = None

# 项目创建模型
class EventCreate(EventBase):
    """项目创建模型"""
    sports_meet_id: int

# 项目更新模型
class EventUpdate(BaseModel):
    """项目更新模型"""
    name: Optional[str] = None
    event_type: Optional[EventTypeEnum] = None
    gender: Optional[GenderEnum] = None
    min_grade: Optional[int] = None
    max_grade: Optional[int] = None
    description: Optional[str] = None
    rules: Optional[str] = None
    venue_id: Optional[int] = None
    scheduled_time: Optional[datetime] = None
    referee_id: Optional[int] = None

# 项目响应模型
class EventResponse(EventBase):
    """项目响应模型"""
    id: int
    sports_meet_id: int
    total_participants: int = 0
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 场馆信息基础模型
class VenueBase(BaseModel):
    """场馆信息基础模型"""
    name: str
    description: Optional[str] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    facilities: Optional[dict] = None

# 场馆创建模型
class VenueCreate(VenueBase):
    """场馆创建模型"""
    pass

# 场馆更新模型
class VenueUpdate(BaseModel):
    """场馆更新模型"""
    name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = None
    location: Optional[str] = None
    facilities: Optional[dict] = None

# 场馆响应模型
class VenueResponse(VenueBase):
    """场馆响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 报名信息基础模型
class RegistrationBase(BaseModel):
    """报名信息基础模型"""
    sports_meet_id: int
    event_id: int
    student_id: int
    status: Optional[StatusEnum] = StatusEnum.active
    assigned_number: Optional[str] = None

# 报名创建模型
class RegistrationCreate(RegistrationBase):
    """报名创建模型"""
    pass

# 报名更新模型
class RegistrationUpdate(BaseModel):
    """报名更新模型"""
    status: Optional[StatusEnum] = None
    assigned_number: Optional[str] = None
    final_result: Optional[str] = None
    rank: Optional[int] = None
    is_winner: Optional[bool] = None

# 报名响应模型
class RegistrationResponse(BaseModel):
    """报名响应模型"""
    id: int
    sports_meet_id: int
    event_id: int
    student_id: int
    status: Optional[StatusEnum] = StatusEnum.active
    assigned_number: Optional[str] = None
    registration_time: datetime
    final_result: Optional[str] = None
    rank: Optional[int] = None
    is_winner: bool = False
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 赛程信息基础模型
class ScheduleBase(BaseModel):
    """赛程信息基础模型"""
    sports_meet_id: int
    event_id: int
    venue_id: int
    start_time: datetime
    end_time: datetime
    group_name: Optional[str] = None
    group_number: Optional[int] = None
    status: Optional[StatusEnum] = StatusEnum.active

# 赛程创建模型
class ScheduleCreate(ScheduleBase):
    """赛程创建模型"""
    pass

# 赛程更新模型
class ScheduleUpdate(BaseModel):
    """赛程更新模型"""
    venue_id: Optional[int] = None
    start_time: Optional[datetime] = None
    end_time: Optional[datetime] = None
    group_name: Optional[str] = None
    group_number: Optional[int] = None
    status: Optional[StatusEnum] = None

# 赛程响应模型
class ScheduleResponse(ScheduleBase):
    """赛程响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 项目成绩基础模型
class EventResultBase(BaseModel):
    """项目成绩基础模型"""
    event_id: int
    registration_id: Optional[int] = None
    result_value: str
    result_type: str
    rank: Optional[int] = None
    is_final: Optional[bool] = False
    round_name: Optional[str] = None
    round_number: Optional[int] = None

# 项目成绩创建模型
class EventResultCreate(EventResultBase):
    """项目成绩创建模型"""
    pass

# 项目成绩更新模型
class EventResultUpdate(BaseModel):
    """项目成绩更新模型"""
    result_value: Optional[str] = None
    result_type: Optional[str] = None
    rank: Optional[int] = None
    is_final: Optional[bool] = None
    round_name: Optional[str] = None
    round_number: Optional[int] = None

# 项目成绩响应模型
class EventResultResponse(EventResultBase):
    """项目成绩响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# 运动会仪表盘数据模型
class SportsMeetDashboardResponse(BaseModel):
    """运动会仪表盘数据模型"""
    totalSportsMeets: int
    upcomingSportsMeets: int
    totalAthletes: int
    totalEvents: int
    totalRegistrations: int

# 基础模型
class BaseResponse(BaseModel):
    """基础响应模型"""
    success: bool = True
    message: str = "操作成功"

class ErrorResponse(BaseModel):
    """错误响应模型"""
    success: bool = False
    message: str
    detail: Optional[str] = None

# 学校相关 schemas
class SchoolBase(BaseModel):
    school_name: str
    short_name: Optional[str] = None
    school_code: Optional[str] = None
    area: Optional[str] = None
    school_level: Optional[str] = None
    teacher_count: Optional[int] = None
    registered_student_count: Optional[int] = None
    current_student_count: Optional[int] = None
    principal: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    contact_info: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

class SchoolCreate(SchoolBase):
    pass

class SchoolUpdate(BaseModel):
    school_name: Optional[str] = None
    short_name: Optional[str] = None
    school_code: Optional[str] = None
    area: Optional[str] = None
    school_level: Optional[str] = None
    teacher_count: Optional[int] = None
    registered_student_count: Optional[int] = None
    current_student_count: Optional[int] = None
    principal: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    contact_info: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None
    description: Optional[str] = None

class SchoolResponse(SchoolBase):
    id: int
    status: StatusEnum
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 学年相关 schemas
class SchoolYearBase(BaseModel):
    year_name: str
    start_date: date
    end_date: date
    academic_year: str
    status: Optional[str] = None
    school_id: Optional[int] = None

class SchoolYearCreate(SchoolYearBase):
    pass

class SchoolYearUpdate(BaseModel):
    year_name: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    academic_year: Optional[str] = None
    status: Optional[str] = None

class SchoolYearResponse(SchoolYearBase):
    id: int
    created_at: datetime
    updated_at: datetime
    completed_at: Optional[datetime] = None
    completed_by: Optional[str] = None
    imported_at: Optional[datetime] = None
    imported_by: Optional[str] = None
    
    class Config:
        from_attributes = True

# 班级相关 schemas
class ClassBase(BaseModel):
    class_name: str
    grade: str
    grade_level: int
    class_teacher_name: Optional[str] = None
    assistant_teacher_name: Optional[str] = None
    max_student_count: int = 60
    start_date: date

class ClassCreate(ClassBase):
    school_id: int
    school_year_id: int

class ClassUpdate(BaseModel):
    """更新班级信息"""
    class_name: Optional[str] = None
    grade: Optional[str] = None
    grade_level: Optional[int] = None
    class_teacher_name: Optional[str] = None
    assistant_teacher_name: Optional[str] = None
    max_student_count: Optional[int] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    status: Optional[StatusEnum] = None
    school_id: Optional[int] = None
    school_year_id: Optional[int] = None

class ClassResponse(ClassBase):
    id: int
    school_id: int
    school_year_id: Optional[int] = None
    current_student_count: int
    status: StatusEnum
    end_date: Optional[date] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

# 学生相关 schemas
class StudentBase(BaseModel):
    student_no: str
    real_name: str
    gender: GenderEnum
    birth_date: date
    id_card: Optional[str] = None
    photo_url: Optional[str] = None
    education_id: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    health_status: Optional[str] = None
    allergy_info: Optional[str] = None
    special_notes: Optional[str] = None
    sports_level: Optional[SportsLevelEnum] = None
    sports_specialty: Optional[str] = None
    physical_limitations: Optional[str] = None
    enrollment_date: date
    graduation_date: Optional[date] = None
    status: StatusEnum = StatusEnum.active

class StudentCreate(StudentBase):
    """创建学生"""
    class_id: Optional[int] = None  # 可选的初始班级ID
    join_date: Optional[date] = None  # 加入班级日期（默认为今天）

class StudentUpdate(BaseModel):
    """更新学生信息"""
    real_name: Optional[str] = None
    gender: Optional[GenderEnum] = None
    birth_date: Optional[date] = None
    id_card: Optional[str] = None
    photo_url: Optional[str] = None
    education_id: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    health_status: Optional[str] = None
    allergy_info: Optional[str] = None
    special_notes: Optional[str] = None
    sports_level: Optional[SportsLevelEnum] = None
    sports_specialty: Optional[str] = None
    physical_limitations: Optional[str] = None
    graduation_date: Optional[date] = None
    status: Optional[StatusEnum] = None

class StudentResponse(StudentBase):
    """学生响应模型"""
    id: int
    user_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class StudentWithClassResponse(StudentResponse):
    """包含当前班级信息的学生响应模型"""
    current_class_id: Optional[int] = None
    current_class_name: Optional[str] = None
    current_grade: Optional[str] = None
    current_grade_level: Optional[int] = None
    current_school_year_id: Optional[int] = None
    current_academic_year: Optional[str] = None
    
    class Config:
        from_attributes = True

class StudentDetailResponse(StudentResponse):
    """学生详细信息响应"""
    user: Optional["UserResponse"] = None
    class_relations: List["StudentClassRelationResponse"] = []
    
    class Config:
        from_attributes = True

# 用户相关 schemas
class UserBase(BaseModel):
    username: str
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    real_name: str
    gender: Optional[GenderEnum] = None
    birth_date: Optional[date] = None
    id_card: Optional[str] = None
    photo_url: Optional[str] = None
    role: UserRoleEnum = UserRoleEnum.student

class UserCreate(UserBase):
    password: str  # 在实际应用中应该进行加密

class UserResponse(UserBase):
    id: int
    school_id: Optional[int] = None
    status: StatusEnum
    last_login_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 学生班级关联 schemas
class StudentClassRelationBase(BaseModel):
    status: StatusEnum = StatusEnum.active
    join_date: date
    leave_date: Optional[date] = None
    is_current: bool = True

class StudentClassRelationCreate(StudentClassRelationBase):
    student_id: int
    class_id: int
    user_id: Optional[int] = None

class StudentClassRelationResponse(StudentClassRelationBase):
    id: int
    student_id: int
    class_id: int
    user_id: Optional[int] = None
    created_at: datetime
    student: StudentResponse
    class_: ClassResponse
    user: Optional[UserResponse] = None
    
    class Config:
        from_attributes = True

# 分页相关 schemas
class PaginationParams(BaseModel):
    """分页参数"""
    page: int = 1
    page_size: int = 10
    search: Optional[str] = None

class PaginatedResponse(BaseModel):
    """分页响应模型"""
    total: int
    page: int
    page_size: int
    total_pages: int
    items: List

# 学生列表查询参数
class StudentQueryParams(PaginationParams):
    """学生查询参数"""
    class_id: Optional[int] = None
    grade: Optional[str] = None
    gender: Optional[GenderEnum] = None
    status: Optional[StatusEnum] = None
    sports_level: Optional[SportsLevelEnum] = None

class StudentListResponse(PaginatedResponse):
    """学生列表响应"""
    items: List[dict]  # 使用 dict 以支持包含班级信息的返回

# 更新前向引用
StudentDetailResponse.model_rebuild()
UserResponse.model_rebuild()
StudentClassRelationResponse.model_rebuild()
StudentListResponse.model_rebuild()

# 用户认证相关 schemas
class UserLogin(BaseModel):
    """用户登录请求"""
    username: str
    password: str

class TokenResponse(BaseModel):
    """登录令牌响应"""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int  # 访问令牌过期时间（秒）
    refresh_expires_in: int  # 刷新令牌过期时间（秒）
    user_info: dict  # 用户基本信息

class RefreshTokenRequest(BaseModel):
    """刷新令牌请求"""
    refresh_token: str

class ChangePasswordRequest(BaseModel):
    """修改密码请求"""
    current_password: str
    new_password: str

class UserUpdate(BaseModel):
    """更新用户信息"""
    real_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone: Optional[str] = None
    role: Optional[UserRoleEnum] = None
    status: Optional[StatusEnum] = None

# 用户活动日志 schemas
class UserActivityLogBase(BaseModel):
    """用户活动日志基础模型"""
    action: str
    resource: str
    ip_address: Optional[str] = None
    user_agent: Optional[str] = None
    details: Optional[str] = None

class UserActivityLogResponse(UserActivityLogBase):
    """用户活动日志响应模型"""
    id: int
    user_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

# 密码重置 schemas
class PasswordResetRequest(BaseModel):
    """密码重置请求"""
    email: EmailStr

class PasswordResetConfirmRequest(BaseModel):
    """密码重置确认请求"""
    token: str
    new_password: str

# 用户偏好设置 schemas
class UserPreferenceBase(BaseModel):
    """用户偏好设置基础模型"""
    preferences: dict

class UserPreferenceResponse(UserPreferenceBase):
    """用户偏好设置响应模型"""
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 体测相关 schemas
class PhysicalTestBase(BaseModel):
    """体测数据基础模型"""
    student_id: int
    class_id: Optional[int] = None
    test_date: date
    test_type: Optional[str] = "日常"
    height: Optional[float] = None
    weight: Optional[float] = None
    vital_capacity: Optional[int] = None
    run_50m: Optional[float] = None
    run_800m: Optional[float] = None  # 改为float支持小数
    run_1000m: Optional[float] = None  # 改为float支持小数
    sit_and_reach: Optional[float] = None
    standing_long_jump: Optional[int] = None
    pull_up: Optional[int] = None
    skip_rope: Optional[int] = None
    sit_ups: Optional[int] = None
    run_50m_8: Optional[float] = None
    total_score: Optional[float] = None
    grade: Optional[str] = None
    tester_name: Optional[str] = None
    test_notes: Optional[str] = None
    is_official: bool = True

class PhysicalTestCreate(PhysicalTestBase):
    """创建体测数据模型"""
    pass

class PhysicalTestUpdate(BaseModel):
    """更新体测数据模型"""
    test_date: Optional[date] = None
    test_type: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    vital_capacity: Optional[int] = None
    run_50m: Optional[float] = None
    run_800m: Optional[float] = None  # 改为float支持小数
    run_1000m: Optional[float] = None  # 改为float支持小数
    sit_and_reach: Optional[float] = None
    standing_long_jump: Optional[int] = None
    pull_up: Optional[int] = None
    skip_rope: Optional[int] = None
    sit_ups: Optional[int] = None
    run_50m_8: Optional[float] = None
    total_score: Optional[float] = None
    grade: Optional[str] = None
    tester_name: Optional[str] = None
    test_notes: Optional[str] = None
    is_official: Optional[bool] = None

class PhysicalTestResponse(PhysicalTestBase):
    """体测数据响应模型"""
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

class PhysicalTestDetailResponse(PhysicalTestResponse):
    """体测数据详细响应模型"""
    student: Optional[StudentResponse] = None
    class_: Optional[ClassResponse] = None
    
    class Config:
        from_attributes = True

# 体测统计相关 schemas
class PhysicalTestStatisticsResponse(BaseModel):
    """体测统计响应模型"""
    total_students: int
    tested_students: int
    excellent_rate: float
    good_rate: float
    pass_rate: float
    fail_rate: float
    average_score: float
