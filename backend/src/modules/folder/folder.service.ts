import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { CreateFolderDto } from './dto/create-folder.dto';
import { UpdateFolderDto } from './dto/update-folder.dto';

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

    // 构建树形结构
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
      throw new Error('文件夹不存在');
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
    // 检查文件夹是否存在
    const folder = await this.prisma.folder.findFirst({
      where: { id: folderId, userId },
    });

    if (!folder) {
      throw new Error('文件夹不存在');
    }

    // 递归删除子文件夹
    const children = await this.prisma.folder.findMany({
      where: { parentId: folderId },
    });

    for (const child of children) {
      await this.remove(userId, child.id);
    }

    // 软删除文件夹内的笔记
    await this.prisma.note.updateMany({
      where: { folderId, userId },
      data: { isDeleted: true, deletedAt: new Date() },
    });

    // 删除文件夹
    await this.prisma.folder.delete({
      where: { id: folderId },
    });

    return { message: '文件夹已删除' };
  }

  // 构建树形结构
  private buildFolderTree(folders: any[]) {
    const folderMap = new Map();
    const rootFolders: any[] = [];

    // 创建映射
    folders.forEach((folder) => {
      folderMap.set(folder.id, { ...folder, children: [] });
    });

    // 构建树形结构
    folders.forEach((folder) => {
      const node = folderMap.get(folder.id);
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