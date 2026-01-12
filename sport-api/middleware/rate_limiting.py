# 速率限制中间件配置
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from fastapi import Request

# 初始化速率限制器
limiter = Limiter(
    key_func=get_remote_address,  # 使用客户端IP作为限速键
    default_limits=["100/minute", "10/second"],  # 默认限制：每分钟100次请求，每秒10次
    headers_enabled=True,  # 启用速率限制响应头
)

# 自定义速率限制超过处理程序
async def custom_rate_limit_handler(request: Request, exc: RateLimitExceeded):
    """自定义速率限制超过处理程序，返回统一格式的错误响应"""
    from fastapi.responses import JSONResponse
    
    # 记录速率限制日志
    from logging_config import get_logger
    logger = get_logger("rate_limit")
    logger.warning(
        "速率限制超过",
        ip=get_remote_address(request),
        path=request.url.path,
        method=request.method
    )
    
    # 返回统一格式的错误响应
    return JSONResponse(
        status_code=429,
        content={
            "detail": "请求频率过高，请稍后再试",
            "status_code": 429,
            "error": "RateLimitExceeded",
            "retry_after": exc.retry_after
        }
    )
