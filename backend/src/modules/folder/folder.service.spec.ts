import { Test, TestingModule } from '@nestjs/testing';
import { FolderService } from './folder.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';

describe('FolderService', () => {
  let service: FolderService;
  let prisma: PrismaService;

  const mockFolder = {
    id: 'folder-id',
    userId: 'user-id',
    name: 'Test Folder',
    parentId: null,
    sortOrder: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
    children: [],
  };

  const mockPrisma = {
    folder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
      count: jest.fn(),
    },
    note: {
      updateMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        FolderService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<FolderService>(FolderService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a root folder', async () => {
      mockPrisma.folder.create.mockResolvedValue(mockFolder as any);

      const result = await service.create('user-id', { name: 'New Folder' });

      expect(result.name).toBe(mockFolder.name);
      expect(mockPrisma.folder.create).toHaveBeenCalled();
    });

    it('should create a nested folder', async () => {
      const nestedFolder = { ...mockFolder, parentId: 'parent-id' };
      mockPrisma.folder.findFirst.mockResolvedValue(mockFolder as any);
      mockPrisma.folder.create.mockResolvedValue(nestedFolder as any);

      const result = await service.create('user-id', {
        name: 'Nested Folder',
        parentId: 'parent-id',
      });

      expect(result.parentId).toBe('parent-id');
    });

    it('should throw NotFoundException if parent not found', async () => {
      mockPrisma.folder.findFirst.mockResolvedValue(null);

      await expect(
        service.create('user-id', { name: 'Folder', parentId: 'invalid-id' })
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return folder tree', async () => {
      mockPrisma.folder.findMany.mockResolvedValue([mockFolder] as any);

      const result = await service.findAll('user-id');

      expect(result).toBeDefined();
      expect(mockPrisma.folder.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-id', parentId: null },
        })
      );
    });
  });

  describe('findOne', () => {
    it('should return a folder', async () => {
      mockPrisma.folder.findFirst.mockResolvedValue(mockFolder as any);

      const result = await service.findOne('user-id', 'folder-id');

      expect(result.id).toBe(mockFolder.id);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.folder.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-id', 'invalid-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update folder name', async () => {
      mockPrisma.folder.findFirst.mockResolvedValue(mockFolder as any);
      mockPrisma.folder.update.mockResolvedValue({
        ...mockFolder,
        name: 'Updated',
      } as any);

      const result = await service.update('user-id', 'folder-id', {
        name: 'Updated',
      });

      expect(result.name).toBe('Updated');
    });

    it('should update folder order', async () => {
      mockPrisma.folder.findFirst.mockResolvedValue(mockFolder as any);
      mockPrisma.folder.update.mockResolvedValue({
        ...mockFolder,
        sortOrder: 1,
      } as any);

      const result = await service.update('user-id', 'folder-id', {
        sortOrder: 1,
      });

      expect(result.sortOrder).toBe(1);
    });
  });

  describe('remove', () => {
    it('should delete folder and move notes to parent', async () => {
      mockPrisma.folder.findFirst.mockResolvedValue(mockFolder as any);
      mockPrisma.folder.findMany.mockResolvedValue([] as any);
      mockPrisma.note.updateMany.mockResolvedValue({ count: 0 });
      mockPrisma.folder.delete.mockResolvedValue(mockFolder as any);

      await service.remove('user-id', 'folder-id');

      expect(mockPrisma.folder.delete).toHaveBeenCalled();
    });
  });
});