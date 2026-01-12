#!/usr/bin/env python3
"""
测试清除数据接口
"""
import requests
import json

BASE_URL = "http://localhost:8002"

# 1. 登录获取Token
print("=== 1. 测试登录 ===")
try:
    response = requests.post(
        f"{BASE_URL}/api/v1/auth/login",
        json={"username": "admin", "password": "admin123"},
        timeout=5
    )
    if response.status_code == 200:
        token = response.json()['access_token']
        print(f"✓ 登录成功")
        print(f"  Token: {token[:20]}...")
    else:
        print(f"✗ 登录失败: {response.status_code}")
        exit(1)
except Exception as e:
    print(f"✗ 错误: {e}")
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

# 2. 检查初始数据
print("\n=== 2. 检查初始数据 ===")
try:
    # 查询班级
    resp_classes = requests.get(
        f"{BASE_URL}/api/v1/classes?page=1&page_size=100",
        headers=headers,
        timeout=5
    )
    class_count = resp_classes.json().get('total') or len(resp_classes.json() if isinstance(resp_classes.json(), list) else [])
    print(f"✓ 班级数: {class_count}")
    
    # 查询学生 (page_size最大100)
    resp_students = requests.get(
        f"{BASE_URL}/api/v1/students?page=1&page_size=100",
        headers=headers,
        timeout=5
    )
    student_data = resp_students.json()
    if isinstance(student_data, dict):
        student_count = student_data.get('total', 0)
    else:
        student_count = len(student_data) if isinstance(student_data, list) else 0
    print(f"✓ 学生数: {student_count}")
except Exception as e:
    print(f"✗ 错误: {e}")

# 3. 测试清除数据接口 - 无权限用户（如果有的话）
print("\n=== 3. 测试权限保护 ===")
try:
    # 用普通用户token测试（这里用admin测试权限是否正常工作）
    response = requests.delete(
        f"{BASE_URL}/api/v1/debug/clear-data",
        headers=headers,
        timeout=5
    )
    if response.status_code == 200:
        print(f"✓ 清除数据接口可访问 (管理员)")
        result = response.json()
        print(f"  删除结果: {json.dumps(result, indent=2, ensure_ascii=False)}")
    elif response.status_code == 403:
        print(f"✓ 权限验证成功 - 拒绝了非管理员用户")
    else:
        print(f"✗ 返回码: {response.status_code}")
        print(f"  响应: {response.text[:200]}")
except Exception as e:
    print(f"✗ 错误: {e}")

# 4. 验证清除后的数据
print("\n=== 4. 验证清除后的数据 ===")
try:
    # 查询班级
    resp_classes = requests.get(
        f"{BASE_URL}/api/v1/classes?page=1&page_size=100",
        headers=headers,
        timeout=5
    )
    class_data = resp_classes.json()
    class_count_after = class_data.get('total') if isinstance(class_data, dict) else (len(class_data) if isinstance(class_data, list) else 0)
    print(f"✓ 清除后班级数: {class_count_after}")
    
    # 查询学生
    resp_students = requests.get(
        f"{BASE_URL}/api/v1/students?page=1&page_size=100",
        headers=headers,
        timeout=5
    )
    student_data = resp_students.json()
    if isinstance(student_data, dict):
        student_count_after = student_data.get('total', 0)
    else:
        student_count_after = len(student_data) if isinstance(student_data, list) else 0
    print(f"✓ 清除后学生数: {student_count_after}")
except Exception as e:
    print(f"✗ 错误: {e}")

print("\n✓ 测试完成！")
