#!/bin/bash

# Jenkins手动项目创建指南
# 用于在Jenkins Web界面中创建mycmdb-frontend项目

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

JENKINS_URL="http://localhost:8080"

echo -e "${BLUE}=== Jenkins手动项目创建指南 ===${NC}"
echo

# 1. 获取管理员密码
echo -e "${YELLOW}1. 获取Jenkins管理员密码${NC}"
echo "如果是首次登录，需要获取初始管理员密码："
echo
if docker exec jenkins-server test -f /var/jenkins_home/secrets/initialAdminPassword 2>/dev/null; then
    echo -e "${GREEN}初始管理员密码:${NC}"
    docker exec jenkins-server cat /var/jenkins_home/secrets/initialAdminPassword
    echo
else
    echo -e "${YELLOW}注意: 初始密码文件不存在，可能已经完成初始化${NC}"
    echo "请使用你设置的管理员账户登录"
    echo
fi

# 2. 访问Jenkins
echo -e "${YELLOW}2. 访问Jenkins Web界面${NC}"
echo "URL: ${JENKINS_URL}"
echo
echo "如果是首次访问，请按照向导完成初始化："
echo "- 输入管理员密码"
echo "- 安装推荐插件"
echo "- 创建管理员用户"
echo

# 3. 创建项目步骤
echo -e "${YELLOW}3. 创建新项目${NC}"
echo "在Jenkins主页面："
echo "1. 点击 '新建任务' 或 'New Item'"
echo "2. 输入项目名称: mycmdb-frontend"
echo "3. 选择 'Pipeline' 类型"
echo "4. 点击 'OK'"
echo

# 4. 配置项目
echo -e "${YELLOW}4. 配置项目${NC}"
echo "在项目配置页面："
echo
echo "【General 部分】"
echo "- 描述: Ant Design Pro前端项目自动化构建"
echo "- 勾选 'GitHub project'"
echo "- Project url: 你的GitHub仓库URL (如果有)"
echo
echo "【Build Triggers 部分】"
echo "- 勾选 'GitHub hook trigger for GITScm polling' (如果配置了GitHub)"
echo "- 勾选 'Poll SCM' 并设置: H/5 * * * * (每5分钟检查一次)"
echo
echo "【Pipeline 部分】"
echo "- Definition: Pipeline script from SCM"
echo "- SCM: Git"
echo "- Repository URL: /workspace/mycmdb (本地路径)"
echo "- Credentials: 无需设置 (本地路径)"
echo "- Branch Specifier: */main"
echo "- Script Path: Jenkinsfile"
echo
echo "5. 点击 '保存'"
echo

# 5. 测试构建
echo -e "${YELLOW}5. 测试构建${NC}"
echo "保存配置后："
echo "1. 在项目页面点击 'Build Now'"
echo "2. 观察构建进度"
echo "3. 点击构建号查看详细日志"
echo

# 6. 快速访问链接
echo -e "${YELLOW}6. 快速访问链接${NC}"
echo "Jenkins主页: ${JENKINS_URL}"
echo "创建新项目: ${JENKINS_URL}/view/all/newJob"
echo "项目页面: ${JENKINS_URL}/job/mycmdb-frontend/ (创建后)"
echo

# 7. 故障排除
echo -e "${YELLOW}7. 常见问题排除${NC}"
echo "如果构建失败，检查："
echo "- Jenkinsfile语法是否正确"
echo "- Docker是否在Jenkins容器中可用"
echo "- 项目路径是否正确挂载"
echo "- 依赖是否能正常安装"
echo

echo -e "${GREEN}现在请打开浏览器访问 ${JENKINS_URL} 开始创建项目！${NC}"

# 自动打开浏览器 (macOS)
if command -v open &> /dev/null; then
    echo
    read -p "是否自动打开浏览器? (y/N): " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        open "${JENKINS_URL}"
    fi
fi