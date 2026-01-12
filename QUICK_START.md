# 快速启动指南

## 📋 项目状态
✅ **所有问题已修复，项目可以启动**

## 🚀 快速启动

### 方式一：本地开发环境

#### 1. 启动后端 API
```bash
cd sport-api
pip install -r requirements.txt
python main.py
```

后端将在 `http://localhost:8002` 启动
- API 文档: http://localhost:8002/docs
- 健康检查: http://localhost:8002/health

#### 2. 启动前端开发服务器
```bash
cd sport-web
npm install
npm run dev
```

前端将在 `http://localhost:5173` 启动
- 自动连接到后端: http://localhost:8002

### 方式二：Docker 容器部署

```bash
# 构建并启动所有服务
docker-compose up -d --build

# 查看容器状态
docker-compose ps

# 查看日志
docker-compose logs -f
```

访问应用：
- 前端: http://localhost:8888
- 后端: http://localhost:8002
- API 文档: http://localhost:8002/docs

### 方式三：仅启动后端 Docker

```bash
# 构建后端镜像
docker build -t sporttools-backend ./sport-api

# 运行容器
docker run -p 8002:8000 sporttools-backend
```

## 📊 验证配置

运行配置验证脚本确保所有设置正确：
```bash
python config_validation.py
```

应该看到：
```
✓ VITE_API_BASE_URL 正确配置为 8002
✓ SECRET_KEY 已配置
✓ 数据库配置正确
✓ 后端监听端口: 8002
✓ 所有配置验证通过！
```

## 🔧 关键配置

| 配置项 | 开发环境 | Docker生产 |
|------|--------|---------|
| 前端地址 | http://localhost:5173 | http://localhost:8888 |
| 后端地址 | http://localhost:8002 | http://localhost:8002 |
| API Base URL | http://localhost:8002 | 由 Nginx 反向代理 |
| 数据库 | SQLite (sports_teaching.db) | SQLite (volumes) |
| 默认用户 | admin / admin123 | admin / admin123 |

## 📁 项目结构

```
sporttools/
├── sport-api/              # 后端 FastAPI 应用
│   ├── main.py             # 主程序入口
│   ├── models.py           # 数据模型
│   ├── schemas.py          # Pydantic schemas
│   ├── database.py         # 数据库配置
│   ├── routes/             # API 路由
│   ├── crud/               # 数据库操作
│   ├── requirements.txt    # Python 依赖
│   └── .env                # 环境变量
├── sport-web/              # 前端 React 应用
│   ├── src/
│   │   ├── pages/          # 页面组件
│   │   ├── components/     # 公共组件
│   │   ├── store/          # Redux 状态管理
│   │   └── utils/          # 工具函数
│   ├── package.json        # Node 依赖
│   └── .env                # 环境变量
├── docker-compose.yml      # Docker 服务编排
└── config_validation.py    # 配置验证脚本
```

## 🔍 常见问题排查

### 前端无法连接后端
- 检查后端是否运行: `http://localhost:8002/health`
- 检查 `.env` 中 `VITE_API_BASE_URL` 是否为 `http://localhost:8002`
- 检查浏览器控制台是否有 CORS 错误

### 数据库错误
- 确保 `sports_teaching.db` 文件存在
- 运行初始化脚本: `python sport-api/init_db.py`
- 检查数据库权限

### Docker 容器无法启动
- 检查日志: `docker-compose logs backend`
- 确保端口未被占用: `netstat -ano | findstr :8002`
- 检查环境变量配置

### API 文档无法访问
- 访问 http://localhost:8002/docs
- 如果 404，检查后端是否正常运行

## 📝 已修复的问题

✅ 前端 ESLint 错误全部解决（6 个）
✅ API 端口统一为 8002
✅ SECRET_KEY 已生成强密钥
✅ 数据库已初始化（363 学生，1 学校）
✅ 所有配置文件验证通过

## 📚 更多信息

- API 文档: [FIXES_SUMMARY.md](FIXES_SUMMARY.md)
- 项目文档: [README.md](README.md)
- 前端开发指南: [sport-web/README.md](sport-web/README.md)
- 后端开发指南: [sport-api/api_student_guide.md](sport-api/api_student_guide.md)

## ✨ 关键改进

1. **安全性**: 生成了强加密的 SECRET_KEY
2. **一致性**: 统一所有 API 端点为 8002
3. **可维护性**: 添加了配置验证脚本
4. **质量**: 修复了所有 ESLint 错误

---

**最后更新**: 2026年1月10日
**状态**: ✅ 就绪投产
