import { Test, TestingModule } from '@nestjs/testing';
import { VersionService } from './version.service';
import { PrismaService } from '../../database/prisma.service';

describe('VersionService', () => {
  let service: VersionService;
  let prisma: PrismaService;

  const mockPrisma = {
    noteVersion: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VersionService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<VersionService>(VersionService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getVersions', () => {
    it('should return note versions', async () => {
      mockPrisma.noteVersion.findMany.mockResolvedValue([
        { id: '1', noteId: 'note-1', content: 'v1' },
        { id: '2', noteId: 'note-1', content: 'v2' },
      ] as any);

      const result = await service.getVersions('note-1');

      expect(result.length).toBe(2);
    });

    it('should return empty array if no versions', async () => {
      mockPrisma.noteVersion.findMany.mockResolvedValue([]);

      const result = await service.getVersions('note-with-no-versions');

      expect(result).toEqual([]);
    });
  });

  describe('getVersion', () => {
    it('should return specific version', async () => {
      mockPrisma.noteVersion.findUnique.mockResolvedValue({
        id: '1',
        noteId: 'note-1',
        content: 'version content',
      } as any);

      const result = await service.getVersion('1');

      expect(result?.id).toBe('1');
    });

    it('should return null if version not found', async () => {
      mockPrisma.noteVersion.findUnique.mockResolvedValue(null);

      const result = await service.getVersion('invalid-id');

      expect(result).toBeNull();
    });
  });

  describe('createVersion', () => {
    it('should create new version', async () => {
      mockPrisma.noteVersion.create.mockResolvedValue({
        id: '1',
        noteId: 'note-1',
        content: 'new version',
      } as any);

      const result = await service.createVersion('note-1', {
        content: 'new version',
      });

      expect(result.id).toBe('1');
    });
  });

  describe('restoreVersion', () => {
    it('should restore note to specific version', async () => {
      mockPrisma.noteVersion.findUnique.mockResolvedValue({
        id: '1',
        content: 'old content',
      } as any);

      const result = await service.restoreVersion('note-1', '1');

      expect(result).toBeDefined();
    });
  });

  describe('deleteVersion', () => {
    it('should delete version', async () => {
      mockPrisma.noteVersion.delete.mockResolvedValue({ id: '1' } as any);

      await service.deleteVersion('1');

      expect(mockPrisma.noteVersion.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });
});