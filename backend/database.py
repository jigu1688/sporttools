# 体育教学辅助网站 - 数据库连接和初始化

from sqlalchemy import create_engine, MetaData
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# 创建数据库引擎
engine = create_engine(
    settings.database_url,
    echo=settings.debug,  # 开发环境下打印SQL语句
    pool_pre_ping=True,   # 连接池预检查
    pool_recycle=300      # 连接回收时间（5分钟）
)

# 创建会话工厂
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# 创建基础模型类
Base = declarative_base()

# 数据库操作依赖
def get_db():
    """获取数据库会话的依赖注入函数"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# 创建所有表
def create_tables():
    """创建所有数据库表"""
    Base.metadata.create_all(bind=engine)

# 初始化数据库（用于开发环境）
def init_database():
    """初始化数据库"""
    create_tables()
    print("数据库初始化完成")

if __name__ == "__main__":
    init_database()