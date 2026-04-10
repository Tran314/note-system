import { IsString, IsNotEmpty, IsOptional, IsUUID, IsBoolean, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ example: '我的第一篇笔记', description: '笔记标题' })
  @IsString()
  @IsNotEmpty({ message: '标题不能为空' })
  title: string;

  @ApiPropertyOptional({ example: '这是笔记内容...', description: '笔记内容' })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({ example: 'uuid-folder-id', description: '所属文件夹 ID' })
  @IsOptional()
  @IsUUID()
  folderId?: string;

  @ApiPropertyOptional({ example: ['uuid-tag-1', 'uuid-tag-2'], description: '标签 ID 数组' })
  @IsOptional()
  @IsArray()
  @IsUUID(4, { each: true })
  tags?: string[];
}