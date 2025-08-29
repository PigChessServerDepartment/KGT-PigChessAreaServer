import { WebServerErrorCode } from "./ErrorCode";
import { ErrorDetail } from "./ErrorDetail";
import { MatchType } from "./Worker/WorkerModel";

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

// export enum MatchType{
//     oneVone=0,
//     moreVmore=1,
//     oneVmore=2,
//     oneVmore_value1=3,
//     oneVmore_value3=4,
//     default=5
// }
export { WebServerErrorCode as ErrorCode } from "./ErrorCode";
type ErrorCode = WebServerErrorCode;
// export enum ErrorCode{
//     WebSocketErr=0,
//     WebSocketSuccess=1,
//     PlayerNameEmpty=2,
//     CreateRoomSuccess=3,
//     CreateRoomFail=4,
//     ConnectRoomSuccess=5,
//     PasswordORRoomnameErr=6,

//     ChangeLocationSuccess=7,
//     ChangeLocationFail=8,
//     SomeoneHaveInThisLocation=10009,

//     GetAllLocationSuccess=9,
//     GetAllLocationFail=10,
//     GameStartSuccess=11,
//     GameStartNotAtRoomFail=12,
//     GameStartNotOwnerFail=13,
//     GameMessageSuccess=14,
//     GameMessageFail=15,
//     GamePlayerLoadFinishSuccess=16,
//     GamePlayerLoadFinishFail=17,
//     GameRoomClose=18,
//     GameEndSuccess=19,
//     GameEndFail=20,
//     SetPlayerNameSuccess=21,
//     SetPlayerNameFail=22,

//     GetRoomGameMessageListSuccess=23,
//     GetRoomGameMessageListRoomNotConnectFail=24,
//     GetRoomGameMessageListPlayerNameError=25,
//     GetRoomGameMessageListNotHaveList=26,

//     GetRoomGameMessageListItemSuccess=27,
    
//     ReConnectRoomSuccess=28,
//     ReConnectRoomFail=29,

//     SetRandomLeavePlayerManagerSuccess=30,
//     SetRandomLeavePlayerManagerFail=31,

//     RandomLeavePlayerManagerSendmsgSuccess=32,
//     RandomLeavePlayerManagerSendmsgFail=33,
//     RandomLeavePlayerManagerRoomNull=34,
//     RandomLeavePlayerManagerYouNotManager=35,

//     ObtainTimestampSuccess=36,
//     ObtainTimestampFail=37,

//     RandomMatchFail=38,

//     PrepareSuccess=39,
//     PrepareFail=40,
//     RandomRoomGameStart=41,

//     ReadySuccess=42,
//     ReadyFail=43,
//     AllReady=44,

//     None=10086,
//     YourGameRoomIsNull=10087,
// }

// export enum ErrorDetail
// {
//     RandomMatchFail_Status1="对方的连接有问题或者是已经取消匹配"
// }

export interface StressTestDataReq
{
    playername:string;
}
export interface StressTestDataRes
{
    id:MsgId;
    playername:string;
}


///创建房间请求
export interface CreateRoomReq {
    roomname: string;  // 房间名称
    password: string;  // 房间密码
}

export interface CreateRoomRes
{
    id:MsgId
    error:ErrorCode;
    roomname: string;
}

///连接房间请求
export interface ConnectRoomReq{
    roomname:string;
    password:string;
}

export interface ConnectRoomRes
{
    id:MsgId;
    error:ErrorCode;
    roomname:string;
    alllocation:[];
}

///改变位置请求
export interface ChangeLocationReq
{
    playername:string;
    nextlocation:number;
    nowlocation:number;
    value:number;
}

export interface ChangeLocationRes
{
    id:MsgId;
    error:ErrorCode;
    playername:string;
    nextlocation:number;
    nowlocation:number;
    value:number;
    detail:ErrorDetail;
    alllocation:[];
}

///获取全部位置请求
export interface GetAllLocationReq
{
    playername:string;
}

export interface GetAllLocationRes
{
    id:MsgId;
    error:ErrorCode;
    alllocation:[];
    
}

///游戏开始请求
export interface GameStartReq
{

}

export interface GameStartRes
{
    id:MsgId;
    error:ErrorCode;
}

///游戏消息请求
export interface GameMessageReq
{
    gamemessage:any;
}

export interface GameMessageRes
{
    id:MsgId;
    error:ErrorCode;
    gamemessage:any;
}

///游戏玩家加载完成请求
export interface GamePlayerLoadFinishReq
{
    value:number
}

export interface GamePlayerLoadFinishRes
{
    id:MsgId;
    error:ErrorCode;
    valuesum:number;
}

///游戏结束请求
export interface GameEndReq
{
    message:any
}

export interface GameEndRes
{
    id:MsgId;
    error:ErrorCode;
}

///游戏房间关闭回复
export interface GameRoomCloseRes
{
    id:MsgId;
    error:ErrorCode;
}

///设置玩家名字请求
export interface SetPlayerNameReq
{
    playername:string
}

export interface SetPlayerNameRes
{
    id:MsgId;
    havecache:boolean;
    player_cache_data:PlayerCacheData|null;
    error:ErrorCode;
}
///获取房间游戏消息列表请求
export interface GetRoomGameMessageListReq
{
    playername:string;
}

export interface GetRoomGameMessageListRes
{
    id:MsgId;
    room_gamemessage_list:Map<number,any>|undefined|null;
    error:ErrorCode;
}

///获取房间游戏消息列表项请求
export interface GetRoomGameMessageListItemReq
{
    playername:string;
    list_item_id:number;
}

export interface GetRoomGameMessageListItemRes
{
    id:MsgId;
    room_gamemessage_list_item:any;
    error:ErrorCode;
}
///重连房间请求
export interface ReConnectRoomReq
{
    roomname:string;
    password:string;
}

export interface ReConnectRoomRes
{
    id:MsgId;
    roomname:string;
    error:ErrorCode;
}
///设置随机离开玩家管理者回复
export interface SetRandomLeavePlayerManagerRes
{
    id:MsgId;
    playername:string;
    error:ErrorCode;
}

///随机离开玩家管理者发送消息请求
export interface RandomLeavePlayerManagerSendmsgReq
{
    gamemessage:any;
}
export interface RandomLeavePlayerManagerSendmsgRes
{
    id:MsgId;
    error:ErrorCode;
}
///获取时间戳请求
export interface ObtainTimestampReq
{
    yourtimestamp:number;
    error:ErrorCode;   
}

export interface ObtainTimestampRes
{
    id:MsgId;
    yourtimestamp:number;
    servertimestamp:number;
    error:ErrorCode;
}
///玩家离开回复
export interface OnePlayerLeaveRes
{
    id:MsgId;
    playername:string;
    error:ErrorCode;
}
///随机匹配房间准备请求
export interface RadomMatchRoomPrepareReq
{
    playername:string;
    error:ErrorCode;
}

export interface RadomMatchRoomPrepareRes
{ 
    id:MsgId;
    playername:string;
    allplayer:string[];
    roomname:string|null;
    error:ErrorCode;
}
///随机匹配请求
export interface RandomMatchReq
{
    matchtype:MatchType;
    playername:string;
}
///随机匹配房间创建回复
export interface RadomMatchRoomCreateRes
{
    id:MsgId;
    ownplayername:string;
    allplayer:string[];
    roomname:string;
    password:string;
    error:ErrorCode;
}

export interface LeaveRoomReq
{
    playername:string;
    situation:PlayerLeaveSituation;
}

export interface LeaveRoomRes
{
    id:MsgId;
    error:ErrorCode;
    situation:PlayerLeaveSituation;
}

export interface RandomMatchFailRes
{
    id:MsgId;
    error:ErrorCode;
    match_queue:string[];
    detail:ErrorDetail;
}

export interface RandomMatchCancelReq
{
    playername:string;
}

export interface RandomMatchCancelRes
{
    id:MsgId;
    playername:string;
    match_gameroom:ConnectRoomReq|null;
    error:ErrorCode;
}

export interface GameLoadReadyReq
{
    playername:string;
}

export interface GameLoadReadyRes
{
    id:MsgId;
    playername:string;
    error:ErrorCode;
}

export interface GetGameAllLoadReadyReq
{
    playername:string;
}

export interface GetGameAllLoadReadyRes
{
    id:MsgId;
    is_all_ready:boolean;
    allreadyplayer:string[];
    error:ErrorCode;
}

export interface GetRoomGameMessageListInSaveReq
{
    roomname:string;
}

export interface GetRoomGameMessageListInSaveRes
{
    id:MsgId;
    room_gamemessage_list:Map<number,any>|undefined|null;
    error:ErrorCode;
}