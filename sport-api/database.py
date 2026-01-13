# 体育教学辅助网站 - 数据库连接和初始化

from sqlalchemy import create_engine, MetaData, event
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from config import settings

# 创建数据库引擎
engine = create_engine(
    settings.database_url,
    echo=settings.debug,  # 开发环境下打印SQL语句
    pool_pre_ping=True,   # 连接池预检查
    pool_recycle=300,     # 连接回收时间（5分钟）
    pool_size=10,         # 连接池大小
    max_overflow=20,      # 最大溢出连接数
    pool_timeout=30,      # 获取连接超时时间（秒）
    pool_use_lifo=True,   # 使用后进先出策略
    connect_args={"check_same_thread": False} if 'sqlite' in settings.database_url.lower() else {}
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
    
    # 创建初始管理员用户
    from sqlalchemy.orm import Session
    from models import User, UserRoleEnum, StatusEnum
    from auth import AuthService
    
    db = SessionLocal()
    try:
        # 检查是否已经存在admin_user
        admin_user = db.query(User).filter(User.username == "admin_user").first()
        if not admin_user:
            # 创建初始管理员用户
            admin_user = User(
                username="admin_user",
                email="admin@example.com",
                phone="13800138000",
                real_name="管理员",
                hashed_password=AuthService.get_password_hash("Admin123!"),
                role=UserRoleEnum.admin,
                status=StatusEnum.active
            )
            db.add(admin_user)
            db.commit()
            print("初始管理员用户创建成功: username=admin_user, password=Admin123!")
        else:
            print("管理员用户已存在")
        
        # 添加初始学年数据
        from models import SchoolYear, SchoolYearStatusEnum
        from datetime import date
        
        # 检查是否已经存在学年数据
        school_year_count = db.query(SchoolYear).count()
        if school_year_count == 0:
            # 创建当前学年
            current_year = SchoolYear(
                school_id=None,  # 没有学校表数据时，暂时设为None
                year_name="2025-2026学年",
                start_date=date(2025, 9, 1),
                end_date=date(2026, 8, 31),
                academic_year="2025",
                status=SchoolYearStatusEnum.active
            )
            db.add(current_year)
            
            # 创建上一学年
            previous_year = SchoolYear(
                school_id=None,
                year_name="2024-2025学年",
                start_date=date(2024, 9, 1),
                end_date=date(2025, 8, 31),
                academic_year="2024",
                status=SchoolYearStatusEnum.completed
            )
            db.add(previous_year)
            
            db.commit()
            print("初始学年数据创建成功")
        else:
            # 检查是否有活跃学年，如果没有，将第一个学年设置为活跃状态
            active_year = db.query(SchoolYear).filter(SchoolYear.status == SchoolYearStatusEnum.active).first()
            if not active_year:
                # 获取第一个学年
                first_year = db.query(SchoolYear).order_by(SchoolYear.start_date.desc()).first()
                if first_year:
                    first_year.status = SchoolYearStatusEnum.active
                    db.commit()
                    print("已将第一个学年设置为活跃状态")
                else:
                    print("没有找到学年数据")
            else:
                print(f"已有{school_year_count}条学年数据，其中1条为活跃学年")
    except Exception as e:
        print(f"初始化数据失败: {str(e)}")
        db.rollback()
    finally:
        db.close()
    
    print("数据库初始化完成")

if __name__ == "__main__":
    init_database()