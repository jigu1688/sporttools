# 构建阶段
FROM node:20-alpine AS builder

WORKDIR /app

# 复制package.json和package-lock.json
COPY package*.json ./

# 安装依赖（使用--only=production减少依赖大小）
RUN npm install --only=production

# 复制源代码
COPY . .

# 构建生产版本
RUN npm run build

# 清理构建过程中产生的临时文件
RUN rm -rf node_modules

# 运行阶段
FROM nginx:alpine

# 复制构建产物到Nginx静态目录
COPY --from=builder /app/dist /usr/share/nginx/html

# 复制Nginx配置文件
COPY nginx.conf /etc/nginx/conf.d/default.conf

# 暴露端口
EXPOSE 80

# 添加健康检查
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost || exit 1

# 启动Nginx
CMD ["nginx", "-g", "daemon off;"]