#!/usr/bin/env python3
"""测试后端API是否正常运行"""

import requests
import sys

def test_backend_apis():
    """测试后端API是否正常运行"""
    base_url = "http://localhost:8002"
    endpoints = [
        "/",
        "/health",
        "/api/v1/auth/login"
    ]
    
    success_count = 0
    total_count = len(endpoints)
    
    for endpoint in endpoints:
        url = f"{base_url}{endpoint}"
        try:
            if endpoint == "/api/v1/auth/login":
                # 测试登录API，使用错误的凭据
                response = requests.post(url, json={"username": "test", "password": "test"}, timeout=5)
            else:
                response = requests.get(url, timeout=5)
            
            print(f"API {endpoint} 状态码: {response.status_code}")
            if response.status_code in [200, 401, 403]:
                # 401和403是正常的认证错误，说明API正在工作
                success_count += 1
                print(f"API {endpoint} 运行正常")
            else:
                print(f"API {endpoint} 返回异常状态码: {response.status_code}")
        except Exception as e:
            print(f"无法连接到API {endpoint}: {e}")
    
    print(f"\n测试结果: {success_count}/{total_count} 个API端点运行正常")
    return success_count == total_count

if __name__ == "__main__":
    success = test_backend_apis()
    sys.exit(0 if success else 1)
