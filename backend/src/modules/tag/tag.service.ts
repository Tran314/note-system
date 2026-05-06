import { Injectable, ConflictException, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateTagDto } from './dto/create-tag.dto';
import { UpdateTagDto } from './dto/update-tag.dto';

@Injectable()
export class TagService {
  constructor(private prisma: PrismaService) {}

  // 创建标签
  async create(userId: string, createTagDto: CreateTagDto) {
    const { name, color } = createTagDto;

    // 检查标签名是否已存在
    const existingTag = await this.prisma.tag.findFirst({
      where: { userId, name },
    });

    if (existingTag) {
      throw new ConflictException('标签名已存在');
    }

    const tag = await this.prisma.tag.create({
      data: {
        userId,
        name,
        color: color || '#6B7280',
      },
    });

    return tag;
  }

  // 获取所有标签
  async findAll(userId: string) {
    const tags = await this.prisma.tag.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      include: {
        _count: { select: { notes: true } },
      },
    });

    return tags.map((tag) => ({
      ...tag,
      noteCount: tag._count.notes,
    }));
  }

  // 获取单个标签
  async findOne(userId: string, tagId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, userId },
      include: {
        notes: {
          where: { note: { isDeleted: false } },
          include: { note: true },
        },
      },
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    return tag;
  }

  // 更新标签
  async update(userId: string, tagId: string, updateTagDto: UpdateTagDto) {
    const { name, color } = updateTagDto;

    // 检查标签名是否重复（排除自身）
    if (name) {
      const existingTag = await this.prisma.tag.findFirst({
        where: { userId, name, id: { not: tagId } },
      });

      if (existingTag) {
        throw new ConflictException('标签名已存在');
      }
    }

    const tag = await this.prisma.tag.update({
      where: { id: tagId, userId },
      data: { name, color },
    });

    return tag;
  }

  // 删除标签
  async remove(userId: string, tagId: string) {
    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, userId },
    });

    if (!tag) {
      throw new NotFoundException('标签不存在');
    }

    // 删除关联关系
    await this.prisma.noteTag.deleteMany({
      where: { tagId },
    });

    // 删除标签
    await this.prisma.tag.delete({
      where: { id: tagId },
    });

    return { message: '标签已删除' };
  }

  // 为笔记添加标签
  async addToNote(userId: string, noteId: string, tagId: string) {
    // 检查笔记和标签是否存在且属于当前用户
    const note = await this.prisma.note.findFirst({
      where: { id: noteId, userId, isDeleted: false },
    });

    const tag = await this.prisma.tag.findFirst({
      where: { id: tagId, userId },
    });

    if (!note || !tag) {
      throw new NotFoundException('笔记或标签不存在');
    }

    // 检查是否已关联
    const existingRelation = await this.prisma.noteTag.findUnique({
      where: { noteId_tagId: { noteId, tagId } },
    });

    if (existingRelation) {
      throw new ConflictException('笔记已有此标签');
    }

    // 创建关联
    await this.prisma.noteTag.create({
      data: { noteId, tagId },
    });

    return { message: '标签添加成功' };
  }

  // 从笔记移除标签
  async removeFromNote(userId: string, noteId: string, tagId: string) {
    await this.prisma.noteTag.delete({
      where: { noteId_tagId: { noteId, tagId } },
    });

    return { message: '标签移除成功' };
  }
}