import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RedisService } from '../../database/redis.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import {
  ConflictException,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private redisService: RedisService,
  ) {}

  // 用户注册
  async register(registerDto: RegisterDto) {
    const { email, password, nickname } = registerDto;

    // 检查邮箱是否已存在
    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    // 密码加密
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname: nickname || email.split('@')[0],
      },
    });

    // 创建默认用户设置
    await this.prisma.userSettings.create({
      data: { userId: user.id },
    });

    // 生成 Token
    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  // 用户登录
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    // 查找用户
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 验证密码
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    // 生成 Token
    const tokens = await this.generateTokens(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
      ...tokens,
    };
  }

  // 刷新 Token
  async refresh(userId: string, refreshToken: string) {
    // 查找用户的刷新令牌
    const storedToken = await this.prisma.refreshToken.findFirst({
      where: {
        userId,
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    });

    if (!storedToken) {
      throw new UnauthorizedException('刷新令牌无效或已过期');
    }

    // 验证 Refresh Token
    const isTokenValid = await bcrypt.compare(refreshToken, storedToken.tokenHash);

    if (!isTokenValid) {
      throw new UnauthorizedException('刷新令牌无效');
    }

    // 将旧令牌加入黑名单
    await this.redisService.addToBlacklist(
      storedToken.jti,
      Math.floor((storedToken.expiresAt.getTime() - Date.now()) / 1000),
    );

    // 撤销旧令牌
    await this.prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: { isRevoked: true },
    });

    // 生成新 Token
    const tokens = await this.generateTokens(userId);

    return tokens;
  }

  // 用户登出
  async logout(userId: string, jti: string) {
    // 将 Access Token 的 jti 加入黑名单
    const accessExpiresIn = this.configService.get<number>('JWT_ACCESS_EXPIRES_IN', 1800);
    await this.redisService.addToBlacklist(jti, accessExpiresIn);

    // 撤销所有刷新令牌
    await this.prisma.refreshToken.updateMany({
      where: { userId, isRevoked: false },
      data: { isRevoked: true },
    });

    // 清除用户会话缓存
    await this.redisService.clearUserSession(userId);

    return { message: '登出成功' };
  }

  // 获取当前用户信息
  async getCurrentUser(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        createdAt: true,
        settings: true,
      },
    });

    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    return user;
  }

  // 生成双 Token
  private async generateTokens(userId: string) {
    const accessExpiresIn = this.configService.get<number>('JWT_ACCESS_EXPIRES_IN', 1800);
    const refreshExpiresIn = this.configService.get<number>('JWT_REFRESH_EXPIRES_IN', 604800);
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    // Access Token（短有效期）
    const accessJti = uuidv4();
    const accessToken = this.jwtService.sign(
      {
        sub: userId,
        roles: ['user'],
        jti: accessJti,
      },
      {
        secret: jwtSecret,
        expiresIn: accessExpiresIn,
      },
    );

    // Refresh Token（长有效期）
    const refreshJti = uuidv4();
    const refreshToken = uuidv4(); // 使用 UUID 作为 Refresh Token
    const refreshTokenHash = await bcrypt.hash(refreshToken, 10);

    // 存储刷新令牌到数据库
    const expiresAt = new Date(Date.now() + refreshExpiresIn * 1000);
    await this.prisma.refreshToken.create({
      data: {
        userId,
        tokenHash: refreshTokenHash,
        jti: refreshJti,
        expiresAt,
      },
    });

    return {
      accessToken,
      accessJti,
      refreshToken,
      refreshExpiresIn,
    };
  }
}