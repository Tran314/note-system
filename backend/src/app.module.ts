import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { PrismaModule } from './database/prisma.module';
import { RedisModule } from './database/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { NoteModule } from './modules/note/note.module';
import { FolderModule } from './modules/folder/folder.module';
import { TagModule } from './modules/tag/tag.module';
import { AttachmentModule } from './modules/attachment/attachment.module';
import { HealthModule } from './modules/health/health.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { validationSchema } from './config/env.validation';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env', '../.env'],
      validationSchema,
      validationOptions: {
        abortEarly: false,
      },
    }),

    // JWT 模块
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<number>('JWT_ACCESS_EXPIRES_IN', 1800),
        },
      }),
      inject: [ConfigService],
    }),

    // 限流模块 - 通过环境变量配置
    ThrottlerModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => [
        {
          ttl: configService.get<number>('THROTTLE_TTL', 60000), // 默认 1 分钟
          limit: configService.get<number>('THROTTLE_LIMIT', 100), // 默认每分钟 100 次请求
        },
      ],
      inject: [ConfigService],
    }),

    // 数据库模块
    PrismaModule,
    RedisModule,

    // 业务模块
    AuthModule,
    UserModule,
    NoteModule,
    FolderModule,
    TagModule,
    AttachmentModule,
    HealthModule,  // 健康检查模块
  ],
  controllers: [AppController],
  providers: [
    AppService,
    // 全局 JWT 认证守卫
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}