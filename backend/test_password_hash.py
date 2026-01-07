#!/usr/bin/env python3
# 测试密码哈希功能
from auth import AuthService
import sys

# 测试不同密码长度
passwords = [
    "short",
    "pass123",
    "admin123", 
    "password123",
    "a" * 72,  # 刚好72字符
    "a" * 73,  # 超过72字符
]

print("测试密码哈希功能...")
print("=" * 50)

for password in passwords:
    print(f"\n测试密码: '{password}'")
    print(f"字符长度: {len(password)}")
    print(f"字节长度: {len(password.encode('utf-8'))}")
    
    try:
        hashed = AuthService.get_password_hash(password)
        print(f"✅ 哈希成功: {hashed[:30]}...")
        
        # 验证哈希
        verified = AuthService.verify_password(password, hashed)
        print(f"✅ 验证成功: {verified}")
        
    except Exception as e:
        print(f"❌ 错误: {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()

print("\n" + "=" * 50)
print("测试完成!")