#!/bin/bash

echo "=== Jenkins项目配置脚本 ==="

# 项目配置
PROJECT_NAME="mycmdb-frontend"
GIT_REPO_URL="https://github.com/Yuexixi123/ItemApprove.git"  # 更新为实际仓库地址
JENKINS_URL="http://localhost:8080"  # 替换为你的Jenkins地址

echo "项目名称: ${PROJECT_NAME}"
echo "Git仓库: ${GIT_REPO_URL}"
echo "Jenkins地址: ${JENKINS_URL}"

echo ""
echo "=== 配置步骤 ==="
echo ""

echo "1. 📋 Jenkins系统配置"
echo "   - 安装必要插件："
echo "     * Git plugin"
echo "     * Docker plugin"
echo "     * NodeJS plugin"
echo "     * Pipeline plugin"
echo "     * Blue Ocean (可选)"
echo ""

echo "2. 🔧 全局工具配置"
echo "   - 配置NodeJS："
echo "     * 名称: NodeJS-18"
echo "     * 版本: 18.x"
echo "     * 自动安装: 是"
echo ""
echo "   - 配置Docker："
echo "     * 确保Jenkins用户有Docker权限"
echo "     * 添加Jenkins用户到docker组: sudo usermod -aG docker jenkins"
echo ""

echo "3. 🚀 创建Pipeline项目"
echo "   - 项目名称: ${PROJECT_NAME}"
echo "   - 项目类型: Pipeline"
echo "   - Pipeline定义: Pipeline script from SCM"
echo "   - SCM: Git"
echo "   - 仓库URL: ${GIT_REPO_URL}"
echo "   - 脚本路径: Jenkinsfile"
echo ""

echo "4. ⚙️ 配置构建触发器"
echo "   - GitHub hook trigger (推荐)"
echo "   - 或定时构建: H/5 * * * * (每5分钟检查一次)"
echo ""

echo "5. 🔐 配置凭据（如果需要）"
echo "   - Git凭据 (如果是私有仓库)"
echo "   - Docker Registry凭据 (如果使用私有仓库)"
echo ""

echo "=== 自动化配置命令 ==="
echo ""

# 创建Jenkins CLI配置
cat > jenkins-cli-config.sh << 'EOF'
#!/bin/bash

# Jenkins CLI配置
JENKINS_URL="http://localhost:8080"
JENKINS_USER="admin"
JENKINS_TOKEN="your-api-token"  # 在Jenkins用户设置中生成

# 下载Jenkins CLI
if [ ! -f jenkins-cli.jar ]; then
    wget ${JENKINS_URL}/jnlpJars/jenkins-cli.jar
fi

# 创建项目
java -jar jenkins-cli.jar -s ${JENKINS_URL} -auth ${JENKINS_USER}:${JENKINS_TOKEN} \
    create-job ${PROJECT_NAME} < project-config.xml

echo "项目创建完成！"
echo "访问地址: ${JENKINS_URL}/job/${PROJECT_NAME}/"
EOF

# 创建项目配置XML
cat > project-config.xml << EOF
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job@2.40">
  <actions/>
  <description>MYCMDB前端项目自动化构建</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <hudson.triggers.SCMTrigger>
          <spec>H/5 * * * *</spec>
          <ignorePostCommitHooks>false</ignorePostCommitHooks>
        </hudson.triggers.SCMTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps@2.92">
    <scm class="hudson.plugins.git.GitSCM" plugin="git@4.8.3">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>${GIT_REPO_URL}</url>
        </hudson.plugins.git.UserRemoteConfig>
      </userRemoteConfigs>
      <branches>
        <hudson.plugins.git.BranchSpec>
          <name>*/main</name>
        </hudson.plugins.git.BranchSpec>
      </branches>
      <doGenerateSubmoduleConfigurations>false</doGenerateSubmoduleConfigurations>
      <submoduleCfg class="list"/>
      <extensions/>
    </scm>
    <scriptPath>Jenkinsfile</scriptPath>
    <lightweight>true</lightweight>
  </definition>
  <triggers/>
  <disabled>false</disabled>
</flow-definition>
EOF

chmod +x jenkins-cli-config.sh

echo "配置文件已生成："
echo "- jenkins-cli-config.sh (CLI配置脚本)"
echo "- project-config.xml (项目配置文件)"
echo ""

echo "=== 手动配置步骤 ==="
echo ""
echo "1. 访问Jenkins: ${JENKINS_URL}"
echo "2. 安装推荐插件"
echo "3. 配置全局工具 (Manage Jenkins -> Global Tool Configuration)"
echo "4. 创建新项目 (New Item -> Pipeline)"
echo "5. 配置Git仓库和Jenkinsfile路径"
echo "6. 保存并构建"
echo ""

echo "=== 验证构建 ==="
echo "提交代码到Git仓库，Jenkins将自动触发构建"
echo "构建完成后访问: http://localhost:3000"
echo ""

echo "配置完成！🎉"