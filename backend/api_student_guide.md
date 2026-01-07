# 学生档案管理API使用指南

## 概述
学生档案管理模块提供了完整的CRUD操作，支持分页查询、搜索过滤、批量操作等功能。

## API端点

### 1. 获取学生列表
**GET** `/api/v1/students/`

#### 查询参数：
- `page`: 页码（默认1）
- `page_size`: 每页数量（默认10，最大100）
- `search`: 搜索关键词（姓名、学籍号、身份证号）
- `class_id`: 班级ID过滤
- `grade`: 年级过滤
- `gender`: 性别过滤（male/female）
- `status`: 状态过滤（active/inactive/graduated/transferred/suspended）
- `sports_level`: 体育水平过滤（excellent/good/average/poor）

#### 响应格式：
```json
{
  "total": 10,
  "page": 1,
  "page_size": 10,
  "total_pages": 1,
  "items": [
    {
      "id": 1,
      "student_no": "2023001",
      "real_name": "张三",
      "gender": "male",
      "birth_date": "2005-03-15",
      "enrollment_date": "2023-09-01",
      "status": "active",
      "sports_level": "good"
    }
  ]
}
```

### 2. 获取学生详细信息
**GET** `/api/v1/students/{student_id}`

#### 响应格式：
```json
{
  "id": 1,
  "student_no": "2023001",
  "real_name": "张三",
  "gender": "male",
  "birth_date": "2005-03-15",
  "id_card": "123456789012345678",
  "enrollment_date": "2023-09-01",
  "status": "active",
  "sports_level": "good",
  "class_relations": [
    {
      "relation_id": 1,
      "class_name": "高一年级1班",
      "grade": "高一",
      "academic_year": "2023-2024",
      "join_date": "2023-09-01",
      "is_current": true,
      "status": "active"
    }
  ]
}
```

### 3. 创建学生
**POST** `/api/v1/students/`

#### 请求体：
```json
{
  "student_no": "2023002",
  "real_name": "李四",
  "gender": "female",
  "birth_date": "2005-06-20",
  "id_card": "876543210987654321",
  "enrollment_date": "2023-09-01",
  "status": "active",
  "sports_level": "average"
}
```

#### 响应格式：
```json
{
  "id": 2,
  "student_no": "2023002",
  "real_name": "李四",
  "gender": "female",
  "birth_date": "2005-06-20",
  "enrollment_date": "2023-09-01",
  "status": "active",
  "sports_level": "average",
  "created_at": "2024-01-03T10:30:00"
}
```

### 4. 更新学生信息
**PUT** `/api/v1/students/{student_id}`

#### 请求体：
```json
{
  "real_name": "李四",
  "sports_level": "good",
  "special_notes": "体育特长生"
}
```

### 5. 删除学生
**DELETE** `/api/v1/students/{student_id}`

#### 响应格式：
```json
{
  "success": true,
  "message": "学生删除成功"
}
```

### 6. 获取学生班级历史
**GET** `/api/v1/students/{student_id}/classes`

### 7. 分配学生到班级
**POST** `/api/v1/students/{student_id}/classes`

#### 查询参数：
- `class_id`: 班级ID
- `academic_year`: 学年（必需）
- `join_date`: 加入日期（可选，默认为今天）

### 8. 从班级移除学生
**DELETE** `/api/v1/students/{student_id}/classes/{class_id}`

#### 查询参数：
- `academic_year`: 学年（必需）
- `leave_date`: 离开日期（可选，默认为今天）

## 数据模型

### 枚举值
- **性别**: `male`, `female`
- **状态**: `active`, `inactive`, `graduated`, `transferred`, `suspended`
- **体育水平**: `excellent`, `good`, `average`, `poor`

### 必填字段
- `student_no`: 学籍号（唯一）
- `real_name`: 真实姓名
- `gender`: 性别
- `birth_date`: 出生日期
- `enrollment_date`: 入学日期

### 可选字段
- `id_card`: 身份证号
- `photo_url`: 照片地址
- `health_status`: 健康状况
- `allergy_info`: 过敏信息
- `special_notes`: 特殊备注
- `sports_level`: 体育水平
- `sports_specialty`: 体育特长
- `physical_limitations`: 身体限制
- `graduation_date`: 毕业日期

## 使用示例

### Python示例
```python
import requests

BASE_URL = "http://localhost:8000"

# 获取学生列表
response = requests.get(f"{BASE_URL}/api/v1/students/?page=1&page_size=10")
students = response.json()

# 创建学生
student_data = {
    "student_no": "2023003",
    "real_name": "王五",
    "gender": "male",
    "birth_date": "2005-01-10",
    "enrollment_date": "2023-09-01"
}
response = requests.post(f"{BASE_URL}/api/v1/students/", json=student_data)
new_student = response.json()

# 搜索学生
response = requests.get(f"{BASE_URL}/api/v1/students/?search=王五")
filtered_students = response.json()
```

### JavaScript示例
```javascript
const BASE_URL = "http://localhost:8000";

// 获取学生列表
const response = await fetch(`${BASE_URL}/api/v1/students/?page=1&page_size=10`);
const students = await response.json();

// 创建学生
const studentData = {
    student_no: "2023003",
    real_name: "王五",
    gender: "male",
    birth_date: "2005-01-10",
    enrollment_date: "2023-09-01"
};

const createResponse = await fetch(`${BASE_URL}/api/v1/students/`, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    body: JSON.stringify(studentData)
});

const newStudent = await createResponse.json();
```

## 错误处理

### 常见错误码
- `400`: 请求参数错误或数据验证失败
- `404`: 学生不存在
- `422`: 数据格式错误（枚举值不正确等）
- `500`: 服务器内部错误

### 错误响应格式
```json
{
  "success": false,
  "message": "创建学生失败",
  "detail": "学籍号已存在"
}
```