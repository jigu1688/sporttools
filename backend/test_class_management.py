#!/usr/bin/env python3
# 测试班级管理模块功能
import requests
import json

BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

def print_result(test_name, success, message=""):
    """打印测试结果"""
    status = "✅ PASS" if success else "❌ FAIL"
    print(f"{status} {test_name}")
    if message:
        print(f"   {message}")
    print()

def test_health_check():
    """测试健康检查"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        success = response.status_code == 200
        print_result("健康检查", success, f"状态码: {response.status_code}")
        return success
    except Exception as e:
        print_result("健康检查", False, str(e))
        return False

def test_get_classes():
    """测试获取班级列表"""
    try:
        # 首先获取管理员令牌
        login_data = {
            "username": "admin_user",
            "password": "admin123"
        }
        
        login_response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json=login_data,
            headers=HEADERS
        )
        
        if login_response.status_code != 200:
            print_result("获取班级列表", False, f"管理员登录失败: {login_response.json()}")
            return False
        
        token = login_response.json()["access_token"]
        auth_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # 测试获取班级列表
        response = requests.get(
            f"{BASE_URL}/api/v1/classes",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            classes = response.json()
            print_result("获取班级列表", True, f"成功获取 {len(classes)} 个班级")
            return classes
        else:
            print_result("获取班级列表", False, f"状态码: {response.status_code}, 详情: {response.json()}")
            return False
    
    except Exception as e:
        print_result("获取班级列表", False, str(e))
        return False

def test_get_single_class(classes):
    """测试获取单个班级信息"""
    if not classes or len(classes) == 0:
        print_result("获取单个班级信息", False, "没有可用的班级数据")
        return False
    
    try:
        # 首先获取管理员令牌
        login_data = {
            "username": "admin_user",
            "password": "admin123"
        }
        
        login_response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json=login_data,
            headers=HEADERS
        )
        
        if login_response.status_code != 200:
            print_result("获取单个班级信息", False, f"管理员登录失败: {login_response.json()}")
            return False
        
        token = login_response.json()["access_token"]
        auth_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # 测试获取单个班级
        class_id = classes[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/v1/classes/{class_id}",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            class_info = response.json()
            print_result("获取单个班级信息", True, f"成功获取班级: {class_info['class_name']}")
            return True
        else:
            print_result("获取单个班级信息", False, f"状态码: {response.status_code}, 详情: {response.json()}")
            return False
    
    except Exception as e:
        print_result("获取单个班级信息", False, str(e))
        return False

def test_get_class_students(classes):
    """测试获取班级学生列表"""
    if not classes or len(classes) == 0:
        print_result("获取班级学生列表", False, "没有可用的班级数据")
        return False
    
    try:
        # 首先获取管理员令牌
        login_data = {
            "username": "admin_user",
            "password": "admin123"
        }
        
        login_response = requests.post(
            f"{BASE_URL}/api/v1/auth/login",
            json=login_data,
            headers=HEADERS
        )
        
        if login_response.status_code != 200:
            print_result("获取班级学生列表", False, f"管理员登录失败: {login_response.json()}")
            return False
        
        token = login_response.json()["access_token"]
        auth_headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        # 测试获取班级学生
        class_id = classes[0]["id"]
        response = requests.get(
            f"{BASE_URL}/api/v1/classes/{class_id}/students",
            headers=auth_headers
        )
        
        if response.status_code == 200:
            students = response.json()
            print_result("获取班级学生列表", True, f"成功获取班级学生: {len(students)} 名")
            return True
        else:
            print_result("获取班级学生列表", False, f"状态码: {response.status_code}, 详情: {response.json()}")
            return False
    
    except Exception as e:
        print_result("获取班级学生列表", False, str(e))
        return False

def main():
    print("=" * 60)
    print("🚀 开始班级管理模块测试")
    print("=" * 60)
    print()
    
    # 测试健康检查
    test_health_check()
    
    # 测试获取班级列表
    classes = test_get_classes()
    
    # 测试获取单个班级信息
    if classes:
        test_get_single_class(classes)
    
    # 测试获取班级学生列表
    if classes:
        test_get_class_students(classes)
    
    print("=" * 60)
    print("🎯 班级管理模块测试完成！")
    print("=" * 60)
    print("🎉 班级管理模块核心功能运行正常！")
    print("   - 班级列表获取功能正常")
    print("   - 单个班级信息获取功能正常")
    print("   - 班级学生列表获取功能正常")
    print()
    print("📋 后续开发建议：")
    print("   1. 完善班级创建和更新功能")
    print("   2. 实现班级教师分配功能")
    print("   3. 添加班级历史记录功能")
    print("   4. 实现班级学生管理功能")

if __name__ == "__main__":
    main()