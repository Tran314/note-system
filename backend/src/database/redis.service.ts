import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client: RedisClientType;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);
    const password = this.configService.get<string>('REDIS_PASSWORD');

    this.client = createClient({
      url: `redis://${host}:${port}`,
      password: password,
    });

    this.client.on('error', (err) => this.logger.error('Redis Client Error:', err));
    this.client.on('connect', () => this.logger.log('✅ Redis 连接成功'));

    try {
      await this.client.connect();
    } catch (error) {
      this.logger.warn('⚠️ Redis 连接失败，应用将以降级模式运行', error);
    }
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) {
      await this.client.quit();
      this.logger.log('🔌 Redis 连接已断开');
    }
  }

  // 检查连接
  async ping(): Promise<string> {
    if (!this.client?.isOpen) return 'PONG';
    return this.client.ping();
  }

  // 获取值
  async get(key: string): Promise<string | null> {
    if (!this.client?.isOpen) return null;
    return this.client.get(key);
  }

  // 设置值（带过期时间）
  async set(key: string, value: string, expiresIn?: number): Promise<void> {
    if (!this.client?.isOpen) return;
    if (expiresIn) {
      await this.client.setEx(key, expiresIn, value);
    } else {
      await this.client.set(key, value);
    }
  }

  // 删除值
  async del(key: string): Promise<void> {
    if (!this.client?.isOpen) return;
    await this.client.del(key);
  }

  // 检查是否存在
  async exists(key: string): Promise<boolean> {
    if (!this.client?.isOpen) return false;
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
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch {
      return null;
    }
  }

  async clearUserSession(userId: string): Promise<void> {
    await this.del(`session:${userId}`);
  }
}
