# GitHub 集成 Jenkins 自动构建指南

## 🚀 方法一：通过 Jenkins Web 界面创建项目

### 1. 访问 Jenkins

打开浏览器访问: http://localhost:8080

### 2. 创建新项目

1. 点击 "新建任务"
2. 输入项目名称: `mycmdb-frontend`
3. 选择 "流水线" (Pipeline)
4. 点击 "确定"

### 3. 配置项目

#### 基本配置

- **描述**: MYCMDB 前端项目 - GitHub 自动构建

#### GitHub 项目配置

- 勾选 "GitHub project"
- **项目 URL**: 填入你的 GitHub 仓库 URL (例如: https://github.com/username/mycmdb)

#### 构建触发器

勾选以下选项:

- ☑️ "GitHub hook trigger for GITScm polling"
- ☑️ "轮询 SCM" - 日程表填入: `H/5 * * * *`

#### 流水线配置

- **定义**: Pipeline script from SCM
- **SCM**: Git
- **仓库 URL**: 你的 GitHub 仓库 URL (例如: https://github.com/username/mycmdb.git)
- **分支说明符**: `*/main`
- **脚本路径**: `Jenkinsfile`

### 4. 保存配置

点击 "保存" 完成项目创建

## 🔗 方法二：配置 GitHub Webhook

### 1. 在 GitHub 仓库中设置 Webhook

1. 进入你的 GitHub 仓库
2. 点击 "Settings" → "Webhooks"
3. 点击 "Add webhook"
4. 配置如下:
   - **Payload URL**: `http://你的服务器IP:8080/github-webhook/`
   - **Content type**: `application/json`
   - **Which events**: 选择 "Just the push event"
   - **Active**: 勾选

### 2. 测试 Webhook

推送代码到 GitHub，检查 Jenkins 是否自动触发构建

## 🛠 方法三：使用 ngrok 暴露本地 Jenkins (推荐用于测试)

如果你的 Jenkins 运行在本地，GitHub 无法直接访问，可以使用 ngrok:

### 1. 安装 ngrok

```bash
# macOS
brew install ngrok

# 或下载: https://ngrok.com/download
```

### 2. 暴露 Jenkins 端口

```bash
ngrok http 8080
```

### 3. 使用 ngrok URL 配置 Webhook

ngrok 会提供一个公网 URL，例如: `https://abc123.ngrok.io` 在 GitHub Webhook 中使用: `https://abc123.ngrok.io/github-webhook/`

## 📋 完整流程示例

### 1. 启动 Jenkins 和 ngrok

```bash
# 终端1: 启动Jenkins
docker run -d --name jenkins-server -p 8080:8080 -p 50000:50000 -v jenkins_home:/var/jenkins_home jenkins/jenkins:lts

# 终端2: 启动ngrok
ngrok http 8080
```

### 2. 配置 Jenkins 项目

按照上述方法一创建项目

### 3. 配置 GitHub Webhook

使用 ngrok 提供的 URL 配置 Webhook

### 4. 测试自动构建

```bash
# 提交代码
git add .
git commit -m "test: trigger jenkins build"
git push origin main
```

## 🔍 故障排除

### 常见问题

1. **Jenkins 项目未显示**

   - 检查 Jenkins 是否正常运行
   - 确认管理员密码正确
   - 查看 Jenkins 日志: `docker logs jenkins-server`

2. **GitHub Webhook 失败**

   - 检查 Webhook URL 是否正确
   - 确认 Jenkins 可以从外网访问
   - 查看 GitHub Webhook 的 Delivery 记录

3. **构建失败**
   - 检查 Jenkinsfile 语法
   - 确认 Docker 在 Jenkins 容器中可用
   - 查看构建日志

### 调试命令

```bash
# 查看Jenkins日志
docker logs jenkins-server

# 检查Jenkins容器状态
docker ps | grep jenkins

# 测试Jenkins API
curl -u admin:password http://localhost:8080/api/json
```
