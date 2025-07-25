#!/bin/bash

echo "🔧 创建Jenkins项目..."

# Jenkins服务器信息
JENKINS_URL="http://localhost:8080"
JOB_NAME="mycmdb-frontend"

# 等待用户输入管理员密码
echo "请输入Jenkins管理员密码:"
read -s ADMIN_PASSWORD

# 创建项目配置XML
cat > job-config.xml << 'EOF'
<?xml version='1.1' encoding='UTF-8'?>
<flow-definition plugin="workflow-job">
  <actions/>
  <description>MYCMDB前端项目 - 自动构建Docker镜像</description>
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
  <definition class="org.jenkinsci.plugins.workflow.cps.CpsScmFlowDefinition" plugin="workflow-cps">
    <scm class="hudson.plugins.git.GitSCM" plugin="git">
      <configVersion>2</configVersion>
      <userRemoteConfigs>
        <hudson.plugins.git.UserRemoteConfig>
          <url>/workspace/mycmdb</url>
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
java -jar jenkins-cli.jar -s ${JENKINS_URL} -auth admin:${ADMIN_PASSWORD} create-job ${JOB_NAME} < job-config.xml

echo "✅ Jenkins项目创建完成！"
echo "🌐 访问地址: ${JENKINS_URL}/job/${JOB_NAME}/"

# 清理临时文件
rm job-config.xml

echo ""
echo "📋 下一步操作:"
echo "1. 访问 ${JENKINS_URL}/job/${JOB_NAME}/"
echo "2. 点击 '立即构建' 开始第一次构建"
echo "3. 查看构建日志和结果"