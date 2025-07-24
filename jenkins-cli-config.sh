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
