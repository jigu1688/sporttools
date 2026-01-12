# 自定义错误处理中间件
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import traceback

async def global_exception_handler(request: Request, exc: Exception):
    """全局异常处理程序，返回统一格式的错误响应"""
    # 记录详细的错误堆栈信息到日志
    from logging_config import get_logger
    logger = get_logger("error")
    
    # 提取错误信息
    if isinstance(exc, HTTPException) or isinstance(exc, StarletteHTTPException):
        status_code = exc.status_code
        detail = str(exc.detail) if isinstance(exc.detail, str) else "请求处理失败"
        error_type = type(exc).__name__
    elif isinstance(exc, RequestValidationError):
        status_code = 422
        # 提取验证错误信息
        error_messages = []
        for error in exc.errors():
            field = '.'.join([str(loc) for loc in error['loc']])
            message = error['msg']
            error_messages.append(f"{field}: {message}")
        detail = "; ".join(error_messages)
        error_type = "ValidationError"
    else:
        status_code = 500
        detail = f"服务器内部错误: {str(exc)}"
        error_type = type(exc).__name__
    
    # 记录错误日志
    logger.error(
        "请求处理失败",
        status_code=status_code,
        error_type=error_type,
        detail=detail,
        request_url=str(request.url),
        request_method=request.method,
        traceback=str(traceback.format_exc())
    )
    
    # 返回统一格式的错误响应
    return JSONResponse(
        status_code=status_code,
        content={
            "detail": detail,
            "status_code": status_code,
            "error": error_type,
            "timestamp": request.scope.get("start_time", None)
        }
    )
