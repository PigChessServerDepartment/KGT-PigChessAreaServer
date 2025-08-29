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

### PunishMent
```ts
export enum PunishMent
{
    None=0,
    Have=1,
}
```

### PlayerLeaveStatus
```ts
export enum PlayerLeaveStatus
{
    Online=0,
    NotOnline=1
}
```

### PlayerLeaveSituation
```ts
export enum PlayerLeaveSituation
{
    None=0,
    NotPrepare=1,
    RoomBreak=2
}
```

### RedisPlayerType
```ts
//Redis数据记录类型
export enum RedisPlayerType{
    WhenPlayingLeave="WhenPlayingLeave_",
    RandomQueue="RandomQueue_",
}
```

### RedisRoomType
```ts
export enum RedisRoomType{
    RoomGameMessageList="RoomGameMessageList_",
}
```

### RedisHashName
```ts
export enum RedisHashName{
}
```

### PlayerCacheData
```ts
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
```

### MatchType
```ts
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
## 对照表目录

- [StressTest = 888888](#stresstest--888888)
- [CreateRoom = 0](#createroom--0)
- [ConnectRoom = 1](#connectroom--1)
- [ChangeLocation = 2](#changelocation--2)
- [GetAllLocation = 3](#getalllocation--3)
- [GameStart = 4](#gamestart--4)
- [GameMessage = 5](#gamemessage--5)
- [GamePlayerLoadFinish = 6](#gameplayerloadfinish--6)
- [GameEnd = 7](#gameend--7)
- [GameRoomClose = 8](#gameroomclose--8)
- [SetPlayerName = 9](#setplayername--9)
- [GetRoomGameMessageList = 10](#getroomgamemessagelist--10)
- [GetRoomGameMessageListItem = 11](#getroomgamemessagelistitem--11)
- [ReConnectRoom = 12](#reconnectroom--12)
- [SetRandomLeavePlayerManager = 13](#setrandomleaveplayermanager--13)
- [RandomLeavePlayerManagerSendmsg = 14](#randomleaveplayermanagersendmsg--14)
- [ObtainTimestamp = 15](#obtaintimestamp--15)
- [OnePlayerLeave = 16](#oneplayerleave--16)
- [RadomMatchRoomCreate = 17](#radommatchroomcreate--17)
- [RadomMatchRoomPrepare = 18](#radommatchroomprepare--18)
- [RandomMatch = 19](#randommatch--19)
- [LeaveRoom = 20](#leaveroom--20)
- [RandomMatchFail = 21](#randommatchfail--21)
- [RadomMatchCancel = 22](#radommatchcancel--22)
- [GameLoadReady = 23](#gameloadready--23)
- [GetGameAllLoadReady = 24](#getgameallloadready--24)
- [GetRoomGameMessageListInSave = 5001](#getroomgamemessagelistinsave--5001)

---

### StressTest = 888888

```ts
export interface StressTestDataReq {
  id: MsgId;
  playername: string;
}
```
```ts
export interface StressTestDataRes {
  id: MsgId;
  playername: string;
}
```

---

### CreateRoom = 0

```ts
export interface CreateRoomReq {
  id: MsgId;
  roomname: string;  // 房间名称
  password: string;  // 房间密码
}
```
```ts
export interface CreateRoomRes {
  id: MsgId;
  error: ErrorCode;
  roomname: string;
}
```

---

### ConnectRoom = 1

```ts
export interface ConnectRoomReq {
  id: MsgId;
  roomname: string;
  password: string;
}
```
```ts
export interface ConnectRoomRes {
  id: MsgId;
  error: ErrorCode;
  roomname: string;
  alllocation: [];
}
```

---

### ChangeLocation = 2

```ts
export interface ChangeLocationReq {
  id: MsgId;
  playername: string;
  nextlocation: number;
  nowlocation: number;
  value: number;
}
```
```ts
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

---

### GetAllLocation = 3

```ts
export interface GetAllLocationReq {
  id: MsgId;
  playername: string;
}
```
```ts
export interface GetAllLocationRes {
  id: MsgId;
  error: ErrorCode;
  alllocation: [];
}
```

---

### GameStart = 4

```ts
export interface GameStartReq {
  id: MsgId;
}
```
```ts
export interface GameStartRes {
  id: MsgId;
  error: ErrorCode;
}
```

---

### GameMessage = 5

```ts
export interface GameMessageReq {
  id: MsgId;
  gamemessage: any;
}
```
```ts
export interface GameMessageRes {
  id: MsgId;
  error: ErrorCode;
  gamemessage: any;
}
```

---

### GamePlayerLoadFinish = 6

```ts
export interface GamePlayerLoadFinishReq {
  id: MsgId;
  value: number;
}
```
```ts
export interface GamePlayerLoadFinishRes {
  id: MsgId;
  error: ErrorCode;
  valuesum: number;
}
```

---

### GameEnd = 7

```ts
export interface GameEndReq {
  id: MsgId;
  message: any;
}
```
```ts
export interface GameEndRes {
  id: MsgId;
  error: ErrorCode;
}
```

---

### GameRoomClose = 8

```ts
// 无Req
```
```ts
export interface GameRoomCloseRes {
  id: MsgId;
  error: ErrorCode;
}
```

---

### SetPlayerName = 9

```ts
export interface SetPlayerNameReq {
  id: MsgId;
  playername: string;
}
```
```ts
export interface SetPlayerNameRes {
  id: MsgId;
  havecache: boolean;
  player_cache_data: PlayerCacheData | null;
  error: ErrorCode;
}
```

---

### GetRoomGameMessageList = 10

```ts
export interface GetRoomGameMessageListReq {
  id: MsgId;
  playername: string;
}
```
```ts
export interface GetRoomGameMessageListRes {
  id: MsgId;
  room_gamemessage_list: Map<number, any> | undefined | null;
  error: ErrorCode;
}
```

---

### GetRoomGameMessageListItem = 11

```ts
export interface GetRoomGameMessageListItemReq {
  id: MsgId;
  playername: string;
  list_item_id: number;
}
```
```ts
export interface GetRoomGameMessageListItemRes {
  id: MsgId;
  room_gamemessage_list_item: any;
  error: ErrorCode;
}
```

---

### ReConnectRoom = 12

```ts
export interface ReConnectRoomReq {
  id: MsgId;
  roomname: string;
  password: string;
}
```
```ts
export interface ReConnectRoomRes {
  id: MsgId;
  roomname: string;
  error: ErrorCode;
}
```

---

### SetRandomLeavePlayerManager = 13

```ts
// 无Req
```
```ts
export interface SetRandomLeavePlayerManagerRes {
  id: MsgId;
  playername: string;
  error: ErrorCode;
}
```

---

### RandomLeavePlayerManagerSendmsg = 14

```ts
export interface RandomLeavePlayerManagerSendmsgReq {
  id: MsgId;
  gamemessage: any;
}
```
```ts
export interface RandomLeavePlayerManagerSendmsgRes {
  id: MsgId;
  error: ErrorCode;
}
```

---

### ObtainTimestamp = 15

```ts
export interface ObtainTimestampReq {
  id: MsgId;
  yourtimestamp: number;
  error: ErrorCode;
}
```
```ts
export interface ObtainTimestampRes {
  id: MsgId;
  yourtimestamp: number;
  servertimestamp: number;
  error: ErrorCode;
}
```

---

### OnePlayerLeave = 16

```ts
// 无Req
```
```ts
export interface OnePlayerLeaveRes {
  id: MsgId;
  playername: string;
  error: ErrorCode;
}
```

---

### RadomMatchRoomCreate = 17

```ts
// 无Req
```
```ts
export interface RadomMatchRoomCreateRes {
  id: MsgId;
  ownplayername: string;
  allplayer: string[];
  roomname: string;
  password: string;
  error: ErrorCode;
}
```

---

### RadomMatchRoomPrepare = 18

```ts
export interface RadomMatchRoomPrepareReq {
  id: MsgId;
  playername: string;
  error: ErrorCode;
}
```
```ts
export interface RadomMatchRoomPrepareRes {
  id: MsgId;
  playername: string;
  allplayer: string[];
  roomname: string | null;
  error: ErrorCode;
}
```

---

### RandomMatch = 19

```ts
export interface RandomMatchReq {
  id: MsgId;
  matchtype: MatchType;
  playername: string;
}
```
```ts
// 对应 Res 是 RadomMatchRoomCreateRes 上面已写
```

---

### LeaveRoom = 20

```ts
export interface LeaveRoomReq {
  id: MsgId;
  playername: string;
  situation: PlayerLeaveSituation;
}
```
```ts
export interface LeaveRoomRes {
  id: MsgId;
  error: ErrorCode;
  situation: PlayerLeaveSituation;
}
```

---

### RandomMatchFail = 21

```ts
// 无Req
```
```ts
export interface RandomMatchFailRes {
  id: MsgId;
  error: ErrorCode;
  match_queue: string[];
  detail: ErrorDetail;
}
```

---

### RadomMatchCancel = 22

```ts
export interface RandomMatchCancelReq {
  id: MsgId;
  playername: string;
}
```
```ts
export interface RandomMatchCancelRes {
  id: MsgId;
  playername: string;
  match_gameroom: ConnectRoomReq | null;
  error: ErrorCode;
}
```

---

### GameLoadReady = 23

```ts
export interface GameLoadReadyReq {
  id: MsgId;
  playername: string;
}
```
```ts
export interface GameLoadReadyRes {
  id: MsgId;
  playername: string;
  error: ErrorCode;
}
```

---

### GetGameAllLoadReady = 24

```ts
export interface GetGameAllLoadReadyReq {
  id: MsgId;
  playername: string;
}
```
```ts
export interface GetGameAllLoadReadyRes {
  id: MsgId;
  is_all_ready: boolean;
  allreadyplayer: string[];
  error: ErrorCode;
}
```

---

### GetRoomGameMessageListInSave = 5001

```ts
export interface GetRoomGameMessageListInSaveReq {
  id: MsgId;
  roomname: string;
}
```
```ts
export interface GetRoomGameMessageListInSaveRes {
  id: MsgId;
  room_gamemessage_list: Map<number, any> | undefined | null;
  error: ErrorCode;
}
```
