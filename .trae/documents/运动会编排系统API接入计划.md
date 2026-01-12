# 运动会编排系统API接入计划

## 一、总体目标
将运动会编排系统的所有功能模块从模拟数据过渡到真实API数据，实现完整的前后端分离架构，确保系统可以在生产环境中稳定运行。

## 二、实施策略
1. **按模块优先级逐个接入**：从核心功能开始，逐步扩展到其他功能
2. **统一使用Redux异步thunk**：为每个API调用创建对应的thunk
3. **完善错误处理和加载状态**：为每个API调用添加适当的错误处理和加载状态
4. **移除所有模拟数据**：确保系统完全依赖真实API数据
5. **保持代码一致性**：遵循现有的代码规范和架构

## 三、详细实施计划

### 1. 运动会管理模块 (SportsMeetList.jsx)

**核心任务**：将运动会的创建、查询、更新、删除功能接入真实API

**具体步骤**：
- ✅ 后端API已实现：`GET /sports-meet`, `GET /sports-meet/{id}`, `POST /sports-meet`, `PUT /sports-meet/{id}`, `DELETE /sports-meet/{id}`
- 在`sportsMeetSlice.js`中添加以下异步thunk：
  - `fetchSportsMeetById`：获取单个运动会详情
  - `createSportsMeet`：创建运动会
  - `updateSportsMeet`：更新运动会
  - `deleteSportsMeetById`：删除运动会
- 修改`SportsMeetList.jsx`组件：
  - 移除模拟数据初始化代码
  - 添加`useEffect`钩子，在组件挂载时调用`fetchSportsMeets`获取运动会列表
  - 修改创建、编辑、删除操作，使用API调用代替直接修改Redux状态
  - 添加加载状态和错误处理

### 2. 项目管理模块 (EventManagement.jsx)

**核心任务**：将项目的创建、查询、更新、删除功能接入真实API

**具体步骤**：
- ✅ 后端API已实现：`GET /sports-meet/{sports_meet_id}/events`
- 需要补充后端API：`POST /sports-meet/{sports_meet_id}/events`, `PUT /sports-meet/{sports_meet_id}/events/{event_id}`, `DELETE /sports-meet/{sports_meet_id}/events/{event_id}`
- 在`sportsMeetSlice.js`中添加以下异步thunk：
  - `fetchEvents`：获取项目列表
  - `fetchEventById`：获取单个项目详情
  - `createEvent`：创建项目
  - `updateEvent`：更新项目
  - `deleteEventById`：删除项目
- 修改`EventManagement.jsx`组件：
  - 移除模拟数据初始化代码
  - 添加`useEffect`钩子，在组件挂载时调用`fetchEvents`获取项目列表
  - 修改创建、编辑、删除操作，使用API调用代替直接修改Redux状态
  - 添加加载状态和错误处理

### 3. 报名管理模块 (RegistrationManagement.jsx)

**核心任务**：将报名管理功能接入真实API

**具体步骤**：
- 需要补充后端API：`GET /sports-meet/{sports_meet_id}/registrations`, `POST /sports-meet/{sports_meet_id}/registrations`, `DELETE /sports-meet/{sports_meet_id}/registrations/{registration_id}`
- 在`sportsMeetSlice.js`中添加以下异步thunk：
  - `fetchRegistrations`：获取报名列表
  - `createRegistration`：创建报名
  - `batchCreateRegistrations`：批量创建报名
  - `deleteRegistrationById`：取消报名
- 修改`RegistrationManagement.jsx`组件：
  - 移除模拟数据初始化代码
  - 添加`useEffect`钩子，在组件挂载时调用`fetchRegistrations`获取报名列表
  - 修改报名操作，使用API调用代替直接修改Redux状态
  - 添加加载状态和错误处理

### 4. 报名审核模块 (RegistrationAudit.jsx)

**核心任务**：将报名审核功能接入真实API

**具体步骤**：
- 需要补充后端API：`GET /sports-meet/{sports_meet_id}/registrations/pending`, `PUT /sports-meet/{sports_meet_id}/registrations/{registration_id}/approve`, `PUT /sports-meet/{sports_meet_id}/registrations/{registration_id}/reject`
- 在`sportsMeetSlice.js`中添加以下异步thunk：
  - `fetchPendingRegistrations`：获取待审核报名列表
  - `approveRegistration`：通过报名
  - `rejectRegistration`：拒绝报名
- 修改`RegistrationAudit.jsx`组件：
  - 移除模拟数据初始化代码
  - 添加`useEffect`钩子，在组件挂载时调用`fetchPendingRegistrations`获取待审核报名列表
  - 修改审核操作，使用API调用代替直接修改Redux状态
  - 添加加载状态和错误处理

### 5. 报名统计模块 (RegistrationStatistics.jsx)

**核心任务**：将报名统计功能接入真实API

**具体步骤**：
- 需要补充后端API：`GET /sports-meet/{sports_meet_id}/registration-statistics`
- 在`sportsMeetSlice.js`中添加以下异步thunk：
  - `fetchRegistrationStatistics`：获取报名统计数据
- 修改`RegistrationStatistics.jsx`组件：
  - 添加`useEffect`钩子，在组件挂载时调用`fetchRegistrationStatistics`获取统计数据
  - 使用API返回的统计数据代替本地计算
  - 添加加载状态和错误处理

### 6. 赛程编排模块 (SportsMeetScheduling.jsx)

**核心任务**：将赛程编排功能接入真实API

**具体步骤**：
- 需要补充后端API：`GET /sports-meet/{sports_meet_id}/schedules`, `POST /sports-meet/{sports_meet_id}/schedules`, `PUT /sports-meet/{sports_meet_id}/schedules/{schedule_id}`, `DELETE /sports-meet/{sports_meet_id}/schedules/{schedule_id}`, `POST /sports-meet/{sports_meet_id}/auto-schedule`
- 在`sportsMeetSlice.js`中添加以下异步thunk：
  - `fetchSchedules`：获取赛程列表
  - `createSchedule`：创建赛程
  - `updateSchedule`：更新赛程
  - `deleteScheduleById`：删除赛程
  - `autoSchedule`：自动编排赛程
- 修改`SportsMeetScheduling.jsx`组件：
  - 移除模拟数据初始化代码
  - 添加`useEffect`钩子，在组件挂载时调用`fetchSchedules`获取赛程列表
  - 修改赛程编排操作，使用API调用代替直接修改Redux状态
  - 添加加载状态和错误处理

### 7. 成绩记录模块 (ResultRecord.jsx)

**核心任务**：将成绩记录功能接入真实API

**具体步骤**：
- 需要补充后端API：`GET /sports-meet/{sports_meet_id}/results`, `POST /sports-meet/{sports_meet_id}/results`, `PUT /sports-meet/{sports_meet_id}/results/{result_id}`, `DELETE /sports-meet/{sports_meet_id}/results/{result_id}`
- 在`sportsMeetSlice.js`中添加以下异步thunk：
  - `fetchResults`：获取成绩列表
  - `createResult`：创建成绩记录
  - `updateResult`：更新成绩记录
  - `deleteResultById`：删除成绩记录
- 修改`ResultRecord.jsx`组件：
  - 移除模拟数据初始化代码
  - 添加`useEffect`钩子，在组件挂载时调用`fetchResults`获取成绩列表
  - 修改成绩录入操作，使用API调用代替直接修改Redux状态
  - 添加加载状态和错误处理

## 四、技术实现细节

### 1. Redux异步thunk模板
```javascript
export const fetchData = createAsyncThunk(
  'sliceName/fetchData',
  async (params, { rejectWithValue }) => {
    try {
      const response = await apiClient.get('/endpoint', { params })
      return response.data
    } catch (error) {
      return rejectWithValue(error.response?.data?.detail || '获取数据失败')
    }
  }
)
```

### 2. 组件加载状态处理
```javascript
const { data, loading, error } = useSelector(state => state.sliceName)

if (loading) {
  return <Spin spinning={loading} />;
}

if (error) {
  return <Alert message="错误" description={error} type="error" />;
}
```

### 3. API调用错误处理
```javascript
try {
  await dispatch(fetchData()).unwrap()
  message.success('操作成功')
} catch (error) {
  message.error(error || '操作失败')
}
```

## 五、测试策略

1. **单元测试**：为每个异步thunk编写单元测试
2. **集成测试**：测试前后端API集成是否正常
3. **端到端测试**：测试完整的业务流程
4. **性能测试**：测试API调用的性能和响应时间

## 六、项目管理

1. **分支策略**：为每个功能模块创建独立的分支，测试通过后合并到主分支
2. **代码审查**：每个功能模块接入API后进行代码审查
3. **持续集成**：配置CI/CD流水线，自动运行测试
4. **文档更新**：更新API文档和前端组件文档

## 七、预期成果

1. 所有功能模块完全依赖真实API数据
2. 移除所有模拟数据代码
3. 完善的错误处理和加载状态
4. 统一的API调用方式
5. 代码质量和可维护性提高
6. 系统可以稳定运行在生产环境

通过这个计划，我们可以系统地将运动会编排系统的所有功能模块接入真实API，实现完整的前后端分离架构，为后续的生产环境部署做好准备。