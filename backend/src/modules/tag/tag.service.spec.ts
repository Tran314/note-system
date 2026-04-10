import { Test, TestingModule } from '@nestjs/testing';
import { TagService } from './tag.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TagService', () => {
  let service: TagService;
  let prisma: PrismaService;

  const mockTag = {
    id: 'tag-id',
    userId: 'user-id',
    name: 'Important',
    color: '#EF4444',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    tag: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    noteTag: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
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

  describe('create', () => {
    it('should create a tag', async () => {
      mockPrisma.tag.create.mockResolvedValue(mockTag as any);

      const result = await service.create('user-id', {
        name: 'New Tag',
        color: '#3B82F6',
      });

      expect(result.name).toBe(mockTag.name);
      expect(mockPrisma.tag.create).toHaveBeenCalled();
    });

    it('should use default color if not provided', async () => {
      mockPrisma.tag.create.mockResolvedValue({
        ...mockTag,
        color: '#6B7280',
      } as any);

      const result = await service.create('user-id', { name: 'Tag' });

      expect(result.color).toBe('#6B7280');
    });
  });

  describe('findAll', () => {
    it('should return all tags', async () => {
      mockPrisma.tag.findMany.mockResolvedValue([mockTag] as any);

      const result = await service.findAll('user-id');

      expect(result).toHaveLength(1);
      expect(result[0].name).toBe(mockTag.name);
    });
  });

  describe('findOne', () => {
    it('should return a tag', async () => {
      mockPrisma.tag.findFirst.mockResolvedValue(mockTag as any);

      const result = await service.findOne('user-id', 'tag-id');

      expect(result.id).toBe(mockTag.id);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.tag.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-id', 'invalid-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update tag', async () => {
      mockPrisma.tag.findFirst.mockResolvedValue(mockTag as any);
      mockPrisma.tag.update.mockResolvedValue({
        ...mockTag,
        name: 'Updated',
      } as any);

      const result = await service.update('user-id', 'tag-id', {
        name: 'Updated',
      });

      expect(result.name).toBe('Updated');
    });
  });

  describe('remove', () => {
    it('should delete tag', async () => {
      mockPrisma.tag.findFirst.mockResolvedValue(mockTag as any);
      mockPrisma.tag.delete.mockResolvedValue(mockTag as any);

      await service.remove('user-id', 'tag-id');

      expect(mockPrisma.tag.delete).toHaveBeenCalled();
    });
  });

  describe('addTagToNote', () => {
    it('should add tag to note', async () => {
      mockPrisma.noteTag.create.mockResolvedValue({} as any);

      await service.addTagToNote('user-id', 'note-id', 'tag-id');

      expect(mockPrisma.noteTag.create).toHaveBeenCalled();
    });
  });

  describe('removeTagFromNote', () => {
    it('should remove tag from note', async () => {
      mockPrisma.noteTag.delete.mockResolvedValue({} as any);

      await service.removeTagFromNote('user-id', 'note-id', 'tag-id');

      expect(mockPrisma.noteTag.delete).toHaveBeenCalled();
    });
  });
});