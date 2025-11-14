# 方案1：以 nginx:alpine 为基底，安装 bun
FROM nginx:alpine

# 安装 bun 依赖（Alpine 兼容库）
RUN apk add --no-cache curl libc6-compat

# 安装 bun（官方脚本，加入系统 PATH）
RUN curl -fsSL https://bun.sh/install | bash && \
    ln -s /root/.bun/bin/bun /usr/local/bin/bun && \
    ln -s /root/.bun/bin/bunx /usr/local/bin/bunx

# 验证 bun 和 nginx 安装成功
RUN bun --version && nginx -v

# 【关键】复制你的 Nginx 配置文件（根据实际路径调整，如无需自定义可删除此步）
# 示例：复制仓库中 packages/web/nginx.conf 到 Nginx 配置目录（与你最初的 Dockerfile 一致）
COPY ./packages/web/nginx.conf /etc/nginx/conf.d/default.conf

# 【关键】复制启动脚本（start.sh 需放在仓库根目录）
COPY start.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start.sh

# 复制你的应用代码（根据实际路径调整！）
# 示例：复制 bun 服务代码到容器 /app 目录，复制静态资源到 Nginx 目录
COPY ./packages/web/dist /usr/share/nginx/html
COPY ./packages/web/server /app
# 前台运行启动脚本（容器不退出）
CMD ["start.sh"]