#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import sys
import io
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

from database import SessionLocal
from models import User, UserRoleEnum
from auth import AuthService

session = SessionLocal()

try:
    # 检查admin用户是否存在
    admin_user = session.query(User).filter(User.username == 'admin').first()
    if admin_user:
        # 更新密码
        admin_user.hashed_password = AuthService.get_password_hash('admin123')
        session.commit()
        print("✓ 已更新admin用户密码为: admin123")
    else:
        print("❌ admin用户不存在")
        
except Exception as e:
    print(f"❌ 错误: {e}")
    session.rollback()
    import traceback
    traceback.print_exc()
finally:
    session.close()
