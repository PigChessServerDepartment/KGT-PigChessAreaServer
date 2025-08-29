import { QueueWorkerNode } from "../const";
import { MatchType } from "./WorkerModel";
import { PlayerCol } from "../PlayerCol";
import { PlayerSessionCol } from "../PlayerSessionCol";
import { RedisMgr } from "../RedisMgr";
import { QueueMatchReq, WorkerMsgId } from "./WorkerModel";
import { EventEmitter } from 'events';
import * as Model from '../Model';
import { PlayerSession } from "../PlayerSession";
import FlakeId from 'flake-idgen';
import { RoomCol } from "../RoomCol";
import { ErrorDetail } from "../ErrorDetail";
type Handler = (msg: any) => void;
const flakeIdGen = new FlakeId();
export class WorkerLogisticSystem
{
    private static instance:WorkerLogisticSystem|null=null;
    private _worker_handlers=new Map<WorkerMsgId,Handler>();
    private _msg_que:QueueWorkerNode[]=[];
    private _eventEmitter=new EventEmitter();
    private _queueLock=false;
    private _bStop=false;
    static getInstance():WorkerLogisticSystem
    {
        if(!WorkerLogisticSystem.instance) WorkerLogisticSystem.instance=new WorkerLogisticSystem();
        return WorkerLogisticSystem.instance;
    }

    // 消费队列中的消息
    _startConsumer() {
        this._eventEmitter.on('processQueue', async () => {
            if (this._queueLock) return;
            this._queueLock = true;
            while (this._msg_que.length > 0 && !this._bStop) 
            {
                const msgNode = this._msg_que.shift(); // 获取队列中的第一个节点
                if(msgNode!=null&&msgNode.id!=null&&msgNode.msg!=null)
                {
                    let Success = await this.HandleWeb(msgNode.id,msgNode.msg);
                    if(Success==false) console.log("consumer false");
                }
            }
            this._queueLock = false;
        });
    }
    stopConsumer() {
        this._bStop = true;
    }

    HandleWeb(id:WorkerMsgId,msg:any)
    {
        console.log('handle web:'+id)
        if(!this._worker_handlers.has(id))
        {
            return false;
        }

        const handler = this._worker_handlers.get(id);
        if(handler) handler(msg);
        return true;
    }

    RegWorker(id:WorkerMsgId,handler:Handler){
        this._worker_handlers.set(id,handler);
    }

    PostMsgToQue(queue_worker_node:QueueWorkerNode)
    {
        this._msg_que.push(queue_worker_node);
        if(this._queueLock==false)
        {
            this._eventEmitter.emit('processQueue');
        }
    }

    ReturnMatchFail(player_sessions:PlayerSession[]=[],match_queue:string[]=[]):void
    {
       for(let player_session of player_sessions)
       {
            let msg:Model.RandomMatchFailRes={id:Model.MsgId.RandomMatchFail,match_queue:match_queue,error:Model.ErrorCode.RandomMatchFail,detail:ErrorDetail.RandomMatchFail_Status1}
            player_session.WebSend(msg);
       }
    }

    constructor()
    {
        this._startConsumer();
        this.RegWorker(WorkerMsgId.QueueMatch,async(msg:any)=>
        {
            let data:QueueMatchReq=msg;
            switch(data.match_type)
            {
                case MatchType.oneVone:
                    let player_sessions:PlayerSession[]=[];
                    let get_session_and_cache_success=true;
                    console.log("匹配1v1",data.match_queue)
                    for(let playername of data.match_queue)
                    {
                        let player_session=PlayerSessionCol.getInstance().GetPlayerSession(playername);
                        let player_cache=await RedisMgr.getInstance().GetRedis(Model.RedisPlayerType.RandomQueue+playername);
                        console.log("get Model.RedisPlayerType.RandomQueue: ",playername)
                        if(player_session==undefined||player_session==null||player_cache==undefined||player_cache==null||!player_session.WebSocketIsOpen()) 
                        {
                            if(player_session==undefined) console.log("player_session undefined")
                            if(player_session==null) console.log("player_session null")
                            if(player_cache==undefined) console.log("player_cache undefined")
                            if(player_cache==null) console.log("player_cache null")
                            if(player_session!=undefined&&player_session!=null&&!player_session.WebSocketIsOpen()) console.log("player_session WebSocketIsOpen ",player_session.WebSocketIsOpen())
                            get_session_and_cache_success=false;
                        }
                        else
                        {
                            console.log("获取到玩家session",player_session.playername)
                            await player_sessions.push(player_session);
                        }
                    }
                    console.log("全部获取成功")
                    if(get_session_and_cache_success==false||player_sessions.length<2) 
                    {
                        console.log("匹配失败")
                        this.ReturnMatchFail(player_sessions,data.match_queue);
                        return;
                    }

                    const uuid = flakeIdGen.next();
                    RoomCol.getInstance().InsertRoom({roomname:uuid.toString(),password:uuid.toString()},player_sessions[0],3,1);
                    let random_room=RoomCol.getInstance().GetRoom({roomname:uuid.toString(),password:uuid.toString()});

                    if(random_room!=undefined)
                    {
                        random_room.SetRadomRoomStatus(MatchType.oneVone)
                        random_room.AddPlayer(player_sessions[1],3,2);
                        random_room.GameStart();
                    }
                    let allplayer:string[]=[];
                    for(let player_session of player_sessions)
                    {
                        allplayer.push(player_session.playername);
                    }
                    let res:Model.RadomMatchRoomCreateRes={
                        id:Model.MsgId.RadomMatchRoomCreate,
                        ownplayername:allplayer[0],
                        allplayer:allplayer,
                        roomname:uuid.toString(),
                        password:uuid.toString(),
                        error:Model.ErrorCode.None}
                    for(let player_session of player_sessions)
                    {
                        console.log("匹配成功")
                        player_session.WebSend(res);
                    }
                break;
            }
        });
    }
    
}