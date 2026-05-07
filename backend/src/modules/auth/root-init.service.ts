import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RootInitService implements OnModuleInit {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const rootEmail = this.configService.get<string>('ROOT_EMAIL')?.trim().toLowerCase();
    const rootPassword = this.configService.get<string>('ROOT_PASSWORD')?.trim();
    const rootNickname =
      this.configService.get<string>('ROOT_NICKNAME')?.trim() || 'Root';

    if (!rootEmail || !rootPassword) {
      return;
    }

    const existingUser = await this.prisma.user.findUnique({
      where: { email: rootEmail },
      select: { id: true, email: true },
    });

    if (existingUser) {
      await this.prisma.userSettings.upsert({
        where: { userId: existingUser.id },
        update: {},
        create: { userId: existingUser.id },
      });
      console.log(`Root account ready: ${existingUser.email}`);
      return;
    }

    const passwordHash = await bcrypt.hash(rootPassword, 10);
    const rootUser = await this.prisma.user.create({
      data: {
        email: rootEmail,
        passwordHash,
        nickname: rootNickname,
      },
    });

    await this.prisma.userSettings.create({
      data: { userId: rootUser.id },
    });

    console.log(`Root account initialized: ${rootUser.email}`);
  }
}
