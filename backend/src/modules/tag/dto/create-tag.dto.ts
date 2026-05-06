import { IsString, IsNotEmpty, MaxLength, IsOptional, Matches } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTagDto {
  @ApiProperty({ example: '重要', description: '标签名称' })
  @IsString()
  @IsNotEmpty({ message: '标签名称不能为空' })
  @MaxLength(50, { message: '标签名最多50位' })
  name: string;

  @ApiPropertyOptional({ example: '#FF0000', description: '标签颜色（HEX 格式）' })
  @IsOptional()
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: '颜色必须是有效的 HEX 格式（如 #FF0000）' })
  color?: string;
}
