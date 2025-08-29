import { MatchType } from "./WorkerModel";

export class RandomMatchSystem {
    private queue_3v3_by_playername: string[] = [];//value=1
    private queue_1v1_by_playername: string[] = [];//value=3
    //1v3队列
    private queue_1v3_value3_by_playername: string[] = [];//value=1
    private queue_1v3_value1_by_playername: string[] = [];//value=3
    private static instance: RandomMatchSystem | null = null;
    constructor() {
        
    }
    static getInstance():RandomMatchSystem {
        if (!RandomMatchSystem.instance) RandomMatchSystem.instance = new RandomMatchSystem();
        return RandomMatchSystem.instance;
    }

    get_random_match_system_status()
    {
        let status:MatchType[]=[]
        // if(this.queue_1v1_by_playername.length>=2)
        // {
        //     status.push(MatchType.oneVone)
        // }
        // if(this.queue_3v3_by_playername.length>=6)
        // {
        //     status.push(MatchType.moreVmore)
        // }
        // if(this.queue_1v3_value1_by_playername.length>=3&&this.queue_1v3_value3_by_playername.length>=1)
        // {
        //     status.push(MatchType.oneVmore)
        // }

        if(this.queue_1v1_by_playername.length>=1)
        {
            status.push(MatchType.oneVone)
        }
        if(this.queue_3v3_by_playername.length>=1)
        {
            status.push(MatchType.moreVmore)
        }
        if(this.queue_1v3_value1_by_playername.length>=1||this.queue_1v3_value3_by_playername.length>=1)
        {
            status.push(MatchType.oneVmore)
        }
        return status
    }

    add_to_queue(match_type:MatchType,playername:string) 
    {
        switch(match_type)
        {
            case MatchType.oneVone:
                this.insert_to_queue_1v1(playername); 
                break;
            case MatchType.moreVmore:
                this.insert_to_queue_3v3(playername);
                break;
            case MatchType.oneVmore_value1:
                this.insert_to_queue_1v3_value1(playername);
                break;
            case MatchType.oneVmore_value3:
                this.insert_to_queue_1v3_value3(playername);
                break;
        }
    }

    insert_to_queue_3v3(playername: string) {
        this.queue_3v3_by_playername.push(playername);
    }

    insert_to_queue_1v1(playername: string) {    
        this.queue_1v1_by_playername.push(playername);
    }

    insert_to_queue_1v3_value3(playername: string) {
        this.queue_1v3_value3_by_playername.push(playername);
    }

    insert_to_queue_1v3_value1(playername: string) {
        this.queue_1v3_value1_by_playername.push(playername);
    }

    get_queue_a_3v3() {
        return this.queue_3v3_by_playername.shift();
    }

    get_queue_a_1v1() {
        return this.queue_1v1_by_playername.shift();
    }

    get_queue_a_1v3_value3() {
        return this.queue_1v3_value3_by_playername.shift();
    }

    get_queue_a_1v3_value1() {
        return this.queue_1v3_value1_by_playername.shift();
    }
}