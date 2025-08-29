import WebSocket from 'ws';
import { Room } from './Room';
import { LogisticSystem } from './LogisticSystem';
import { LogicNode, RecNode, WorkerMsgBaseNode,WorkerMsgType } from './const';
import { PlayerSessionCol } from './PlayerSessionCol';
import { PlayerCacheData, RedisPlayerType } from './Model';
import { RedisMgr } from './RedisMgr';
import { PlayerCol } from './PlayerCol';
import * as Model from './Model';
import { RoomCol } from './RoomCol';
export class PlayerSession {
    private ws: WebSocket
    public playername: string
    // public nowgameroom: Room | null = null
    public nowgameroom:Model.ConnectRoomReq | null = null

    constructor(ws: WebSocket, playername: string) {
        this.ws = ws;
        this.playername = playername;
    }

    player_polling() {
        this.ws.on('message', (message: WebSocket.Data) => {
            try {
                let data: any;
                // 检查 message 类型
                if (typeof message === "string") {
                    data = JSON.parse(message);
                } else if (Buffer.isBuffer(message)) {
                    data = JSON.parse(message.toString());
                } else {
                    throw new Error("Unsupported message format");
                }

                let recnode = new RecNode(data.id, data);
                let logicnode = new LogicNode(this, recnode);
                LogisticSystem.getInstance().PostMsgToQue(logicnode);
                console.log("playersession_webmessage:")
                console.log(data);
                // if(data.id==Model.MsgId.SetPlayerName)
                // {
                //     this.CheckPlayerSessonSetName(data)
                // }
                // else
                // {
                //     let recnode = new RecNode(data.id, data);
                //     let logicnode = new LogicNode(this, recnode);
                //     LogisticSystem.getInstance().PostMsgToQue(logicnode);
                //     console.log("playersession_webmessage:")
                //     console.log(data);
                //     // let logicworkernode = new WorkerMsgBaseNode(WorkerMsgType.LogisticSystemMsg, new LogicNodeMsg(recnode, this.playername));
                //     // logisticsystem_worker.send_message(logicworkernode);
                // }
            } catch (error) {
                console.error("Error while processing message:", error);
            }
        });

        this.ws.on('close', () => {
            console.log(this.playername + "离开")
            this.DelPlayer(Model.PlayerLeaveStatus.NotOnline);
            //删除PlayerSession,Player
            PlayerSessionCol.getInstance().DeletePlayerSession(this.playername);
            // RedisMgr.getInstance().DelRedis(Model.RedisPlayerType.RandomQueue + this.playername);
        })
    }

    CheckPlayerSessonSetName(data:any):boolean
    {
        console.log("setplayername: "+data.playername)
        this.SetPlayerName(data.playername)
        let res=PlayerSessionCol.getInstance().InsertPlayerSession(this);
        console.log("set session to map:"+res);
        return res;
    }

    DelPlayer(player_leave_status:Model.PlayerLeaveStatus) {
        if (this.nowgameroom != null) {
            let temp_player = PlayerCol.getInstance().GetPlayer(this.playername);
            let now_game_room_instance=RoomCol.getInstance().GetRoom(this.nowgameroom)
            if (temp_player != null && now_game_room_instance!=null && now_game_room_instance.IsPlayer(temp_player)) {
                let playercachedata: PlayerCacheData =
                {
                    playername: this.playername,
                    nowroomname: this.nowgameroom.roomname,
                    password: this.nowgameroom.password,
                    nextlocation: temp_player.GetNextLocation(),
                    nowlocation: temp_player.GetNowLocation(),
                    value: temp_player.GetValue(),
                    isplayer: now_game_room_instance.IsGameStartPlayer(temp_player),
                    punishment: 1,
                };
                //游戏开始时有惩罚
                if (now_game_room_instance.gamestart == true) {
                    playercachedata.punishment = 1;
                }
                else if(player_leave_status==Model.PlayerLeaveStatus.NotOnline)
                {
                    playercachedata.punishment = 0;
                }
                RedisMgr.getInstance().SetRedisExpire(RedisPlayerType.WhenPlayingLeave + this.playername, JSON.stringify(playercachedata), 60 * 20);
                //游戏内玩游戏的玩家离开
                now_game_room_instance.RemovePlayer(this)
                if (now_game_room_instance.IsGameStartPlayer(temp_player)) {
                    now_game_room_instance.AddWhenPlayingLeavePlayer(this.playername)
                    now_game_room_instance.SetRandomLeavePlayerManager();
                }
            }
            else {
                if(now_game_room_instance!=null)
                {
                    now_game_room_instance.RemovePlayer(this)
                }
            }

            this.nowgameroom = null
        }
    }

    SetPlayerName(playername: string) {
        this.playername = playername
        // console.log("set playername: "+this.playername)
    }

    WebSend(data: any) {
        console.log("PlayerSession WebSend:")
        console.log(data)
        if(typeof data == "object") data = JSON.stringify(data)
        if (this.ws.readyState == WebSocket.CLOSED) return
        this.ws.send(data)
    }

    WebSocketIsOpen() {
        if (this.ws.readyState == WebSocket.CLOSED) return false
        return true
    }

}