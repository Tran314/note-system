import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { Prisma } from '@prisma/client';
import * as fs from 'fs/promises';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  private async ensureUploadDir(dir: string): Promise<void> {
    try {
      await fs.access(dir);
    } catch {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  async upload(
    userId: string,
    file: Express.Multer.File,
    noteId?: string,
  ) {
    if (!file) {
      throw new BadRequestException('文件不存在');
    }

    const maxSize = this.configService.get<number>('MAX_FILE_SIZE', 10485760);
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小超过限制（10MB）');
    }

    const allowedMimeTypes = [
      'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
      'application/pdf',
      'text/plain', 'text/csv',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException('不支持的文件类型');
    }

    const ext = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${ext}`;
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, uniqueFilename);

    await this.ensureUploadDir(uploadDir);

    // 先写入文件，成功后再创建数据库记录
    await fs.writeFile(filePath, file.buffer);

    try {
      const attachment = await this.prisma.attachment.create({
        data: {
          userId,
          noteId,
          filename: file.originalname,
          filePath: uniqueFilename,
          fileSize: file.size,
          mimeType: file.mimetype,
        },
      });
      return attachment;
    } catch (error) {
      // 数据库写入失败，清理已上传的文件
      await fs.unlink(filePath).catch(() => {});
      throw error;
    }
  }

  async uploadMultiple(
    userId: string,
    files: Express.Multer.File[],
    noteId?: string,
  ) {
    const uploadedPaths: string[] = [];
    const createdIds: string[] = [];
    const attachments: any[] = [];

    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');

    try {
      for (const file of files) {
        const attachment = await this.upload(userId, file, noteId);
        uploadedPaths.push((attachment as any).filePath);
        createdIds.push((attachment as any).id);
        attachments.push(attachment);
      }
      return attachments;
    } catch (error) {
      // 部分失败时清理已上传的文件
      for (const filePath of uploadedPaths) {
        await fs.unlink(path.join(uploadDir, filePath)).catch(() => {});
      }
      // 清理已创建的数据库记录
      if (createdIds.length > 0) {
        await this.prisma.attachment.deleteMany({
          where: { id: { in: createdIds } },
        }).catch(() => {});
      }
      throw error;
    }
  }

  async findAll(userId: string, noteId?: string) {
    const where: Prisma.AttachmentWhereInput = { userId };
    if (noteId) where.noteId = noteId;

    return this.prisma.attachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, attachmentId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, userId },
    });

    if (!attachment) {
      throw new NotFoundException('文件不存在');
    }

    return attachment;
  }

  async getFile(userId: string, attachmentId: string) {
    const attachment = await this.findOne(userId, attachmentId);

    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, attachment.filePath);

    try {
      const fileBuffer = await fs.readFile(filePath);
      return {
        buffer: fileBuffer,
        filename: attachment.filename,
        mimeType: attachment.mimeType,
      };
    } catch {
      throw new NotFoundException('文件不存在或已被删除');
    }
  }

  async remove(userId: string, attachmentId: string) {
    const attachment = await this.findOne(userId, attachmentId);

    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, attachment.filePath);

    // 先删除数据库记录
    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

    // 再删除物理文件（即使失败也不影响数据库一致性）
    await fs.unlink(filePath).catch(() => {});

    return { message: '文件已删除' };
  }

  async attachToNote(userId: string, attachmentId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    await this.prisma.attachment.update({
      where: { id: attachmentId, userId },
      data: { noteId },
    });

    return { message: '文件关联成功' };
  }
}
