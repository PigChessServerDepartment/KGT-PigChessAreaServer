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

export enum GateServerErrorCode{
    Fali=0,
    Success=1,
}