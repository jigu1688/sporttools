"""
后端服务器启动脚本
使用此脚本启动后端服务器，避免主进程立即退出导致的问题
"""
import uvicorn
import sys
import os

# 将当前目录添加到Python路径
sys.path.insert(0, os.path.dirname(__file__))

# 导入app对象
from main import app

if __name__ == "__main__":
    # 直接运行app对象，避免字符串导入导致的重复初始化
    uvicorn.run(
        app,  # 直接传递app对象
        host="127.0.0.1",
        port=8002,
        log_level="info"
    )
