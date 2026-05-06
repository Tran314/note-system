import {
  Controller,
  Get,
  Put,
  Body,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { CurrentUser } from '../../common';

@ApiTags('用户')
@Controller('users')
@ApiBearerAuth()
export class UserController {
  constructor(private userService: UserService) {}

  @Get('profile')
  @ApiOperation({ summary: '获取用户资料' })
  async getProfile(@CurrentUser('sub') userId: string) {
    return this.userService.getProfile(userId);
  }

  @Put('profile')
  @ApiOperation({ summary: '更新用户资料' })
  async updateProfile(
    @CurrentUser('sub') userId: string,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.userService.updateProfile(userId, updateProfileDto);
  }

  @Put('password')
  @ApiOperation({ summary: '修改密码' })
  async updatePassword(
    @CurrentUser('sub') userId: string,
    @Body() updatePasswordDto: UpdatePasswordDto,
  ) {
    return this.userService.updatePassword(userId, updatePasswordDto);
  }

  @Put('settings')
  @ApiOperation({ summary: '更新用户设置' })
  async updateSettings(
    @CurrentUser('sub') userId: string,
    @Body() settings: UpdateSettingsDto,
  ) {
    return this.userService.updateSettings(userId, settings);
  }
}