import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../database/prisma.service';

describe('SearchService', () => {
  let service: SearchService;
  let prisma: PrismaService;

  const mockPrisma = {
    note: {
      findMany: jest.fn(),
    },
    folder: {
      findMany: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<SearchService>(SearchService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('searchNotes', () => {
    it('should search notes by keyword', async () => {
      mockPrisma.note.findMany.mockResolvedValue([
        { id: '1', title: 'Test Note' },
      ] as any);

      const result = await service.searchNotes('test', 'user-id');

      expect(result.length).toBe(1);
    });
  });

  describe('globalSearch', () => {
    it('should search across all entities', async () => {
      mockPrisma.note.findMany.mockResolvedValue([{ id: '1' }] as any);
      mockPrisma.folder.findMany.mockResolvedValue([{ id: '2' }] as any);
      mockPrisma.tag.findMany.mockResolvedValue([{ id: '3' }] as any);

      const result = await service.globalSearch('test', 'user-id');

      expect(result).toHaveProperty('notes');
      expect(result).toHaveProperty('folders');
      expect(result).toHaveProperty('tags');
    });
  });
});