import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { Public } from '../../common/decorators/public.decorator';

interface HealthStatus {
  status: 'ok' | 'error';
  timestamp: string;
  uptime: number;
  version: string;
  services: {
    database: 'connected' | 'disconnected';
    redis: 'connected' | 'disconnected';
  };
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  private startTime: number;

  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {
    this.startTime = Date.now();
  }

  @Public()
  @Get()
  @ApiOperation({ summary: '健康检查' })
  async check(): Promise<HealthStatus> {
    const databaseStatus = await this.checkDatabase();
    const redisStatus = await this.checkRedis();

    const allHealthy = databaseStatus === 'connected' && redisStatus === 'connected';

    return {
      status: allHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      uptime: Date.now() - this.startTime,
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: databaseStatus,
        redis: redisStatus,
      },
    };
  }

  @Public()
  @Get('ready')
  @ApiOperation({ summary: '就绪检查' })
  async ready(): Promise<{ ready: boolean }> {
    const db = await this.checkDatabase();
    const cache = await this.checkRedis();
    
    return {
      ready: db === 'connected' && cache === 'connected',
    };
  }

  @Public()
  @Get('live')
  @ApiOperation({ summary: '存活检查' })
  live(): { alive: boolean } {
    return { alive: true };
  }

  private async checkDatabase(): Promise<'connected' | 'disconnected'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'connected';
    } catch {
      return 'disconnected';
    }
  }

  private async checkRedis(): Promise<'connected' | 'disconnected'> {
    try {
      await this.redis.ping();
      return 'connected';
    } catch {
      return 'disconnected';
    }
  }
}