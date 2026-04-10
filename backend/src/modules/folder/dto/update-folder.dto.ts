import { IsString, IsOptional, IsUUID, IsInt } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateFolderDto {
  @ApiPropertyOptional({ example: '更新后的文件夹名', description: '文件夹名称' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'uuid-parent-id', description: '父文件夹 ID' })
  @IsOptional()
  @IsUUID()
  parentId?: string;

  @ApiPropertyOptional({ example: 1, description: '排序顺序' })
  @IsOptional()
  @IsInt()
  sortOrder?: number;
}