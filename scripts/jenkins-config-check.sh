#!/bin/bash

echo "=== Jenkins 项目配置检查 ==="
echo ""

JENKINS_URL="http://localhost:8080"
PROJECT_NAME="mycmdb-frontend"

echo "🔍 1. 检查Jenkins服务..."
if curl -s "${JENKINS_URL}" > /dev/null; then
    echo "✅ Jenkins服务正常"
else
    echo "❌ Jenkins服务无法访问"
    exit 1
fi

echo ""
echo "🔍 2. 检查项目配置..."
PROJECT_CONFIG_URL="${JENKINS_URL}/job/${PROJECT_NAME}/config.xml"

echo "项目配置URL: ${PROJECT_CONFIG_URL}"
echo ""

echo "🔧 3. 推荐的项目配置步骤："
echo ""
echo "1. 访问: ${JENKINS_URL}/job/${PROJECT_NAME}/configure"
echo ""
echo "2. 确认以下配置："
echo "   📋 General:"
echo "      - 项目名称: ${PROJECT_NAME}"
echo "      - 描述: MYCMDB前端项目自动化构建"
echo ""
echo "   🔧 Build Triggers:"
echo "      ☑️ Poll SCM"
echo "      📅 Schedule: H/5 * * * *"
echo ""
echo "   📦 Pipeline:"
echo "      📝 Definition: Pipeline script from SCM"
echo "      🔗 SCM: Git"
echo "      🌐 Repository URL: https://github.com/Yuexixi123/ItemApprove.git"
echo "      🌿 Branch Specifier: */main"
echo "      📄 Script Path: Jenkinsfile"
echo ""
echo "3. 保存配置"
echo ""
echo "4. 手动触发构建测试"
echo ""

echo "🚀 快速修复命令："
echo ""
echo "# 1. 提交测试文件"
echo "git add Jenkinsfile.test"
echo "git commit -m 'test: 添加Jenkins连接测试'"
echo "git push origin main"
echo ""
echo "# 2. 临时使用测试Jenkinsfile"
echo "# 在Jenkins项目配置中将Script Path改为: Jenkinsfile.test"
echo ""
echo "# 3. 手动触发构建"
echo "curl -X POST ${JENKINS_URL}/job/${PROJECT_NAME}/build"
echo ""

echo "配置检查完成！"