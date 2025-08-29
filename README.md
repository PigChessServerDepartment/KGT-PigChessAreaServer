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
export enum ErrorDetail
{
    None="没有错误",
    RandomMatchFail_Status1="对方的连接有问题或者是已经取消匹配",
    PlayerRoomEmpty="玩家记录的房间为空",
    RoomInstanceNull="房间实例为空",
    PlayerInstanceNull="玩家实例为空",
    SomeoneHaveInThisLocation="这个位置已经有人了",
}

export enum WebServerErrorCode{
    WebSocketErr=0,
    WebSocketSuccess=1,
    PlayerNameEmpty=2,
    CreateRoomSuccess=3,
    CreateRoomFail=4,
    ConnectRoomSuccess=5,
    PasswordORRoomnameErr=6,

    ChangeLocationSuccess=7,
    ChangeLocationFail=8,
    SomeoneHaveInThisLocation=10009,

    GetAllLocationSuccess=9,
    GetAllLocationFail=10,
    GameStartSuccess=11,
    GameStartNotAtRoomFail=12,
    GameStartNotOwnerFail=13,
    GameMessageSuccess=14,
    GameMessageFail=15,
    GamePlayerLoadFinishSuccess=16,
    GamePlayerLoadFinishFail=17,
    GameRoomClose=18,
    GameEndSuccess=19,
    GameEndFail=20,
    SetPlayerNameSuccess=21,
    SetPlayerNameFail=22,

    GetRoomGameMessageListSuccess=23,
    GetRoomGameMessageListRoomNotConnectFail=24,
    GetRoomGameMessageListPlayerNameError=25,
    GetRoomGameMessageListNotHaveList=26,

    GetRoomGameMessageListItemSuccess=27,
    
    ReConnectRoomSuccess=28,
    ReConnectRoomFail=29,

    SetRandomLeavePlayerManagerSuccess=30,
    SetRandomLeavePlayerManagerFail=31,

    RandomLeavePlayerManagerSendmsgSuccess=32,
    RandomLeavePlayerManagerSendmsgFail=33,
    RandomLeavePlayerManagerRoomNull=34,
    RandomLeavePlayerManagerYouNotManager=35,

    ObtainTimestampSuccess=36,
    ObtainTimestampFail=37,

    RandomMatchFail=38,

    PrepareSuccess=39,
    PrepareFail=40,
    RandomRoomGameStart=41,

    ReadySuccess=42,
    ReadyFail=43,
    AllReady=44,

    None=10086,
    YourGameRoomIsNull=10087,
}

```
## 一些类型定义
```ts
export enum PunishMent
{
    None=0,
    Have=1,
}

export enum PlayerLeaveStatus
{
    Online=0,
    NotOnline=1
}

export enum PlayerLeaveSituation
{
    None=0,
    NotPrepare=1,
    RoomBreak=2
}

//Redis数据记录类型
export enum RedisPlayerType{
    WhenPlayingLeave="WhenPlayingLeave_",
    RandomQueue="RandomQueue_",
}
export enum RedisRoomType{
    RoomGameMessageList="RoomGameMessageList_",
}


export enum RedisHashName{
}

export interface PlayerCacheData{
    playername:string;
    nowroomname:string;
    password:string;
    nextlocation:number;
    nowlocation:number;
    value:number;
    isplayer:boolean;
    punishment:PunishMent;
}

export enum MatchType{
    oneVone=0,
    moreVmore=1,
    oneVmore=2,
    oneVmore_value1=3,
    oneVmore_value3=4,
    default=5
}
```

# Req / Res 对照表 
---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// StressTest=888888
  export interface StressTestDataReq {
    id: MsgId;
    playername: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// StressTest=888888
  export interface StressTestDataRes {
    id: MsgId;
    playername: string;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// CreateRoom=0
  export interface CreateRoomReq {
    id: MsgId;
    roomname: string;  // 房间名称
    password: string;  // 房间密码
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// CreateRoom=0
  export interface CreateRoomRes {
    id: MsgId;
    error: ErrorCode;
    roomname: string;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// ConnectRoom=1
  export interface ConnectRoomReq {
    id: MsgId;
    roomname: string;
    password: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// ConnectRoom=1
  export interface ConnectRoomRes {
    id: MsgId;
    error: ErrorCode;
    roomname: string;
    alllocation: [];
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// ChangeLocation=2
  export interface ChangeLocationReq {
    id: MsgId;
    playername: string;
    nextlocation: number;
    nowlocation: number;
    value: number;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// ChangeLocation=2
  export interface ChangeLocationRes {
    id: MsgId;
    error: ErrorCode;
    playername: string;
    nextlocation: number;
    nowlocation: number;
    value: number;
    detail: ErrorDetail;
    alllocation: [];
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GetAllLocation=3
  export interface GetAllLocationReq {
    id: MsgId;
    playername: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GetAllLocation=3
  export interface GetAllLocationRes {
    id: MsgId;
    error: ErrorCode;
    alllocation: [];
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GameStart=4
  export interface GameStartReq {
    id: MsgId;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GameStart=4
  export interface GameStartRes {
    id: MsgId;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GameMessage=5
  export interface GameMessageReq {
    id: MsgId;
    gamemessage: any;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GameMessage=5
  export interface GameMessageRes {
    id: MsgId;
    error: ErrorCode;
    gamemessage: any;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GamePlayerLoadFinish=6
  export interface GamePlayerLoadFinishReq {
    id: MsgId;
    value: number;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GamePlayerLoadFinish=6
  export interface GamePlayerLoadFinishRes {
    id: MsgId;
    error: ErrorCode;
    valuesum: number;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GameEnd=7
  export interface GameEndReq {
    id: MsgId;
    message: any;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GameEnd=7
  export interface GameEndRes {
    id: MsgId;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GameRoomClose=8
  // 无Req
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GameRoomClose=8
  export interface GameRoomCloseRes {
    id: MsgId;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// SetPlayerName=9
  export interface SetPlayerNameReq {
    id: MsgId;
    playername: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// SetPlayerName=9
  export interface SetPlayerNameRes {
    id: MsgId;
    havecache: boolean;
    player_cache_data: PlayerCacheData | null;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GetRoomGameMessageList=10
  export interface GetRoomGameMessageListReq {
    id: MsgId;
    playername: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GetRoomGameMessageList=10
  export interface GetRoomGameMessageListRes {
    id: MsgId;
    room_gamemessage_list: Map<number, any> | undefined | null;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GetRoomGameMessageListItem=11
  export interface GetRoomGameMessageListItemReq {
    id: MsgId;
    playername: string;
    list_item_id: number;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GetRoomGameMessageListItem=11
  export interface GetRoomGameMessageListItemRes {
    id: MsgId;
    room_gamemessage_list_item: any;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// ReConnectRoom=12
  export interface ReConnectRoomReq {
    id: MsgId;
    roomname: string;
    password: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// ReConnectRoom=12
  export interface ReConnectRoomRes {
    id: MsgId;
    roomname: string;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// SetRandomLeavePlayerManager=13
  // 无Req
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// SetRandomLeavePlayerManager=13
  export interface SetRandomLeavePlayerManagerRes {
    id: MsgId;
    playername: string;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// RandomLeavePlayerManagerSendmsg=14
  export interface RandomLeavePlayerManagerSendmsgReq {
    id: MsgId;
    gamemessage: any;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// RandomLeavePlayerManagerSendmsg=14
  export interface RandomLeavePlayerManagerSendmsgRes {
    id: MsgId;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// ObtainTimestamp=15
  export interface ObtainTimestampReq {
    id: MsgId;
    yourtimestamp: number;
    error: ErrorCode;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// ObtainTimestamp=15
  export interface ObtainTimestampRes {
    id: MsgId;
    yourtimestamp: number;
    servertimestamp: number;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// OnePlayerLeave=16
  // 无Req
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// OnePlayerLeave=16
  export interface OnePlayerLeaveRes {
    id: MsgId;
    playername: string;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// RadomMatchRoomCreate=17
  // 无Req
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// RadomMatchRoomCreate=17
  export interface RadomMatchRoomCreateRes {
    id: MsgId;
    ownplayername: string;
    allplayer: string[];
    roomname: string;
    password: string;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// RadomMatchRoomPrepare=18
  export interface RadomMatchRoomPrepareReq {
    id: MsgId;
    playername: string;
    error: ErrorCode;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// RadomMatchRoomPrepare=18
  export interface RadomMatchRoomPrepareRes {
    id: MsgId;
    playername: string;
    allplayer: string[];
    roomname: string | null;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// RandomMatch=19
  export interface RandomMatchReq {
    id: MsgId;
    matchtype: MatchType;
    playername: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// RandomMatch=19
  // 对应 Res 是 RadomMatchRoomCreateRes 上面已写
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// LeaveRoom=20
  export interface LeaveRoomReq {
    id: MsgId;
    playername: string;
    situation: PlayerLeaveSituation;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// LeaveRoom=20
  export interface LeaveRoomRes {
    id: MsgId;
    error: ErrorCode;
    situation: PlayerLeaveSituation;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// RandomMatchFail=21
  // 无Req
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// RandomMatchFail=21
  export interface RandomMatchFailRes {
    id: MsgId;
    error: ErrorCode;
    match_queue: string[];
    detail: ErrorDetail;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// RadomMatchCancel=22
  export interface RandomMatchCancelReq {
    id: MsgId;
    playername: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// RadomMatchCancel=22
  export interface RandomMatchCancelRes {
    id: MsgId;
    playername: string;
    match_gameroom: ConnectRoomReq | null;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GameLoadReady=23
  export interface GameLoadReadyReq {
    id: MsgId;
    playername: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GameLoadReady=23
  export interface GameLoadReadyRes {
    id: MsgId;
    playername: string;
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GetGameAllLoadReady=24
  export interface GetGameAllLoadReadyReq {
    id: MsgId;
    playername: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GetGameAllLoadReady=24
  export interface GetGameAllLoadReadyRes {
    id: MsgId;
    is_all_ready: boolean;
    allreadyplayer: string[];
    error: ErrorCode;
}
  ```
  </div>

</div>


---

<div style="display:flex; gap:20px;">

  <div style="flex:1;">

  ```ts
  /// GetRoomGameMessageListInSave=5001
  export interface GetRoomGameMessageListInSaveReq {
    id: MsgId;
    roomname: string;
}
  ```
  </div>

  <div style="flex:1;">

  ```ts
  /// GetRoomGameMessageListInSave=5001
  export interface GetRoomGameMessageListInSaveRes {
    id: MsgId;
    room_gamemessage_list: Map<number, any> | undefined | null;
    error: ErrorCode;
}
  ```
  </div>

</div>
