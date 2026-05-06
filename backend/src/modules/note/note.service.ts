import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';
import { UpdateNoteDto } from './dto/update-note.dto';
import { QueryNotesDto } from './dto/query-notes.dto';

@Injectable()
export class NoteService {
  constructor(private prisma: PrismaService) {}

  // 创建笔记
  async create(userId: string, createNoteDto: CreateNoteDto) {
    const { title, content, folderId, tags } = createNoteDto;

    // 创建笔记
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

    // 创建初始版本
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

  // 获取笔记列表
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

  // 获取笔记详情
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
      throw new NotFoundException('笔记不存在');
    }

    return note;
  }

  // 更新笔记
  async update(userId: string, noteId: string, updateNoteDto: UpdateNoteDto) {
    const { title, content, folderId, isPinned, tags } = updateNoteDto;

    // 获取当前笔记
    const currentNote = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!currentNote) {
      throw new NotFoundException('笔记不存在');
    }

    // 更新笔记
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

    // 创建新版本
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

  // 软删除笔记
  async remove(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    await this.prisma.note.update({
      where: { id: noteId },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return { message: '笔记已删除' };
  }

  // 恢复已删除笔记
  async restore(userId: string, noteId: string) {
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: true },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在或未删除');
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

  // 获取历史版本
  async getVersions(userId: string, noteId: string) {
    // 验证笔记属于当前用户
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId },
    });

    if (!note) {
      throw new NotFoundException('笔记不存在');
    }

    const versions = await this.prisma.noteVersion.findMany({
      where: { noteId },
      orderBy: { version: 'desc' },
      take: 20,
    });

    return versions;
  }

  // 获取回收站笔记列表（带分页）
  async getTrash(userId: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const [notes, total] = await Promise.all([
      this.prisma.note.findMany({
        where: { userId, isDeleted: true },
        orderBy: { deletedAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.note.count({ where: { userId, isDeleted: true } }),
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
}