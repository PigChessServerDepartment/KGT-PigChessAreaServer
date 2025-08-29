import { PlayerSession } from "./PlayerSession";
import { MsgId } from "./Model";
import { MatchType } from "./Worker/WorkerModel";
import { WorkerMsgId } from "./Worker/WorkerModel";


// export type UnionNodeMsg = QueueNodeMsg | LogicNode | undefined | null

export enum WorkerMsgType
{
  LogisticSystemMsg=1,
  QueueWorkerMsg=2,
}

export interface RedisConnectIni
{   
    RedisPwd:"123456",
    RedisPort:6380,
    RedisHost:"127.0.0.1",
    ConnectNum:3
}

export class Defer {
    private func: (() => void) | null;
    constructor(func: () => void) {
      this.func = func;
      // 返回一个 Proxy 对象，拦截对 dispose 方法的访问
      return new Proxy(this, {
        get(target: Defer, prop: string | symbol) {
          if (prop === 'dispose') {
            // 返回绑定了 target 的 dispose 方法
            return target.dispose.bind(target);
          }
          // 返回其他属性
          return (target as any)[prop];
        },
      });
    }
  
    // 清理函数
    dispose(): void {
      if (this.func) {
        this.func(); // 执行传入的函数
        this.func = null; // 防止重复调用
      }
    }
  }

export class RecNode
{
    public id:null|MsgId=null;
    public msg:any;
    constructor(id:MsgId,msg:any)
    {
        this.id=id;
        this.msg=msg;
    }
}

export class WorkerMsgBaseNode
{
  public workermsgtype:WorkerMsgType;
  public msg:any;
  constructor(workermsgtype:WorkerMsgType,msg:any)
  {
    this.workermsgtype=workermsgtype;
    this.msg=msg;
  }
}

export class QueueNodeMsg
{
  public playername;
  public match_type;
  constructor(playername:string,match_type:MatchType)
  {
    this.playername=playername;
    this.match_type=match_type;
  }
}

export class QueueWorkerNode
{
  public id:null|WorkerMsgId=null;
  public msg:any;
  constructor(id:WorkerMsgId,msg:any)
  {
    this.id=id;
    this.msg=msg;
  }
}

// export class LogicNodeMsg
// {
//   public recnode:RecNode|null=null;
//   public playersession_str:string;
//   constructor(recnode:RecNode,playersession_str:string)
//   {
//     this.recnode=recnode;
//     this.playersession_str=playersession_str;
//   }
// }

export class LogicNode
{
    public playersession:null|PlayerSession=null;
    public recnode:RecNode|null=null;
    constructor(playersession:PlayerSession,recnode:RecNode)
    {
        this.playersession=playersession;
        this.recnode=recnode;
    }
}
