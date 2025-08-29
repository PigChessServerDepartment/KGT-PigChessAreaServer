import { WorkerMsgType } from "../const";
// import { MatchType } from "../Model";

export enum MatchType{
    oneVone=0,
    moreVmore=1,
    oneVmore=2,
    oneVmore_value1=3,
    oneVmore_value3=4,
    default=5
}
export enum WorkerMsgId{
    QueueMatch = 1,
}

export interface QueueMatchReq{
    id:WorkerMsgId;
    witch_worker:WorkerMsgType;
    match_type:MatchType;
    match_queue:string[];
}