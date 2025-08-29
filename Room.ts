import { PlayerSession } from "./PlayerSession";
import { Player } from "./Player";
import * as Model from './Model';
import { RoomCol } from "./RoomCol";
import { PlayerCol } from "./PlayerCol";
import { MatchType } from "./Worker/WorkerModel";
export class Room
{
    public players:Player[]=[];
    public game_start_player:Player[]=[];
    public when_playing_leave_player:string[]=[];
    public random_leave_player_manager:Player|null=null;
    public looker:Player[]=[];
    public is_game_end=false;
    public load_finish_num=0;
    public roomname:string;
    public password:string;
    public ower:null|Player=null;
    public loadsum:number=0;
    public gamestart=false;
    public room_gamemessage_list:Map<number,any>;

    public radom_room_status:MatchType=MatchType.default;

    constructor(roomname:string,password:string,ower:PlayerSession,value:number,own_nowlocation:number)
    {
        this.roomname=roomname;
        this.password=password;
        this.AddOwer(ower,value,own_nowlocation)
        this.room_gamemessage_list=new Map<number,any>();
    }

    GetRoomGameMessageList()
    {
        return this.room_gamemessage_list
    }

    SetRadomRoomStatus(status:MatchType)
    {
        this.radom_room_status=status
    }

    GameStart()
    {
        this.gamestart=true;
        this.players.forEach((player:Player) => {
            if(player.IsLooker()!=true) this.game_start_player.push(player)
        });
    }

    IsPlayer(player:Player)
    {
        return this.players.includes(player)
    }

    IsGameStart()
    {
        return this.gamestart;
    }

    IsGameStartPlayer(player:Player)
    {
        return this.game_start_player.includes(player)
    }

    AddLoadSum(value:number)
    {
        this.loadsum+=value
        return this.loadsum
    }
    GetAllLocation()
    {
        let locationarray:any=[]
        this.players.forEach((player:Player) => {
            locationarray.push(player.GetPlayernameAndLocation())
        });
        return locationarray
    }

    AddOwer(ower:PlayerSession,value:number,ower_nowlocation:number):void
    {

        let owerplayer=new Player(value,ower_nowlocation,0,ower);
        this.ower=owerplayer
        this.players.push(owerplayer)
        ower.nowgameroom={roomname:this.roomname,password:this.password}
    }

    ChangeLocationCheck(playersession:PlayerSession,location:number)
    {
        if(location==0) return true;
        for(let player of this.players)
        {
            if(player.GetPlayerSession().playername!=playersession.playername&&location==player.GetNowLocation())
            {
                return false;
            }
        }
        return true;
    }

    RemovePlayer(playersession:PlayerSession)
    {
        //按照session中的名字去除掉player
        this.players = this.players.filter((player:Player) => player.GetPlayerSession().playername !== playersession.playername);
        this.game_start_player=this.game_start_player.filter((player:Player) => player.GetPlayerSession().playername !== playersession.playername);
        //正在游戏中的玩家记录去除掉
        
        PlayerCol.getInstance().DeletePlayer(playersession.playername)

        this.OnePlayerLeaveMsgSend(playersession.playername)

        if(this.players.length==0||(this.game_start_player.length==0&&this.gamestart==true))
        {
            this.GameEndRoomClose()
        }
    }

    GameEndRoomClose()
    {
        this.players.forEach((player:Player) => {
            player.GetPlayerSession().nowgameroom=null
        });
        //通知玩家全部退出的时候关闭了
        const res:Model.GameRoomCloseRes={id:Model.MsgId.GameRoomClose,error:Model.ErrorCode.GameRoomClose}
        this.Broadcast(res)
        //删掉全部playersession的引用
        RoomCol.getInstance().DeleteRoom(this.roomname)
    }

    RoomClose()
    {
        this.players.forEach((player:Player) => {
            player.GetPlayerSession().nowgameroom=null
        });
        RoomCol.getInstance().DeleteRoom(this.roomname)
    }

    AddPlayer(player:PlayerSession,value:number,player_nowlocation:number)
    {
        player.nowgameroom={roomname:this.roomname,password:this.password}
        let in_room_player:Player=new Player(value,player_nowlocation,0,player)
        this.players.push(in_room_player)
    }

    AddReConnectPlayer(player:PlayerSession,playercachedata:Model.PlayerCacheData)
    {
        player.nowgameroom={roomname:this.roomname,password:this.password}
        let in_room_player:Player=new Player(playercachedata.value,playercachedata.nowlocation,playercachedata.nextlocation,player)
        this.players.push(in_room_player)
        if(this.IsGameStart()==true&&playercachedata.isplayer==true)
        {
            this.game_start_player.push(in_room_player)
        }
    }

    GetAllGameStartPlayerName()
    {
        let allplayername:string[]=[]
        this.game_start_player.forEach((player:Player) => {
            allplayername.push(player.GetPlayerSession().playername)
        });
        return allplayername
    }
    IsRandomRoomPlayerAllPrepared()
    {
        for(let player of this.game_start_player)
        {
            if(player.IsLooker()==true) continue
            if(player.randomroom_is_prepared==false) return false
        }

        return true
    }
    IsAllPlayerLoadedReady()
    {
        for(let player of this.game_start_player)
        {
            if(player.IsLooker()==true) continue
            if(player.player_is_loaded_ready==false) return false
        }
        return true
    }

    GetAllLoadedReadyPlayerName()
    {
        let allreadyplayername:string[]=[]
        this.players.forEach((player:Player) => {
            if(player.IsLooker()!=true&&player.player_is_loaded_ready) 
                allreadyplayername.push(player.GetPlayerSession().playername)
        });
        return allreadyplayername
    }

    AddWhenPlayingLeavePlayer(playername:string)
    {
        this.when_playing_leave_player.push(playername)
        if(this.random_leave_player_manager!=null&&playername==this.random_leave_player_manager.GetPlayerSession().playername)
        {
            this.RemoveRandomLeavePlayerManager()
            this.SetRandomLeavePlayerManager()
        }
    }

    RemoveRandomLeavePlayerManager()
    {
        this.random_leave_player_manager=null
    }

    SetRandomLeavePlayerManager()
    {
        if(this.game_start_player.length==0) return
        let random_index=Math.floor(Math.random()*this.game_start_player.length)
        this.random_leave_player_manager=this.game_start_player[random_index]
        let res:Model.SetRandomLeavePlayerManagerRes=
        {
            id:Model.MsgId.SetRandomLeavePlayerManager,
            error:Model.ErrorCode.SetRandomLeavePlayerManagerSuccess,
            playername:this.random_leave_player_manager.GetPlayerSession().playername
        }
        this.random_leave_player_manager.GetPlayerSession().WebSend(JSON.stringify(res));
    }

    GetRandomLeavePlayerManager()
    {
        return this.random_leave_player_manager
    }

    RemoveWhenPlayingLeavePlayer(playername:string)
    {
        this.when_playing_leave_player=this.when_playing_leave_player.filter((name:string) => name !== playername);
        if(this.when_playing_leave_player.length==0)
        {
            this.RemoveRandomLeavePlayerManager();
        }
    }

    SetRoomGameMessage(msg:any)
    {
        //记录下单局游戏内通信数据
        console.log('SetRoomGameMessage: '+msg)
        // let id:number=JSON.parse(msg.gamemessage).ln;
        let id:number=msg[0];
        this.room_gamemessage_list.set(id,msg);
    }

    OnePlayerLeaveMsgSend(playername:string)
    {
        let res:Model.OnePlayerLeaveRes=
        {
            id:Model.MsgId.OnePlayerLeave,
            playername:playername,
            error:Model.ErrorCode.None
        }
        this.Broadcast(res)
    }


    Broadcast(msg:any)
    {
        console.log("Broadcast:")
        console.log(msg)
        this.players.forEach((player:Player) => {
            let playersession:PlayerSession=player.GetPlayerSession()
            playersession.WebSend(JSON.stringify(msg))
            // switch (msg.id) {
            //     case Model.MsgId.ChangeLocation:
            //         if(msg.playername==playersession.playername)
            //         {
            //             player.SetLocationAndValue(msg.value,msg.nowlocation,msg.nextlocation)
            //         }
            //         break;
            //     default:
            //         break;
            // }
        });

        switch (msg.id) {
            case Model.MsgId.GameStart:
                this.GameStart()
                // this.players.forEach((player:Player) => {
                //     if(player.IsLooker()!=true) this.game_start_player.push(player)
                // });
                break;
            case Model.MsgId.GameEnd:
                this.GameEndRoomClose()
                break;
            default:
                break;
        }

    }

}