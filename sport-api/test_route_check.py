#!/usr/bin/env python3
# 检查API路由是否正确
import requests

BASE_URL = "http://localhost:8002"

# 检查所有相关路由
routes_to_check = [
    ("GET", "/"),
    ("GET", "/health"),
    ("GET", "/api/v1/auth"),
    ("GET", "/api/v1/auth/users"),
    ("GET", "/api/v1/users"),
    ("GET", "/api/v1/users/me/profile"),
    ("GET", "/api/v1/students"),
]

print("检查API路由...")
print("=" * 60)

for method, route in routes_to_check:
    try:
        if method == "GET":
            response = requests.get(f"{BASE_URL}{route}")
        elif method == "POST":
            response = requests.post(f"{BASE_URL}{route}")
        elif method == "PUT":
            response = requests.put(f"{BASE_URL}{route}")
        elif method == "DELETE":
            response = requests.delete(f"{BASE_URL}{route}")
        
        print(f"{route:<35} {method:<6} {response.status_code:<5} {response.reason}")
    except Exception as e:
        print(f"{route:<35} {method:<6} ❌ 错误: {str(e)}")

print("\n" + "=" * 60)
print("路由检查完成!")