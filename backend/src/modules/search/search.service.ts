import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class SearchService {
  constructor(private prisma: PrismaService) {}

  async searchNotes(keyword: string, userId: string) {
    return this.prisma.note.findMany({
      where: {
        userId,
        OR: [
          { title: { contains: keyword } },
          { content: { contains: keyword } },
        ],
      },
    });
  }

  async searchFolders(keyword: string, userId: string) {
    return this.prisma.folder.findMany({
      where: {
        userId,
        name: { contains: keyword },
      },
    });
  }

  async searchTags(keyword: string, userId: string) {
    return this.prisma.tag.findMany({
      where: {
        userId,
        name: { contains: keyword },
      },
    });
  }

  async globalSearch(keyword: string, userId: string) {
    const notes = await this.searchNotes(keyword, userId);
    const folders = await this.searchFolders(keyword, userId);
    const tags = await this.searchTags(keyword, userId);

    return { notes, folders, tags };
  }
}