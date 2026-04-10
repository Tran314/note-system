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

const ALLOWED_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
  'application/pdf',
  'text/plain',
  'text/markdown',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const ALLOWED_EXTENSIONS = [
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.svg',
  '.pdf',
  '.txt',
  '.md',
  '.doc',
  '.docx',
];

@Injectable()
export class AttachmentService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async upload(userId: string, file: Express.Multer.File, noteId?: string) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    await this.ensureNoteAccess(userId, noteId);

    const maxSize = this.configService.get<number>('MAX_FILE_SIZE', 10485760);
    if (file.size > maxSize) {
      throw new BadRequestException('File exceeds max size');
    }

    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(`Unsupported mime type: ${file.mimetype}`);
    }

    const originalExt = path.extname(file.originalname).toLowerCase();
    const safeExt = originalExt.replace(/[^a-z0-9.]/g, '');

    if (!ALLOWED_EXTENSIONS.includes(safeExt)) {
      throw new BadRequestException(`Unsupported extension: ${originalExt}`);
    }

    const mimeToExt: Record<string, string[]> = {
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
      'image/gif': ['.gif'],
      'image/webp': ['.webp'],
      'image/svg+xml': ['.svg'],
      'application/pdf': ['.pdf'],
      'text/plain': ['.txt'],
      'text/markdown': ['.md'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': [
        '.docx',
      ],
    };

    const expectedExtensions = mimeToExt[file.mimetype] || [];
    if (expectedExtensions.length > 0 && !expectedExtensions.includes(safeExt)) {
      throw new BadRequestException('File extension does not match mime type');
    }

    const uniqueFilename = `${uuidv4()}${safeExt}`;
    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, uniqueFilename);

    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    fs.writeFileSync(filePath, file.buffer);

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

  async findOne(userId: string, attachmentId: string) {
    const attachment = await this.prisma.attachment.findFirst({
      where: { id: attachmentId, userId },
    });

    if (!attachment) {
      throw new NotFoundException('Attachment not found');
    }

    return attachment;
  }

  async getFile(userId: string, attachmentId: string) {
    const attachment = await this.findOne(userId, attachmentId);

    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, attachment.filePath);

    if (!fs.existsSync(filePath)) {
      throw new NotFoundException('Attachment file not found');
    }

    const fileBuffer = fs.readFileSync(filePath);

    return {
      buffer: fileBuffer,
      filename: attachment.filename,
      mimeType: attachment.mimeType,
    };
  }

  async remove(userId: string, attachmentId: string) {
    const attachment = await this.findOne(userId, attachmentId);

    const uploadDir = this.configService.get<string>('UPLOAD_DIR', './uploads');
    const filePath = path.join(uploadDir, attachment.filePath);

    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }

    await this.prisma.attachment.delete({
      where: { id: attachmentId },
    });

    return { message: 'Attachment deleted' };
  }

  async attachToNote(userId: string, attachmentId: string, noteId: string) {
    await this.ensureNoteAccess(userId, noteId);

    await this.prisma.attachment.update({
      where: { id: attachmentId, userId },
      data: { noteId },
    });

    return { message: 'Attachment linked successfully' };
  }

  private async ensureNoteAccess(userId: string, noteId?: string) {
    if (!noteId) {
      return;
    }

    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
      select: { id: true },
    });

    if (!note) {
      throw new NotFoundException('Note not found or access denied');
    }
  }
}
