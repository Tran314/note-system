import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../../database/prisma.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, nickname } = registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException('该邮箱已被注册');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = await this.prisma.user.create({
      data: {
        email,
        passwordHash,
        nickname: nickname || email.split('@')[0],
      },
    });

    await this.prisma.userSettings.create({
      data: { userId: user.id },
    });

    const accessToken = this.generateAccessToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const accessToken = this.generateAccessToken(user.id);

    return {
      user: {
        id: user.id,
        email: user.email,
        nickname: user.nickname,
        avatarUrl: user.avatarUrl,
      },
      accessToken,
    };
  }

  async logout() {
    return { message: '退出成功' };
  }

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

  private generateAccessToken(userId: string) {
    const accessExpiresIn = this.configService.get<number>(
      'JWT_ACCESS_EXPIRES_IN',
      2592000,
    );
    const jwtSecret = this.configService.get<string>('JWT_SECRET');

    return this.jwtService.sign(
      {
        sub: userId,
        roles: ['user'],
      },
      {
        secret: jwtSecret,
        expiresIn: accessExpiresIn,
      },
    );
  }
}
