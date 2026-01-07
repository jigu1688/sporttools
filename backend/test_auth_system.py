#!/usr/bin/env python3
# 体育教学辅助网站 - 认证系统测试脚本
# 测试用户注册、登录、权限验证等完整功能

import requests
import json
from datetime import datetime, date
import time

# API基础URL
BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

class AuthSystemTester:
    def __init__(self):
        self.session = requests.Session()
        self.access_token = None
        self.admin_token = None
        self.user_id = None
        self.admin_id = None
        
    def print_result(self, test_name, success, message="", data=None):
        """打印测试结果"""
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status} {test_name}")
        if message:
            print(f"   消息: {message}")
        if data and not success:
            print(f"   数据: {data}")
        print()
    
    def test_health_check(self):
        """测试健康检查"""
        try:
            response = self.session.get(f"{BASE_URL}/health")
            success = response.status_code == 200
            self.print_result("健康检查", success, 
                            f"状态码: {response.status_code}",
                            response.json() if success else None)
            return success
        except Exception as e:
            self.print_result("健康检查", False, str(e))
            return False
    
    def test_user_registration(self):
        """测试用户注册"""
        try:
            # 注册普通用户
            user_data = {
                "username": "test_user",
                "password": "pass123",
                "real_name": "测试用户",
                "email": "test@example.com",
                "role": "student"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/v1/auth/register",
                json=user_data,
                headers=HEADERS
            )
            
            if response.status_code == 201:
                user = response.json()
                self.user_id = user.get("id")
                self.print_result("用户注册", True, f"用户ID: {self.user_id}", user)
                return True
            else:
                self.print_result("用户注册", False, 
                                f"状态码: {response.status_code}",
                                response.json())
                return False
                
        except Exception as e:
            self.print_result("用户注册", False, str(e))
            return False
    
    def test_admin_registration(self):
        """测试管理员注册"""
        try:
            admin_data = {
                "username": "admin_user",
                "password": "admin123",
                "real_name": "系统管理员",
                "email": "admin@example.com",
                "role": "admin"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/v1/auth/register",
                json=admin_data,
                headers=HEADERS
            )
            
            if response.status_code == 201:
                admin = response.json()
                self.admin_id = admin.get("id")
                self.print_result("管理员注册", True, f"管理员ID: {self.admin_id}", admin)
                return True
            else:
                self.print_result("管理员注册", False,
                                f"状态码: {response.status_code}",
                                response.json())
                return False
                
        except Exception as e:
            self.print_result("管理员注册", False, str(e))
            return False
    
    def test_user_login(self):
        """测试用户登录"""
        try:
            login_data = {
                "username": "test_user",
                "password": "password123"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/v1/auth/login",
                json=login_data,
                headers=HEADERS
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.access_token = token_data.get("access_token")
                self.print_result("用户登录", True, 
                                f"令牌获取成功: {self.access_token[:20]}...",
                                token_data)
                return True
            else:
                self.print_result("用户登录", False,
                                f"状态码: {response.status_code}",
                                response.json())
                return False
                
        except Exception as e:
            self.print_result("用户登录", False, str(e))
            return False
    
    def test_admin_login(self):
        """测试管理员登录"""
        try:
            login_data = {
                "username": "admin_user",
                "password": "admin123"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/v1/auth/login",
                json=login_data,
                headers=HEADERS
            )
            
            if response.status_code == 200:
                token_data = response.json()
                self.admin_token = token_data.get("access_token")
                self.print_result("管理员登录", True,
                                f"管理员令牌获取成功: {self.admin_token[:20]}...",
                                token_data)
                return True
            else:
                self.print_result("管理员登录", False,
                                f"状态码: {response.status_code}",
                                response.json())
                return False
                
        except Exception as e:
            self.print_result("管理员登录", False, str(e))
            return False
    
    def test_get_current_user(self):
        """测试获取当前用户信息"""
        if not self.access_token:
            self.print_result("获取当前用户", False, "未获取到用户令牌")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            response = self.session.get(
                f"{BASE_URL}/api/v1/users/me/profile",
                headers=headers
            )
            
            if response.status_code == 200:
                user_info = response.json()
                self.print_result("获取当前用户", True, 
                                f"用户信息获取成功", user_info)
                return True
            else:
                self.print_result("获取当前用户", False,
                                f"状态码: {response.status_code}",
                                response.json())
                return False
                
        except Exception as e:
            self.print_result("获取当前用户", False, str(e))
            return False
    
    def test_user_list_access(self):
        """测试用户列表访问（需要管理员权限）"""
        if not self.admin_token:
            self.print_result("用户列表访问", False, "未获取到管理员令牌")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.admin_token}"}
            response = self.session.get(
                f"{BASE_URL}/api/v1/users",
                headers=headers
            )
            
            if response.status_code == 200:
                users = response.json()
                self.print_result("用户列表访问", True,
                                f"成功获取用户列表，共 {len(users)} 个用户",
                                users)
                return True
            else:
                self.print_result("用户列表访问", False,
                                f"状态码: {response.status_code}",
                                response.json())
                return False
                
        except Exception as e:
            self.print_result("用户列表访问", False, str(e))
            return False
    
    def test_unauthorized_access(self):
        """测试未授权访问"""
        try:
            # 不带令牌访问需要认证的接口
            response = self.session.get(f"{BASE_URL}/api/v1/users/me/profile")
            
            if response.status_code == 401:
                self.print_result("未授权访问测试", True,
                                "正确拒绝未授权访问",
                                response.json())
                return True
            else:
                self.print_result("未授权访问测试", False,
                                f"应该返回401，实际状态码: {response.status_code}",
                                response.json())
                return False
                
        except Exception as e:
            self.print_result("未授权访问测试", False, str(e))
            return False
    
    def test_change_password(self):
        """测试修改密码"""
        if not self.access_token:
            self.print_result("修改密码", False, "未获取到用户令牌")
            return False
            
        try:
            headers = {"Authorization": f"Bearer {self.access_token}"}
            password_data = {
                "current_password": "password123",
                "new_password": "newpassword456"
            }
            
            response = self.session.put(
                f"{BASE_URL}/api/v1/users/me/password",
                json=password_data,
                headers=headers
            )
            
            if response.status_code == 200:
                self.print_result("修改密码", True, "密码修改成功")
                
                # 尝试用新密码登录
                login_data = {
                    "username": "test_user",
                    "password": "newpassword456"
                }
                
                login_response = self.session.post(
                    f"{BASE_URL}/api/v1/auth/login",
                    json=login_data,
                    headers=HEADERS
                )
                
                if login_response.status_code == 200:
                    self.print_result("新密码验证", True, "新密码登录成功")
                    return True
                else:
                    self.print_result("新密码验证", False, "新密码登录失败")
                    return False
            else:
                self.print_result("修改密码", False,
                                f"状态码: {response.status_code}",
                                response.json())
                return False
                
        except Exception as e:
            self.print_result("修改密码", False, str(e))
            return False
    
    def test_wrong_credentials(self):
        """测试错误凭据登录"""
        try:
            wrong_data = {
                "username": "test_user",
                "password": "wrong_password"
            }
            
            response = self.session.post(
                f"{BASE_URL}/api/v1/auth/login",
                json=wrong_data,
                headers=HEADERS
            )
            
            if response.status_code == 401:
                self.print_result("错误凭据测试", True,
                                "正确拒绝错误凭据",
                                response.json())
                return True
            else:
                self.print_result("错误凭据测试", False,
                                f"应该返回401，实际状态码: {response.status_code}",
                                response.json())
                return False
                
        except Exception as e:
            self.print_result("错误凭据测试", False, str(e))
            return False
    
    def run_all_tests(self):
        """运行所有测试"""
        print("=" * 60)
        print("🚀 开始体育教学辅助网站认证系统测试")
        print("=" * 60)
        print()
        
        tests = [
            ("健康检查", self.test_health_check),
            ("用户注册", self.test_user_registration),
            ("管理员注册", self.test_admin_registration),
            ("用户登录", self.test_user_login),
            ("管理员登录", self.test_admin_login),
            ("获取当前用户", self.test_get_current_user),
            ("用户列表访问", self.test_user_list_access),
            ("未授权访问", self.test_unauthorized_access),
            ("修改密码", self.test_change_password),
            ("错误凭据", self.test_wrong_credentials),
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"🔄 正在执行: {test_name}")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                print(f"❌ {test_name} 测试执行异常: {str(e)}")
            print("-" * 40)
            time.sleep(0.5)  # 稍微延迟避免请求过快
        
        print("=" * 60)
        print(f"🎯 测试完成: {passed}/{total} 通过")
        print("=" * 60)
        
        if passed == total:
            print("🎉 所有测试通过！认证系统运行正常！")
        else:
            print(f"⚠️  有 {total - passed} 个测试失败，请检查相关功能。")
        
        return passed == total

if __name__ == "__main__":
    tester = AuthSystemTester()
    tester.run_all_tests()