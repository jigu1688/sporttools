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

# 创建FastAPI应用实例
app = FastAPI(
    title="体育教学辅助网站API",
    description="体育老师专用的综合教学辅助管理平台",
    version="1.0.0"
)

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # 前端开发地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 注册路由
app.include_router(students_router)
app.include_router(auth_router)
app.include_router(users_router)
app.include_router(classes_router)

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
        port=8000,
        reload=True,
        log_level="info"
    )