import * as http from 'http';
import WebSocket from 'ws';
import { URL } from 'url';  // 引入 URL 模块，用于解析 URL
import { IncomingMessage, ServerResponse } from 'http';  // 引入 HTTP 模块的类型
import {PlayerSession} from './PlayerSession';
import {MsgId,ErrorCode} from './Model';
import { PlayerSessionCol } from './PlayerSessionCol';
import { Worker } from 'worker_threads';
import { parentPort } from 'worker_threads';
import * as path from 'path';
import { CreateWorker } from './Worker/CreateWorker';

export const queue_worker=new CreateWorker('./QueueWorker.ts');
// 启动 Worker 线程
function startWorker() {
  queue_worker.worker_polling();
}

const server = http.createServer((req: IncomingMessage, res: ServerResponse) => {
  res.write('Hello, world!');
  res.end();
});

function main()
{
  const wss = new WebSocket.Server({ server });  // 使用 WebSocket.Server
// 监听 WebSocket 连接
  wss.on('connection', (ws: WebSocket, req: IncomingMessage) => 
  {
  // 获取查询参数
    console.log('connect');
    let playersession=new PlayerSession(ws,'');
    playersession.player_polling();
    // PlayerSessionCol.getInstance().InsertPlayerSession(playersession);
  });

  // 启动 HTTP 和 WebSocket 服务器
    const port = 4000;
    server.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}

main();
// 启动 Worker
startWorker();
