import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VersionService {
  constructor(private prisma: PrismaService) {}

  async getVersions(userId: string, noteId: string) {
    // 先验证笔记归属权
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在或无权访问');
    }

    return this.prisma.noteVersion.findMany({
      where: { noteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVersion(userId: string, id: string) {
    const version = await this.prisma.noteVersion.findUnique({
      where: { id },
      include: { note: true },
    });

    if (!version) {
      throw new NotFoundException('版本不存在');
    }

    // 验证用户是否拥有该笔记
    if (version.note.userId !== userId) {
      throw new NotFoundException('无权访问此版本');
    }

    return version;
  }

  async createVersion(noteId: string, data: { version: number; title: string; content: string }) {
    return this.prisma.noteVersion.create({
      data: {
        noteId,
        version: data.version,
        title: data.title,
        content: data.content,
      },
    });
  }
}
