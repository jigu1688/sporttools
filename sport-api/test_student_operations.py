#!/usr/bin/env python3
"""测试学生管理的具体操作"""

import requests
import json

BASE_URL = "http://localhost:8002"

def test_create_student():
    """测试创建学生"""
    print("测试创建学生...")
    try:
        student_data = {
            "student_no": "TEST001",
            "real_name": "测试学生",
            "gender": "male",
            "birth_date": "2005-01-01",
            "id_card": "123456789012345678",
            "enrollment_date": "2023-09-01",
            "status": "active"
        }
        
        response = requests.post(
            f"{BASE_URL}/api/v1/students/",
            json=student_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"状态码: {response.status_code}")
        if response.status_code == 201:
            data = response.json()
            print(f"创建成功 - 学生ID: {data.get('id')}")
            return data.get('id')
        else:
            print(f"响应: {response.text}")
            return None
    except Exception as e:
        print(f"错误: {e}")
        return None

def test_get_student_detail(student_id):
    """测试获取学生详细信息"""
    print(f"\n测试获取学生详细信息 - ID: {student_id}")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/students/{student_id}")
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"学生姓名: {data.get('real_name')}")
            print(f"学籍号: {data.get('student_no')}")
            print(f"性别: {data.get('gender')}")
            return True
        else:
            print(f"响应: {response.text}")
            return False
    except Exception as e:
        print(f"错误: {e}")
        return False

def test_update_student(student_id):
    """测试更新学生信息"""
    print(f"\n测试更新学生信息 - ID: {student_id}")
    try:
        update_data = {
            "real_name": "测试学生_已更新",
            "sports_level": "good"
        }
        
        response = requests.put(
            f"{BASE_URL}/api/v1/students/{student_id}",
            json=update_data,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"更新成功 - 新姓名: {data.get('real_name')}")
            return True
        else:
            print(f"响应: {response.text}")
            return False
    except Exception as e:
        print(f"错误: {e}")
        return False

def test_search_students():
    """测试学生搜索功能"""
    print("\n测试学生搜索功能...")
    try:
        # 搜索测试
        response = requests.get(f"{BASE_URL}/api/v1/students/?search=测试")
        print(f"搜索'测试' - 状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"找到 {data.get('total', 0)} 个结果")
        
        # 按班级过滤
        response = requests.get(f"{BASE_URL}/api/v1/students/?gender=male")
        print(f"按性别过滤 - 状态码: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"找到 {data.get('total', 0)} 个男学生")
            
        return True
    except Exception as e:
        print(f"错误: {e}")
        return False

def test_delete_student(student_id):
    """测试删除学生"""
    print(f"\n测试删除学生 - ID: {student_id}")
    try:
        response = requests.delete(f"{BASE_URL}/api/v1/students/{student_id}")
        print(f"状态码: {response.status_code}")
        if response.status_code == 200:
            print("删除成功")
            return True
        else:
            print(f"响应: {response.text}")
            return False
    except Exception as e:
        print(f"错误: {e}")
        return False

if __name__ == "__main__":
    print("=== 学生管理功能测试 ===\n")
    
    # 测试创建学生
    student_id = test_create_student()
    if student_id:
        # 测试获取详细信息
        test_get_student_detail(student_id)
        
        # 测试更新学生
        test_update_student(student_id)
        
        # 测试搜索功能
        test_search_students()
        
        # 测试删除学生
        test_delete_student(student_id)
    
    print("\n=== 测试完成 ===")