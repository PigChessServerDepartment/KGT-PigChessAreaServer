import { Player } from "./Player";

export class PlayerCol//局内玩家
{
    private static instance:PlayerCol|null=null;
    private allPlayer=new Map<string,Player>();
    static getInstance():PlayerCol
    {
        if(!PlayerCol.instance) PlayerCol.instance=new PlayerCol();
        return PlayerCol.instance;
    }

    constructor()
    {

    }

    InsertPlayer(player:Player)
    {
        if(this.allPlayer.has(player.GetPlayerSession().playername)) return false

        this.allPlayer.set(player.GetPlayerSession().playername,player)

        return true
    }

    DeletePlayer(playername:string)
    {
        this.allPlayer.delete(playername)
    }
    
    GetPlayer(playername:string)
    {
        return this.allPlayer.get(playername)
    }

}