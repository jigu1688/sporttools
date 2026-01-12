# 体育教学辅助系统

## 项目简介
体育教学辅助系统是一个专为体育老师设计的综合教学辅助管理平台，用于管理体育赛事、课程和训练，提升体育教学效率。

## 技术栈

### 前端
- React 19
- Ant Design 6.1.3
- Redux Toolkit
- Vite
- Axios

### 后端
- Python 3.11
- FastAPI
- SQLAlchemy
- Redis（可选）

### 部署
- Docker & Docker Compose
- Nginx
- SQLite（开发环境）/ PostgreSQL（生产环境）

## 项目结构
```
.
├── sport-api/        # 后端API代码
├── sport-web/        # 前端代码
├── docker-compose.yml # Docker Compose配置
├── .gitignore        # Git忽略文件
└── README.md         # 项目说明文档
```

## 生产环境部署指南

### 1. 环境准备
- Docker 20.10+ 
- Docker Compose 1.29+
- 服务器（推荐4核8G以上）
- 域名（建议使用HTTPS）

### 2. 配置环境变量

#### 后端环境变量
在 `sport-api/` 目录下创建 `.env` 文件，参考 `.env.example` 配置：
```env
# 应用配置
APP_NAME=体育教学辅助网站API
APP_VERSION=1.0.0
DEBUG=False

# 数据库配置
DATABASE_URL=sqlite:///./sports_teaching.db
# 或PostgreSQL配置
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=sports_teaching
# DB_USER=postgres
# DB_PASSWORD=your-db-password

# JWT配置（生产环境必须修改）
SECRET_KEY=your-secret-key-change-in-production
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=1440

# Redis配置
REDIS_HOST=redis
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_DB=0
```

#### 前端环境变量
在 `sport-web/` 目录下创建 `.env.production` 文件：
```env
# 环境配置
NODE_ENV=production

# API配置
VITE_API_BASE_URL=/api

# 应用配置
VITE_APP_NAME=体育教学辅助系统
VITE_APP_VERSION=1.0.0
```

### 3. 部署步骤

#### 使用Docker Compose部署
1. 克隆代码库：
```bash
git clone https://github.com/jigu1688/sporttools.git
cd sporttools
```

2. 构建并启动容器：
```bash
docker-compose up -d --build
```

3. 验证部署：
```bash
# 检查容器状态
docker-compose ps

# 检查日志
docker-compose logs -f
```

4. 访问应用：
   - 前端：http://your-server-ip:8888
   - 后端API：http://your-server-ip:8002
   - 健康检查：http://your-server-ip:8002/health

### 4. 安全配置

#### HTTPS配置
1. 准备SSL证书（推荐使用Let's Encrypt）
2. 修改 `sport-web/nginx.conf`，配置SSL证书路径：
```nginx
ssl_certificate /etc/nginx/ssl/cert.pem;
ssl_certificate_key /etc/nginx/ssl/key.pem;
```
3. 将证书文件挂载到容器：
```yaml
# 在docker-compose.yml中添加
volumes:
  - ./ssl:/etc/nginx/ssl
```

#### 防火墙配置
```bash
# 开放必要端口
sudo ufw allow 80
sudo ufw allow 443
sudo ufw allow 8002
```

### 5. 监控和维护

#### 健康检查
- 后端健康检查：`http://your-server-ip:8002/health`
- 前端健康检查：`http://your-server-ip:8888/health`

#### 日志管理
- 容器日志：`docker-compose logs -f`
- 应用日志：挂载的 `backend_logs` 卷

#### 备份策略
1. 数据库备份：
```bash
docker-compose exec backend sqlite3 /app/sports_teaching.db .dump > backup_$(date +%Y%m%d_%H%M%S).sql
```

2. 上传文件备份：
```bash
tar -czf uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz ./sport-api/uploads
```

3. 配置自动备份脚本：
```bash
# 添加到crontab
0 2 * * * /path/to/backup_script.sh
```

### 6. 性能优化

#### 前端优化
- 启用CDN加速静态资源
- 配置浏览器缓存
- 启用gzip/brotli压缩

#### 后端优化
- 使用PostgreSQL替代SQLite
- 配置Redis缓存
- 优化数据库连接池
- 启用异步处理

### 7. 故障排查

#### 常见问题
1. **502 Bad Gateway**：检查后端服务是否正常运行
2. **401 Unauthorized**：检查JWT Secret Key是否一致
3. **数据库连接失败**：检查数据库配置和连接池设置
4. **前端无法访问API**：检查CORS配置和Nginx代理设置

#### 排查步骤
1. 查看容器状态：`docker-compose ps`
2. 查看应用日志：`docker-compose logs -f backend`
3. 测试数据库连接：`docker-compose exec backend python -c "from database import SessionLocal; db = SessionLocal(); print('Database connected successfully'); db.close()"`
4. 测试API端点：`curl -v http://localhost:8002/health`

## 开发环境设置

### 前端开发
```bash
cd sport-web
npm install
npm run dev
```

### 后端开发
```bash
cd sport-api
pip install -r requirements.txt
python main.py
```

## 版本更新

1. 拉取最新代码：
```bash
git pull origin master
```

2. 重新构建并启动容器：
```bash
docker-compose up -d --build
```

3. 执行数据库迁移（如果需要）：
```bash
docker-compose exec backend alembic upgrade head
```

## 贡献指南

1. Fork本仓库
2. 创建功能分支：`git checkout -b feature/your-feature`
3. 提交更改：`git commit -m 'Add your feature'`
4. 推送到分支：`git push origin feature/your-feature`
5. 创建Pull Request

## 许可证

MIT License

## 联系方式

如有问题或建议，请提交Issue或联系项目维护者。