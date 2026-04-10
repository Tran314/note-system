import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '用户邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ example: 'password123', description: '用户密码（6-50位）' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @MaxLength(50, { message: '密码最多50位' })
  password: string;

  @ApiPropertyOptional({ example: '用户昵称', description: '用户昵称' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称最多50位' })
  nickname?: string;
}