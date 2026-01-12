#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import requests
import json

# 登录获取token
login_url = 'http://localhost:8002/api/v1/auth/login'
login_data = {'username': 'jigu', 'password': 'jigu123'}  # 尝试jigu用户

try:
    response = requests.post(login_url, json=login_data, timeout=5)
    print(f"登录状态码: {response.status_code}")
    
    if response.status_code != 200:
        print(f"登录失败: {response.text}")
        exit(1)
    
    token_data = response.json()
    token = token_data.get('access_token')
    print(f"✓ 获取Token成功")
    
    # 测试学生API
    headers = {'Authorization': f'Bearer {token}'}
    students_url = 'http://localhost:8002/api/v1/students/?skip=0&limit=5'
    
    response = requests.get(students_url, headers=headers, timeout=5)
    print(f"\n学生API状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"总学生数: {data.get('total', 0)}")
        print(f"返回记录数: {len(data.get('data', []))}")
        if data.get('data'):
            print(f"第一条学生: {data['data'][0].get('real_name', 'N/A')}")
    else:
        print(f"学生API错误: {response.text}")
    
    # 测试班级API
    classes_url = 'http://localhost:8002/api/v1/classes?skip=0&limit=5'
    response = requests.get(classes_url, headers=headers, timeout=5)
    print(f"\n班级API状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"总班级数: {data.get('total', 0)}")
        print(f"返回记录数: {len(data.get('data', []))}")
        if data.get('data'):
            print(f"第一个班级: {data['data'][0].get('class_name', 'N/A')}")
    else:
        print(f"班级API错误: {response.text}")
        
    print("\n✓ API测试完成！")
    
except Exception as e:
    print(f"错误: {e}")
    import traceback
    traceback.print_exc()
