import { parentPort } from 'worker_threads';
import { RandomMatchSystem } from './RodomMatchSystem';
import { MatchType } from "./WorkerModel";
import { PlayerSessionCol } from '../PlayerSessionCol';
import { PlayerSession } from '../PlayerSession';
import { RoomCol } from '../RoomCol';
import FlakeId from 'flake-idgen';
import * as Model from '../Model';
import { RedisMgr } from '../RedisMgr';
import { LogicNode, QueueNodeMsg, WorkerMsgBaseNode, WorkerMsgType } from '../const';
import { WorkerBaseNodeSwitchFactory } from './WokerBaseNodeSwitchFactory';
import { QueueMatchReq, WorkerMsgId } from './WorkerModel';
import { match } from 'assert';

const flakeIdGen = new FlakeId();
let oneVone_queue: Set<string> = new Set<string>();
let moreVmore_queue: PlayerSession[] = [];
let oneVmore_value1_queue: PlayerSession[] = [];
let oneVmore_value3_queue: PlayerSession[] = [];

function processQueue() {
    let sys_status=RandomMatchSystem.getInstance().get_random_match_system_status();
    if(sys_status.length<=0) return;
    for(;;)
    {
        let match_type=sys_status[0];
        for(let i=0;i<sys_status.length;i++)
        {
            switch(match_type)
            {
                case MatchType.oneVone:
                oneVone_handle();
                break;
            }
        }
        if(RandomMatchSystem.getInstance().get_random_match_system_status().length<=0) break;
    }
}

async function oneVone_handle()
{
    let playername=RandomMatchSystem.getInstance().get_queue_a_1v1();
    if(playername==undefined) return;

    // let playersession=PlayerSessionCol.getInstance().GetPlayerSession(playername);
    // if(playersession==undefined) return;
    if(await RedisMgr.getInstance().GetRedis(Model.RedisPlayerType.RandomQueue+playername)==null) 
    {
        console.log("玩家不在 Model.RedisPlayerType.RandomQueue redis中")
        return;
    }
            
    oneVone_queue.add(playername);
    if(oneVone_queue.size>=2)
    {
        let tempqueue= await GetTempQueue(2);
        if(tempqueue.length==2)
        {
            let QueueMatchReq:QueueMatchReq={id:WorkerMsgId.QueueMatch,witch_worker:WorkerMsgType.QueueWorkerMsg,match_queue:tempqueue,match_type:MatchType.oneVone};
            parentPort?.postMessage(QueueMatchReq);
            DeleteInQueue(tempqueue);
        }
    }

    // if(oneVone_queue.length>=2)
    // {
    //     let p1_success=true,p2_success=true
    //     let player1=oneVone_queue[0];
    //     if(await RedisMgr.getInstance().GetRedis(Model.RedisPlayerType.RandomQueue+player1.playername)||!player1.WebSocketIsOpen())
    //     {
    //         p1_success=false
    //         oneVone_queue.shift();
    //     }
    //     let player2=oneVone_queue[1];
    //     if(await RedisMgr.getInstance().GetRedis(Model.RedisPlayerType.RandomQueue+player1.playername)||!player1.WebSocketIsOpen())
    //     {
    //         p2_success=false
    //         oneVone_queue.shift();
    //     }
        
    //     if(p1_success==false||p2_success==false)
    //     {
    //         if(p1_success==true)
    //         {
    //             oneVone_queue.push(player1)
    //         }

    //         if(p2_success==true)
    //         {
    //             oneVone_queue.push(player2)
    //         }
    //         return
    //     }

        // const uuid = flakeIdGen.next();
    //     RoomCol.getInstance().InsertRoom({roomname:uuid.toString(),password:uuid.toString()},player1,3,1);
    //     let random_room=RoomCol.getInstance().GetRoom({roomname:uuid.toString(),password:uuid.toString()});

    //     if(random_room!=undefined)
    //     {
    //         random_room.SetRadomRoomStatus(Model.MatchType.oneVone)
    //         random_room.AddPlayer(player2,3,2);
    //     }
    //     let allplayer:string[]=[];
    //     allplayer.push(player1.playername);
    //     allplayer.push(player2.playername)
    //     let res:Model.RadomMatchRoomCreateRes={
    //         id:Model.MsgId.RadomMatchRoomCreate,
    //         ownplayername:player1.playername,
    //         allplayer:allplayer,
    //         roomname:uuid.toString(),
    //         password:uuid.toString(),
    //         error:Model.ErrorCode.None}

    //     player1.WebSend(JSON.stringify(res));
    //     player2.WebSend(JSON.stringify(res));
    // }
}

async function GetTempQueue(size:number)
{
    let tempqueue:string[]=[];
    const iterator = oneVone_queue.values();
    for(let i=0;i<size;i++)
    {
        const Element = iterator.next().value; // 获取一个元素
        let isExist=await RedisMgr.getInstance().GetRedis(Model.RedisPlayerType.RandomQueue+Element);
        if (Element !== undefined && isExist!=null ) {
            tempqueue.push(Element);
        }
        else if(Element!== undefined&&isExist==null)
        {
            oneVone_queue.delete(Element); // 删除一个元素
        }
    }
    console.log("Worker:function GetTempQueue: ",tempqueue)
    return tempqueue;
}

function DeleteInQueue(tempqueue:string[])
{
    for(let i=0;i<tempqueue.length;i++)
    {
        if(oneVone_queue.has(tempqueue[i]))
        {
            oneVone_queue.delete(tempqueue[i]);
        }
    }
    console.log("Worker:function DeleteInQueue: ",tempqueue)
}

// 每秒钟处理队列一次
setInterval(processQueue, 1000);

// 监听来自父线程的消息
parentPort?.on('message', (message:WorkerMsgBaseNode) => {
    console.log(message)
    switch(message.workermsgtype)
    {
        case WorkerMsgType.QueueWorkerMsg:
            let queuenodemsg:QueueNodeMsg=WorkerBaseNodeSwitchFactory.getInstance().SwitchToAny(message) as QueueNodeMsg;
            RandomMatchSystem.getInstance().add_to_queue(queuenodemsg.match_type,queuenodemsg.playername)
            break;
    }
});