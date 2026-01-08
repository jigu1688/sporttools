# 学年管理系统设计方案

## 1. 数据结构设计

### 1.1 核心数据实体

#### 1.1.1 学年（SchoolYear）
```javascript
{
  id: 1,                      // 学年ID
  yearName: '2025-2026学年',  // 学年名称
  startDate: '2025-09-01',    // 起始日期
  endDate: '2026-08-31',      // 结束日期
  status: 'active',           // 状态：active（当前）/ completed（已完成）
  importedAt: '2025-09-01',   // 数据导入时间
  importedBy: '管理员',       // 数据导入人
  completedAt: '',            // 学年结束时间
  completedBy: ''             // 学年结束操作人
}
```

#### 1.1.2 当前学年（CurrentSchoolYear）
```javascript
{
  id: 1,
  yearName: '2025-2026学年',
  startDate: '2025-09-01',
  endDate: '2026-08-31',
  status: 'active'
}
```

#### 1.1.3 学生历史记录（StudentHistory）
```javascript
{
  id: 1,
  studentId: 1,               // 学生ID
  educationId: '25083338',    // 教育ID
  name: '学生1',              // 学生姓名
  schoolYearId: 2,            // 学年ID
  schoolYearName: '2024-2025学年', // 学年名称
  grade: '一年级',           // 年级
  className: '主校区1班',     // 班级
  gender: 'male',            // 性别
  age: 17,                   // 年龄
  status: '在学',            // 状态
  finalScore: 85,            // 最终成绩
  gradeLevel: '良好',        // 等级
  testRecords: [1, 2]        // 关联的测试记录ID
}
```

#### 1.1.4 测试记录（TestRecord）
```javascript
{
  id: 1,
  studentName: '学生1',
  educationId: '20240701001',
  gender: 'male',
  grade: '一年级',
  className: '主校区1班',
  testDate: '2026-01-04',
  schoolYearId: 1,           // 新增：学年ID
  schoolYearName: '2025-2026学年', // 新增：学年名称
  testItems: {
    height: 120,
    weight: 25,
    vitalCapacity: 1500,
    run50m: 8.5,
    sitAndReach: 15
  },
  totalScore: 85,
  gradeLevel: '良好',
  isApproved: true,
  approvedBy: '管理员',
  approvedTime: '2026-01-04 10:00:00'
}
```

## 2. 学年结束操作流程

### 2.1 功能概述
学年结束操作是管理员手动触发的学年归档流程，将当前学年的学生数据和成绩进行归档保存，为新学年的数据维护做准备。

### 2.2 操作流程

1. **操作触发**
   - 管理员登录系统，进入「学年管理」页面
   - 点击「结束当前学年」按钮

2. **数据验证**
   - 系统验证当前学年是否存在未处理的测试记录
   - 验证当前学年是否有学生数据
   - 显示学年统计信息供管理员确认

3. **确认操作**
   - 管理员确认学年结束操作
   - 系统提示操作不可逆，需要再次确认

4. **数据归档**
   - 将当前学年所有学生数据归档到`studentHistories`
   - 关联学生的测试记录到历史记录
   - 计算并保存学生的最终成绩和等级
   - 更新学年状态为「已完成」
   - 记录操作时间和操作人

5. **数据清空**
   - 清空当前学年的学生列表
   - 清空当前学年的班级列表
   - 保留测试项目配置和历史数据

6. **操作完成**
   - 显示操作成功提示
   - 刷新页面，显示新学年准备状态

### 2.3 核心逻辑

```javascript
// 学年结束操作核心逻辑
completeSchoolYear: (state, action) => {
  // 1. 更新学年状态为已完成
  const yearIndex = state.schoolYears.findIndex(year => year.id === action.payload.yearId)
  if (yearIndex !== -1) {
    state.schoolYears[yearIndex] = {
      ...state.schoolYears[yearIndex],
      status: 'completed',
      completedAt: action.payload.completedAt,
      completedBy: action.payload.completedBy
    }
  }
  
  // 2. 将当前学年学生数据归档到历史记录
  state.students.forEach(student => {
    state.studentHistories.push({
      id: state.studentHistories.length + 1,
      studentId: student.id,
      educationId: student.educationId,
      name: student.name,
      schoolYearId: action.payload.yearId,
      schoolYearName: state.schoolYears[yearIndex].yearName,
      grade: student.grade,
      className: student.className,
      gender: student.gender,
      age: student.age,
      status: student.status,
      finalScore: 0, // 实际应用中应该计算最终成绩
      gradeLevel: '',
      testRecords: [] // 实际应用中应该关联测试记录
    })
  })
  
  // 3. 清空当前学生和班级数据，准备新学年
  state.students = []
  state.classes = []
}
```

## 3. 新学年开启操作流程

### 3.1 功能概述
新学年开启操作是在学年结束后，为新学年准备数据结构，导入新学年学生数据的流程。

### 3.2 操作流程

1. **创建新学年**
   - 管理员进入「学年管理」页面
   - 点击「创建新学年」按钮
   - 填写新学年的基本信息（学年名称、起始日期、结束日期）
   - 系统生成新学年记录

2. **设置当前学年**
   - 选择新创建的学年
   - 点击「设置为当前学年」按钮
   - 系统更新当前学年状态

3. **导入新学年数据**
   - 进入「学生管理」页面
   - 使用导入功能，上传来自上层学籍系统的学生数据
   - 系统验证数据格式和完整性
   - 导入数据到当前学年的学生列表

4. **数据初始化**
   - 系统自动生成班级信息
   - 初始化学生的基本信息
   - 准备测试数据录入环境

5. **操作完成**
   - 显示导入成功提示
   - 显示新学年的学生统计信息

## 4. 数据查询和索引功能

### 4.1 历史数据查询

1. **按学年查询**
   - 提供学年下拉选择器
   - 选择特定学年后，显示该学年的所有学生数据
   - 支持按班级、性别、成绩等级等筛选

2. **按学生查询**
   - 提供学生教育ID或姓名搜索
   - 显示学生在所有学年的历史记录
   - 支持查看学生的历年成绩变化趋势

3. **统计数据查询**
   - 按学年统计学生成绩分布
   - 按年级统计各测试项目的平均分
   - 生成历年成绩对比报表

### 4.2 数据索引设计

- **学年索引**：使用`schoolYearId`作为主要索引，关联学生、班级和测试记录
- **学生索引**：使用`educationId`作为唯一标识，跨学年关联学生历史记录
- **日期索引**：使用`testDate`和`schoolYear`关联时间维度的数据

## 5. UI界面设计

### 5.1 学年管理页面

1. **当前学年信息展示**
   - 显示当前学年的基本信息
   - 显示当前学年的学生统计数据
   - 提供「结束当前学年」按钮

2. **历史学年列表**
   - 以卡片形式展示所有历史学年
   - 显示学年名称、状态、学生数量等基本信息
   - 提供「查看详情」按钮

3. **新学年创建表单**
   - 学年名称输入框
   - 起始日期和结束日期选择器
   - 「创建新学年」按钮

### 5.2 历史数据查询页面

1. **查询条件区域**
   - 学年选择器
   - 学生搜索框
   - 班级、性别、成绩等级筛选器
   - 「查询」和「重置」按钮

2. **数据展示区域**
   - 学生列表表格
   - 支持分页和排序
   - 提供「查看详情」按钮

3. **数据导出功能**
   - 支持按条件导出历史数据
   - 提供Excel和PDF格式选择

### 5.3 学生历史详情页面

1. **学生基本信息**
   - 显示学生的基本信息
   - 显示学生的教育ID和姓名

2. **历年成绩记录**
   - 以时间线形式展示学生在各学年的成绩
   - 显示各测试项目的成绩和等级
   - 提供成绩变化趋势图表

3. **测试记录详情**
   - 显示该学生的所有测试记录
   - 支持查看详细的测试数据

## 6. 实现步骤和技术方案

### 6.1 技术栈
- React 19.2.0
- Redux Toolkit（状态管理）
- Ant Design（UI组件库）
- XLSX（Excel导入导出）

### 6.2 实现步骤

1. **数据结构更新**（已完成）
   - 更新`dataSlice`，添加学年管理相关状态
   - 更新`physicalTestSlice`，为测试记录添加学年字段

2. **学年管理组件开发**
   - 创建`SchoolYearManagement.jsx`组件
   - 实现学年列表、创建和结束操作

3. **学生历史记录组件开发**
   - 创建`StudentHistory.jsx`组件
   - 实现历史数据查询和展示功能

4. **数据导入导出功能增强**
   - 为导入功能添加学年关联
   - 支持按学年导出数据

5. **UI界面优化**
   - 更新导航菜单，添加学年管理入口
   - 优化数据展示页面

6. **测试和验证**
   - 测试学年结束和新学年开启流程
   - 验证数据归档和查询功能
   - 测试边界情况和异常处理

### 6.3 关键功能实现

#### 6.3.1 学年结束操作
```javascript
// 学年结束操作触发
const handleCompleteSchoolYear = async () => {
  try {
    await dispatch(completeSchoolYear({
      yearId: currentSchoolYear.id,
      completedAt: new Date().toISOString(),
      completedBy: currentUser.name
    }))
    message.success('学年结束操作成功')
    // 刷新页面或跳转
  } catch (error) {
    message.error('学年结束操作失败：' + error.message)
  }
}
```

#### 6.3.2 历史数据查询
```javascript
// 按学年查询学生历史记录
const getStudentHistoriesByYear = (yearId) => {
  return state.studentHistories.filter(history => history.schoolYearId === yearId)
}

// 按学生查询历史记录
const getStudentHistoriesByStudent = (educationId) => {
  return state.studentHistories.filter(history => history.educationId === educationId)
}
```

## 7. 系统扩展考虑

1. **数据备份功能**：在学年结束操作前，自动备份当前学年的数据
2. **批量操作支持**：支持批量导入多个学年的数据
3. **权限管理**：为学年管理操作添加特殊权限控制
4. **日志记录**：记录所有学年管理操作的详细日志
5. **数据迁移工具**：支持将历史数据迁移到新的存储结构

## 8. 总结

本设计方案基于用户需求，实现了一个完整的学年管理系统，包括学年结束操作、新学年开启操作、历史数据查询和索引功能。系统采用了清晰的数据结构和流程设计，确保了数据的安全性和可追溯性，同时提供了友好的UI界面和便捷的操作体验。

该方案符合用户提出的"每年只接受上层学籍系统提供的有效名单进行导入，不对学籍情况进行管理"的核心需求，同时满足了"以年份为学段进行保存，方便进行后续的查询和索引"的要求。