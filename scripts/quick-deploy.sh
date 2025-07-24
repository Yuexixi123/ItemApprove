#!/bin/bash

echo "=== MYCMDB快速部署脚本 ==="

# 配置变量
PROJECT_NAME="mycmdb-frontend"
GIT_BRANCH="main"
DEPLOY_PORT="3000"

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 日志函数
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查系统依赖..."
    
    # 检查Git
    if ! command -v git &> /dev/null; then
        log_error "Git未安装，请先安装Git"
        exit 1
    fi
    
    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi
    
    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js 18+"
        exit 1
    fi
    
    # 检查pnpm
    if ! command -v pnpm &> /dev/null; then
        log_warn "pnpm未安装，正在安装..."
        npm install -g pnpm
    fi
    
    log_info "依赖检查完成 ✅"
}

# 构建应用
build_app() {
    log_info "开始构建应用..."
    
    # 清理旧文件
    rm -rf node_modules dist || true
    
    # 安装依赖
    log_info "安装依赖..."
    pnpm install --frozen-lockfile
    
    # 代码检查
    log_info "执行代码检查..."
    pnpm run lint
    
    # 构建项目
    log_info "构建项目..."
    pnpm run build
    
    # 检查构建结果
    if [ ! -d "dist" ]; then
        log_error "构建失败：dist目录不存在"
        exit 1
    fi
    
    log_info "应用构建完成 ✅"
}

# 构建Docker镜像
build_docker() {
    log_info "构建Docker镜像..."
    
    local timestamp=$(date +%Y%m%d-%H%M%S)
    local image_tag="${PROJECT_NAME}:${timestamp}"
    
    # 构建镜像
    docker build -t ${image_tag} .
    docker tag ${image_tag} ${PROJECT_NAME}:latest
    
    log_info "Docker镜像构建完成: ${image_tag} ✅"
    echo ${image_tag} > .last_image_tag
}

# 部署应用
deploy_app() {
    log_info "部署应用..."
    
    local image_tag=$(cat .last_image_tag 2>/dev/null || echo "${PROJECT_NAME}:latest")
    
    # 停止旧容器
    log_info "停止旧容器..."
    docker stop ${PROJECT_NAME}-current || true
    docker rm ${PROJECT_NAME}-current || true
    
    # 启动新容器
    log_info "启动新容器..."
    docker run -d \
        --name ${PROJECT_NAME}-current \
        -p ${DEPLOY_PORT}:80 \
        --restart unless-stopped \
        ${image_tag}
    
    log_info "应用部署完成 ✅"
}

# 健康检查
health_check() {
    log_info "执行健康检查..."
    
    local max_attempts=6
    local attempt=1
    
    while [ $attempt -le $max_attempts ]; do
        sleep 5
        
        if curl -f http://localhost:${DEPLOY_PORT}/health > /dev/null 2>&1; then
            log_info "健康检查通过 ✅"
            return 0
        fi
        
        log_warn "健康检查失败，重试中... (${attempt}/${max_attempts})"
        ((attempt++))
    done
    
    log_error "健康检查失败，请检查应用状态"
    return 1
}

# 显示部署信息
show_info() {
    log_info "部署信息："
    echo "  应用地址: http://localhost:${DEPLOY_PORT}"
    echo "  健康检查: http://localhost:${DEPLOY_PORT}/health"
    echo "  容器名称: ${PROJECT_NAME}-current"
    echo ""
    echo "管理命令："
    echo "  查看日志: docker logs -f ${PROJECT_NAME}-current"
    echo "  停止应用: docker stop ${PROJECT_NAME}-current"
    echo "  重启应用: docker restart ${PROJECT_NAME}-current"
}

# 清理资源
cleanup() {
    log_info "清理旧资源..."
    
    # 清理旧镜像（保留最近3个）
    docker images ${PROJECT_NAME} --format "{{.Tag}}" | \
    grep -E "^[0-9]{8}-[0-9]{6}$" | \
    sort -r | \
    tail -n +4 | \
    xargs -r -I {} docker rmi ${PROJECT_NAME}:{} || true
    
    # 清理悬空镜像
    docker image prune -f || true
    
    log_info "清理完成 ✅"
}

# 主函数
main() {
    echo "开始部署 ${PROJECT_NAME}..."
    echo ""
    
    # 检查是否在项目根目录
    if [ ! -f "package.json" ] || [ ! -f "Dockerfile" ]; then
        log_error "请在项目根目录运行此脚本"
        exit 1
    fi
    
    # 执行部署流程
    check_dependencies
    build_app
    build_docker
    deploy_app
    
    # 健康检查
    if health_check; then
        show_info
        cleanup
        echo ""
        log_info "🎉 部署成功！"
    else
        log_error "部署失败，请检查日志"
        exit 1
    fi
}

# 脚本参数处理
case "${1:-}" in
    "build")
        check_dependencies
        build_app
        build_docker
        ;;
    "deploy")
        deploy_app
        health_check
        ;;
    "clean")
        cleanup
        ;;
    "status")
        docker ps | grep ${PROJECT_NAME} || echo "应用未运行"
        ;;
    *)
        main
        ;;
esac