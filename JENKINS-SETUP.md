# Jenkins 自动化构建部署指南

## 📋 概述

本文档介绍如何为 MYCMDB 前端项目配置 Jenkins 自动化构建和部署流程。

## 🏗️ 架构说明

Git 仓库 → Jenkins → Docker 构建 → 容器部署 → 健康检查

## 🔧 前置要求

### 系统要求

- Jenkins 2.400+
- Docker 20.10+
- Node.js 18+
- Git

### Jenkins 插件

- Git plugin
- Docker plugin
- NodeJS plugin
- Pipeline plugin
- Blue Ocean (可选)

## 📦 安装配置

### 1. Jenkins 基础配置

#### 1.1 安装必要插件

```bash
# 在Jenkins管理界面安装以下插件
- Git plugin
- Docker plugin
- NodeJS plugin
- Pipeline plugin
- Docker Pipeline plugin
```

#### 1.2 配置全局工具

进入 `Manage Jenkins` → `Global Tool Configuration`

**NodeJS 配置：**

- 名称: `NodeJS-18`
- 版本: `18.x`
- 自动安装: ✅

**Docker 配置：**

```bash
# 确保Jenkins用户有Docker权限
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

### 2. 创建 Pipeline 项目

#### 2.1 新建项目

1. 点击 `New Item`
2. 输入项目名称: `mycmdb-frontend`
3. 选择 `Pipeline`
4. 点击 `OK`

#### 2.2 配置项目

**General 设置：**

- 描述: `MYCMDB前端项目自动化构建`
- 保留构建数量: `10`

**Build Triggers：**

- ✅ `GitHub hook trigger for GITScm polling`
- 或 ✅ `Poll SCM`: `H/5 * * * *` (每 5 分钟检查)

**Pipeline 设置：**

- Definition: `Pipeline script from SCM`
- SCM: `Git`
- Repository URL: `你的Git仓库地址`
- Branch: `*/main`
- Script Path: `Jenkinsfile`

### 3. 配置 Git Webhook（推荐）

#### 3.1 GitHub 配置

1. 进入 GitHub 仓库设置
2. 点击 `Webhooks` → `Add webhook`
3. Payload URL: `http://your-jenkins-url/github-webhook/`
4. Content type: `application/json`
5. Events: `Just the push event`

#### 3.2 GitLab 配置

1. 进入 GitLab 项目设置
2. 点击 `Webhooks`
3. URL: `http://your-jenkins-url/project/mycmdb-frontend`
4. Trigger: `Push events`

## 🚀 构建流程

### 构建阶段说明

1. **Checkout** - 检出代码
2. **Environment Setup** - 环境准备
3. **Install Dependencies** - 安装依赖
4. **Code Quality** - 代码质量检查
   - Lint 检查
   - 类型检查
   - 单元测试
5. **Build Application** - 构建应用
6. **Build Docker Image** - 构建 Docker 镜像
7. **Deploy** - 部署应用
8. **Health Check** - 健康检查
9. **Cleanup** - 清理资源

### 构建产物

- **Docker 镜像**: `mycmdb-frontend:${BUILD_NUMBER}`
- **静态文件**: `dist/` 目录
- **构建日志**: Jenkins 构建历史

## 🔍 监控和验证

### 健康检查

```bash
# 检查应用状态
curl http://localhost:3000/health

# 检查容器状态
docker ps | grep mycmdb-frontend

# 查看容器日志
docker logs mycmdb-frontend-current
```

### 访问地址

- **应用地址**: http://localhost:3000
- **健康检查**: http://localhost:3000/health
- **Jenkins 项目**: http://your-jenkins-url/job/mycmdb-frontend/

## 🛠️ 故障排除

### 常见问题

#### 1. 构建失败 - 依赖安装错误

```bash
# 解决方案：清理缓存
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

#### 2. Docker 构建失败

```bash
# 检查Docker服务
sudo systemctl status docker

# 检查Jenkins用户权限
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

#### 3. 端口冲突

```bash
# 查看端口占用
netstat -tulpn | grep :3000

# 停止冲突容器
docker stop $(docker ps -q --filter "publish=3000")
```

#### 4. 健康检查失败

```bash
# 检查nginx配置
docker exec mycmdb-frontend-current nginx -t

# 查看nginx日志
docker exec mycmdb-frontend-current tail -f /var/log/nginx/error.log
```

### 日志查看

```bash
# Jenkins构建日志
# 在Jenkins界面查看具体构建的Console Output

# 应用日志
docker logs -f mycmdb-frontend-current

# 系统日志
journalctl -u jenkins -f
```

## 📈 优化建议

### 1. 构建优化

- 使用 Docker 多阶段构建
- 启用 pnpm 缓存
- 并行执行测试和检查

### 2. 部署优化

- 蓝绿部署
- 滚动更新
- 自动回滚

### 3. 监控优化

- 集成 Prometheus 监控
- 配置告警通知
- 性能指标收集

## 🔐 安全配置

### 1. 凭据管理

```bash
# 在Jenkins中配置凭据
Manage Jenkins → Manage Credentials → Add Credentials
```

### 2. 权限控制

- 配置基于角色的访问控制
- 限制构建权限
- 审计日志记录

## 📞 支持和维护

### 定期维护任务

- 清理旧的 Docker 镜像
- 备份 Jenkins 配置
- 更新插件版本
- 监控磁盘空间

### 联系方式

- 项目维护者: [你的联系方式]
- 技术支持: [支持邮箱]

---

## 🎯 快速开始

1. **克隆项目**

   ```bash
   git clone [你的仓库地址]
   cd mycmdb
   ```

2. **配置 Jenkins**

   ```bash
   # 运行配置脚本
   chmod +x scripts/setup-jenkins.sh
   ./scripts/setup-jenkins.sh
   ```

3. **创建 Pipeline 项目**

   - 按照上述步骤在 Jenkins 中创建项目

4. **触发构建**

   ```bash
   # 提交代码触发自动构建
   git add .
   git commit -m "feat: 配置Jenkins自动化构建"
   git push origin main
   ```

5. **验证部署**
   ```bash
   # 检查应用状态
   curl http://localhost:3000/health
   ```

🎉 **恭喜！你的 Jenkins 自动化构建流程已配置完成！**
