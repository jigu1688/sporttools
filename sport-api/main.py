# 体育教学辅助网站 - 后端主程序
# 体育教学辅助网站后端服务

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import uvicorn

# 配置日志
from logging_config import setup_logging
from config import settings
logger = setup_logging(log_level=settings.log_level, log_file=settings.log_file)
logger.info("正在初始化体育教学辅助网站API服务...")

# 导入路由
from routes.students import router as students_router
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.classes import router as classes_router
from routes.school_year import router as school_year_router
from routes.physical_test import router as physical_test_router
from routes.logs import router as logs_router
from routes.sports_meet import router as sports_meet_router
from routes.school import router as school_router
from routes.debug import router as debug_router
from routes.dashboard import router as dashboard_router

# 创建FastAPI应用实例
app = FastAPI(
    title="体育教学辅助网站API",
    description="体育老师专用的综合教学辅助管理平台",
    version="1.0.0"
)

# 配置速率限制
from slowapi.errors import RateLimitExceeded
from middleware.rate_limiting import limiter, custom_rate_limit_handler
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, custom_rate_limit_handler)

# 初始化数据库
from database import init_database
logger.info("正在初始化数据库...")
init_database()

# 配置CORS
from config import settings

# 根据环境动态配置CORS
if not settings.debug:
    # 生产环境：使用环境变量配置的生产域名
    if settings.production_domain:
        cors_origins = [
            f"http://{settings.production_domain}",
            f"https://{settings.production_domain}"
        ]
    else:
        cors_origins = []
    # 生产环境配置更严格的CORS策略
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],  # 只允许必要的HTTP方法
        allow_headers=["Authorization", "Content-Type", "Accept"],  # 只允许必要的HTTP头
        expose_headers=["X-Total-Count", "X-Page", "X-Page-Size"],  # 只暴露必要的响应头
        max_age=3600,  # 预检请求结果缓存1小时
    )
else:
    # 开发环境：允许所有常用开发地址
    cors_origins = settings.cors_origins
    app.add_middleware(
        CORSMiddleware,
        allow_origins=cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

# 注册路由
app.include_router(students_router, prefix="/api/v1/students")
app.include_router(auth_router, prefix="/api/v1/auth")
app.include_router(users_router, prefix="/api/v1/users")
app.include_router(classes_router, prefix="/api/v1/classes")
app.include_router(school_year_router, prefix="/api/v1/school-years")
app.include_router(physical_test_router, prefix="/api/v1/physical-tests")
app.include_router(logs_router, prefix="/api/v1/logs")
app.include_router(sports_meet_router, prefix="/api/v1/sports-meets")
app.include_router(school_router, prefix="/api/v1/schools")
app.include_router(dashboard_router, prefix="/api/v1/dashboard")
# 仅在开发环境下注册debug路由
if settings.debug:
    app.include_router(debug_router, prefix="/api/v1/debug")

# 异常处理
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
from middleware.error_handling import global_exception_handler

# 添加全局异常处理中间件
@app.exception_handler(Exception)
async def exception_handler(request: Request, exc: Exception):
    return await global_exception_handler(request, exc)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return await global_exception_handler(request, exc)

@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    return await global_exception_handler(request, exc)

@app.get("/")
async def root():
    """根路径，返回API信息"""
    return {
        "message": "体育教学辅助网站API服务",
        "version": "1.0.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    """健康检查接口，包含数据库和Redis连接检查"""
    
    health_status = {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "checks": {
            "database": "healthy",
            "redis": "healthy"
        }
    }
    
    # 检查数据库连接
    try:
        from sqlalchemy.orm import Session
        from sqlalchemy import text
        from database import SessionLocal
        
        db = SessionLocal()
        db.execute(text("SELECT 1"))
        db.close()
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["database"] = f"unhealthy: {str(e)}"
    
    # 检查Redis连接（如果配置了Redis）
    try:
        from config import settings
        if settings.redis_host:
            import redis
            redis_client = redis.Redis(
                host=settings.redis_host,
                port=settings.redis_port,
                db=settings.redis_db,
                password=settings.redis_password,
                decode_responses=settings.redis_decode_responses
            )
            # 执行简单命令测试Redis连接
            redis_client.ping()
    except ImportError:
        # Redis库未安装，标记为未配置
        health_status["checks"]["redis"] = "not_configured"
    except Exception as e:
        health_status["status"] = "unhealthy"
        health_status["checks"]["redis"] = f"unhealthy: {str(e)}"
    
    return health_status
