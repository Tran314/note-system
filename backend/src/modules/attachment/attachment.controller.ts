import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { AttachmentService } from './attachment.service';
import { CurrentUser } from '../../common';
import { Response } from 'express';

@ApiTags('附件')
@Controller('attachments')
@ApiBearerAuth()
export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  @Post('upload')
  @ApiOperation({ summary: '上传单个文件' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: { type: 'string', format: 'binary' },
        noteId: { type: 'string' },
      },
    },
  })
  @UseInterceptors(FileInterceptor('file'))
  async uploadSingle(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('noteId') noteId?: string,
  ) {
    return this.attachmentService.upload(userId, file, noteId);
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: '批量上传文件' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('files', 5))
  async uploadMultiple(
    @CurrentUser('sub') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('noteId') noteId?: string,
  ) {
    return this.attachmentService.uploadMultiple(userId, files, noteId);
  }

  @Get()
  @ApiOperation({ summary: '获取文件列表' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('noteId') noteId?: string,
  ) {
    return this.attachmentService.findAll(userId, noteId);
  }

  @Get(':id')
  @ApiOperation({ summary: '获取文件信息' })
  @ApiParam({ name: 'id', description: '附件 ID' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') attachmentId: string,
  ) {
    return this.attachmentService.findOne(userId, attachmentId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: '下载文件' })
  @ApiParam({ name: 'id', description: '附件 ID' })
  async download(
    @CurrentUser('sub') userId: string,
    @Param('id') attachmentId: string,
    @Res() res: Response,
  ) {
    const file = await this.attachmentService.getFile(userId, attachmentId);

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${file.filename}"`);
    res.send(file.buffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: '删除文件' })
  @ApiParam({ name: 'id', description: '附件 ID' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id') attachmentId: string,
  ) {
    return this.attachmentService.remove(userId, attachmentId);
  }

  @Post(':id/attach/:noteId')
  @ApiOperation({ summary: '关联文件到笔记' })
  @ApiParam({ name: 'id', description: '附件 ID' })
  @ApiParam({ name: 'noteId', description: '笔记 ID' })
  async attachToNote(
    @CurrentUser('sub') userId: string,
    @Param('id') attachmentId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.attachmentService.attachToNote(userId, attachmentId, noteId);
  }
}