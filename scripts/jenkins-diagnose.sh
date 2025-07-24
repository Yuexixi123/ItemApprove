#!/bin/bash

echo "=== Jenkins 自动构建诊断脚本 ==="
echo ""

# 配置信息
JENKINS_URL="http://localhost:8080"
PROJECT_NAME="mycmdb-frontend"
GIT_REPO_URL="https://github.com/Yuexixi123/ItemApprove.git"

echo "📋 检查配置信息..."
echo "Jenkins地址: ${JENKINS_URL}"
echo "项目名称: ${PROJECT_NAME}"
echo "Git仓库: ${GIT_REPO_URL}"
echo ""

echo "🔍 1. 检查Jenkins服务状态..."
if curl -s "${JENKINS_URL}" > /dev/null; then
    echo "✅ Jenkins服务正常运行"
else
    echo "❌ Jenkins服务无法访问，请检查："
    echo "   - Jenkins是否启动"
    echo "   - 端口8080是否被占用"
    echo "   - 防火墙设置"
    exit 1
fi

echo ""
echo "🔍 2. 检查项目是否存在..."
PROJECT_URL="${JENKINS_URL}/job/${PROJECT_NAME}/"
if curl -s "${PROJECT_URL}" > /dev/null; then
    echo "✅ 项目存在: ${PROJECT_URL}"
else
    echo "❌ 项目不存在，需要创建项目"
    echo "   请按照以下步骤创建："
    echo "   1. 访问 ${JENKINS_URL}"
    echo "   2. 点击 'New Item'"
    echo "   3. 输入项目名: ${PROJECT_NAME}"
    echo "   4. 选择 'Pipeline'"
    echo "   5. 配置Git仓库: ${GIT_REPO_URL}"
fi

echo ""
echo "🔍 3. 检查Git仓库连接..."
if git ls-remote "${GIT_REPO_URL}" > /dev/null 2>&1; then
    echo "✅ Git仓库连接正常"
else
    echo "❌ Git仓库连接失败，请检查："
    echo "   - 仓库地址是否正确"
    echo "   - 网络连接是否正常"
    echo "   - 是否需要认证凭据"
fi

echo ""
echo "🔍 4. 检查本地Git状态..."
if [ -d ".git" ]; then
    echo "✅ 当前目录是Git仓库"
    
    # 检查远程仓库
    CURRENT_REMOTE=$(git remote get-url origin 2>/dev/null || echo "未配置")
    echo "当前远程仓库: ${CURRENT_REMOTE}"
    
    if [ "${CURRENT_REMOTE}" = "${GIT_REPO_URL}" ]; then
        echo "✅ 远程仓库地址匹配"
    else
        echo "⚠️ 远程仓库地址不匹配"
        echo "   当前: ${CURRENT_REMOTE}"
        echo "   期望: ${GIT_REPO_URL}"
    fi
    
    # 检查最新提交
    LATEST_COMMIT=$(git rev-parse --short HEAD)
    echo "最新提交: ${LATEST_COMMIT}"
    
    # 检查是否有未推送的提交
    if git status --porcelain | grep -q .; then
        echo "⚠️ 有未提交的更改"
    else
        echo "✅ 工作目录干净"
    fi
    
else
    echo "❌ 当前目录不是Git仓库"
fi

echo ""
echo "🔍 5. 检查Jenkinsfile..."
if [ -f "Jenkinsfile" ]; then
    echo "✅ Jenkinsfile存在"
    
    # 检查触发器配置
    if grep -q "triggers" Jenkinsfile; then
        echo "✅ Jenkinsfile包含触发器配置"
    else
        echo "⚠️ Jenkinsfile缺少触发器配置"
        echo "   建议添加以下配置到pipeline块中："
        echo "   triggers {"
        echo "       pollSCM('H/5 * * * *')"
        echo "   }"
    fi
else
    echo "❌ Jenkinsfile不存在"
fi

echo ""
echo "🔧 建议的解决步骤："
echo ""
echo "1. 确保Jenkins项目已创建并配置正确"
echo "2. 在项目配置中启用构建触发器："
echo "   - Poll SCM: H/5 * * * *"
echo "   - 或GitHub webhook"
echo "3. 确保Git仓库地址正确"
echo "4. 手动触发一次构建测试"
echo "5. 检查Jenkins构建日志"
echo ""

echo "🚀 快速修复命令："
echo ""
echo "# 手动触发构建（如果项目已存在）"
echo "curl -X POST ${JENKINS_URL}/job/${PROJECT_NAME}/build"
echo ""
echo "# 推送代码触发构建"
echo "git add ."
echo "git commit -m 'trigger build'"
echo "git push origin main"
echo ""

echo "诊断完成！"