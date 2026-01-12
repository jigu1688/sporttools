import requests
import json

# 登录获取token
login_url = 'http://localhost:8002/api/v1/auth/login'
login_data = {'username': 'admin', 'password': 'admin123'}

response = requests.post(login_url, json=login_data)
print(f"登录状态码: {response.status_code}")

if response.status_code == 200:
    token_data = response.json()
    token = token_data.get('access_token')
    print(f"✓ 获取Token成功")
    
    # 测试学生API
    headers = {'Authorization': f'Bearer {token}'}
    students_url = 'http://localhost:8002/api/v1/students/?skip=0&limit=5'
    
    response = requests.get(students_url, headers=headers)
    print(f"\n学生API状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"总学生数: {data.get('total', 0)}")
        print(f"返回记录数: {len(data.get('data', []))}")
        if data.get('data'):
            print(f"第一条记录: {json.dumps(data['data'][0], ensure_ascii=False, indent=2)}")
    else:
        print(f"学生API错误: {response.text}")
    
    # 测试班级API
    classes_url = 'http://localhost:8002/api/v1/classes?skip=0&limit=5'
    response = requests.get(classes_url, headers=headers)
    print(f"\n班级API状态码: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        print(f"总班级数: {data.get('total', 0)}")
        print(f"返回记录数: {len(data.get('data', []))}")
        if data.get('data'):
            print(f"第一条记录: {json.dumps(data['data'][0], ensure_ascii=False, indent=2)}")
    else:
        print(f"班级API错误: {response.text}")
else:
    print(f"登录失败: {response.text}")
