import { IsOptional, IsUUID, IsString, IsBoolean, IsInt, Min, Max, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class QueryNotesDto {
  @ApiPropertyOptional({ example: 'uuid-folder-id', description: '按文件夹筛选' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ example: 'uuid-tag-id', description: '按标签筛选' })
  @IsOptional()
  @IsUUID()
  tagId?: string;

  @ApiPropertyOptional({ example: '关键词', description: '搜索关键词（最多100字符）' })
  @IsOptional()
  @IsString()
  @MaxLength(100, { message: '搜索关键词最多100个字符' })
  keyword?: string;

  @ApiPropertyOptional({ example: true, description: '是否置顶' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isPinned?: boolean;

  @ApiPropertyOptional({ example: 1, description: '页码（最小1）' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Type(() => Number)
  page?: number;

  @ApiPropertyOptional({ example: 20, description: '每页数量（最小1，最大100）' })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100, { message: '每页最多100条' })
  @Type(() => Number)
  limit?: number;
}