import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async check() {
    await this.prisma.$queryRaw`SELECT 1`;
    return { status: 'ok', database: 'connected' };
  }

  async checkReady() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { ready: true };
    } catch {
      return { ready: false };
    }
  }

  checkLive() {
    return { live: true };
  }
}