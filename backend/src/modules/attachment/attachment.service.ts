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
  private readonly allowedExtensions = new Set([
    // 图片
    '.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.ico',
    // 文档
    '.pdf',
    // 文本
    '.txt', '.csv', '.md', '.log',
    // Office
    '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    // 压缩文件
    '.zip', '.rar', '.7z', '.tar', '.gz',
  ]);

  private readonly allowedMimeTypes = new Set([
    'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/bmp',
    'application/pdf',
    'text/plain', 'text/csv', 'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'application/zip', 'application/x-rar-compressed', 'application/x-7z-compressed',
    'application/gzip', 'application/x-tar',
  ]);

  private readonly fileSignatureChecks: Map<string, (buffer: Buffer) => boolean> = new Map([
    ['image/jpeg', (buffer) => buffer[0] === 0xFF && buffer[1] === 0xD8],
    ['image/png', (buffer) => 
      buffer[0] === 0x89 && buffer[1] === 0x50 && buffer[2] === 0x4E && buffer[3] === 0x47],
    ['image/gif', (buffer) => 
      (buffer[0] === 0x47 && buffer[1] === 0x49 && buffer[2] === 0x46 && buffer[3] === 0x38)],
    ['application/pdf', (buffer) => 
      buffer[0] === 0x25 && buffer[1] === 0x50 && buffer[2] === 0x44 && buffer[3] === 0x46],
  ]);

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

  private async validateFile(file: Express.Multer.File, userId: string): Promise<void> {
    const ext = path.extname(file.originalname).toLowerCase();

    if (!this.allowedExtensions.has(ext)) {
      throw new BadRequestException(`不支持的文件类型: ${ext}`);
    }

    if (!this.allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException('不支持的文件 MIME 类型');
    }

    const maxSize = this.configService.get<number>('MAX_FILE_SIZE', 10485760);
    if (file.size > maxSize) {
      throw new BadRequestException(`文件大小超过限制（${Math.floor(maxSize / 1048576)}MB）`);
    }

    if (file.size === 0) {
      throw new BadRequestException('文件大小为0，请上传有效文件');
    }

    const filename = file.originalname.toLowerCase();
    if (/[<>"|?*\\]/.test(filename)) {
      throw new BadRequestException('文件名包含非法字符');
    }

    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      throw new BadRequestException('文件名包含路径遍历字符');
    }

    const signatureChecker = this.fileSignatureChecks.get(file.mimetype);
    if (signatureChecker && file.buffer && !signatureChecker(file.buffer)) {
      throw new BadRequestException('文件内容与声明类型不符，可能存在安全风险');
    }

    const maxFilesPerUser = this.configService.get<number>('MAX_FILES_PER_USER', 1000);
    const currentFileCount = await this.prisma.attachment.count({ where: { userId } });
    if (currentFileCount >= maxFilesPerUser) {
      throw new BadRequestException(`已达到文件数量上限（${maxFilesPerUser}个）`);
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

    if (!file.buffer) {
      throw new BadRequestException('文件内容缺失');
    }

    await this.validateFile(file, userId);

    const ext = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${ext}`;
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const userDir = path.join(uploadDir, userId);
    const filePath = path.join(userDir, uniqueFilename);

    await this.ensureUploadDir(userDir);

    try {
      await fs.writeFile(filePath, file.buffer);

      const attachment = await this.prisma.attachment.create({
        data: {
          userId,
          noteId,
          filename: file.originalname,
          filePath: path.join(userId, uniqueFilename),
          fileSize: file.size,
          mimeType: file.mimetype,
        },
      });
      return attachment;
    } catch (error) {
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
      for (const filePath of uploadedPaths) {
        await fs.unlink(path.join(uploadDir, filePath)).catch(() => {});
      }
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

    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

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
