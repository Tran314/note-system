import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

interface FolderTreeNode {
  id: string;
  userId: string;
  name: string;
  parentId: string | null;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
  children: FolderTreeNode[];
}

@Injectable()
export class FolderService {
  constructor(private prisma: PrismaService) {}

  // 创建文件夹
  async create(userId: string, createFolderDto: CreateFolderDto) {
    const { name, parentId, sortOrder } = createFolderDto;

    const folder = await this.prisma.folder.create({
      data: {
        userId,
        name,
        parentId,
        sortOrder: sortOrder || 0,
      },
      include: { parent: true },
    });

    return folder;
  }

  // 获取文件夹列表（树形结构）
  async findAll(userId: string) {
    const folders = await this.prisma.folder.findMany({
      where: { userId },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'asc' }],
    });

    return this.buildFolderTree(folders);
  }

  // 获取单个文件夹
  async findOne(userId: string, folderId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
      include: {
        parent: true,
        children: { orderBy: { sortOrder: 'asc' } },
        notes: { where: { isDeleted: false } },
      },
    });

    if (!folder) {
      throw new NotFoundException('文件夹不存在');
    }

    return folder;
  }

  // 更新文件夹
  async update(userId: string, folderId: string, updateFolderDto: UpdateFolderDto) {
    const { name, parentId, sortOrder } = updateFolderDto;

    const folder = await this.prisma.folder.update({
      where: { id: folderId, userId },
      data: { name, parentId, sortOrder },
      include: { parent: true, children: true },
    });

    return folder;
  }

  // 删除文件夹（连带删除子文件夹和笔记）
  async remove(userId: string, folderId: string) {
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new NotFoundException('文件夹不存在');
    }

    await this.removeChildFolders(userId, folderId, 1);

    await this.prisma.note.updateMany({
      where: { folderId, userId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await this.prisma.folder.delete({
      where: { id: folderId },
    });

    return { message: '文件夹已删除' };
  }

  // 递归删除子文件夹（带深度限制）
  private async removeChildFolders(userId: string, folderId: string, depth: number) {
    if (depth > 10) {
      return;
    }

    const children = await this.prisma.folder.findMany({
      where: { parentId: folderId, userId },
    });

    for (const child of children) {
      await this.removeChildFolders(userId, child.id, depth + 1);
    }

    await this.prisma.note.updateMany({
      where: { folderId, userId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    await this.prisma.folder.delete({
      where: { id: folderId },
    });
  }

  // 构建树形结构
  private buildFolderTree(folders: {
    id: string;
    userId: string;
    name: string;
    parentId: string | null;
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
  }[]): FolderTreeNode[] {
    const folderMap = new Map<string, FolderTreeNode>();
    const rootFolders: FolderTreeNode[] = [];

    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    folders.forEach((folder) => {
      const node = folderMap.get(folder.id)!;
      if (folder.parentId) {
        const parent = folderMap.get(folder.parentId);
        if (parent) {
          parent.children.push(node);
        }
      } else {
        rootFolders.push(node);
      }
    });

    return rootFolders;
  }
}
