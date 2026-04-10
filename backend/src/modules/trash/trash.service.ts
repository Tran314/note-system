import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TrashService {
  constructor(private prisma: PrismaService) {}

  async getTrashNotes(userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        deletedAt: { not: null },
      },
    });
  }

  async restoreNote(id: string) {
    return this.prisma.note.update({
      where: { id },
      data: { deletedAt: null },
    });
  }

  async permanentDelete(id: string) {
    return this.prisma.note.delete({
      where: { id },
    });
  }
}