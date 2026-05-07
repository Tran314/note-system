import { IsString, IsOptional, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiPropertyOptional({ example: '新昵称', description: '用户昵称' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '昵称最多50位' })
  nickname?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg', description: '头像 URL' })
  @IsOptional()
  @IsString()
  @MaxLength(500, { message: '头像 URL 最多500位' })
  avatarUrl?: string;
}