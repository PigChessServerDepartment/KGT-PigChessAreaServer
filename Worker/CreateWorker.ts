import { Worker } from 'worker_threads';
import * as path from 'path';
import { QueueWorkerNode, WorkerMsgType } from '../const';
import { WorkerLogisticSystem } from './WorkerLogisticSystem';
export class CreateWorker
{
    public filename: string = "";
    private worker: Worker;
    constructor(filename: string)
    {
        this.filename = filename;
        this.worker = new Worker
        (path.resolve(__dirname, this.filename),
        {execArgv: ['-r', 'ts-node/register', '--inspect']}); 

    }

    worker_polling()
    {
        this.worker.on('message', (message:any) => {
            let data: any;
            // 检查 message 类型
            if (typeof message === "string") {
                data = JSON.parse(message);
            } else if (Buffer.isBuffer(message)) {
                data = JSON.parse(message.toString());
            }
            else if (typeof message === "object") {
                data = message;
            } else if (message instanceof ArrayBuffer) {
                data = JSON.parse(Buffer.from(message).toString());
            } 
            else {
                throw new Error("Unsupported message format");
            }
            
            console.log('来自 Worker 的消息:', message);

            switch(data.witch_worker)
            {
                case WorkerMsgType.QueueWorkerMsg:
                    // console.log("QueueSystemMsg");
                    let queue_worker_node=new QueueWorkerNode(data.id,data);
                    WorkerLogisticSystem.getInstance().PostMsgToQue(queue_worker_node);
                    break;
            }
        });
        this.worker.on('error', (error:any) => {
            console.error('Worker 错误:', error);
        });
        this.worker.on('exit', (code:any) => {
            if (code !== 0) {
                console.error(`Worker 退出，退出码 ${code}`);
            }
        });
        this.worker.postMessage({ action: 'start',filename:this.filename });
    }

    send_message(message:any)
    {
        if(message)
        this.worker.postMessage(message);
    }
}