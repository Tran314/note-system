import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '../../database/prisma.service';

describe('TagService', () => {
  let service: TagService;
  let prisma: PrismaService;

  const mockPrisma = {
    tag: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    noteTag: {
      deleteMany: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
      findUnique: jest.fn(),
    },
    note: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TagService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TagService>(TagService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return user tags', async () => {
      const mockTags = [
        {
          id: '1',
          userId: 'user-id',
          name: 'Test Tag',
          color: '#FF0000',
          _count: { notes: 5 },
        },
      ];

      mockPrisma.tag.findMany.mockResolvedValue(mockTags);

      const result = await service.findAll('user-id');
      expect(result).toHaveLength(1);
      expect(result[0].noteCount).toBe(5);
    });
  });

  describe('create', () => {
    it('should create tag', async () => {
      const mockTag = {
        id: '1',
        userId: 'user-id',
        name: 'Test Tag',
        color: '#FF0000',
      };

      mockPrisma.tag.findFirst.mockResolvedValue(null);
      mockPrisma.tag.create.mockResolvedValue(mockTag);

      const result = await service.create('user-id', { name: 'Test Tag', color: '#FF0000' });
      expect(result).toEqual(mockTag);
    });

    it('should throw if tag name exists', async () => {
      mockPrisma.tag.findFirst.mockResolvedValue({ id: '1', name: 'Test Tag' });

      await expect(
        service.create('user-id', { name: 'Test Tag' }),
      ).rejects.toThrow('标签名已存在');
    });
  });

  describe('update', () => {
    it('should update tag', async () => {
      const mockTag = {
        id: '1',
        userId: 'user-id',
        name: 'Updated Tag',
        color: '#00FF00',
      };

      mockPrisma.tag.findFirst.mockResolvedValue(null);
      mockPrisma.tag.update.mockResolvedValue(mockTag);

      const result = await service.update('user-id', '1', { name: 'Updated Tag' });
      expect(result).toEqual(mockTag);
    });
  });

  describe('remove', () => {
    it('should delete tag', async () => {
      mockPrisma.tag.findFirst.mockResolvedValue({ id: '1' });
      mockPrisma.noteTag.deleteMany.mockResolvedValue({ count: 0 });
      mockPrisma.tag.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('user-id', '1');
      expect(result).toEqual({ message: '标签已删除' });
    });
  });
});
