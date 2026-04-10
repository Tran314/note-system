import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '../../database/prisma.service';

describe('TagService', () => {
  let service: TagService;
  let prisma: PrismaService;

  const mockTag = {
    id: 'tag-id',
    userId: 'user-id',
    name: 'Important',
    color: '#FF0000',
    createdAt: new Date(),
  };

  const mockPrisma = {
    tag: {
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

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByUser', () => {
    it('should return user tags', async () => {
      mockPrisma.tag.findMany.mockResolvedValue([mockTag] as any);

      const result = await service.findAll('user-id');

      expect(result.length).toBe(1);
    });
  });

  describe('create', () => {
    it('should create tag', async () => {
      mockPrisma.tag.create.mockResolvedValue(mockTag as any);

      const result = await service.create('user-id', { name: 'Important', color: '#FF0000' });

      expect(result.name).toBe('Important');
    });
  });

  describe('update', () => {
    it('should update tag', async () => {
      mockPrisma.tag.update.mockResolvedValue({
        ...mockTag,
        name: 'Updated Tag',
      } as any);

      const result = await service.update('user-id', 'tag-id', { name: 'Updated Tag' });

      expect(result.name).toBe('Updated Tag');
    });
  });

  describe('delete', () => {
    it('should delete tag', async () => {
      mockPrisma.tag.findUnique.mockResolvedValue(mockTag as any);
      mockPrisma.tag.delete.mockResolvedValue(mockTag as any);

      await service.remove('user-id', 'tag-id');

      expect(mockPrisma.tag.delete).toHaveBeenCalled();
    });
  });
});