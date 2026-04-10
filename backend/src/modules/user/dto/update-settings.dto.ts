import {
  IsBoolean,
  IsIn,
  IsInt,
  IsOptional,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSettingsDto {
  @ApiPropertyOptional({ example: 'light', description: 'Theme' })
  @IsOptional()
  @IsIn(['light', 'dark'])
  theme?: string;

  @ApiPropertyOptional({ example: 16, description: 'Editor font size' })
  @IsOptional()
  @IsInt()
  @Min(12)
  @Max(32)
  editorFontSize?: number;

  @ApiPropertyOptional({ example: true, description: 'Auto save enabled' })
  @IsOptional()
  @IsBoolean()
  autoSave?: boolean;

  @ApiPropertyOptional({ example: 30, description: 'Auto save interval in seconds' })
  @IsOptional()
  @IsInt()
  @Min(5)
  @Max(3600)
  autoSaveInterval?: number;

  @ApiPropertyOptional({ example: 'uuid-folder-id', description: 'Default folder id' })
  @IsOptional()
  @IsUUID()
  defaultFolderId?: string;
}
