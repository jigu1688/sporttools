#!/usr/bin/env python3
"""
创建测试用户
"""

from database import SessionLocal
from models import User, UserRoleEnum
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def get_password_hash(password: str) -> str:
    """生成密码哈希"""
    return pwd_context.hash(password)

def create_test_user():
    """创建测试用户"""
    db = SessionLocal()
    try:
        # 检查是否已存在管理员用户
        existing_user = db.query(User).filter(User.username == "admin").first()
        if existing_user:
            print("管理员用户已存在")
            return True
        
        # 使用正确的bcrypt哈希
        password_hash = get_password_hash("admin123")
        
        # 创建管理员用户
        admin_user = User(
            username="admin",
            email="admin@school.com",
            hashed_password=password_hash,
            real_name="System Administrator",
            role=UserRoleEnum.admin,
            status="active"
        )
        
        db.add(admin_user)
        db.commit()
        db.refresh(admin_user)
        
        print("✅ 管理员用户创建成功")
        print(f"用户名: {admin_user.username}")
        print(f"密码: admin123")
        print(f"角色: {admin_user.role}")
        
        return True
        
    except Exception as e:
        print(f"创建用户失败: {str(e)}")
        return False
    finally:
        db.close()

if __name__ == "__main__":
    create_test_user()