# 体育教学辅助网站 - API数据模型
# 用于API请求和响应的Pydantic模型

from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import date, datetime
from models import GenderEnum, StatusEnum, SportsLevelEnum, UserRoleEnum

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
    school_code: str
    address: Optional[str] = None
    contact_info: Optional[str] = None
    logo_url: Optional[str] = None
    website: Optional[str] = None

class SchoolCreate(SchoolBase):
    pass

class SchoolResponse(SchoolBase):
    id: int
    status: StatusEnum
    created_at: datetime
    updated_at: datetime
    
    class Config:
        from_attributes = True

# 班级相关 schemas
class ClassBase(BaseModel):
    class_name: str
    grade: str
    grade_level: int
    academic_year: str
    class_teacher_name: Optional[str] = None
    assistant_teacher_name: Optional[str] = None
    max_student_count: int = 60
    start_date: date

class ClassCreate(ClassBase):
    school_id: int

class ClassResponse(ClassBase):
    id: int
    school_id: int
    current_student_count: int
    status: StatusEnum
    end_date: Optional[date] = None
    created_at: datetime
    updated_at: datetime
    
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
    pass

class StudentUpdate(BaseModel):
    """更新学生信息"""
    real_name: Optional[str] = None
    gender: Optional[GenderEnum] = None
    birth_date: Optional[date] = None
    id_card: Optional[str] = None
    photo_url: Optional[str] = None
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
    academic_year: str
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
    items: List[StudentResponse]

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
    token_type: str = "bearer"
    expires_in: int  # 令牌过期时间（秒）
    user_info: dict  # 用户基本信息

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