# 体育教学辅助系统 - 代码质量评估报告

**评估日期**：2026年1月10日  
**评估范围**：全系统前后端代码  
**评估版本**：1.0.0

---

## 一、项目概述

### 技术栈
| 层级 | 技术 |
|------|------|
| 前端 | React 18 + Redux Toolkit + Ant Design + Vite |
| 后端 | FastAPI + SQLAlchemy + SQLite |
| 认证 | JWT Token |

### 功能模块
1. **基础管理**：学校信息、学年管理、班级管理、学生管理、用户管理
2. **体测系统**：成绩管理、统计分析、评分标准
3. **运动会编排**：运动会管理、项目管理、报名管理、成绩录入、赛程编排

---

## 二、发现的问题汇总

### 🔴 严重问题 (需立即修复)

#### 1. API端口配置不一致
- **位置**：[sport-web/src/utils/apiClient.js](sport-web/src/utils/apiClient.js#L4)
- **问题**：前端默认端口 `8001`，后端实际运行端口 `8002`
- **影响**：导致前端无法正常连接后端API

#### 2. 学生API缺少认证依赖
- **位置**：[sport-api/routes/students.py](sport-api/routes/students.py#L29-L70)
- **问题**：所有学生API端点没有 `current_user` 依赖，任何人可访问
- **影响**：严重安全漏洞，学生数据可被未授权访问

#### 3. 体测模块路由前缀重复
- **位置**：[sport-api/routes/physical_test.py](sport-api/routes/physical_test.py#L31-L34)
- **问题**：路由器定义了 `prefix="/api/v1/physical-tests"`，同时 main.py 中又注册了相同前缀
- **影响**：导致实际路径变成 `/api/v1/physical-tests/api/v1/physical-tests/...`

#### 4. 学年管理API路径不一致
- **位置**：
  - 前端：[sport-web/src/pages/SchoolYearManagement.jsx](sport-web/src/pages/SchoolYearManagement.jsx)
  - 后端：[sport-api/routes/school_year.py](sport-api/routes/school_year.py)
- **问题**：前端调用 `/school-years/current`，后端定义 `/active`
- **影响**：学年管理功能无法正常工作

#### 5. 运动会模块权限控制缺失
- **位置**：[sport-api/routes/sports_meet.py](sport-api/routes/sports_meet.py)
- **问题**：所有运动会接口没有权限控制装饰器
- **影响**：任何已登录用户可创建、修改、删除运动会数据

---

### 🟡 中等问题 (建议尽快修复)

#### 6. 前端字段映射不完整
- **位置**：[sport-web/src/store/dataSlice.js](sport-web/src/store/dataSlice.js#L332-L395)
- **问题**：`fetchStudents`, `createStudentAPI`, `updateStudentAPI` 三个处理器的字段转换不一致
- **影响**：学生数据显示和更新可能出现字段丢失

#### 7. 删除学生逻辑错误
- **位置**：[sport-web/src/store/dataSlice.js](sport-web/src/store/dataSlice.js#L395-L410)
- **问题**：先删除学生再查找，导致班级学生数更新逻辑永远不执行
- **影响**：删除学生后班级人数统计不准确

#### 8. 学年管理字段名称不一致
- **位置**：[sport-web/src/pages/SchoolYearManagement.jsx](sport-web/src/pages/SchoolYearManagement.jsx)
- **问题**：前端使用 `createdAt`（驼峰式），后端返回 `created_at`（下划线式）
- **影响**：创建时间等字段无法正确显示

#### 9. 用户详情接口权限不完善
- **位置**：[sport-api/routes/users.py](sport-api/routes/users.py)
- **问题**：任何已登录用户可查看任意用户详细信息
- **影响**：存在用户信息泄露风险

#### 10. 数据库级联删除缺失
- **位置**：[sport-api/models.py](sport-api/models.py)
- **问题**：多个外键关系没有设置级联删除
- **影响**：删除父记录时可能出现外键约束错误

---

### 🟢 轻微问题 (可优化项)

#### 11. 学生CRUD缺少字段验证
- **位置**：[sport-api/crud/student_crud.py](sport-api/crud/student_crud.py#L152-L170)
- **问题**：直接使用 `setattr` 更新所有传入字段，没有白名单验证
- **建议**：添加允许更新的字段白名单

#### 12. 运动会模块功能不完整
- **位置**：[sport-api/routes/sports_meet.py](sport-api/routes/sports_meet.py)
- **问题**：缺少统计汇总、批量审核、批量录入成绩等常用接口
- **建议**：补充相关功能接口

#### 13. 前端未使用导入
- **位置**：多个前端组件文件
- **问题**：存在导入了但未使用的模块
- **建议**：清理未使用的导入

---

## 三、可实施修复方案

### 第一阶段：紧急修复 (预计 2-3 小时)

| 序号 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| 1 | 修改前端API默认端口为8002 | apiClient.js | 5分钟 |
| 2 | 为学生API添加认证依赖 | routes/students.py | 30分钟 |
| 3 | 修复体测路由前缀重复 | routes/physical_test.py | 10分钟 |
| 4 | 统一学年管理API路径 | routes/school_year.py | 20分钟 |
| 5 | 为运动会API添加权限控制 | routes/sports_meet.py | 40分钟 |

### 第二阶段：重要修复 (预计 3-4 小时)

| 序号 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| 6 | 统一前端学生字段映射 | dataSlice.js | 45分钟 |
| 7 | 修复删除学生逻辑错误 | dataSlice.js | 15分钟 |
| 8 | 修复学年管理字段名称 | SchoolYearManagement.jsx | 30分钟 |
| 9 | 完善用户详情权限控制 | routes/users.py | 30分钟 |
| 10 | 添加数据库级联删除 | models.py | 60分钟 |

### 第三阶段：优化改进 (预计 2-3 小时)

| 序号 | 任务 | 文件 | 预计时间 |
|------|------|------|----------|
| 11 | 添加学生CRUD字段验证 | crud/student_crud.py | 30分钟 |
| 12 | 补充运动会功能接口 | routes/sports_meet.py | 90分钟 |
| 13 | 清理未使用的导入 | 多个文件 | 30分钟 |

---

## 四、具体修复代码

### 修复1：API端口配置

```javascript
// sport-web/src/utils/apiClient.js 第4行
// 修改前
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8001'}/api/v1`

// 修改后
const API_BASE_URL = `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8002'}/api/v1`
```

### 修复2：学生API认证

```python
# sport-api/routes/students.py
from auth import get_current_user
from models import User

@router.get("/", response_model=StudentListResponse)
async def get_students(
    page: int = Query(1, ge=1, description="页码"),
    # ... 其他参数
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)  # 添加此行
):
```

### 修复3：体测路由前缀

```python
# sport-api/routes/physical_test.py 第31-34行
# 修改前
router = APIRouter(
    prefix="/api/v1/physical-tests",
    tags=["physical-tests"],
    responses={404: {"description": "Not found"}},
)

# 修改后
router = APIRouter(
    tags=["physical-tests"],
    responses={404: {"description": "Not found"}},
)
```

### 修复4：统一学生字段映射

```javascript
// sport-web/src/store/dataSlice.js
// 添加统一的学生数据标准化函数
const normalizeStudent = (student = {}) => ({
  ...student,
  name: student.real_name || student.name,
  birthDate: student.birth_date || student.birthDate,
  idCard: student.id_card || student.idCard,
  studentId: student.student_no || student.studentId,
  educationId: student.education_id || student.educationId,
  phone: student.phone,
  address: student.address,
  grade: student.current_grade || student.grade,
  className: student.current_class_name || student.className,
  classId: student.current_class_id || student.classId
})

// 在所有学生相关的 fulfilled 处理器中使用此函数
```

### 修复5：删除学生逻辑

```javascript
// sport-web/src/store/dataSlice.js
.addCase(deleteStudentAPI.fulfilled, (state, action) => {
  // 先查找要删除的学生
  const student = state.students.find(s => s.id === action.payload)
  
  // 更新班级学生数
  if (student) {
    const classIndex = state.classes.findIndex(cls => cls.id === student.classId)
    if (classIndex !== -1) {
      state.classes[classIndex].studentCount = Math.max(0, state.classes[classIndex].studentCount - 1)
    }
  }
  
  // 最后删除学生
  state.students = state.students.filter(s => s.id !== action.payload)
})
```

---

## 五、测试建议

修复完成后，建议执行以下测试：

### 功能测试
- [ ] 登录/登出功能
- [ ] 学生CRUD操作
- [ ] 班级CRUD操作
- [ ] 学年管理功能
- [ ] 体测成绩管理
- [ ] 运动会管理

### 安全测试
- [ ] 未登录用户访问受保护页面
- [ ] 普通用户访问管理功能
- [ ] API权限验证

### 数据一致性测试
- [ ] 删除班级后学生关联
- [ ] 删除学生后班级人数
- [ ] 学年切换后数据

---

## 六、结论

本系统存在 **5个严重问题**、**5个中等问题** 和 **3个轻微问题**。

**建议优先级**：
1. 🔴 紧急修复第一阶段的5个问题（安全性和功能可用性）
2. 🟡 尽快修复第二阶段的5个问题（数据完整性和用户体验）
3. 🟢 逐步优化第三阶段的改进项（代码质量）

**总体评估**：项目框架完整，功能模块划分清晰，但存在较多的安全漏洞和前后端不一致问题，需要系统性修复后才能投入生产使用。

---

**报告生成者**：GitHub Copilot  
**审核状态**：待用户确认执行
