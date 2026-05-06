import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  // 上传文件
  async upload(
    userId: string,
    file: Express.Multer.File,
    noteId?: string,
  ) {
    // 验证文件
    if (!file) {
      throw new BadRequestException('文件不存在');
    }

    const maxSize = this.configService.get<number>('MAX_FILE_SIZE', 10485760);
    if (file.size > maxSize) {
      throw new BadRequestException('文件大小超过限制（10MB）');
    }

    // 验证文件类型
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

    // 生成唯一文件名
    const ext = path.extname(file.originalname);
    const uniqueFilename = `${uuidv4()}${ext}`;

    // 存储路径
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, uniqueFilename);

    // 确保上传目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    // 写入文件
    fs.writeFileSync(filePath, file.buffer);

    // 保存文件信息到数据库
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
  }

  // 批量上传文件
  async uploadMultiple(
    userId: string,
    files: Express.Multer.File[],
    noteId?: string,
  ) {
    const attachments = await Promise.all(
      files.map((file) => this.upload(userId, file, noteId)),
    );

    return attachments;
  }

  // 获取文件列表
  async findAll(userId: string, noteId?: string) {
    const where: any = { userId };

    if (noteId) {
      where.noteId = noteId;
    }

    const attachments = await this.prisma.attachment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    return attachments;
  }

  // 获取单个文件信息
  async findOne(userId: string, attachmentId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, userId },
    });

    if (!attachment) {
      throw new NotFoundException('文件不存在');
    }

    return attachment;
  }

  // 获取文件内容（用于下载）
  async getFile(userId: string, attachmentId: string) {
    const attachment = await this.findOne(userId, attachmentId);

    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, attachment.filePath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('文件不存在或已被删除');
    }

    const fileBuffer = fs.readFileSync(filePath);

    return {
      buffer: fileBuffer,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
    };
  }

  // 删除文件
  async remove(userId: string, attachmentId: string) {
    const attachment = await this.findOne(userId, attachmentId);

    // 删除物理文件
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, attachment.filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    // 删除数据库记录
    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return { message: '文件已删除' };
  }

  // 关联文件到笔记
  async attachToNote(userId: string, attachmentId: string, noteId: string) {
    // 检查笔记是否存在
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    // 更新文件关联
    await this.prisma.attachment.update({
      where: { id: attachmentId, userId },
      data: { noteId },
    });

    return { message: '文件关联成功' };
  }
}