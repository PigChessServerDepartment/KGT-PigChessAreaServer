# PigChessAreaServer

* port=4000
* host=http://

## id格式:
```typescript
export enum MsgId{
    StressTest=888888,
    //5001-10000
    GetRoomGameMessageListInSave=5001,
    //0-5000
    CreateRoom=0,
    ConnectRoom=1,
    ChangeLocation=2,
    GetAllLocation=3,
    GameStart=4,
    GameMessage=5,
    GamePlayerLoadFinish=6,
    GameEnd=7,
    GameRoomClose=8,
    SetPlayerName=9,
    GetRoomGameMessageList=10,
    GetRoomGameMessageListItem=11,
    ReConnectRoom=12,
    SetRandomLeavePlayerManager=13,
    RandomLeavePlayerManagerSendmsg=14,
    ObtainTimestamp=15,
    OnePlayerLeave=16,
    
    RadomMatchRoomCreate=17,
    RadomMatchRoomPrepare=18,
    RandomMatch=19,
    LeaveRoom=20,
    RandomMatchFail=21,
    RadomMatchCancel=22,
    GameLoadReady=23,
    GetGameAllLoadReady=24,
}
```
## ErrorCode格式:
```typescript
export enum GateServerErrorCode{
    None=10086,
}
```

## Req格式:
```typescript
获取游戏房间数据暂存
GetRoomGameMessageListInSave=5001
export interface GetRoomGameMessageListInSaveReq
{
    id:MsgId;
    roomname:string;
}
```
## Res格式:
```typescript
GetRoomGameMessageListInSave=5001
export interface GetRoomGameMessageListInSaveRes
{
    id:MsgId;
    room_gamemessage_list:Map<number,any>|undefined|null;
    error:ErrorCode;
}
```