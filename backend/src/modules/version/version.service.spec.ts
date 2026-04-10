import { Test, TestingModule } from '@nestjs/testing';
import { VersionService } from './version.service';
import { PrismaService } from '../../database/prisma.service';

describe('VersionService', () => {
  let service: VersionService;
  let prisma: PrismaService;

  const mockPrisma = {
    note: {
      findFirst: jest.fn(),
    },
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
      ] as any);

      mockPrisma.note.findFirst.mockResolvedValue({
        id: 'note-1',
        userId: 'user-id',
      } as any);

      const result = await service.getVersions('user-id', 'note-1');

      expect(result.length).toBe(1);
    });
  });

  describe('getVersion', () => {
    it('should return specific version', async () => {
      mockPrisma.noteVersion.findUnique.mockResolvedValue({
        id: '1',
        content: 'version content',
        note: { userId: 'user-id' },
      } as any);

      const result = await service.getVersion('user-id', '1');

      expect(result?.id).toBe('1');
    });
  });
});
