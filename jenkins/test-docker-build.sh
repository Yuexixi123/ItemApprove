#!/bin/bash

echo "🧪 本地测试Docker镜像构建..."

# 设置变量
IMAGE_NAME="mycmdb-frontend"
IMAGE_TAG="test-$(date +%Y%m%d-%H%M%S)"

echo "📦 构建Docker镜像: ${IMAGE_NAME}:${IMAGE_TAG}"

# 构建镜像
docker build -t ${IMAGE_NAME}:${IMAGE_TAG} .

if [ $? -eq 0 ]; then
    echo "✅ 镜像构建成功！"
    
    # 显示镜像信息
    echo "📊 镜像信息:"
    docker images | grep ${IMAGE_NAME}
    
    # 测试运行容器
    echo "🚀 测试运行容器..."
    docker run -d --name mycmdb-test -p 3001:80 ${IMAGE_NAME}:${IMAGE_TAG}
    
    echo "⏳ 等待容器启动..."
    sleep 5
    
    # 检查容器状态
    if docker ps | grep mycmdb-test > /dev/null; then
        echo "✅ 容器运行成功！"
        echo "🌐 测试地址: http://localhost:3001"
        echo ""
        echo "🛑 停止测试容器请运行:"
        echo "docker stop mycmdb-test && docker rm mycmdb-test"
    else
        echo "❌ 容器启动失败"
        docker logs mycmdb-test
    fi
else
    echo "❌ 镜像构建失败！"
    exit 1
fi