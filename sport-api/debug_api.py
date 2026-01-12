#!/usr/bin/env python3
"""
直接测试API响应
"""
import requests
import json

BASE_URL = "http://localhost:8002"

# 登录
response = requests.post(
    f"{BASE_URL}/api/v1/auth/login",
    json={"username": "admin", "password": "admin123"},
    timeout=5
)
token = response.json()['access_token']
headers = {"Authorization": f"Bearer {token}"}

# 获取所有班级
response = requests.get(
    f"{BASE_URL}/api/v1/classes?page=1&page_size=1000",
    headers=headers,
    timeout=5
)
classes_data = response.json()
print(f"班级数据类型: {type(classes_data)}")
if isinstance(classes_data, list):
    print(f"班级总数 (列表长度): {len(classes_data)}")
elif isinstance(classes_data, dict):
    print(f"班级数据: {json.dumps(classes_data, indent=2)[:500]}")

# 获取所有学生
response = requests.get(
    f"{BASE_URL}/api/v1/students?page=1&page_size=1000",
    headers=headers,
    timeout=5
)
students_data = response.json()
print(f"\n学生数据类型: {type(students_data)}")
if isinstance(students_data, dict):
    print(f"学生API响应结构:")
    print(f"  - total: {students_data.get('total')}")
    print(f"  - page: {students_data.get('page')}")
    print(f"  - page_size: {students_data.get('page_size')}")
    print(f"  - total_pages: {students_data.get('total_pages')}")
    print(f"  - items数量: {len(students_data.get('items', []))}")
    if students_data.get('items'):
        print(f"  - 第一个学生: {students_data['items'][0]}")
elif isinstance(students_data, list):
    print(f"学生总数 (列表长度): {len(students_data)}")
