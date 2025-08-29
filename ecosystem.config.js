module.exports = {
  apps : [{
    cwd: '/usr/src/app', // 项目的目录位置
    kill_timeout: 10000,
    wait_ready: true,
    watch: false, // 是否监听文件改动，而重新启动服务
    ignore_watch: ['node_modules'], // 忽略监听的目录
    name   : "server", // 启动项目的别名
    script : "./server.ts" // 项目的启动文件
  }]
}