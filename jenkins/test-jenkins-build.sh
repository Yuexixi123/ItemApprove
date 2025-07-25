#!/bin/bash

# Jenkins项目测试脚本
# 用于测试mycmdb-frontend项目的构建功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Jenkins配置
JENKINS_URL="http://localhost:8080"
JOB_NAME="mycmdb-frontend"

echo -e "${BLUE}=== Jenkins项目测试脚本 ===${NC}"
echo

# 1. 检查Jenkins服务状态
echo -e "${YELLOW}1. 检查Jenkins服务状态...${NC}"
if curl -s -f "${JENKINS_URL}/login" > /dev/null; then
    echo -e "${GREEN}✓ Jenkins服务运行正常${NC}"
else
    echo -e "${RED}✗ Jenkins服务不可访问，请检查服务状态${NC}"
    exit 1
fi

# 2. 检查项目是否存在
echo -e "${YELLOW}2. 检查项目是否存在...${NC}"
if curl -s -f "${JENKINS_URL}/job/${JOB_NAME}/" > /dev/null; then
    echo -e "${GREEN}✓ 项目 ${JOB_NAME} 存在${NC}"
else
    echo -e "${RED}✗ 项目 ${JOB_NAME} 不存在，请先在Jenkins中创建项目${NC}"
    echo -e "${YELLOW}请访问: ${JENKINS_URL} 手动创建项目${NC}"
    exit 1
fi

# 3. 检查Jenkinsfile
echo -e "${YELLOW}3. 检查Jenkinsfile...${NC}"
if [ -f "Jenkinsfile" ]; then
    echo -e "${GREEN}✓ Jenkinsfile 存在${NC}"
    echo "Jenkinsfile内容预览:"
    head -10 Jenkinsfile | sed 's/^/  /'
else
    echo -e "${RED}✗ Jenkinsfile 不存在${NC}"
    exit 1
fi

# 4. 检查Dockerfile
echo -e "${YELLOW}4. 检查Dockerfile...${NC}"
if [ -f "Dockerfile" ]; then
    echo -e "${GREEN}✓ Dockerfile 存在${NC}"
else
    echo -e "${RED}✗ Dockerfile 不存在${NC}"
    exit 1
fi

# 5. 检查package.json
echo -e "${YELLOW}5. 检查package.json...${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✓ package.json 存在${NC}"
    echo "项目信息:"
    cat package.json | jq -r '.name, .version, .scripts.build' 2>/dev/null || echo "  无法解析package.json"
else
    echo -e "${RED}✗ package.json 不存在${NC}"
    exit 1
fi

# 6. 本地Docker构建测试
echo -e "${YELLOW}6. 执行本地Docker构建测试...${NC}"
echo "这将测试Dockerfile是否能正常构建镜像"
read -p "是否执行本地构建测试? (y/N): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "开始构建Docker镜像..."
    if docker build -t mycmdb-frontend-test:latest .; then
        echo -e "${GREEN}✓ Docker镜像构建成功${NC}"
        
        # 测试运行容器
        echo "测试运行容器..."
        CONTAINER_ID=$(docker run -d -p 3001:80 mycmdb-frontend-test:latest)
        sleep 3
        
        if curl -s -f "http://localhost:3001" > /dev/null; then
            echo -e "${GREEN}✓ 容器运行成功，应用可访问${NC}"
            echo "测试URL: http://localhost:3001"
        else
            echo -e "${YELLOW}⚠ 容器启动但应用可能未就绪${NC}"
        fi
        
        # 清理测试容器
        docker stop $CONTAINER_ID > /dev/null
        docker rm $CONTAINER_ID > /dev/null
        echo "已清理测试容器"
    else
        echo -e "${RED}✗ Docker镜像构建失败${NC}"
        exit 1
    fi
else
    echo "跳过本地构建测试"
fi

# 7. 提供Jenkins操作指南
echo
echo -e "${BLUE}=== Jenkins操作指南 ===${NC}"
echo -e "${YELLOW}手动触发构建:${NC}"
echo "1. 访问: ${JENKINS_URL}/job/${JOB_NAME}/"
echo "2. 点击 'Build Now' 按钮"
echo
echo -e "${YELLOW}查看构建日志:${NC}"
echo "1. 在项目页面点击最新的构建号"
echo "2. 点击 'Console Output' 查看详细日志"
echo
echo -e "${YELLOW}配置GitHub Webhook (自动触发):${NC}"
echo "1. 在GitHub仓库设置中添加Webhook"
echo "2. Payload URL: ${JENKINS_URL}/github-webhook/"
echo "3. Content type: application/json"
echo "4. 选择 'Just the push event'"
echo
echo -e "${YELLOW}常用Jenkins CLI命令:${NC}"
echo "# 触发构建"
echo "curl -X POST ${JENKINS_URL}/job/${JOB_NAME}/build"
echo
echo "# 获取构建状态"
echo "curl ${JENKINS_URL}/job/${JOB_NAME}/lastBuild/api/json"
echo
echo -e "${GREEN}测试完成！${NC}"