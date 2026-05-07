import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

type MemoryEntry = {
  value: string;
  expiresAt?: number;
};

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType | null = null;
  private readonly memoryStore = new Map<string, MemoryEntry>();
  private useMemoryStore = false;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    const redisDisabled =
      this.configService.get<string>('REDIS_DISABLED', 'false') === 'true';

    if (redisDisabled) {
      this.useMemoryStore = true;
      console.log('Redis disabled, using in-memory cache for personal mode');
      return;
    }

    const host = this.configService.get<string>('REDIS_HOST', 'localhost');
    const port = this.configService.get<number>('REDIS_PORT', 6379);

    this.client = createClient({
      url: `redis://${host}:${port}`,
    });

    this.client.on('error', (err) => {
      console.warn('Redis unavailable, falling back to in-memory cache:', err);
      this.useMemoryStore = true;
    });

    try {
      await this.client.connect();
      console.log('Redis connected');
    } catch (error) {
      this.useMemoryStore = true;
      this.client = null;
      console.warn('Redis connect failed, using in-memory cache:', error);
    }
  }

  async onModuleDestroy() {
    if (this.client?.isOpen) {
      await this.client.quit();
    }
  }

  async ping(): Promise<string> {
    if (this.useMemoryStore || !this.client) {
      return 'PONG';
    }

    return this.client.ping();
  }

  async get(key: string): Promise<string | null> {
    if (this.useMemoryStore || !this.client) {
      return this.getMemoryValue(key);
    }

    return this.client.get(key);
  }

  async set(key: string, value: string, expiresIn?: number): Promise<void> {
    if (this.useMemoryStore || !this.client) {
      this.setMemoryValue(key, value, expiresIn);
      return;
    }

    if (expiresIn) {
      await this.client.setEx(key, expiresIn, value);
      return;
    }

    await this.client.set(key, value);
  }

  async del(key: string): Promise<void> {
    if (this.useMemoryStore || !this.client) {
      this.memoryStore.delete(key);
      return;
    }

    await this.client.del(key);
  }

  async exists(key: string): Promise<boolean> {
    if (this.useMemoryStore || !this.client) {
      return this.getMemoryValue(key) !== null;
    }

    const result = await this.client.exists(key);
    return result === 1;
  }

  async addToBlacklist(jti: string, expiresIn: number): Promise<void> {
    await this.set(`blacklist:${jti}`, '1', expiresIn);
  }

  async isBlacklisted(jti: string): Promise<boolean> {
    return this.exists(`blacklist:${jti}`);
  }

  async cacheUserSession(
    userId: string,
    data: object,
    expiresIn: number,
  ): Promise<void> {
    await this.set(`session:${userId}`, JSON.stringify(data), expiresIn);
  }

  async getUserSession(userId: string): Promise<object | null> {
    const data = await this.get(`session:${userId}`);
    return data ? JSON.parse(data) : null;
  }

  async clearUserSession(userId: string): Promise<void> {
    await this.del(`session:${userId}`);
  }

  private getMemoryValue(key: string): string | null {
    const entry = this.memoryStore.get(key);
    if (!entry) {
      return null;
    }

    if (entry.expiresAt && entry.expiresAt <= Date.now()) {
      this.memoryStore.delete(key);
      return null;
    }

    return entry.value;
  }

  private setMemoryValue(key: string, value: string, expiresIn?: number) {
    this.memoryStore.set(key, {
      value,
      expiresAt: expiresIn ? Date.now() + expiresIn * 1000 : undefined,
    });
  }
}
