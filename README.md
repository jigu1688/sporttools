# 体育教学辅助系统

## 项目简介
体育教学辅助系统是一个用于管理和组织体育赛事、课程和训练的综合性平台。

## 技术栈

### 前端
- React 19
- Ant Design 6.1.3
- Redux Toolkit
- Vite

### 后端
- Go
- Gin框架

## 部署方式

### 本地开发
1. 启动后端服务
2. 启动前端开发服务器：`npm run dev`

### Docker部署
使用Docker Compose可以将前后端部署到一起：
```bash
docker-compose up -d
```

### Vercel部署
- 前端可以直接部署到Vercel
- 后端需要使用Vercel Serverless Functions或外部部署

## 项目结构
```
.
├── backend/          # Go后端代码
├── frontend/         # React前端代码
├── .gitignore        # Git忽略文件
└── README.md         # 项目说明文档
```