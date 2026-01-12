#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""测试 POST /api/v1/students 是否已修复"""

import requests
import json

token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1IiwiZXhwIjoxNzM2NDI3MjAwLCJpYXQiOjE3MzY0MjM2MDAsInNjb3BlcyI6WyJhZG1pbiJdfQ.O1RFKBZPnFJPL8EGJtNs0j4g7cA8v3vHqE0qJfGX1sU'

headers = {'Authorization': f'Bearer {token}'}
data = {
    'student_no': 'POST_TEST_001',
    'real_name': 'POST 测试',
    'gender': 'male',
    'birth_date': '2008-01-01',
    'enrollment_date': '2024-01-01',
    'status': 'active'
}

print("测试 POST /api/v1/students...")
response = requests.post('http://localhost:8002/api/v1/students', json=data, headers=headers)
print(f'Status Code: {response.status_code}')
print(f'Response: {response.text[:300]}')

if response.status_code == 201:
    print("\n✅ POST 端点工作正常！405错误已修复！")
elif response.status_code == 405:
    print("\n❌ 仍然返回405。问题未解决。")
else:
    print(f"\n⚠️ 返回 {response.status_code}")
