import { Test, TestingModule } from '@nestjs/testing';
import { SearchService } from './search.service';
import { PrismaService } from '../../database/prisma.service';
import { ElasticsearchService } from '@nestjs/elasticsearch';

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

  const mockElasticsearch = {
    search: jest.fn(),
    index: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SearchService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ElasticsearchService,
          useValue: mockElasticsearch,
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
      const mockNotes = [
        { id: '1', title: 'Test Note', content: 'content' },
        { id: '2', title: 'Another Note', content: 'test content' },
      ];

      mockPrisma.note.findMany.mockResolvedValue(mockNotes as any);

      const result = await service.searchNotes('test', 'user-id');

      expect(result.length).toBeGreaterThan(0);
    });

    it('should return empty array if no notes found', async () => {
      mockPrisma.note.findMany.mockResolvedValue([]);

      const result = await service.searchNotes('nonexistent', 'user-id');

      expect(result).toEqual([]);
    });

    it('should search in folders', async () => {
      mockPrisma.folder.findMany.mockResolvedValue([
        { id: '1', name: 'Test Folder' },
      ] as any);

      const result = await service.searchFolders('test', 'user-id');

      expect(result).toBeDefined();
    });

    it('should search in tags', async () => {
      mockPrisma.tag.findMany.mockResolvedValue([
        { id: '1', name: 'Test Tag' },
      ] as any);

      const result = await service.searchTags('test', 'user-id');

      expect(result).toBeDefined();
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