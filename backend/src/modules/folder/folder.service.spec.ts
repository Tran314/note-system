import { Test, TestingModule } from '@nestjs/testing';
import { FolderService } from './folder.service';
import { PrismaService } from '../../database/prisma.service';

describe('FolderService', () => {
  let service: FolderService;
  let prisma: PrismaService;

  const mockFolder = {
    id: 'folder-id',
    userId: 'user-id',
    name: 'Test Folder',
    parentId: null,
    createdAt: new Date(),
  };

  const mockPrisma = {
    folder: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
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

  describe('findByUser', () => {
    it('should return user folders', async () => {
      mockPrisma.folder.findMany.mockResolvedValue([mockFolder] as any);

      const result = await service.findAll('user-id');

      expect(result.length).toBe(1);
    });
  });

  describe('create', () => {
    it('should create folder', async () => {
      mockPrisma.folder.create.mockResolvedValue(mockFolder as any);

      const result = await service.create('user-id', { name: 'New Folder' });

      expect(result.name).toBe('Test Folder');
    });
  });

  describe('update', () => {
    it('should update folder', async () => {
      mockPrisma.folder.update.mockResolvedValue({
        ...mockFolder,
        name: 'Updated Folder',
      } as any);

      const result = await service.update('user-id', 'folder-id', { name: 'Updated Folder' });

      expect(result.name).toBe('Updated Folder');
    });
  });

  describe('delete', () => {
    it('should delete folder', async () => {
      mockPrisma.folder.findUnique.mockResolvedValue(mockFolder as any);
      mockPrisma.folder.delete.mockResolvedValue(mockFolder as any);

      await service.remove('user-id', 'folder-id');

      expect(mockPrisma.folder.delete).toHaveBeenCalled();
    });
  });
});