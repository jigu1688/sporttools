# 🚀 应用已启动运行

**启动时间**: 2026年1月10日 16:42  
**状态**: ✅ **正在运行**

---

## 📍 访问地址

| 服务 | 地址 | 状态 |
|------|------|------|
| **前端应用** | http://localhost:5173 | ✅ 运行中 |
| **后端 API** | http://localhost:8002 | ✅ 运行中 |
| **API 文档** | http://localhost:8002/docs | ✅ 可用 |
| **健康检查** | http://localhost:8002/health | ✅ 健康 |

---

## 🔑 登录信息

```
用户名: admin
密码: admin123
角色: 管理员
```

---

## 📊 系统数据

- ✅ 学校数量: 1 所
- ✅ 学生数量: 363 人
- ✅ 学年数量: 2 个 (其中 1 个活跃)
- ✅ 数据库: SQLite 308 KB

---

## 🛠️ 开发环境特性

### 前端 (Vite)
- **Hot Module Reload**: 代码修改自动刷新
- **快速启动**: 519 ms
- **框架**: React 19 + Vite 7.2.5

### 后端 (FastAPI)
- **Auto-reload**: 代码修改自动重启
- **API 文档**: Swagger UI 可用
- **框架**: FastAPI + Uvicorn

---

## 📋 功能模块

✅ 用户管理系统  
✅ 学生信息管理  
✅ 班级管理  
✅ 体测成绩管理  
✅ 运动会编排  
✅ 学年管理  
✅ 权限控制  
✅ 活动日志  

---

## 🔌 API 端点示例

### 获取学生列表
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8002/api/v1/students
```

### 获取体测成绩
```bash
curl -H "Authorization: Bearer {token}" \
  http://localhost:8002/api/v1/physical-tests
```

### 查看 API 文档
访问: http://localhost:8002/docs

---

## ⛔ 停止应用

### 前端服务
在前端终端按 **Ctrl+C**

### 后端服务
在后端终端按 **Ctrl+C**

---

## 📝 日志文件

- **前端日志**: 在 Vite 终端查看
- **后端日志**: 在 FastAPI 终端查看
- **数据库日志**: `sport-api/logs/` 目录

---

## 🐛 常见问题

### 端口被占用
如果看到 "Port 5173 already in use" 或 "Port 8002 already in use":
```bash
# 查找占用端口的进程并关闭
netstat -ano | findstr :5173
taskkill /PID {PID} /F
```

### 前端无法连接后端
检查 `sport-web/.env` 中的 API 地址:
```
VITE_API_BASE_URL=http://localhost:8002
```

### 数据库错误
检查数据库文件: `sport-api/sports_teaching.db`  
如果损坏，运行初始化: `python sport-api/init_db.py`

---

## 📚 相关文档

- [快速启动指南](QUICK_START.md) - 项目启动方式
- [修复完成报告](REPAIR_REPORT.md) - 所有修复内容
- [详细修复明细](FIXES_SUMMARY.md) - 修复列表

---

## ✨ 下一步

1. ✅ 访问 http://localhost:5173
2. ✅ 登录系统 (admin/admin123)
3. ✅ 浏览各功能模块
4. ✅ 修改代码 (自动热更新)
5. ✅ 查看 API 文档

---

**祝您使用愉快！** 🎉

