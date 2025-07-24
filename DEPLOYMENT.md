# MYCMDB 前端部署说明

## 系统要求

- Docker 20.10+
- 2GB+ 可用内存
- 网络能访问后端服务 `http://172.16.1.80:50512`

## 快速启动

### 方法 1：使用 Docker Hub 镜像（推荐）

```bash
# 拉取并启动容器
docker run -d \
  --name mycmdb-frontend \
  -p 3000:80 \
  yourusername/mycmdb-frontend:latest

# 访问应用
open http://localhost:3000
```

### 方法 2：使用本地 tar 文件

```bash
# 1. 加载镜像
docker load -i mycmdb-frontend-v1.0.tar.gz

# 2. 启动容器
docker run -d \
  --name mycmdb-frontend \
  -p 3000:80 \
  mycmdb-frontend:v1.0
```

## 高级配置

### 自定义端口

```bash
docker run -d \
  --name mycmdb-frontend \
  -p 8080:80 \
  yourusername/mycmdb-frontend:latest
```

### 环境变量配置

```bash
docker run -d \
  --name mycmdb-frontend \
  -p 3000:80 \
  -e NODE_ENV=production \
  yourusername/mycmdb-frontend:latest
```

### 使用 docker-compose

```yaml
version: '3.8'
services:
  frontend:
    image: yourusername/mycmdb-frontend:latest
    ports:
      - '3000:80'
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

## 管理命令

```bash
# 查看容器状态
docker ps

# 查看日志
docker logs mycmdb-frontend

# 停止容器
docker stop mycmdb-frontend

# 重启容器
docker restart mycmdb-frontend

# 删除容器
docker rm mycmdb-frontend

# 更新镜像
docker pull yourusername/mycmdb-frontend:latest
docker stop mycmdb-frontend
docker rm mycmdb-frontend
docker run -d --name mycmdb-frontend -p 3000:80 yourusername/mycmdb-frontend:latest
```

## 故障排除

1. **端口冲突**：修改 `-p` 参数中的本地端口
2. **无法访问后端**：确保网络能访问 `http://172.16.1.80:50512`
3. **容器启动失败**：查看日志 `docker logs mycmdb-frontend`
