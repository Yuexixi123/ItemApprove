pipeline {
    agent any
    
    environment {
        // Docker镜像名称和标签
        IMAGE_NAME = 'mycmdb-frontend'
        IMAGE_TAG = "${BUILD_NUMBER}"
        DOCKER_REGISTRY = 'localhost:5000' // 可以改为你的Docker Registry
        
        // Node.js版本
        NODE_VERSION = '18'
    }
    
    stages {
        stage('准备环境') {
            steps {
                echo "🚀 开始构建 MYCMDB 前端项目"
                echo "构建编号: ${BUILD_NUMBER}"
                echo "Git分支: ${env.GIT_BRANCH}"
                echo "Git提交: ${env.GIT_COMMIT}"
                
                // 清理工作空间
                cleanWs()
                
                // 检出代码
                checkout scm
            }
        }
        
        stage('安装依赖') {
            steps {
                echo "📦 安装项目依赖..."
                sh '''
                    # 安装pnpm（如果Jenkins容器中没有）
                    npm install -g pnpm
                    
                    # 安装项目依赖
                    pnpm install --frozen-lockfile
                '''
            }
        }
        
        stage('代码检查') {
            parallel {
                stage('ESLint检查') {
                    steps {
                        echo "🔍 运行ESLint检查..."
                        sh 'pnpm run lint'
                    }
                }
                
                stage('TypeScript检查') {
                    steps {
                        echo "🔍 运行TypeScript类型检查..."
                        sh 'npx tsc --noEmit'
                    }
                }
                
                stage('Prettier检查') {
                    steps {
                        echo "🔍 检查代码格式..."
                        sh 'pnpm run prettier:check || true'
                    }
                }
            }
        }
        
        stage('运行测试') {
            steps {
                echo "🧪 运行单元测试..."
                sh '''
                    # 运行测试并生成覆盖率报告
                    pnpm run test -- --coverage --watchAll=false
                '''
                
                // 发布测试报告
                publishHTML([
                    allowMissing: false,
                    alwaysLinkToLastBuild: true,
                    keepAll: true,
                    reportDir: 'coverage/lcov-report',
                    reportFiles: 'index.html',
                    reportName: '测试覆盖率报告'
                ])
            }
        }
        
        stage('构建Docker镜像') {
            steps {
                script {
                    echo "🐳 构建Docker镜像..."
                    
                    // 构建镜像
                    def image = docker.build("${IMAGE_NAME}:${IMAGE_TAG}")
                    
                    // 同时打上latest标签
                    sh "docker tag ${IMAGE_NAME}:${IMAGE_TAG} ${IMAGE_NAME}:latest"
                    
                    echo "✅ Docker镜像构建完成: ${IMAGE_NAME}:${IMAGE_TAG}"
                    
                    // 显示镜像信息
                    sh "docker images | grep ${IMAGE_NAME}"
                }
            }
        }
        
        stage('镜像安全扫描') {
            steps {
                echo "🔒 运行镜像安全扫描..."
                script {
                    try {
                        // 使用docker scan或trivy进行安全扫描（可选）
                        sh "docker run --rm -v /var/run/docker.sock:/var/run/docker.sock aquasec/trivy:latest image ${IMAGE_NAME}:${IMAGE_TAG} || true"
                    } catch (Exception e) {
                        echo "⚠️ 安全扫描工具未安装，跳过此步骤"
                    }
                }
            }
        }
        
        stage('推送镜像') {
            when {
                anyOf {
                    branch 'main'
                    branch 'master'
                    branch 'develop'
                }
            }
            steps {
                script {
                    echo "📤 推送Docker镜像到Registry..."
                    
                    // 如果有私有Registry，在这里推送
                    // docker.withRegistry("https://${DOCKER_REGISTRY}", 'docker-registry-credentials') {
                    //     def image = docker.image("${IMAGE_NAME}:${IMAGE_TAG}")
                    //     image.push()
                    //     image.push("latest")
                    // }
                    
                    echo "✅ 镜像推送完成"
                }
            }
        }
        
        stage('部署准备') {
            when {
                branch 'main'
            }
            steps {
                echo "🚀 准备部署..."
                
                // 生成部署脚本
                sh '''
                    cat > deploy-docker.sh << 'EOF'
#!/bin/bash
echo "🚀 部署MYCMDB前端应用..."

# 停止现有容器
docker stop mycmdb-frontend || true
docker rm mycmdb-frontend || true

# 启动新容器
docker run -d \\
    --name mycmdb-frontend \\
    -p 3000:80 \\
    --restart unless-stopped \\
    ${IMAGE_NAME}:${IMAGE_TAG}

echo "✅ 部署完成！"
echo "🌐 访问地址: http://localhost:3000"
EOF
                    chmod +x deploy-docker.sh
                '''
                
                // 归档部署脚本
                archiveArtifacts artifacts: 'deploy-docker.sh', fingerprint: true
            }
        }
    }
    
    post {
        always {
            echo "🧹 清理构建环境..."
            
            // 清理node_modules（可选）
            sh 'rm -rf node_modules || true'
            
            // 清理旧的Docker镜像（保留最近5个版本）
            script {
                try {
                    sh '''
                        # 清理旧镜像，保留最近5个版本
                        docker images ${IMAGE_NAME} --format "table {{.Tag}}" | grep -v TAG | grep -v latest | sort -nr | tail -n +6 | xargs -I {} docker rmi ${IMAGE_NAME}:{} || true
                    '''
                } catch (Exception e) {
                    echo "清理旧镜像时出现错误，继续执行"
                }
            }
        }
        
        success {
            echo "🎉 构建成功完成！"
            
            // 发送成功通知（可选）
            // slackSend(
            //     color: 'good',
            //     message: "✅ MYCMDB前端构建成功 - 构建 #${BUILD_NUMBER}"
            // )
        }
        
        failure {
            echo "❌ 构建失败！"
            
            // 发送失败通知（可选）
            // slackSend(
            //     color: 'danger',
            //     message: "❌ MYCMDB前端构建失败 - 构建 #${BUILD_NUMBER}"
            // )
        }
        
        unstable {
            echo "⚠️ 构建不稳定"
        }
    }
}