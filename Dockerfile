ARG DATABASE_URL

FROM node:lts AS api-builder
ENV NODE_ENV=production
WORKDIR /app
ADD package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc /app/
ADD packages/api/package.json /app/packages/api/
RUN corepack enable && cd packages/api && pnpm install --prod --no-optional
ADD . /app
RUN cd packages/api && DATABASE_URL=$DATABASE_URL npx prisma generate


FROM node:lts AS app-builder
ENV PROJECT_ENV=production
WORKDIR /code
ADD package.json pnpm-lock.yaml pnpm-workspace.yaml .npmrc /code/
ADD packages/web/package.json /code/packages/web/
RUN corepack enable && cd ./packages/web && pnpm install
ADD . /code
RUN pnpm run build:web


FROM oven/bun:alpine
RUN apk add --no-cache nginx
# 验证 bun 和 nginx 安装成功
RUN bun --version && nginx -v

# 示例：复制仓库中 packages/web/nginx.conf 到 Nginx 配置目录（与你最初的 Dockerfile 一致）
COPY ./packages/web/nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=app-builder code/packages/web/dist /usr/share/nginx/html

COPY --from=api-builder /app /app

# 【关键】复制启动脚本（start.sh 需放在仓库根目录）
COPY start.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/start.sh

# 前台运行启动脚本（容器不退出）
CMD ["tail -f /dev/null"]
# CMD ["start.sh"]
EXPOSE 80