import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, createNoteDto: CreateNoteDto) {
    const { title, content, folderId, tags } = createNoteDto;

    await this.validateFolderAccess(userId, folderId);
    await this.validateTagAccess(userId, tags);

    const note = await this.prisma.note.create({
      data: {
        userId,
        folderId,
        title,
        content,
        tags: tags
          ? {
              create: tags.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        folder: true,
        tags: { include: { tag: true } },
      },
    });

    await this.prisma.noteVersion.create({
      data: {
        noteId: note.id,
        version: 1,
        title,
        content,
      },
    });

    return note;
  }

  async findAll(userId: string, query: QueryNotesDto) {
    const { folderId, tagId, keyword, isPinned, page = 1, limit = 20 } = query;

    const where: any = {
      userId,
      isDeleted: false,
    };

    if (folderId) {
      where.folderId = folderId;
    }

    if (isPinned !== undefined) {
      where.isPinned = isPinned;
    }

    if (tagId) {
      where.tags = { some: { tagId } };
    }

    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
      ];
    }

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where,
        include: {
          folder: true,
          tags: { include: { tag: true } },
        },
        orderBy: [{ isPinned: 'desc' }, { updatedAt: 'desc' }],
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.note.count({ where }),
    ]);

    return {
      notes,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
      include: {
        folder: true,
        tags: { include: { tag: true } },
        versions: {
          orderBy: { version: 'desc' },
          take: 10,
        },
        attachments: true,
      },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    return note;
  }

  async update(userId: string, noteId: string, updateNoteDto: UpdateNoteDto) {
    const { title, content, folderId, isPinned, tags } = updateNoteDto;

    const currentNote = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!currentNote) {
      throw new NotFoundException('Note not found');
    }

    await this.validateFolderAccess(userId, folderId);
    await this.validateTagAccess(userId, tags);

    const note = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        title,
        content,
        folderId,
        isPinned,
        version: currentNote.version + 1,
        tags: tags
          ? {
              deleteMany: {},
              create: tags.map((tagId) => ({
                tag: { connect: { id: tagId } },
              })),
            }
          : undefined,
      },
      include: {
        folder: true,
        tags: { include: { tag: true } },
      },
    });

    await this.prisma.noteVersion.create({
      data: {
        noteId: note.id,
        version: note.version,
        title: title || currentNote.title,
        content: content || currentNote.content,
      },
    });

    return note;
  }

  async remove(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new NotFoundException('Note not found');
    }

    await this.prisma.note.update({
      where: { id: noteId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: 'Note deleted' };
  }

  async restore(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: true },
    });

    if (!note) {
      throw new Error('Note not found or not deleted');
    }

    const restoredNote = await this.prisma.note.update({
      where: { id: noteId },
      data: {
        isDeleted: false,
        deletedAt: null,
      },
    });

    return restoredNote;
  }

  async getVersions(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      throw new NotFoundException('Note not found or access denied');
    }

    const versions = await this.prisma.noteVersion.findMany({
      where: { noteId },
      orderBy: { version: 'desc' },
      take: 20,
    });

    return versions;
  }

  async getTrash(userId: string) {
    const notes = await this.prisma.note.findMany({
      where: { userId, isDeleted: true },
      orderBy: { deletedAt: 'desc' },
    });

    return notes;
  }

  private async validateFolderAccess(userId: string, folderId?: string) {
    if (!folderId) {
      return;
    }

    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
      select: { id: true },
    });

    if (!folder) {
      throw new ForbiddenException('Folder not found or access denied');
    }
  }

  private async validateTagAccess(userId: string, tagIds?: string[]) {
    if (!tagIds?.length) {
      return;
    }

    const tags = await this.prisma.tag.findMany({
      where: {
        id: { in: tagIds },
        userId,
      },
      select: { id: true },
    });

    if (tags.length !== new Set(tagIds).size) {
      throw new ForbiddenException('One or more tags are invalid for this user');
    }
  }
}
