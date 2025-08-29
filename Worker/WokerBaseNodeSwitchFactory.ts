import { WorkerMsgType } from "../const";
import * as Node from "../const"
import { PlayerSession } from "../PlayerSession";
import { PlayerSessionCol } from "../PlayerSessionCol";

export class WorkerBaseNodeSwitchFactory
{
    private static instance:WorkerBaseNodeSwitchFactory|null=null;
    static getInstance():WorkerBaseNodeSwitchFactory
    {
        if(!WorkerBaseNodeSwitchFactory.instance) WorkerBaseNodeSwitchFactory.instance=new WorkerBaseNodeSwitchFactory();
        return WorkerBaseNodeSwitchFactory.instance;
    }

    SwitchToAny(workermsgbasenode:Node.WorkerMsgBaseNode)
    {
        switch(workermsgbasenode.workermsgtype)
        {
            case WorkerMsgType.QueueWorkerMsg:
                const queuemsg=workermsgbasenode.msg as Node.QueueNodeMsg;
                return queuemsg;
                break;
        }
    }
}