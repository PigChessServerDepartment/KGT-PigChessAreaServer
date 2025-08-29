import * as Model from './Model';
import { parentPort } from 'worker_threads';
import WebSocket from 'ws';
import { PlayerSession } from './PlayerSession';
import {Defer, QueueNodeMsg,LogicNode, WorkerMsgBaseNode, WorkerMsgType} from "./const";
import { EventEmitter } from 'events';
import { RoomCol } from './RoomCol';
import { Room } from './Room';
import { RedisMgr } from './RedisMgr';
import { RandomMatchSystem } from './Worker/RodomMatchSystem';
import { PlayerCol } from './PlayerCol';
import { PlayerSessionCol } from './PlayerSessionCol';
import { WorkerBaseNodeSwitchFactory } from './Worker/WokerBaseNodeSwitchFactory';
import { queue_worker } from './server';
import { MatchType } from './Worker/WorkerModel';
import { ErrorDetail } from './ErrorDetail';
type Handler = (msg: any, con:PlayerSession) => void;
export class LogisticSystem
{
    private static instance: LogisticSystem | null = null;
    private _web_handlers=new Map<Model.MsgId,Handler>();
    private _msg_que:LogicNode[]=[];
    private _eventEmitter=new EventEmitter();
    private _queueLock=false;
    private _bStop=false;
    static getInstance(): LogisticSystem
    {
        if (!LogisticSystem.instance) LogisticSystem.instance = new LogisticSystem();
        return LogisticSystem.instance;
    }

    // 消费队列中的消息
    _startConsumer() {
        this._eventEmitter.on('processQueue', async () => {
            if (this._queueLock) return;
            this._queueLock = true;
            while (this._msg_que.length > 0 && !this._bStop) 
            {
                const msgNode = this._msg_que.shift(); // 获取队列中的第一个节点
                if(msgNode?.recnode!=null&&msgNode.recnode.id!=null&&msgNode.recnode.msg!=null&&msgNode.playersession!=null)
                {
                    let Success = await this.HandleWeb(msgNode.recnode?.id,msgNode?.recnode?.msg,msgNode?.playersession);
                    if(Success==false) console.log("consumer false");
                }
            }
            this._queueLock = false;
        });
    }
    stopConsumer() {
        this._bStop = true;
    }

    HandleWeb(id:Model.MsgId,msg:any,playersession:PlayerSession)
    {
        console.log('handle web:'+id)
        if(!this._web_handlers.has(id))
        {
            return false;
        }

        const handler = this._web_handlers.get(id);
        if(handler) handler(msg,playersession);
        return true;
    }

    RegWeb(id:Model.MsgId,handler:Handler){
        this._web_handlers.set(id,handler);
    }

    PostMsgToQue(logicnode:LogicNode)
    {
        this._msg_que.push(logicnode);
        if(this._queueLock==false)
        {
            this._eventEmitter.emit('processQueue');
        }
    }

    constructor()
    {
        this._startConsumer();
        this.RegWeb(Model.MsgId.StressTest,(msg:any,con:PlayerSession)=>{
            const data:Model.StressTestDataReq=msg
            console.log("Reg: "+data)
            const res:Model.StressTestDataRes={id:Model.MsgId.StressTest,playername:data.playername}
            con.WebSend(JSON.stringify(res))
        })

        this.RegWeb(Model.MsgId.CreateRoom,(msg:any,con:PlayerSession)=>{
            //创建房间
            const data:Model.CreateRoomReq=msg;
            console.log(data);
            let success=RoomCol.getInstance().InsertRoom(data,con);
            const res:Model.CreateRoomRes={id:Model.MsgId.CreateRoom,error:Model.ErrorCode.CreateRoomSuccess,roomname:data.roomname}
            if(!success)
            {
                res.error=Model.ErrorCode.CreateRoomFail
            }
            
            con.WebSend(JSON.stringify(res))
        })

        this.RegWeb(Model.MsgId.ConnectRoom,(msg:any,con:PlayerSession)=>{
            const data:Model.ConnectRoomReq=msg
            console.log(data)
            let room:Room|undefined=RoomCol.getInstance().GetRoom(data)
            const res:Model.ConnectRoomRes={id:Model.MsgId.ConnectRoom,error:Model.ErrorCode.ConnectRoomSuccess,roomname:data.roomname,alllocation:[]}
            if(room)
            {
                if(room.password!=data.password)
                {
                    res.error=Model.ErrorCode.PasswordORRoomnameErr
                    con.WebSend(JSON.stringify(res))
                    return
                }
                room.AddPlayer(con,0,0)
                res.alllocation=room.GetAllLocation()
                con.WebSend(JSON.stringify(res))
            }
            else
            {
                res.error=Model.ErrorCode.PasswordORRoomnameErr
                con.WebSend(JSON.stringify(res))
            }
        })

        this.RegWeb(Model.MsgId.ReConnectRoom,async(msg:any,con:PlayerSession)=>{
            const data:Model.ReConnectRoomReq=msg
            console.log(data)
            let room:Room|undefined=RoomCol.getInstance().GetRoom(data)
            const res:Model.ReConnectRoomRes={id:Model.MsgId.ReConnectRoom,error:Model.ErrorCode.ReConnectRoomSuccess,roomname:data.roomname}
            if(room)
                {
                    if(room.password!=data.password)
                    {
                        res.error=Model.ErrorCode.PasswordORRoomnameErr
                        con.WebSend(JSON.stringify(res))
                        return
                    }
                    let playercache=await RedisMgr.getInstance().GetRedis(Model.RedisPlayerType.WhenPlayingLeave+con.playername)
                    if(playercache!=null)
                    {
                        let playercachejson:Model.PlayerCacheData=JSON.parse(playercache)
                        room.AddReConnectPlayer(con,playercachejson)
                        room.RemoveWhenPlayingLeavePlayer(con.playername)
                        con.WebSend(JSON.stringify(res))
                        await RedisMgr.getInstance().DelRedis(Model.RedisPlayerType.WhenPlayingLeave+con.playername)
                    }
                    else
                    {
                        res.error=Model.ErrorCode.ReConnectRoomFail
                        con.WebSend(JSON.stringify(res))
                    }
                }
                else
                {
                    res.error=Model.ErrorCode.PasswordORRoomnameErr
                    con.WebSend(JSON.stringify(res))
                }
        });

        this.RegWeb(Model.MsgId.ChangeLocation,(msg:any,con:PlayerSession)=>{
            const data:Model.ChangeLocationReq=msg
            console.log("Reg: ",data)
            const res:Model.ChangeLocationRes=
            {
                id:Model.MsgId.ChangeLocation,
                error:Model.ErrorCode.ChangeLocationSuccess,
                playername:data.playername,
                nextlocation:data.nextlocation,
                nowlocation:data.nowlocation,
                value:data.value,
                detail:ErrorDetail.None,
                alllocation:[]
            }
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.ChangeLocationFail
                res.detail=ErrorDetail.PlayerRoomEmpty
                con.WebSend(JSON.stringify(res))
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                let player=PlayerCol.getInstance().GetPlayer(con.playername)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    res.detail=ErrorDetail.RoomInstanceNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                res.alllocation=now_game_room_instance.GetAllLocation()
                if(player==null||player==undefined)
                {
                    res.error=Model.ErrorCode.ChangeLocationFail
                    res.detail=ErrorDetail.PlayerInstanceNull
                    con.WebSend(JSON.stringify(res))
                    return
                }

                player.SetLocationAndValue(data.value,data.nowlocation,data.nextlocation)
                now_game_room_instance.Broadcast(res)
                // if(now_game_room_instance.ChangeLocationCheck(con,data.nextlocation)==true)
                // {
                //     console.log("ChangeLocationCheck: ",con.playername)
                //     player.SetLocationAndValue(data.value,data.nowlocation,data.nextlocation)
                //     now_game_room_instance.Broadcast(res)
                // }
                // else
                // {
                //     res.error=Model.ErrorCode.SomeoneHaveInThisLocation
                //     res.detail=ErrorDetail.SomeoneHaveInThisLocation
                //     con.WebSend(JSON.stringify(res))
                // }
            }
        })

        this.RegWeb(Model.MsgId.GetAllLocation,(msg:any,con:PlayerSession)=>{
            const data:Model.GetAllLocationReq=msg
            console.log("Reg: "+data)
            const res:Model.GetAllLocationRes=
            {
                id:Model.MsgId.GetAllLocation,
                alllocation:[],
                error:Model.ErrorCode.GetAllLocationSuccess
            }
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.GetAllLocationFail
                con.WebSend(JSON.stringify(res))
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                res.alllocation=now_game_room_instance.GetAllLocation()
                con.WebSend(JSON.stringify(res))
            }
        })

        this.RegWeb(Model.MsgId.GameStart,(msg:any,con:PlayerSession)=>{
            const data:Model.GameStartReq=msg
            const res:Model.GameStartRes={id:Model.MsgId.GameStart,error:Model.ErrorCode.GameStartSuccess}
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.GameStartNotAtRoomFail
                con.WebSend(JSON.stringify(res))
                return
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                if(now_game_room_instance.ower==null||now_game_room_instance.ower.GetPlayerSession().playername!=con.playername)
                {
                    res.error=Model.ErrorCode.GameStartNotOwnerFail
                    con.WebSend(JSON.stringify(res))
                    return
                }
                now_game_room_instance.Broadcast(res)
            }
        })

        this.RegWeb(Model.MsgId.GameMessage,(msg:any,con:PlayerSession)=>{
            const data:Model.GameMessageReq=msg
            const res:Model.GameMessageRes={
                id:Model.MsgId.GameMessage,error:Model.ErrorCode.GameMessageSuccess,gamemessage:data.gamemessage
            }
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.GameMessageFail
                con.WebSend(JSON.stringify(res))
                return
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                now_game_room_instance.SetRoomGameMessage(data.gamemessage)
                now_game_room_instance.Broadcast(res)
            }
        })

        this.RegWeb(Model.MsgId.GamePlayerLoadFinish,(msg:any,con:PlayerSession)=>{
            const data:Model.GamePlayerLoadFinishReq=msg
            const res:Model.GamePlayerLoadFinishRes={id:Model.MsgId.GamePlayerLoadFinish,error:Model.ErrorCode.GamePlayerLoadFinishSuccess,valuesum:0}
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.ChangeLocationFail
                con.WebSend(JSON.stringify(res))
                return;
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                res.valuesum=now_game_room_instance.AddLoadSum(data.value)
                now_game_room_instance.Broadcast(res)
            }
        })

        this.RegWeb(Model.MsgId.GameEnd,(msg:any,con:PlayerSession)=>{
            const data:Model.GameEndReq=msg
            const res:Model.GameEndRes={id:Model.MsgId.GameEnd,error:Model.ErrorCode.GameEndSuccess}
            if(con.nowgameroom==null)
            {
                return;
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                now_game_room_instance.Broadcast(res)
            }
        })

        this.RegWeb(Model.MsgId.SetPlayerName,async (msg:any,con:PlayerSession)=>{
            const data:Model.SetPlayerNameReq=msg
            const res:Model.SetPlayerNameRes={id:Model.MsgId.SetPlayerName,havecache:false,player_cache_data:null,error:Model.ErrorCode.SetPlayerNameSuccess}
            // con.SetPlayerName(data.playername)
            let SetNameStatus=con.CheckPlayerSessonSetName(data)
            if(SetNameStatus==true)
            {
                let playercache=await RedisMgr.getInstance().GetRedis(Model.RedisPlayerType.WhenPlayingLeave+data.playername)
                if(playercache!=null)
                {
                    let playercachejson:Model.PlayerCacheData=JSON.parse(playercache)
                    res.havecache=true
                    res.player_cache_data=playercachejson
                }
            }
            else
            {
                res.error=Model.ErrorCode.SetPlayerNameFail
            }
            con.WebSend(JSON.stringify(res))
            //删除缓存
            // RedisMgr.getInstance().DelRedis(Model.RedisPlayerType.WhenPlayingLeave+data.playername)
        })
        //获取整个房间游戏消息列表
        this.RegWeb(Model.MsgId.GetRoomGameMessageList,(msg:any,con:PlayerSession)=>{
            const data:Model.GetRoomGameMessageListReq=msg
            const res:Model.GetRoomGameMessageListRes={id:Model.MsgId.GetRoomGameMessageList,room_gamemessage_list:null,error:Model.ErrorCode.GetRoomGameMessageListSuccess};
            if(con.playername!=data.playername)
            {
                res.error=Model.ErrorCode.GetRoomGameMessageListPlayerNameError;
                con.WebSend(JSON.stringify(res));
            }

            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.GetRoomGameMessageListRoomNotConnectFail;
                con.WebSend(JSON.stringify(res));
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                if(now_game_room_instance.room_gamemessage_list)
                {
                    res.room_gamemessage_list=now_game_room_instance.room_gamemessage_list;
                    con.WebSend(JSON.stringify(res));
                }
                else
                {
                    res.error=Model.ErrorCode.GetRoomGameMessageListNotHaveList
                    con.WebSend(JSON.stringify(res));
                }
            }

        })
        //获取整个游戏消息列表中的某个消息
        this.RegWeb(Model.MsgId.GetRoomGameMessageListItem,(msg:any,con:PlayerSession)=>{
            const data:Model.GetRoomGameMessageListItemReq=msg
            const res:Model.GetRoomGameMessageListItemRes={id:Model.MsgId.GetRoomGameMessageListItem,room_gamemessage_list_item:null,error:Model.ErrorCode.GetRoomGameMessageListItemSuccess}
            if(con.playername!=data.playername)
            {
                res.error=Model.ErrorCode.GetRoomGameMessageListPlayerNameError;
                con.WebSend(JSON.stringify(res));
            }
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.GetRoomGameMessageListRoomNotConnectFail;
                con.WebSend(JSON.stringify(res));
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                if(now_game_room_instance.room_gamemessage_list)
                    {
                        // res.room_gamemessage_list_item=now_game_room_instance.room_gamemessage_list.get(data.list_item_id);
                        // con.WebSend(JSON.stringify(res));
                        let list_item=now_game_room_instance.room_gamemessage_list.get(data.list_item_id);
                        if(list_item) 
                        {
                            res.room_gamemessage_list_item=list_item
                            con.WebSend(JSON.stringify(res));
                        }
                        else
                        {
                            
                            // "[29,{\"Type\":\"GM\",\"Command\":[0],\"Content\": turn.turn,\"from\":turn.turn,\"SHtype\":\""PASS"\"},\"1\"]"
                            let gamemessage=[data.list_item_id,{Type:"GM",Command:[0],Content:"turn.turn",from:"turn.turn",SHtype:"PASS"},1];
                            res.room_gamemessage_list_item=gamemessage;
                            con.WebSend(JSON.stringify(res));
                            // now_game_room_instance.room_gamemessage_list.set(data.list_item_id,JSON.stringify(gamemessage));
                            now_game_room_instance.SetRoomGameMessage(gamemessage)
                        }
                    }
                    else
                    {
                        res.error=Model.ErrorCode.GetRoomGameMessageListNotHaveList
                        con.WebSend(JSON.stringify(res));
                    }
            }
        })

        this.RegWeb(Model.MsgId.RandomLeavePlayerManagerSendmsg,(msg:any,con:PlayerSession)=>{
            const data:Model.RandomLeavePlayerManagerSendmsgReq=msg
            const res:Model.RandomLeavePlayerManagerSendmsgRes={id:Model.MsgId.RandomLeavePlayerManagerSendmsg,error:Model.ErrorCode.RandomLeavePlayerManagerSendmsgSuccess}
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.RandomLeavePlayerManagerRoomNull
                con.WebSend(JSON.stringify(res))
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                let RandomLeavePlayerManager=now_game_room_instance.GetRandomLeavePlayerManager()
                if(RandomLeavePlayerManager!=null&&RandomLeavePlayerManager.GetPlayerSession().playername==con.playername)
                {
                    now_game_room_instance.Broadcast(res)
                }
                else
                {
                    res.error=Model.ErrorCode.RandomLeavePlayerManagerYouNotManager
                    con.WebSend(JSON.stringify(res))
                }
            }
        })

        this.RegWeb(Model.MsgId.ObtainTimestamp,(msg:any,con:PlayerSession)=>{
            const data:Model.ObtainTimestampReq=msg
            const res:Model.ObtainTimestampRes={
                id:Model.MsgId.ObtainTimestamp,
                servertimestamp:Date.now(),
                yourtimestamp:data.yourtimestamp,
                error:Model.ErrorCode.ObtainTimestampSuccess}
            con.WebSend(JSON.stringify(res))
        })

        this.RegWeb(Model.MsgId.GetGameAllLoadReady,(msg:any,con:PlayerSession)=>{
            const data:Model.GetGameAllLoadReadyReq=msg
            const res:Model.GetGameAllLoadReadyRes={id:Model.MsgId.GetGameAllLoadReady,is_all_ready:false,allreadyplayer:[],error:Model.ErrorCode.None}
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.YourGameRoomIsNull
                con.WebSend(JSON.stringify(res))
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                res.is_all_ready=now_game_room_instance.IsAllPlayerLoadedReady()
                res.allreadyplayer=now_game_room_instance.GetAllLoadedReadyPlayerName()
                con.WebSend(JSON.stringify(res))

                if(res.is_all_ready==true)
                {
                    const res:Model.GameLoadReadyRes={id:Model.MsgId.GameLoadReady,playername:"KGT工作室Server",error:Model.ErrorCode.AllReady}
                    now_game_room_instance.Broadcast(res)
                }
            }
        })

        this.RegWeb(Model.MsgId.GameLoadReady,(msg:any,con:PlayerSession)=>{
            const data:Model.GameLoadReadyReq=msg
            const res:Model.GameLoadReadyRes={id:Model.MsgId.GameLoadReady,playername:data.playername,error:Model.ErrorCode.ReadySuccess}
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.YourGameRoomIsNull
                con.WebSend(JSON.stringify(res))
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                let player=PlayerCol.getInstance().GetPlayer(con.playername)
                //感觉要加错误码
                if(player==null||player==undefined)
                {
                    res.error=Model.ErrorCode.ReadyFail
                    con.WebSend(JSON.stringify(res))
                    return
                }
                player.SetPlayerIsLoadedReady(true)
                con.WebSend(JSON.stringify(res))
                if(now_game_room_instance.IsAllPlayerLoadedReady()==true)
                {
                    res.error=Model.ErrorCode.AllReady
                    res.playername="KGT工作室Server"
                    now_game_room_instance.Broadcast(res)
                }
            }
        })

        this.RegWeb(Model.MsgId.RadomMatchRoomPrepare,(msg:any,con:PlayerSession)=>{
            const data:Model.RadomMatchRoomPrepareReq=msg
            const res:Model.RadomMatchRoomPrepareRes={
                id:Model.MsgId.RadomMatchRoomPrepare,
                playername:con.playername,
                allplayer:[],
                roomname:null,
                error:Model.ErrorCode.PrepareSuccess
            }
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.YourGameRoomIsNull
                con.WebSend(JSON.stringify(res))
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }
                res.roomname=now_game_room_instance.roomname
                let player=PlayerCol.getInstance().GetPlayer(con.playername)
                //感觉要加错误码
                if(player==null||player==undefined)
                {
                    res.error=Model.ErrorCode.PrepareFail
                    con.WebSend(JSON.stringify(res))
                    return
                }
                player.SetRandomRoomIsPrepared(true)
                con.WebSend(JSON.stringify(res))
                if(now_game_room_instance.IsRandomRoomPlayerAllPrepared()==true)
                {
                    res.error=Model.ErrorCode.RandomRoomGameStart
                    res.allplayer=now_game_room_instance.GetAllGameStartPlayerName()
                    res.playername="KGT工作室Server"
                    now_game_room_instance.Broadcast(res)
                }

            }
        })

        this.RegWeb(Model.MsgId.RandomMatch,async(msg:any,con:PlayerSession)=>{          
            const data:Model.RandomMatchReq=msg
            let match_type:MatchType=data.matchtype
            let playername:string=data.playername
            // RandomMatchSystem.getInstance().add_to_queue(match_type,playername)
            queue_worker.send_message(new WorkerMsgBaseNode(WorkerMsgType.QueueWorkerMsg,new QueueNodeMsg(playername,match_type)))
            console.log("set Model.RedisPlayerType.RandomQueue: ",playername," match_type:",match_type)
            await RedisMgr.getInstance().SetRedisExpire(Model.RedisPlayerType.RandomQueue+con.playername,1,60)
        })

        this.RegWeb(Model.MsgId.RadomMatchCancel,async(msg:any,con:PlayerSession)=>{
            let data:Model.RandomMatchCancelReq=msg
            const res:Model.RandomMatchCancelRes={id:Model.MsgId.RadomMatchCancel,error:Model.ErrorCode.None,playername:data.playername,match_gameroom:con.nowgameroom}
            await RedisMgr.getInstance().DelRedis(Model.RedisPlayerType.RandomQueue+con.playername)
            if(con.nowgameroom!=null)
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance!=null&&now_game_room_instance!=undefined)
                {
                    await now_game_room_instance.Broadcast(res)
                    now_game_room_instance.RoomClose()
                }
            }
            con.WebSend(JSON.stringify(res));
        })

        this.RegWeb(Model.MsgId.LeaveRoom,(msg:any,con:PlayerSession)=>{
            const data:Model.LeaveRoomReq=msg
            const res:Model.LeaveRoomRes={id:Model.MsgId.LeaveRoom,error:Model.ErrorCode.None,situation:Model.PlayerLeaveSituation.None}
            if(con.nowgameroom==null)
            {
                res.error=Model.ErrorCode.YourGameRoomIsNull
                con.WebSend(JSON.stringify(res))
            }
            else
            {
                let now_game_room_instance=RoomCol.getInstance().GetRoom(con.nowgameroom)
                if(now_game_room_instance==null)
                {
                    res.error=Model.ErrorCode.YourGameRoomIsNull
                    con.WebSend(JSON.stringify(res))
                    return
                }

                // if((now_game_room_instance.ower==null||con.playername==now_game_room_instance.ower.GetPlayerSession().playername)&&now_game_room_instance.radom_room_status==MatchType.default)
                // {
                //     res.situation=Model.PlayerLeaveSituation.RoomBreak;
                //     now_game_room_instance.Broadcast(res)
                // }
                if(data.situation==Model.PlayerLeaveSituation.RoomBreak)
                {
                    res.situation=Model.PlayerLeaveSituation.RoomBreak;
                    now_game_room_instance.Broadcast(res)
                }


                //离开的玩家发送自己当前的情况,没准备的要接受处罚
                if(data.situation==Model.PlayerLeaveSituation.NotPrepare)
                {
                    //....待处理
                }
                con.DelPlayer(Model.PlayerLeaveStatus.Online)
                con.WebSend(JSON.stringify(res))
            }
        })

        this.RegWeb(Model.MsgId.GetRoomGameMessageListInSave,(msg:any,con:PlayerSession)=>{
            const data:Model.GetRoomGameMessageListInSaveReq=msg
            const res:Model.GetRoomGameMessageListInSaveRes={id:Model.MsgId.GetRoomGameMessageListInSave,room_gamemessage_list:null,error:Model.ErrorCode.None}
            RedisMgr.getInstance().GetRedis(Model.RedisRoomType.RoomGameMessageList+data.roomname).then((value)=>{
                if(value!=null) res.room_gamemessage_list=new Map(JSON.parse(value))
                con.WebSend(JSON.stringify(res))
            })
        });
    }
}

// 监听来自父线程的消息
parentPort?.on('message', (message:WorkerMsgBaseNode) => {
    // console.log(message)
    // let logicnode=WorkerBaseNodeSwitchFactory.getInstance().SwitchToAny(message) as LogicNode;
    // if(logicnode)
    // {
    //     LogisticSystem.getInstance().PostMsgToQue(logicnode);
    // }
});