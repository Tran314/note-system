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
<<<<<<< Updated upstream
=======
import {
  ConflictException,
  UnauthorizedException,
  TooManyRequestsException,
} from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
>>>>>>> Stashed changes

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

    const accessToken = this.generateAccessToken(user.id, user.email);

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

<<<<<<< Updated upstream
=======
    const failures = await this.redisService.getLoginFailures(email);
    if (failures >= 5) {
      throw new TooManyRequestsException('登录失败次数过多，请在 15 分钟后再试');
    }

>>>>>>> Stashed changes
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('邮箱或密码错误');
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      await this.redisService.incrLoginFailures(email);
      throw new UnauthorizedException('邮箱或密码错误');
    }

<<<<<<< Updated upstream
    const accessToken = this.generateAccessToken(user.id, user.email);
=======
    await this.redisService.resetLoginFailures(email);

    const tokens = await this.generateTokens(user.id);
>>>>>>> Stashed changes

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

  private generateAccessToken(userId: string, email: string) {
    const accessExpiresIn = this.configService.get<number>(
      'JWT_ACCESS_EXPIRES_IN',
      2592000,
    );
    const jwtSecret = this.configService.get<string>('JWT_SECRET');
    const rootEmail = this.configService.get<string>('ROOT_EMAIL')?.trim().toLowerCase();
    const normalizedEmail = email.trim().toLowerCase();
    const roles =
      rootEmail && normalizedEmail === rootEmail ? ['root', 'user'] : ['user'];

    return this.jwtService.sign(
      {
        sub: userId,
        roles,
      },
      {
        secret: jwtSecret,
        expiresIn: accessExpiresIn,
      },
    );
  }
}
