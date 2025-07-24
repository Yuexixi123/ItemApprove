#!/bin/bash

set -e

echo "=== 开始Jenkins自动化构建 ==="

# 环境变量设置
PROJECT_NAME="mycmdb-frontend"
DOCKER_IMAGE="${PROJECT_NAME}"
BUILD_TAG="${BUILD_NUMBER:-$(date +%Y%m%d-%H%M%S)}"
CONTAINER_NAME="${PROJECT_NAME}-${BUILD_TAG}"
CURRENT_CONTAINER="${PROJECT_NAME}-current"

# 1. 清理工作空间
echo "清理工作空间..."
rm -rf node_modules dist || true

# 2. 安装pnpm（如果未安装）
echo "检查pnpm安装..."
if ! command -v pnpm &> /dev/null; then
    echo "安装pnpm..."
    npm install -g pnpm
fi

# 3. 安装依赖
echo "安装项目依赖..."
pnpm install --frozen-lockfile

# 4. 代码质量检查
echo "执行代码检查..."
pnpm run lint

# 5. 运行测试（如果有）
if grep -q '"test"' package.json; then
    echo "运行测试..."
    pnpm run test -- --watchAll=false --coverage=false
fi

# 6. 构建项目
echo "构建前端项目..."
pnpm run build

# 7. 构建Docker镜像
echo "构建Docker镜像: ${DOCKER_IMAGE}:${BUILD_TAG}"
docker build -t ${DOCKER_IMAGE}:${BUILD_TAG} .
docker tag ${DOCKER_IMAGE}:${BUILD_TAG} ${DOCKER_IMAGE}:latest

# 8. 停止并删除旧容器
echo "停止旧容器..."
docker stop ${CURRENT_CONTAINER} || true
docker rm ${CURRENT_CONTAINER} || true

# 9. 启动新容器
echo "启动新容器..."
docker run -d \
    --name ${CURRENT_CONTAINER} \
    -p 3000:80 \
    --restart unless-stopped \
    ${DOCKER_IMAGE}:${BUILD_TAG}

# 10. 健康检查
echo "执行健康检查..."
sleep 10
for i in {1..5}; do
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "健康检查通过！"
        break
    elif [ $i -eq 5 ]; then
        echo "健康检查失败！"
        exit 1
    else
        echo "等待服务启动... ($i/5)"
        sleep 10
    fi
done

# 11. 清理旧镜像（保留最近3个版本）
echo "清理旧镜像..."
docker images ${DOCKER_IMAGE} --format "table {{.Tag}}" | grep -v "latest" | grep -v "TAG" | sort -r | tail -n +4 | xargs -r docker rmi ${DOCKER_IMAGE}: || true

echo "=== 构建部署完成 ==="
echo "访问地址: http://localhost:3000"
echo "镜像版本: ${DOCKER_IMAGE}:${BUILD_TAG}"