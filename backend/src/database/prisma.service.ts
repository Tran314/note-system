import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'stdout', level: 'info' },
        { emit: 'stdout', level: 'warn' },
        { emit: 'stdout', level: 'error' },
      ],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Prisma 数据库连接成功');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('🔌 Prisma 数据库连接已断开');
  }

  // 清理软删除的数据（定时任务可调用）
  async cleanSoftDeletedData(daysToKeep: number = 30) {
    const expirationDate = new Date();
    expirationDate.setDate(expirationDate.getDate() - daysToKeep);

    const deleted = await this.note.deleteMany({
      where: {
        isDeleted: true,
        deletedAt: { lt: expirationDate },
      },
    });

    return deleted;
  }
}