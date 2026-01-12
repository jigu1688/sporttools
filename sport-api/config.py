# 体育教学辅助网站 - 配置文件

import os
from typing import Optional
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    """应用配置类"""
    
    # 应用基础配置
    app_name: str = "体育教学辅助网站API"
    app_version: str = "1.0.0"
    debug: bool = True
    
    # 数据库配置
    database_url: str = "sqlite:///./sports_teaching.db"
    database_host: Optional[str] = None
    database_port: Optional[int] = None
    database_name: Optional[str] = None
    database_user: Optional[str] = None
    database_password: Optional[str] = None
    
    # JWT配置
    secret_key: str = "default-secret-key-for-development-only"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24小时
    
    # Redis配置（用于缓存）
    redis_host: str = "redis"  # Docker网络中的Redis服务名
    redis_port: int = 6379
    redis_password: Optional[str] = None
    redis_db: int = 0
    redis_pool_size: int = 10
    redis_decode_responses: bool = True
    
    # 文件上传配置
    upload_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_file_extensions: list = [".jpg", ".jpeg", ".png", ".pdf", ".xlsx", ".xls"]
    
    # CORS配置
    cors_origins: list = [
        # 生产环境域名
        "http://your-production-domain.com",
        "https://your-production-domain.com",
        # 开发环境域名（仅在开发模式下使用）
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5175",
        "http://localhost:5176",
        "http://127.0.0.1:5176",
        "http://localhost:5177",
        "http://127.0.0.1:5177"
    ]
    
    # 日志配置
    log_level: str = "INFO"
    log_file: str = "logs/app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True
        extra = "ignore"  # 忽略未在模型中定义的环境变量

# 创建全局配置实例
settings = Settings()

# 根据环境变量切换数据库配置
if os.getenv("DATABASE_URL"):
    settings.database_url = os.getenv("DATABASE_URL")
elif os.getenv("DB_HOST"):
    settings.database_url = (
        f"postgresql://{os.getenv('DB_USER')}:{os.getenv('DB_PASSWORD')}"
        f"@{os.getenv('DB_HOST')}:{os.getenv('DB_PORT')}/{os.getenv('DB_NAME')}"
    )

# 生产环境安全配置
if not settings.debug:
    # 生产环境必须通过环境变量设置Secret Key
    env_secret_key = os.getenv("SECRET_KEY")
    if env_secret_key:
        settings.secret_key = env_secret_key
    settings.log_level = "WARNING"
    # 验证Secret Key是否已设置（仅在生产环境中强制要求）
    if not settings.secret_key or settings.secret_key == "default-secret-key-for-development-only":
        raise ValueError("SECRET_KEY environment variable must be set in production")