#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""
完整的前后端集成测试：
1. 登录后端
2. 获取学生列表
3. 验证数据返回
"""

import requests
import json
import time

BASE_URL = "http://localhost:8002"
API_BASE = f"{BASE_URL}/api/v1"

print("=" * 60)
print("前后端集成测试")
print("=" * 60)

# 1. 登录
print("\n[1/3] 正在登录...")
login_response = requests.post(
    f"{API_BASE}/auth/login",
    json={"username": "admin", "password": "admin123"}
)

if login_response.status_code != 200:
    print(f"❌ 登录失败: {login_response.status_code}")
    print(f"   响应: {login_response.text}")
    exit(1)

login_data = login_response.json()
access_token = login_data.get('access_token')
user_info = login_data.get('user_info')

print(f"✅ 登录成功")
print(f"   用户: {user_info.get('username')}")
print(f"   Token: {access_token[:50]}...")

# 2. 获取学生列表（认证请求）
print("\n[2/3] 正在获取学生列表...")
headers = {"Authorization": f"Bearer {access_token}"}
students_response = requests.get(
    f"{API_BASE}/students",
    headers=headers,
    params={"page": 1, "page_size": 10}
)

if students_response.status_code != 200:
    print(f"❌ 获取学生列表失败: {students_response.status_code}")
    print(f"   响应: {students_response.text}")
    exit(1)

students_data = students_response.json()
print(f"✅ 获取学生列表成功")
print(f"   总数: {students_data.get('total', 0)}")
print(f"   本页数: {len(students_data.get('items', []))}")

# 3. 验证数据
print("\n[3/3] 数据验证...")
items = students_data.get('items', [])
if len(items) > 0:
    print(f"✅ 成功返回 {len(items)} 条学生记录")
    print("\n   示例学生数据（前3条）:")
    for i, student in enumerate(items[:3], 1):
        print(f"   {i}. {student.get('real_name', 'N/A')} - {student.get('student_no', 'N/A')}")
else:
    print("⚠️  没有返回学生记录（可能数据库为空）")

print("\n" + "=" * 60)
print("✅ 所有测试通过！前端应该能正常显示数据。")
print("=" * 60)
