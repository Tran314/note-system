import { IsString, IsOptional, MaxLength, Matches } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateTagDto {
  @ApiPropertyOptional({ example: '更新后的标签名', description: '标签名称' })
  @IsOptional()
  @IsString()
  @MaxLength(50, { message: '标签名最多50位' })
  name?: string;

  @ApiPropertyOptional({ example: '#00FF00', description: '标签颜色（HEX 格式）' })
  @IsOptional()
  @IsString()
  @MaxLength(7, { message: '颜色格式不正确' })
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: '颜色必须是有效的 HEX 格式（如 #FF0000）' })
  color?: string;
}