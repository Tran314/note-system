import { Test, TestingModule } from '@nestjs/testing';
import { FolderService } from './folder.service';
import { PrismaService } from '../../database/prisma.service';

describe('FolderService', () => {
  let service: FolderService;
  let prisma: PrismaService;

  const mockPrisma = {
    folder: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return user folders', async () => {
      const mockFolders = [
        {
          id: '1',
          userId: 'user-id',
          name: 'Test Folder',
          parentId: null,
        },
      ];

      mockPrisma.folder.findMany.mockResolvedValue(mockFolders);

      const result = await service.findAll('user-id');
      expect(result).toHaveLength(1);
    });
  });

  describe('create', () => {
    it('should create folder', async () => {
      const mockFolder = {
        id: '1',
        userId: 'user-id',
        name: 'Test Folder',
        parentId: null,
      };

      mockPrisma.folder.findFirst.mockResolvedValue(null);
      mockPrisma.folder.create.mockResolvedValue(mockFolder);

      const result = await service.create('user-id', { name: 'Test Folder' });
      expect(result).toEqual(mockFolder);
    });
  });

  describe('delete', () => {
    it('should delete folder', async () => {
      mockPrisma.folder.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.folder.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('user-id', '1');
      expect(result).toEqual({ message: '文件夹已删除' });
    });
  });
});
