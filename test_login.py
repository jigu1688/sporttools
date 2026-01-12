#!/usr/bin/env python3
"""
测试登录功能是否正常工作
"""

import requests
import sys

# 测试配置
BASE_URL = "http://localhost:5173"
LOGIN_ENDPOINT = f"{BASE_URL}/api/v1/auth/login"

# 默认测试账户（从database.py中获取的正确默认账户）
DEFAULT_ACCOUNT = {
    "username": "admin_user",
    "password": "Admin123!"
}

def test_login():
    """测试登录功能"""
    print(f"测试登录功能...")
    print(f"API端点: {LOGIN_ENDPOINT}")
    print(f"测试账户: {DEFAULT_ACCOUNT['username']} / {DEFAULT_ACCOUNT['password']}")
    
    try:
        # 发送登录请求
        response = requests.post(
            LOGIN_ENDPOINT,
            json=DEFAULT_ACCOUNT,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        print(f"\n响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        # 检查响应
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print(f"\n✅ 登录成功！")
                print(f"   访问令牌: {data['access_token'][:20]}...")
                print(f"   刷新令牌: {data['refresh_token'][:20]}...")
                print(f"   用户信息: {data['user_info']}")
                return True
            else:
                print(f"\n❌ 登录失败：响应中缺少access_token")
                return False
        else:
            print(f"\n❌ 登录失败：状态码 {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError as e:
        print(f"\n❌ 连接失败：无法连接到前端服务")
        print(f"   错误信息: {str(e)}")
        return False
    except requests.exceptions.Timeout:
        print(f"\n❌ 请求超时：前端服务未在5秒内响应")
        return False
    except Exception as e:
        print(f"\n❌ 测试失败：发生未知错误")
        print(f"   错误信息: {str(e)}")
        return False

def test_direct_backend_login():
    """直接测试后端登录API"""
    print(f"\n\n测试直接后端登录...")
    direct_url = "http://localhost:8002/api/v1/auth/login"
    print(f"直接后端API端点: {direct_url}")
    
    try:
        # 直接发送登录请求到后端
        response = requests.post(
            direct_url,
            json=DEFAULT_ACCOUNT,
            headers={"Content-Type": "application/json"},
            timeout=5
        )
        
        print(f"响应状态码: {response.status_code}")
        print(f"响应内容: {response.text}")
        
        if response.status_code == 200:
            data = response.json()
            if "access_token" in data:
                print(f"✅ 直接后端登录成功！")
                return True
            else:
                print(f"❌ 直接后端登录失败：响应中缺少access_token")
                return False
        else:
            print(f"❌ 直接后端登录失败：状态码 {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ 直接后端测试失败：{str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("体育教学辅助系统 - 登录功能测试")
    print("=" * 60)
    
    # 先测试通过前端代理的登录（这是主要测试目标）
    proxy_success = test_login()
    
    print(f"\n\n" + "=" * 60)
    print("测试总结:")
    print(f"通过前端代理登录: {'✅ 成功' if proxy_success else '❌ 失败'}")
    
    # 退出状态码
    if proxy_success:
        print("\n🎉 前端登录测试通过！登录功能正常工作。")
        sys.exit(0)
    else:
        print("\n⚠️  前端登录测试失败，请检查配置和服务状态。")
        sys.exit(1)
