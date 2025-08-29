import { PlayerCol } from "./PlayerCol";
import { PlayerSession } from "./PlayerSession";

export class Player{
    private playersession:PlayerSession
    private nextlocation:number=0;
    private nowlocation:number=0;
    private value:number=0;
    public randomroom_is_prepared:boolean=false
    public player_is_loaded_ready:boolean=false
    constructor(value:number,nowlocation:number,nextlocation:number,playersession:PlayerSession)
    {
        this.value=value
        this.nowlocation=nowlocation
        this.nextlocation=nextlocation
        this.playersession=playersession

        PlayerCol.getInstance().InsertPlayer(this)
    }

    SetRandomRoomIsPrepared(value:boolean)
    {
        this.randomroom_is_prepared=value
    }

    SetPlayerIsLoadedReady(value:boolean)
    {
        this.player_is_loaded_ready=value
    }

    SetLocationAndValue(value:number,nowlocation:number,nextlocation:number)
    {
        this.value=value
        this.nowlocation=nowlocation
        this.nextlocation=nextlocation
        console.log('setlocation:',"nowloacation:",nowlocation,"nextlocation:",nextlocation)
    }

    GetPlayernameAndLocation()
    {
        return {playername:this.GetPlayerSession().playername,nextlocation:this.nextlocation,nowlocation:this.nowlocation,value:this.value}
    }

    IsLooker()
    {
        if(this.nextlocation==0&&this.nowlocation==0) return true
        else return false
    }

    GetPlayerSession()
    {
        return this.playersession
    }

    GetNextLocation()
    {
        return this.nextlocation
    }

    GetNowLocation()
    {
        return this.nowlocation
    }
    
    GetValue()
    {
        return this.value
    }
}