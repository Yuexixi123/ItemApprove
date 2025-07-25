#!/bin/bash

echo "🔧 创建GitHub集成的Jenkins项目..."

# Jenkins服务器信息
JENKINS_URL="http://localhost:8080"
JOB_NAME="mycmdb-frontend-github"

# 获取GitHub仓库信息
echo "请输入你的GitHub仓库URL (例如: https://github.com/username/mycmdb.git):"
read GITHUB_REPO_URL

echo "请输入Jenkins管理员密码:"
read -s ADMIN_PASSWORD

# 创建项目配置XML
cat > github-job-config.xml << EOF
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <actions/>
  <description>MYCMDB前端项目 - GitHub自动构建Docker镜像</description>
  <keepDependencies>false</keepDependencies>
  <properties>
    <org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
      <triggers>
        <com.cloudbees.jenkins.GitHubPushTrigger plugin="github">
          <spec></spec>
        </com.cloudbees.jenkins.GitHubPushTrigger>
        <hudson.triggers.SCMTrigger>
          <spec>H/5 * * * *</spec>
          <ignorePostCommitHooks>false</ignorePostCommitHooks>
        </hudson.triggers.SCMTrigger>
      </triggers>
    </org.jenkinsci.plugins.workflow.job.properties.PipelineTriggersJobProperty>
    <org.jenkinsci.plugins.github.config.GitHubProjectProperty plugin="github">
      <projectUrl>${GITHUB_REPO_URL%%.git}</projectUrl>
      <displayName></displayName>
    </org.jenkinsci.plugins.github.config.GitHubProjectProperty>
  </properties>
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps">
    <scm class="hudson.plugins.git.GitSCM" plugin="git">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>${GITHUB_REPO_URL}</url>
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

# 下载Jenkins CLI（如果不存在）
if [ ! -f "jenkins-cli.jar" ]; then
    echo "📥 下载Jenkins CLI..."
    curl -O ${JENKINS_URL}/jnlpJars/jenkins-cli.jar
fi

# 创建Jenkins项目
echo "🏗️ 创建Jenkins项目: ${JOB_NAME}"
java -jar jenkins-cli.jar -s ${JENKINS_URL} -auth admin:${ADMIN_PASSWORD} create-job ${JOB_NAME} < github-job-config.xml

if [ $? -eq 0 ]; then
    echo "✅ Jenkins项目创建完成！"
    echo "🌐 访问地址: ${JENKINS_URL}/job/${JOB_NAME}/"
else
    echo "❌ 项目创建失败，请检查Jenkins是否运行正常"
    exit 1
fi

# 清理临时文件
rm github-job-config.xml

echo ""
echo "📋 下一步操作:"
echo "1. 访问 ${JENKINS_URL}/job/${JOB_NAME}/"
echo "2. 配置GitHub Webhook (见下方说明)"
echo "3. 推送代码到GitHub测试自动构建"
echo ""
echo "🔗 GitHub Webhook配置:"
echo "   Payload URL: ${JENKINS_URL}/github-webhook/"
echo "   Content type: application/json"
echo "   Events: Just the push event"