#!/bin/bash

# 部署脚本
set -e

echo "开始部署到测试环境..."

# 停止现有容器
docker-compose down

# 拉取最新代码 (如果需要)
# git pull origin main

# 构建并启动服务
docker-compose up -d --build

echo "部署完成!"
echo "前端访问地址: http://localhost:3000"