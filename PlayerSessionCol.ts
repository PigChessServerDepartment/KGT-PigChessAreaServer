import { PlayerSession } from "./PlayerSession";

export class PlayerSessionCol//连接会话
{
    private static instance:PlayerSessionCol|null=null;
    private allPlayerSession=new Map<string,PlayerSession>();
    static getInstance():PlayerSessionCol
    {
        if(!PlayerSessionCol.instance) PlayerSessionCol.instance=new PlayerSessionCol();
        return PlayerSessionCol.instance;
    }
    constructor()
    {

    }

    InsertPlayerSession(playersession:PlayerSession)
    {
        if(this.allPlayerSession.has(playersession.playername)) return false

        this.allPlayerSession.set(playersession.playername,playersession)

        // playersession.player_polling();
        return true;
    }

    DeletePlayerSession(playername:string)
    {
        this.allPlayerSession.delete(playername)
    }

    GetPlayerSession(playername:string)
    {
        return this.allPlayerSession.get(playername)
    }
}