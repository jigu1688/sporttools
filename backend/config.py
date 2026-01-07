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
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24小时
    
    # Redis配置（用于缓存）
    redis_host: str = "localhost"
    redis_port: int = 6379
    redis_password: Optional[str] = None
    redis_db: int = 0
    
    # 文件上传配置
    upload_dir: str = "uploads"
    max_file_size: int = 10 * 1024 * 1024  # 10MB
    allowed_file_extensions: list = [".jpg", ".jpeg", ".png", ".pdf", ".xlsx", ".xls"]
    
    # CORS配置
    cors_origins: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8080"
    ]
    
    # 日志配置
    log_level: str = "INFO"
    log_file: str = "logs/app.log"
    
    class Config:
        env_file = ".env"
        case_sensitive = True

# 创建全局配置实例
settings = Settings()

# 根据环境变量切换数据库配置
if os.getenv("DATABASE_URL"):
    settings.database_url = os.getenv("DATABASE_URL")
elif os.getenv("DB_HOST"):
    settings.database_url = f"postgresql://{settings.database_user}:{settings.database_password}@{settings.database_host}:{settings.database_port}/{settings.database_name}"

# 生产环境安全配置
if not settings.debug:
    settings.secret_key = os.getenv("SECRET_KEY", "fallback-secret-key-for-production")
    settings.log_level = "WARNING"