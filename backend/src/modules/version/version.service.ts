import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class VersionService {
  constructor(private prisma: PrismaService) {}

  async getVersions(noteId: string) {
    return this.prisma.noteVersion.findMany({
      where: { noteId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async getVersion(id: string) {
    return this.prisma.noteVersion.findUnique({
      where: { id },
    });
  }

  async createVersion(noteId: string, data: { content: string }) {
    return this.prisma.noteVersion.create({
      data: {
        noteId,
        content: data.content,
      },
    });
  }
}