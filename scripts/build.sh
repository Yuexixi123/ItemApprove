#!/bin/bash

# 构建脚本
set -e

echo "开始构建Docker镜像..."

# 构建镜像
docker build -t mycmdb-frontend:latest .

echo "构建完成!"

# 可选：推送到镜像仓库
# docker tag mycmdb-frontend:latest your-registry/mycmdb-frontend:latest
# docker push your-registry/mycmdb-frontend:latest