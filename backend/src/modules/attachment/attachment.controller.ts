import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Query,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  Res,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiParam,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { AttachmentService } from './attachment.service';
import { CurrentUser } from '../../common';
import { Response } from 'express';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const SINGLE_UPLOAD_LIMITS = {
  files: 1,
  fields: 5,
  parts: 6,
  fileSize: MAX_UPLOAD_BYTES,
};
const MULTI_UPLOAD_LIMITS = {
  files: 5,
  fields: 5,
  parts: 10,
  fileSize: MAX_UPLOAD_BYTES,
};

@ApiTags('Attachments')
@Controller('attachments')
@ApiBearerAuth()
export class AttachmentController {
  constructor(private attachmentService: AttachmentService) {}

  @Post('upload')
  @ApiOperation({ summary: 'Upload a single attachment' })
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
  @UseInterceptors(FileInterceptor('file', { limits: SINGLE_UPLOAD_LIMITS }))
  async uploadSingle(
    @CurrentUser('sub') userId: string,
    @UploadedFile() file: Express.Multer.File,
    @Query('noteId') noteId?: string,
  ) {
    return this.attachmentService.upload(userId, file, noteId);
  }

  @Post('upload/multiple')
  @ApiOperation({ summary: 'Upload multiple attachments' })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FilesInterceptor('files', 5, {
      limits: MULTI_UPLOAD_LIMITS,
    }),
  )
  async uploadMultiple(
    @CurrentUser('sub') userId: string,
    @UploadedFiles() files: Express.Multer.File[],
    @Query('noteId') noteId?: string,
  ) {
    return this.attachmentService.uploadMultiple(userId, files, noteId);
  }

  @Get()
  @ApiOperation({ summary: 'Get attachment list' })
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('noteId') noteId?: string,
  ) {
    return this.attachmentService.findAll(userId, noteId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get attachment metadata' })
  @ApiParam({ name: 'id', description: 'Attachment ID' })
  async findOne(
    @CurrentUser('sub') userId: string,
    @Param('id') attachmentId: string,
  ) {
    return this.attachmentService.findOne(userId, attachmentId);
  }

  @Get(':id/download')
  @ApiOperation({ summary: 'Download an attachment' })
  @ApiParam({ name: 'id', description: 'Attachment ID' })
  async download(
    @CurrentUser('sub') userId: string,
    @Param('id') attachmentId: string,
    @Res() res: Response,
  ) {
    const file = await this.attachmentService.getFile(userId, attachmentId);
    const encodedFilename = encodeURIComponent(file.filename);

    res.setHeader('Content-Type', file.mimeType || 'application/octet-stream');
    res.setHeader(
      'Content-Disposition',
      `attachment; filename*=UTF-8''${encodedFilename}`,
    );
    res.send(file.buffer);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an attachment' })
  @ApiParam({ name: 'id', description: 'Attachment ID' })
  async remove(
    @CurrentUser('sub') userId: string,
    @Param('id') attachmentId: string,
  ) {
    return this.attachmentService.remove(userId, attachmentId);
  }

  @Post(':id/attach/:noteId')
  @ApiOperation({ summary: 'Attach a file to a note' })
  @ApiParam({ name: 'id', description: 'Attachment ID' })
  @ApiParam({ name: 'noteId', description: 'Note ID' })
  async attachToNote(
    @CurrentUser('sub') userId: string,
    @Param('id') attachmentId: string,
    @Param('noteId') noteId: string,
  ) {
    return this.attachmentService.attachToNote(userId, attachmentId, noteId);
  }
}
