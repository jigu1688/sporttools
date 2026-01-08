# 体育教学辅助网站 - 后端主程序
# 体育教学辅助网站后端服务

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# 导入路由
from routes.students import router as students_router
from routes.auth import router as auth_router
from routes.users import router as users_router
from routes.classes import router as classes_router
from routes.school_year import router as school_year_router
from routes.physical_test import router as physical_test_router
from routes.logs import router as logs_router

# 创建FastAPI应用实例
app = FastAPI(
    title="体育教学辅助网站API",
    description="体育老师专用的综合教学辅助管理平台",
    version="1.0.0"
)

# 初始化数据库
from database import init_database
init_database()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:5174", "http://127.0.0.1:5174"],  # 前端开发地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(students_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(classes_router)
app.include_router(school_year_router)
app.include_router(physical_test_router)
app.include_router(logs_router)

# 异常处理
from fastapi import Request
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    """处理请求验证错误，返回友好的错误信息"""
    # 提取所有错误消息
    error_messages = []
    for error in exc.errors():
        field = '.'.join([str(loc) for loc in error['loc']])
        message = error['msg']
        error_messages.append(f"{field}: {message}")
    
    # 打印详细错误信息到日志
    print(f"Validation Error: {exc}")
    print(f"Error Messages: {error_messages}")
    
    # 返回统一格式的错误响应
    return JSONResponse(
        status_code=422,
        content={
            "detail": "验证失败",
            "message": "; ".join(error_messages),
            "errors": exc.errors()
        }
    )

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
    """健康检查接口"""
    return {"status": "healthy"}

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host="0.0.0.0",
        port=8002,
        reload=True,
        log_level="info"
    )