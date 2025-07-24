pipeline {
    agent any
    
    // 添加触发器配置
    triggers {
        // SCM轮询：每5分钟检查一次代码变更
        pollSCM('H/5 * * * *')
        // 或者使用cron触发器（可选）
        // cron('H/10 * * * *')
    }
    
    tools {
        nodejs 'NodeJS-18'  // 确保Jenkins中配置了NodeJS-18
    }
    
    environment {
        PROJECT_NAME = 'mycmdb-frontend'
        DOCKER_IMAGE = "${PROJECT_NAME}"
        DOCKER_TAG = "${BUILD_NUMBER}"
        REGISTRY_URL = '' // 如果有私有仓库，在这里配置
        DEPLOY_PORT = '3000'
        HEALTH_CHECK_URL = "http://localhost:${DEPLOY_PORT}/health"
    }
    
    options {
        // 保留最近10次构建
        buildDiscarder(logRotator(numToKeepStr: '10'))
        // 超时设置
        timeout(time: 30, unit: 'MINUTES')
        // 禁用并发构建
        disableConcurrentBuilds()
        // 跳过默认的代码检出
        skipDefaultCheckout(false)
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '📥 检出代码...'
                checkout scm
                
                script {
                    // 获取Git信息
                    env.GIT_COMMIT_SHORT = sh(
                        script: 'git rev-parse --short HEAD',
                        returnStdout: true
                    ).trim()
                    env.GIT_BRANCH = sh(
                        script: 'git rev-parse --abbrev-ref HEAD',
                        returnStdout: true
                    ).trim()
                    env.GIT_AUTHOR = sh(
                        script: 'git log -1 --pretty=format:"%an"',
                        returnStdout: true
                    ).trim()
                    env.GIT_MESSAGE = sh(
                        script: 'git log -1 --pretty=format:"%s"',
                        returnStdout: true
                    ).trim()
                }
                
                echo "Git分支: ${env.GIT_BRANCH}"
                echo "Git提交: ${env.GIT_COMMIT_SHORT}"
                echo "提交作者: ${env.GIT_AUTHOR}"
                echo "提交信息: ${env.GIT_MESSAGE}"
            }
        }
        
        stage('Environment Setup') {
            steps {
                echo '🔧 设置构建环境...'
                sh '''
                    echo "Node版本: $(node --version)"
                    echo "NPM版本: $(npm --version)"
                    
                    # 安装pnpm
                    if ! command -v pnpm &> /dev/null; then
                        npm install -g pnpm
                    fi
                    echo "PNPM版本: $(pnpm --version)"
                    
                    # 清理工作空间
                    rm -rf node_modules dist || true
                '''
            }
        }
        
        stage('Install Dependencies') {
            steps {
                echo '📦 安装项目依赖...'
                sh 'pnpm install --frozen-lockfile'
            }
        }
        
        stage('Code Quality') {
            parallel {
                stage('Lint Check') {
                    steps {
                        echo '🔍 执行代码检查...'
                        sh 'pnpm run lint'
                    }
                }
                stage('Type Check') {
                    steps {
                        echo '📝 执行类型检查...'
                        sh 'pnpm run tsc'
                    }
                }
                stage('Unit Tests') {
                    when {
                        expression {
                            return fileExists('jest.config.ts') || fileExists('jest.config.js')
                        }
                    }
                    steps {
                        echo '🧪 运行单元测试...'
                        sh 'pnpm run test -- --watchAll=false --coverage=false --passWithNoTests --passWithNoTests'
                    }
                }
            }
        }
        
        stage('Build Application') {
            steps {
                echo '🏗️ 构建前端应用...'
                sh 'pnpm run build'
                
                // 检查构建产物
                sh '''
                    if [ ! -d "dist" ]; then
                        echo "❌ 构建失败：dist目录不存在"
                        exit 1
                    fi
                    
                    echo "✅ 构建成功，产物大小："
                    du -sh dist/
                '''
            }
        }
        
        stage('Build Docker Image') {
            steps {
                echo '🐳 构建Docker镜像...'
                script {
                    def imageTag = "${DOCKER_IMAGE}:${BUILD_NUMBER}"
                    def latestTag = "${DOCKER_IMAGE}:latest"
                    
                    // 构建镜像
                    def image = docker.build(imageTag)
                    
                    // 标记为latest
                    sh "docker tag ${imageTag} ${latestTag}"
                    
                    // 如果配置了私有仓库，推送镜像
                    if (env.REGISTRY_URL) {
                        docker.withRegistry("https://${env.REGISTRY_URL}", 'docker-registry-credentials') {
                            image.push()
                            image.push('latest')
                        }
                    }
                    
                    echo "✅ 镜像构建完成: ${imageTag}"
                }
            }
        }
        
        stage('Deploy') {
            steps {
                echo '🚀 部署应用...'
                sh '''
                    # 停止旧容器
                    docker stop ${PROJECT_NAME}-current || true
                    docker rm ${PROJECT_NAME}-current || true
                    
                    # 启动新容器
                    docker run -d \
                        --name ${PROJECT_NAME}-current \
                        -p ${DEPLOY_PORT}:80 \
                        --restart unless-stopped \
                        -e BUILD_NUMBER=${BUILD_NUMBER} \
                        -e GIT_COMMIT=${GIT_COMMIT_SHORT} \
                        -e GIT_BRANCH=${GIT_BRANCH} \
                        -e GIT_AUTHOR="${GIT_AUTHOR}" \
                        ${DOCKER_IMAGE}:${BUILD_NUMBER}
                    
                    echo "✅ 容器启动成功"
                '''
            }
        }
        
        stage('Health Check') {
            steps {
                echo '🏥 执行健康检查...'
                script {
                    def maxRetries = 6
                    def retryInterval = 10
                    
                    for (int i = 1; i <= maxRetries; i++) {
                        try {
                            sleep(retryInterval)
                            sh "curl -f ${HEALTH_CHECK_URL}"
                            echo "✅ 健康检查通过！"
                            break
                        } catch (Exception e) {
                            if (i == maxRetries) {
                                error("❌ 健康检查失败：服务无法正常访问")
                            } else {
                                echo "⏳ 等待服务启动... (${i}/${maxRetries})"
                            }
                        }
                    }
                }
            }
        }
        
        stage('Cleanup') {
            steps {
                echo '🧹 清理资源...'
                sh '''
                    # 清理旧镜像（保留最近5个版本）
                    docker images ${DOCKER_IMAGE} --format "{{.Tag}}" | \
                    grep -E "^[0-9]+$" | \
                    sort -nr | \
                    tail -n +6 | \
                    xargs -r -I {} docker rmi ${DOCKER_IMAGE}:{} || true
                    
                    # 清理悬空镜像
                    docker image prune -f || true
                    
                    echo "✅ 清理完成"
                '''
            }
        }
    }
    
    post {
        always {
            echo '📊 构建后处理...'
            
            // 发布构建产物（如果需要）
            archiveArtifacts artifacts: 'dist/**/*', allowEmptyArchive: true
            
            // 清理工作空间
            cleanWs()
        }
        
        success {
            echo '🎉 构建成功！'
            script {
                def deployUrl = "http://localhost:${env.DEPLOY_PORT}"
                def message = """
                ✅ **构建部署成功**
                
                📋 **构建信息**
                - 项目: ${env.PROJECT_NAME}
                - 构建号: ${env.BUILD_NUMBER}
                - 分支: ${env.GIT_BRANCH}
                - 提交: ${env.GIT_COMMIT_SHORT}
                - 作者: ${env.GIT_AUTHOR}
                - 信息: ${env.GIT_MESSAGE}
                
                🔗 **访问地址**
                - 应用地址: ${deployUrl}
                - 健康检查: ${env.HEALTH_CHECK_URL}
                
                🐳 **镜像信息**
                - 镜像: ${env.DOCKER_IMAGE}:${env.BUILD_NUMBER}
                """
                
                echo message
                
                // 如果配置了通知，可以在这里发送
                // slackSend(message: message)
                // emailext(subject: "构建成功 - ${env.PROJECT_NAME}", body: message)
            }
        }
        
        failure {
            echo '❌ 构建失败！'
            script {
                def message = """
                ❌ **构建失败**
                
                📋 **构建信息**
                - 项目: ${env.PROJECT_NAME}
                - 构建号: ${env.BUILD_NUMBER}
                - 分支: ${env.GIT_BRANCH}
                - 提交: ${env.GIT_COMMIT_SHORT}
                - 作者: ${env.GIT_AUTHOR}
                - 信息: ${env.GIT_MESSAGE}
                
                🔗 **查看详情**
                - 构建日志: ${env.BUILD_URL}console
                """
                
                echo message
                
                // 发送失败通知
                // slackSend(color: 'danger', message: message)
                // emailext(subject: "构建失败 - ${env.PROJECT_NAME}", body: message)
            }
        }
        
        unstable {
            echo '⚠️ 构建不稳定'
        }
    }
}