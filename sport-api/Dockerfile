# 使用Python官方镜像
FROM python:3.11-alpine

# 设置工作目录
WORKDIR /app

# 创建非root用户
RUN addgroup -S appgroup && adduser -S appuser -G appgroup

# 复制requirements.txt
COPY requirements.txt ./

# 安装依赖
RUN pip install --no-cache-dir -r requirements.txt

# 安装uvicorn作为WSGI服务器
RUN pip install --no-cache-dir uvicorn

# 复制源代码
COPY . .

# 更改文件所有权
RUN chown -R appuser:appgroup /app

# 切换到非root用户
USER appuser

# 暴露端口
EXPOSE 8000

# 运行应用，使用uvicorn作为WSGI服务器
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
