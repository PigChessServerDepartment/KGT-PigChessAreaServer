import { Room } from "./Room";
import * as Model from './Model';
import { PlayerSession } from "./PlayerSession";
import { RedisMgr } from "./RedisMgr";
export class RoomCol
{
    private allroom=new Map<string,Room>();

    private static instance: RoomCol | null = null;
    static getInstance(): RoomCol
    {
        if (!RoomCol.instance) RoomCol.instance = new RoomCol();
        return RoomCol.instance;
    }

    constructor()
    {
        
    }
    
    InsertRoom(room:Model.CreateRoomReq,ower:PlayerSession):boolean;
    InsertRoom(room:Model.CreateRoomReq,ower:PlayerSession,value:number,own_nowlocation:number):boolean;
    InsertRoom(room:Model.CreateRoomReq,ower:PlayerSession,value?:number,own_nowlocation?:number):boolean
    {
        if(this.allroom.has(room.roomname)) return false
        if(value!==undefined&&own_nowlocation!==undefined)
        {
            this.allroom.set(room.roomname,new Room(room.roomname,room.password,ower,value,own_nowlocation));
        }
        else
        {
            this.allroom.set(room.roomname,new Room(room.roomname,room.password,ower,0,0));
        }
        return true;
    }

    SaveRoomGameMessageList(roomname:string)
    {
        const messagelist=this.allroom.get(roomname)?.GetRoomGameMessageList();
        if(messagelist)
        {
            const roomGameMessageListJson = JSON.stringify(
                Array.from(messagelist.entries())
            );
            RedisMgr.getInstance().SetRedisExpire(Model.RedisRoomType.RoomGameMessageList+roomname,roomGameMessageListJson,6000);
        }
    }

    DeleteRoom(roomname:string)
    {
        this.allroom.delete(roomname);
    }

    GetRoom(room:Model.ConnectRoomReq): Room | undefined
    {
        return this.allroom.get(room.roomname)
    }
}