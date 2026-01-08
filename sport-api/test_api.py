#!/usr/bin/env python3
"""测试API接口"""

import requests
import json

BASE_URL = "http://localhost:8002"

def test_root():
    """测试根路径"""
    print("测试根路径...")
    try:
        response = requests.get(f"{BASE_URL}/")
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"错误: {e}")

def test_health():
    """测试健康检查"""
    print("\n测试健康检查...")
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"状态码: {response.status_code}")
        print(f"响应: {response.json()}")
    except Exception as e:
        print(f"错误: {e}")

def test_students_list():
    """测试学生列表"""
    print("\n测试学生列表...")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/students/")
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"总学生数: {data.get('total', 0)}")
            print(f"学生列表: {len(data.get('items', []))} 个")
        else:
            print(f"响应: {response.text}")
    except Exception as e:
        print(f"错误: {e}")

if __name__ == "__main__":
    test_root()
    test_health()
    test_students_list()