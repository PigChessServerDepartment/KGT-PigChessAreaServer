# 使用官方 Node.js 镜像作为基础镜像
FROM node:18

# 设置工作目录,工作目录和ecosystem.config.js的cwd要一致
WORKDIR /usr/src/app

# 复制 package.json 和 package-lock.json
COPY package*.json ./

# 安装依赖
RUN npm install
#设置淘宝镜像源
RUN npm config set registry https://registry.npmmirror.com/
# 安装 ts-node 和 typescript
RUN npm install -g ts-node typescript
# 安装 PM2 全局
RUN npm install -g pm2
# 安装 bun 全局
RUN npm install -g bun

# 复制项目文件
COPY . .

# 暴露端口
EXPOSE 4000

# 启动应用,ecosystem.config.js为启动文件
CMD ["pm2-runtime", "start", "ecosystem.config.js"]