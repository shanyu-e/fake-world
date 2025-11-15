#!/bin/sh
set -e  # 脚本执行出错时立即退出

# 启动 Nginx（前台模式，禁止后台 daemon）
echo "🔧 启动 Nginx 服务..."
nginx -g "daemon off;" &

# 启动 bun 服务（根据你的项目入口文件调整路径！）
echo "🚀 启动 Bun 服务..."
cd /app  # 进入 bun 项目目录（替换为你的 bun 服务根目录）
bun run /app/packages/api/src/index.ts  # 替换为你的 bun 启动命令（如 bun run dev、bun index.ts 等）

# 等待所有后台进程（确保容器不退出）
wait