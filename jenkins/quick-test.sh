#!/bin/bash

# 快速Jenkins构建测试脚本
# 用于测试mycmdb-frontend项目的构建功能

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

JENKINS_URL="http://localhost:8080"
JOB_NAME="mycmdb-frontend"

echo -e "${BLUE}=== 快速Jenkins构建测试 ===${NC}"
echo

# 检查项目是否存在
echo -e "${YELLOW}检查项目状态...${NC}"
if curl -s -f "${JENKINS_URL}/job/${JOB_NAME}/" > /dev/null; then
    echo -e "${GREEN}✓ 项目 ${JOB_NAME} 已存在${NC}"
else
    echo -e "${RED}✗ 项目 ${JOB_NAME} 不存在${NC}"
    echo "请先运行: ./jenkins/manual-create-project.sh 创建项目"
    exit 1
fi

# 触发构建
echo -e "${YELLOW}触发构建...${NC}"
BUILD_RESULT=$(curl -s -X POST "${JENKINS_URL}/job/${JOB_NAME}/build" -w "%{http_code}")

if [[ "$BUILD_RESULT" == "201" ]]; then
    echo -e "${GREEN}✓ 构建已触发${NC}"
else
    echo -e "${YELLOW}⚠ 构建触发可能失败 (HTTP: $BUILD_RESULT)${NC}"
fi

# 等待构建开始
echo -e "${YELLOW}等待构建开始...${NC}"
sleep 5

# 获取最新构建信息
echo -e "${YELLOW}获取构建状态...${NC}"
BUILD_INFO=$(curl -s "${JENKINS_URL}/job/${JOB_NAME}/lastBuild/api/json" 2>/dev/null || echo "{}")

if echo "$BUILD_INFO" | grep -q '"building":true'; then
    echo -e "${BLUE}🔄 构建正在进行中...${NC}"
    echo "构建URL: ${JENKINS_URL}/job/${JOB_NAME}/lastBuild/console"
elif echo "$BUILD_INFO" | grep -q '"result":"SUCCESS"'; then
    echo -e "${GREEN}✅ 最新构建成功！${NC}"
elif echo "$BUILD_INFO" | grep -q '"result":"FAILURE"'; then
    echo -e "${RED}❌ 最新构建失败${NC}"
    echo "请查看构建日志: ${JENKINS_URL}/job/${JOB_NAME}/lastBuild/console"
else
    echo -e "${YELLOW}⚠ 无法获取构建状态${NC}"
fi

# 显示有用的链接
echo
echo -e "${BLUE}=== 有用的链接 ===${NC}"
echo "项目主页: ${JENKINS_URL}/job/${JOB_NAME}/"
echo "构建历史: ${JENKINS_URL}/job/${JOB_NAME}/builds"
echo "最新构建日志: ${JENKINS_URL}/job/${JOB_NAME}/lastBuild/console"
echo "项目配置: ${JENKINS_URL}/job/${JOB_NAME}/configure"

# 显示构建命令
echo
echo -e "${BLUE}=== 手动操作命令 ===${NC}"
echo "手动触发构建:"
echo "curl -X POST ${JENKINS_URL}/job/${JOB_NAME}/build"
echo
echo "获取构建状态:"
echo "curl ${JENKINS_URL}/job/${JOB_NAME}/lastBuild/api/json"
echo
echo "查看构建日志:"
echo "curl ${JENKINS_URL}/job/${JOB_NAME}/lastBuild/consoleText"

echo
echo -e "${GREEN}测试完成！请访问Jenkins Web界面查看详细信息。${NC}"