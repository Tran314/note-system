import { IsString, MinLength, MaxLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePasswordDto {
  @ApiProperty({ example: 'oldPassword123', description: '原密码' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @MaxLength(50, { message: '密码最多50位' })
  oldPassword: string;

  @ApiProperty({ example: 'newPassword123', description: '新密码' })
  @IsString()
  @MinLength(6, { message: '密码至少6位' })
  @MaxLength(50, { message: '密码最多50位' })
  newPassword: string;
}