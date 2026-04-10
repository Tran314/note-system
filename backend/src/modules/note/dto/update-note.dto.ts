import { IsString, IsOptional, IsUUID, IsBoolean, IsArray } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateNoteDto {
  @ApiPropertyOptional({ example: '更新后的标题', description: '笔记标题' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ example: '更新后的内容...', description: '笔记内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'uuid-folder-id', description: '所属文件夹 ID' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ example: false, description: '是否置顶' })
  @IsOptional()
  @IsBoolean()
  isPinned?: boolean;

  @ApiPropertyOptional({ example: ['uuid-tag-1', 'uuid-tag-2'], description: '标签 ID 数组' })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  tags?: string[];
}