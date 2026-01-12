#!/usr/bin/env python3
"""
测试API数据返回是否正常
"""

import requests
import json
import time

BASE_URL = "http://localhost:8002"

def test_login():
    """测试登录"""
    print("\n=== 测试登录 ===")
    try:
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json={"username": "admin", "password": "admin123"},
            timeout=5
        )
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 登录成功")
            print(f"  Token: {data.get('access_token', '')[:20]}...")
            return data.get('access_token')
        else:
            print(f"✗ 登录失败: {response.text}")
            return None
    except Exception as e:
        print(f"✗ 错误: {e}")
        return None

def test_get_classes(token):
    """测试获取班级列表"""
    print("\n=== 测试获取班级列表 ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/v1/classes?page=1&page_size=5",
            headers=headers,
            timeout=5
        )
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 获取班级成功")
            items = data.get('items', [])
            print(f"  返回班级数: {len(items)}")
            if items:
                print(f"  第一个班级: {items[0]}")
            return items
        else:
            print(f"✗ 获取失败: {response.text}")
            return None
    except Exception as e:
        print(f"✗ 错误: {e}")
        return None

def test_get_students(token):
    """测试获取学生列表"""
    print("\n=== 测试获取学生列表 ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/v1/students?page=1&page_size=5",
            headers=headers,
            timeout=5
        )
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 获取学生成功")
            items = data.get('items', [])
            print(f"  返回学生数: {len(items)}")
            if items:
                print(f"  第一个学生: {items[0]}")
            return items
        else:
            print(f"✗ 获取失败: {response.text}")
            return None
    except Exception as e:
        print(f"✗ 错误: {e}")
        return None

def test_get_all_classes(token):
    """获取所有班级统计"""
    print("\n=== 获取所有班级统计 ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/v1/classes?page=1&page_size=1000",
            headers=headers,
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            total = data.get('total', 0)
            print(f"✓ 总班级数: {total}")
            return total
        else:
            print(f"✗ 获取失败")
            return 0
    except Exception as e:
        print(f"✗ 错误: {e}")
        return 0

def test_get_all_students(token):
    """获取所有学生统计"""
    print("\n=== 获取所有学生统计 ===")
    try:
        headers = {"Authorization": f"Bearer {token}"}
        response = requests.get(
            f"{BASE_URL}/api/v1/students?page=1&page_size=1000",
            headers=headers,
            timeout=5
        )
        if response.status_code == 200:
            data = response.json()
            total = data.get('total', 0)
            print(f"✓ 总学生数: {total}")
            return total
        else:
            print(f"✗ 获取失败")
            return 0
    except Exception as e:
        print(f"✗ 错误: {e}")
        return 0

if __name__ == "__main__":
    print("开始测试API...")
    print(f"API地址: {BASE_URL}")
    
    # 等待服务启动
    for i in range(5):
        try:
            response = requests.get(f"{BASE_URL}/docs", timeout=2)
            if response.status_code == 200:
                print("✓ 服务已启动")
                break
        except:
            if i < 4:
                print(f"等待服务启动... ({i+1}/5)")
                time.sleep(1)
    
    # 登录
    token = test_login()
    
    if not token:
        print("\n✗ 登录失败，无法继续测试")
        exit(1)
    
    # 测试班级
    classes = test_get_classes(token)
    total_classes = test_get_all_classes(token)
    
    # 测试学生
    students = test_get_students(token)
    total_students = test_get_all_students(token)
    
    # 总结
    print("\n" + "="*50)
    print("测试总结:")
    print(f"  班级总数: {total_classes} (期望: 69)")
    print(f"  学生总数: {total_students} (期望: 628)")
    
    if total_classes == 69 and total_students == 628:
        print("\n✓ 所有测试通过！")
    else:
        print("\n⚠ 数据不符合预期")
