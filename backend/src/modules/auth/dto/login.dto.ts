import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com', description: '用户邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ example: 'password123', description: '用户密码' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @MaxLength(50, { message: '密码最多50位' })
  password: string;
}