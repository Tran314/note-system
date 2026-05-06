import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TrashService {
  constructor(private prisma: PrismaService) {}

  async getTrashNotes(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        isDeleted: true,
      },
    });
  }

  async restoreNote(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId, isDeleted: true },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在或不属于当前用户');
    }

    return this.prisma.note.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async permanentDelete(userId: string, id: string) {
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在或不属于当前用户');
    }

    return this.prisma.note.delete({
      where: { id },
    });
  }
}
