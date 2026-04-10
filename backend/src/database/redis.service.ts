import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.client = createClient({
      url: `redis://${host}:${port}`,
    });

    this.client.on('error', (err) => console.error('Redis Client Error:', err));
    this.client.on('connect', () => console.log('✅ Redis 连接成功'));

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
    console.log('🔌 Redis 连接已断开');
  }

  // 获取值
  async get(key: string): Promise<string | null> {
    return this.client.get(key);
  }

  // 设置值（带过期时间）
  async set(key: string, value: string, expiresIn?: number): Promise<void> {
    if (expiresIn) {
      await this.client.setEx(key, expiresIn, value);
    } else {
      await this.client.set(key, value);
    }
  }

  // 删除值
  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  // 检查是否存在
  async exists(key: string): Promise<boolean> {
    const result = await this.client.exists(key);
    return result === 1;
  }

  // Token 黑名单操作
  async addToBlacklist(jti: string, expiresIn: number): Promise<void> {
    await this.set(`blacklist:${jti}`, '1', expiresIn);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    return this.exists(`blacklist:${jti}`);
  }

  // 用户会话缓存
  async cacheUserSession(userId: string, data: object, expiresIn: number): Promise<void> {
    await this.set(`session:${userId}`, JSON.stringify(data), expiresIn);
  }

  async getUserSession(userId: string): Promise<object | null> {
    const data = await this.get(`session:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async clearUserSession(userId: string): Promise<void> {
    await this.del(`session:${userId}`);
  }
}