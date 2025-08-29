import { Redis } from "ioredis";
import { Defer, RedisConnectIni } from "./const";
class RedisPool {
    private connections: Redis[] = []; // 存储连接池中的连接
    private waitingQueue: Array<(conn: Redis) => void> = []; // 等待队列
  
    constructor(private redisConnectMsg: RedisConnectIni) {
      // 初始化连接池
      for (let i = 0; i < redisConnectMsg.ConnectNum; i++) {
        const conn = new Redis({
          host: redisConnectMsg.RedisHost,
          port: redisConnectMsg.RedisPort,
          password: redisConnectMsg.RedisPwd,
        });
  
        // 监听连接错误
        conn.on('error', (err: any) => {
          console.error('Redis connection error:', err);
        });
  
        this.connections.push(conn);
      }
    }
  
    /**
     * 获取一个 Redis 连接
     * @returns Promise<Redis>
     */
    public getConnection(): Promise<Redis> {
      return new Promise((resolve) => {
        if (this.connections.length > 0) {
          // 如果池中有可用连接，直接返回
          resolve(this.connections.pop()!);
        } else {
          // 如果池中没有可用连接，将请求加入等待队列
          this.waitingQueue.push(resolve);
        }
      });
    }
  
    /**
     * 释放一个 Redis 连接
     * @param conn Redis 连接
     */
    public releaseConnection(conn: Redis): void {
      if (this.waitingQueue.length > 0) {
        // 如果有等待的请求，直接将连接分配给等待的请求
        const waitingResolve = this.waitingQueue.shift()!;
        waitingResolve(conn);
      } else {
        // 如果没有等待的请求，将连接放回池中
        this.connections.push(conn);
      }
    }
  
    /**
     * 关闭连接池
     */
    public async close(): Promise<void> {
      // 关闭所有连接
      await Promise.all(this.connections.map((conn) => conn.quit()));
      this.connections = [];
      this.waitingQueue = [];
      console.log('Redis pool closed.');
    }
  }
  

export class RedisMgr
{

    private con_redis_pool:RedisPool;

    constructor()
    {
        
        this.con_redis_pool=new RedisPool({   
            RedisPwd:"123456",
            RedisPort:6380,
            RedisHost:"127.0.0.1",
            ConnectNum:3
        });
    }
    private static instance: RedisMgr | null = null;
    static getInstance(): RedisMgr
    {
        if (!RedisMgr.instance) RedisMgr.instance = new RedisMgr();
        return RedisMgr.instance;
    }

    async SetRedis(key: any, value: any) {
        const conn = await this.con_redis_pool.getConnection();
        let defer:Defer=new Defer(()=>{
            this.con_redis_pool.releaseConnection(conn);
            console.log("redis connection release")
        })
        try {
            await conn.set(key, value)
            return true
        } catch (error: any) {
            console.log('Set redis error is', error)
            return false
        }finally {
            defer.dispose(); // 确保无论如何都会释放连接
        }
    }

    async GetRedis(key: any) {
        const conn = await this.con_redis_pool.getConnection();
        let defer:Defer=new Defer(()=>{
            this.con_redis_pool.releaseConnection(conn);
            console.log("Get redis connection release")
        })
        try {
            const result = await conn.get(key)
            if (result == null) {
                console.log('result', result, ' this key cannot be find...')
                return null
            }
            console.log('result:', result, 'get key success...')
            return result
        }
        catch (error: any) {
            console.log('get redis error is ', error)
            return null
        }finally {
            defer.dispose(); // 确保无论如何都会释放连接
        }
    }

    async DelRedis(key: any) {
        const conn = await this.con_redis_pool.getConnection();
        let defer:Defer=new Defer(()=>{
            this.con_redis_pool.releaseConnection(conn);
            console.log("Del redis connection release")
        })
        try {
            await conn.del(key)
            return true
        } catch (error: any) {
            console.log('Del redis error is', error)
            return false
        }finally {
            defer.dispose(); // 确保无论如何都会释放连接
        }
    }
    
    async QueryRedis(key: any) {
        const conn = await this.con_redis_pool.getConnection();
        let defer:Defer=new Defer(()=>{
            this.con_redis_pool.releaseConnection(conn);
        })
        try {
            const result = await conn.exists(key)
            //  判断该值是否为空 如果为空返回null
            if (result === 0) {
                console.log('result:<', '<' + result + '>', 'This key is null...');
                return null
            }
            console.log('Result:', '<' + result + '>', 'With this value!...');
            return result
        } catch (error: any) {
            console.log('QueryRedis error is', error);
            return null
        }finally {
            defer.dispose(); // 确保无论如何都会释放连接
        }
    }
    
    async SetRedisExpire(key: any, value: any, exptime: any) {
        const conn = await this.con_redis_pool.getConnection();
        let defer:Defer=new Defer(()=>{
            this.con_redis_pool.releaseConnection(conn);
        })
        try {
            // 设置键和值
            await conn.set(key, value)
            // 设置过期时间（以秒为单位）
            await conn.expire(key, exptime);
            return true;
        } catch (error: any) {
            console.log('SetRedisExpire error is', error);
            return false;
        }finally {
            defer.dispose(); // 确保无论如何都会释放连接
        }
    }

    async HSetRedis(hashname: any, field: any, value: any) {
        const conn = await this.con_redis_pool.getConnection();
        let defer:Defer=new Defer(()=>{
            this.con_redis_pool.releaseConnection(conn);
        })
        try {
            await conn.hset(hashname, field, value)
            return true
        } catch (error: any) {
            console.log('HSetRedis error is', error)
            return false
        }finally {
            defer.dispose(); // 确保无论如何都会释放连接
        }
    }

}