import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchNotes(keyword: string, userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        isDeleted: false,
        OR: [
          { title: { contains: keyword, mode: 'insensitive' } },
          { content: { contains: keyword, mode: 'insensitive' } },
        ],
      },
    });
  }

  async searchFolders(keyword: string, userId: string) {
    return this.prisma.folder.findMany({
      where: {
        userId,
        name: { contains: keyword, mode: 'insensitive' },
      },
    });
  }

  async searchTags(keyword: string, userId: string) {
    return this.prisma.tag.findMany({
      where: {
        userId,
        name: { contains: keyword, mode: 'insensitive' },
      },
    });
  }

  async globalSearch(keyword: string, userId: string) {
    const [notes, folders, tags] = await Promise.all([
      this.searchNotes(keyword, userId),
      this.searchFolders(keyword, userId),
      this.searchTags(keyword, userId),
    ]);

    return { notes, folders, tags };
  }
}
