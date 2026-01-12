#!/usr/bin/env python3
"""测试前端服务器是否正常运行"""

import requests
import sys

def test_frontend_server():
    """测试前端服务器是否正常运行"""
    url = "http://localhost:5174/"
    try:
        response = requests.get(url, timeout=5)
        print(f"前端服务器状态码: {response.status_code}")
        if response.status_code == 200:
            print("前端服务器运行正常")
            return True
        else:
            print(f"前端服务器返回异常状态码: {response.status_code}")
            return False
    except Exception as e:
        print(f"无法连接到前端服务器: {e}")
        return False

if __name__ == "__main__":
    success = test_frontend_server()
    sys.exit(0 if success else 1)
