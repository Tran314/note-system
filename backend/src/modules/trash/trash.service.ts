import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
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
      orderBy: { deletedAt: 'desc' },
    });
  }

  async restoreNote(userId: string, id: string) {
    // 先验证笔记归属权
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在或无权访问');
    }

    if (!note.isDeleted) {
      throw new ForbiddenException('笔记不在回收站中');
    }

    return this.prisma.note.update({
      where: { id },
      data: { isDeleted: false, deletedAt: null },
    });
  }

  async permanentDelete(userId: string, id: string) {
    // 先验证笔记归属权
    const note = await this.prisma.note.findFirst({
      where: { id, userId },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在或无权访问');
    }

    // 删除关联的版本记录
    await this.prisma.noteVersion.deleteMany({
      where: { noteId: id },
    });

    // 删除关联的标签关系
    await this.prisma.noteTag.deleteMany({
      where: { noteId: id },
    });

    return this.prisma.note.delete({
      where: { id },
    });
  }
}