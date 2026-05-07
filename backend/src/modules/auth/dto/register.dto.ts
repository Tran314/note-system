import { IsEmail, IsString, MinLength, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com', description: '用户邮箱' })
  @IsEmail({}, { message: '邮箱格式不正确' })
  email: string;

  @ApiProperty({ example: 'Password123', description: '用户密码（6-50位，需包含大小写字母和数字）' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @MaxLength(50, { message: '密码最多50位' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d@$!%*?&]{6,50}$/,
    { message: '密码必须包含大小写字母和数字' }
  )
  password: string;

  @ApiPropertyOptional({ example: '用户昵称', description: '用户昵称' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称最多50位' })
  nickname?: string;
}