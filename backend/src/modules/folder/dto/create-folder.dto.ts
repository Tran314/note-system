import { IsString, IsNotEmpty, IsOptional, IsUUID, IsInt } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFolderDto {
  @ApiProperty({ example: '我的文件夹', description: '文件夹名称' })
  @IsString()
  @IsNotEmpty({ message: '文件夹名称不能为空' })
  name: string;

  @ApiPropertyOptional({ example: 'uuid-parent-id', description: '父文件夹 ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: 0, description: '排序顺序' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}