import { Injectable, UnauthorizedException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  // 获取用户资料
  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        createdAt: true,
        updatedAt: true,
        settings: true,
      },
    });

    return user;
  }

  // 更新用户资料
  async updateProfile(userId: string, updateProfileDto: UpdateProfileDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new NotFoundException('用户不存在');
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: updateProfileDto,
      select: {
        id: true,
        email: true,
        nickname: true,
        avatarUrl: true,
        updatedAt: true,
      },
    });

    return user;
  }

  // 修改密码
  async updatePassword(userId: string, updatePasswordDto: UpdatePasswordDto) {
    const { oldPassword, newPassword } = updatePasswordDto;

    // 获取用户当前密码
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { passwordHash: true },
    });

    // 验证旧密码
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    const isPasswordValid = await bcrypt.compare(oldPassword, user.passwordHash);

    if (!isPasswordValid) {
      throw new UnauthorizedException('原密码错误');
    }

    // 加密新密码
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // 更新密码
    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    return { message: '密码修改成功' };
  }

  // 更新用户设置
  async updateSettings(userId: string, settings: UpdateSettingsDto) {
    const userSettings = await this.prisma.userSettings.upsert({
      where: { userId },
      update: settings,
      create: { userId, ...settings },
    });

    return userSettings;
  }
}