# 体育教学辅助网站 - 日志配置模块

import os
import logging
from logging.handlers import RotatingFileHandler
import structlog
from datetime import datetime

# 确保日志目录存在
LOG_DIR = "logs"
os.makedirs(LOG_DIR, exist_ok=True)

# 日志配置函数
def setup_logging(log_level: str = "INFO", log_file: str = "logs/app.log"):
    """
    配置日志记录
    
    Args:
        log_level: 日志级别（DEBUG, INFO, WARNING, ERROR, CRITICAL）
        log_file: 日志文件路径
    """
    
    # 设置日志级别
    level = getattr(logging, log_level.upper(), logging.INFO)
    
    # 清除现有处理器
    logging.root.handlers = []
    
    # 配置基本日志
    logging.basicConfig(
        level=level,
        format="%(message)s",
        handlers=[
            RotatingFileHandler(
                log_file,
                maxBytes=10 * 1024 * 1024,  # 10MB
                backupCount=5,  # 保留5个备份文件
                encoding="utf-8"
            ),
            logging.StreamHandler()
        ]
    )
    
    # 配置structlog
    structlog.configure(
        processors=[
            structlog.contextvars.merge_contextvars,
            structlog.stdlib.add_log_level,
            structlog.stdlib.PositionalArgumentsFormatter(),
            structlog.processors.TimeStamper(fmt="iso"),
            structlog.processors.StackInfoRenderer(),
            structlog.processors.format_exc_info,
            structlog.dev.ConsoleRenderer()
        ],
        logger_factory=structlog.stdlib.LoggerFactory(),
        wrapper_class=structlog.stdlib.BoundLogger,
        cache_logger_on_first_use=True,
    )
    
    return structlog.get_logger()

# 获取日志记录器
def get_logger(name: str = None):
    """
    获取日志记录器
    
    Args:
        name: 日志记录器名称
    
    Returns:
        structlog.BoundLogger: 日志记录器实例
    """
    return structlog.get_logger(name)
