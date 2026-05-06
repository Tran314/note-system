import { IsOptional, IsString, IsBoolean, IsNumber, Min, Max, IsIn } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ description: '主题', enum: ['light', 'dark'] })
  @IsOptional()
  @IsString()
  @IsIn(['light', 'dark'], { message: '主题只能是 light 或 dark' })
  theme?: string;

  @ApiPropertyOptional({ description: '编辑器字体大小' })
  @IsOptional()
  @IsNumber()
  @Min(12)
  @Max(32)
  editorFontSize?: number;

  @ApiPropertyOptional({ description: '是否启用自动保存' })
  @IsOptional()
  @IsBoolean()
  autoSave?: boolean;

  @ApiPropertyOptional({ description: '自动保存间隔（秒）' })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(300)
  autoSaveInterval?: number;

  @ApiPropertyOptional({ description: '默认文件夹ID' })
  @IsOptional()
  @IsString()
  defaultFolderId?: string;
}
