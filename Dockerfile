# 多阶段构建 - 基于基础镜像构建最终应用
FROM cmdb-web:base AS builder

# 复制源代码（基础镜像已经包含依赖，这里只复制源码）
COPY . .

# 构建应用
RUN pnpm run build

# 生产阶段 - 使用nginx提供静态文件服务
FROM nginx:alpine AS production

# 复制自定义nginx配置
COPY nginx.conf /etc/nginx/nginx.conf

# 从构建阶段复制构建产物
COPY --from=builder /app/dist /usr/share/nginx/html

# 暴露端口
EXPOSE 80

# 启动nginx
CMD ["nginx", "-g", "daemon off;"]
