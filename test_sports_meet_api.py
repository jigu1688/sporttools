#!/usr/bin/env python3
"""
测试运动会编排系统的API端点
"""

import requests
import sys
import json

# 测试配置
BASE_URL = "http://localhost:8002"
API_BASE_URL = f"{BASE_URL}/api/v1"
LOGIN_URL = f"{API_BASE_URL}/auth/login"

# 测试账户（从database.py中获取的正确默认账户）
TEST_ACCOUNT = {
    "username": "admin_user",
    "password": "Admin123!"
}

def test_login():
    """测试登录功能"""
    print(f"\n{'='*60}")
    print("测试登录功能")
    print(f"{'='*60}")
    
    try:
        response = requests.post(
            LOGIN_URL,
            json=TEST_ACCOUNT,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print(f"✅ 登录成功！")
                return data["access_token"]
            else:
                print(f"❌ 登录失败：响应中缺少access_token")
                return None
        else:
            print(f"❌ 登录失败：状态码 {response.status_code}")
            return None
            
    except Exception as e:
        print(f"❌ 登录测试失败：{str(e)}")
        return None

def test_api_endpoint(access_token, endpoint, method="GET", data=None, expected_status=200, description=""):
    """测试单个API端点"""
    url = f"{API_BASE_URL}{endpoint}"
    headers = {
        "Content-Type": "application/json",
        "Authorization": f"Bearer {access_token}"
    }
    
    print(f"\n测试 {description}：{method} {endpoint}")
    
    try:
        if method == "GET":
            response = requests.get(url, headers=headers, timeout=5)
        elif method == "POST":
            response = requests.post(url, json=data, headers=headers, timeout=5)
        elif method == "PUT":
            response = requests.put(url, json=data, headers=headers, timeout=5)
        elif method == "DELETE":
            response = requests.delete(url, headers=headers, timeout=5)
        else:
            print(f"❌ 不支持的HTTP方法：{method}")
            return False
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容: {response.text[:200]}...")
        
        if response.status_code == expected_status:
            print(f"✅ {description} 测试通过！")
            return True
        else:
            print(f"❌ {description} 测试失败：期望状态码 {expected_status}，实际状态码 {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ {description} 测试失败：{str(e)}")
        return False

def main():
    """主测试函数"""
    print("🏃‍♂️ 开始测试运动会编排系统API")
    print(f"测试环境：{BASE_URL}")
    
    # 1. 测试登录功能
    access_token = test_login()
    if not access_token:
        print(f"\n❌ 登录失败，无法继续测试其他API端点")
        sys.exit(1)
    
    # 2. 测试运动会相关API
    print(f"\n{'='*60}")
    print("开始测试运动会相关API")
    print(f"{'='*60}")
    
    # 测试获取运动会列表
    test_api_endpoint(access_token, "/sports-meet", description="获取运动会列表")
    
    # 测试获取仪表盘数据
    test_api_endpoint(access_token, "/sports-meet/dashboard", description="获取仪表盘数据")
    
    # 3. 测试场馆相关API
    print(f"\n{'='*60}")
    print("开始测试场馆相关API")
    print(f"{'='*60}")
    
    # 测试获取场馆列表
    test_api_endpoint(access_token, "/sports-meet/venues", description="获取场馆列表")
    
    # 4. 测试裁判相关API
    print(f"\n{'='*60}")
    print("开始测试裁判相关API")
    print(f"{'='*60}")
    
    # 测试获取裁判列表
    test_api_endpoint(access_token, "/sports-meet/referees", description="获取裁判列表")
    
    # 5. 测试项目相关API
    print(f"\n{'='*60}")
    print("开始测试项目相关API")
    print(f"{'='*60}")
    
    # 测试获取项目列表（需要先有运动会）
    # 先创建一个测试运动会
    sports_meet_data = {
        "name": "测试运动会",
        "start_date": "2026-05-01",
        "end_date": "2026-05-02",
        "status": "planning",
        "description": "用于测试的运动会"
    }
    
    # 创建运动会
    create_meet_response = requests.post(
        f"{API_BASE_URL}/sports-meet",
        json=sports_meet_data,
        headers={
            "Content-Type": "application/json",
            "Authorization": f"Bearer {access_token}"
        },
        timeout=5
    )
    
    if create_meet_response.status_code == 200:
        sports_meet_id = create_meet_response.json()["id"]
        print(f"✅ 成功创建测试运动会，ID: {sports_meet_id}")
        
        # 测试获取项目列表
        test_api_endpoint(access_token, f"/sports-meet/{sports_meet_id}/events", description="获取项目列表")
        
        # 测试获取报名统计数据
        test_api_endpoint(access_token, f"/sports-meet/{sports_meet_id}/registration-statistics", description="获取报名统计数据")
        
        # 测试获取赛程列表
        test_api_endpoint(access_token, f"/sports-meet/{sports_meet_id}/schedules", description="获取赛程列表")
        
        # 测试获取成绩列表
        test_api_endpoint(access_token, f"/sports-meet/{sports_meet_id}/results", description="获取成绩列表")
        
        # 删除测试运动会
        delete_meet_response = requests.delete(
            f"{API_BASE_URL}/sports-meet/{sports_meet_id}",
            headers={
                "Content-Type": "application/json",
                "Authorization": f"Bearer {access_token}"
            },
            timeout=5
        )
        
        if delete_meet_response.status_code == 200:
            print(f"✅ 成功删除测试运动会")
        else:
            print(f"⚠️  删除测试运动会失败，状态码: {delete_meet_response.status_code}")
    else:
        print(f"⚠️  创建测试运动会失败，无法测试后续API，状态码: {create_meet_response.status_code}")
        print(f"响应内容: {create_meet_response.text}")
    
    print(f"\n{'='*60}")
    print("测试完成！")
    print(f"{'='*60}")
    print("\n🎉 所有API端点测试完毕！")
    print("请手动在浏览器中测试前端功能，确保所有功能正常工作。")
    print("前端访问地址: http://localhost:5173")
    print("API文档地址: http://localhost:8002/docs")

if __name__ == "__main__":
    main()
