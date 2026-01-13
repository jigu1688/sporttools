"""
完整测试脚本：验证 academic_year 移除及 school_year_id 整合的功能

测试场景：
1. 创建班级（带 school_year_id）
2. 创建学生（无 academic_year）
3. 分配学生到班级（无 academic_year 参数）
4. 查询班级学生列表（不需要 academic_year 过滤）
5. 查询体测历史（使用 school_year_id 过滤）
"""

import requests
import json
from datetime import datetime, date

BASE_URL = "http://127.0.0.1:8002/api/v1"
HEADERS = {"Content-Type": "application/json"}

# 全局变量存储 token 和相关 ID
auth_token = None
admin_user_id = None
school_id = 1
school_year_id = 1
test_class_id = None
test_student_id = None


def login():
    """登录获取 token"""
    global auth_token, admin_user_id
    try:
        response = requests.post(
            f"{BASE_URL}/auth/login",
            headers=HEADERS,
            json={"username": "admin_user", "password": "Admin123!"}
        )
        if response.status_code == 200:
            data = response.json()
            auth_token = data.get("access_token")
            admin_user_id = data.get("user_info", {}).get("id")
            print(f"✓ 登录成功，token: {auth_token[:20]}...")
            return True
        else:
            print(f"❌ 登录失败: {response.text}")
            return False
    except Exception as e:
        print(f"❌ 登录异常: {e}")
        return False


def get_auth_headers():
    """获取认证 headers"""
    return {
        **HEADERS,
        "Authorization": f"Bearer {auth_token}"
    }


def test_create_class():
    """测试创建班级（带 school_year_id，无 academic_year）"""
    global test_class_id
    try:
        class_data = {
            "class_name": f"测试班级-{datetime.now().strftime('%H%M%S')}",
            "grade": "高一",
            "grade_level": 10,
            "class_teacher_name": "测试教师",
            "max_student_count": 50,
            "start_date": date.today().isoformat(),
            "school_id": school_id,
            "school_year_id": school_year_id
        }
        response = requests.post(
            f"{BASE_URL}/classes",
            headers=get_auth_headers(),
            json=class_data
        )
        if response.status_code in [200, 201]:
            data = response.json()
            test_class_id = data.get("id")
            print(f"✓ 创建班级成功: {test_class_id} - {class_data['class_name']}")
            # 验证响应中是否有 school_year_id
            if "school_year_id" in data:
                print(f"  - school_year_id: {data['school_year_id']}")
            # 验证响应中是否 无 academic_year（应该没有）
            if "academic_year" not in data:
                print(f"  ✓ 响应中无 academic_year（符合预期）")
            return True
        else:
            print(f"❌ 创建班级失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ 创建班级异常: {e}")
        return False


def test_create_student():
    """测试创建学生（无 academic_year）"""
    global test_student_id
    try:
        student_data = {
            "student_no": f"S{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "real_name": f"测试学生-{datetime.now().strftime('%H%M%S')}",
            "gender": "male",
            "birth_date": "2008-01-01",
            "enrollment_date": date.today().isoformat(),
            "status": "active"
        }
        response = requests.post(
            f"{BASE_URL}/students",
            headers=get_auth_headers(),
            json=student_data
        )
        if response.status_code in [200, 201]:
            data = response.json()
            test_student_id = data.get("id")
            print(f"✓ 创建学生成功: {test_student_id} - {student_data['real_name']}")
            # 验证响应中是否 无 academic_year
            if "academic_year" not in data:
                print(f"  ✓ 响应中无 academic_year（符合预期）")
            return True
        else:
            print(f"❌ 创建学生失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ 创建学生异常: {e}")
        return False


def test_assign_student_to_class():
    """测试分配学生到班级（无 academic_year 参数）"""
    try:
        if not test_class_id or not test_student_id:
            print("❌ 跳过分配学生测试：班级或学生不存在")
            return False
        
        # 注意：新 API 不需要 academic_year 参数
        response = requests.post(
            f"{BASE_URL}/students/{test_student_id}/classes",
            headers=get_auth_headers(),
            params={
                "class_id": test_class_id,
                # 无 academic_year 参数
                "join_date": date.today().isoformat()
            }
        )
        if response.status_code in [200, 201]:
            data = response.json()
            print(f"✓ 分配学生到班级成功")
            print(f"  - 学生ID: {test_student_id}, 班级ID: {test_class_id}")
            return True
        else:
            print(f"❌ 分配学生失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ 分配学生异常: {e}")
        return False


def test_get_class_students():
    """测试查询班级学生列表（使用 school_year_id，无 academic_year）"""
    try:
        if not test_class_id:
            print("❌ 跳过查询班级学生测试：班级不存在")
            return False
        
        # 新 API 使用 school_year_id 过滤
        response = requests.get(
            f"{BASE_URL}/classes/{test_class_id}/students",
            headers=get_auth_headers(),
            params={
                "school_year_id": school_year_id
                # 无 academic_year 参数
            }
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 查询班级学生成功: 获取 {len(data)} 名学生")
            if len(data) > 0:
                first_student = data[0]
                print(f"  - 学生示例: {first_student.get('real_name')}")
                # 验证响应中是否有 school_year_id 和 academic_year（用于展示）
                if "school_year_id" in first_student:
                    print(f"    - school_year_id: {first_student['school_year_id']}")
                if "academic_year" in first_student:
                    print(f"    - academic_year（用于显示）: {first_student['academic_year']}")
            return True
        else:
            print(f"❌ 查询班级学生失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ 查询班级学生异常: {e}")
        return False


def test_get_physical_test_history():
    """测试查询体测历史（使用 school_year_id，无 academic_year）"""
    try:
        # 新 API 使用 school_year_id 过滤，移除了 academic_year
        response = requests.get(
            f"{BASE_URL}/physical-tests/history",
            headers=get_auth_headers(),
            params={
                "school_year_id": school_year_id,
                # 无 academic_year 参数
                "skip": 0,
                "limit": 10
            }
        )
        if response.status_code == 200:
            data = response.json()
            print(f"✓ 查询体测历史成功: 获取 {len(data)} 条记录")
            if len(data) > 0:
                first_record = data[0]
                print(f"  - 体测示例: {first_record.get('studentName')}")
                # 验证返回中的 academic_year 来自 school_year join
                if "academic_year" in first_record:
                    print(f"    - academic_year: {first_record['academic_year']}")
            return True
        else:
            print(f"❌ 查询体测历史失败: {response.status_code} - {response.text}")
            return False
    except Exception as e:
        print(f"❌ 查询体测历史异常: {e}")
        return False


def run_all_tests():
    """运行所有测试"""
    print("=" * 60)
    print("开始测试 academic_year 移除和 school_year_id 整合")
    print("=" * 60)
    
    tests = [
        ("登录", login),
        ("创建班级", test_create_class),
        ("创建学生", test_create_student),
        ("分配学生到班级", test_assign_student_to_class),
        ("查询班级学生列表", test_get_class_students),
        ("查询体测历史", test_get_physical_test_history),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n[测试] {test_name}...")
        result = test_func()
        results.append((test_name, result))
    
    print("\n" + "=" * 60)
    print("测试总结")
    print("=" * 60)
    passed = sum(1 for _, result in results if result)
    total = len(results)
    for test_name, result in results:
        status = "✓ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
    
    print(f"\n通过率: {passed}/{total} ({100 * passed // total}%)")
    return passed == total


if __name__ == "__main__":
    import sys
    success = run_all_tests()
    sys.exit(0 if success else 1)
