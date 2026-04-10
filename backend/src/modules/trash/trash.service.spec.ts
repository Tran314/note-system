import { Test, TestingModule } from '@nestjs/testing';
import { TrashService } from './trash.service';
import { PrismaService } from '../../database/prisma.service';

describe('TrashService', () => {
  let service: TrashService;
  let prisma: PrismaService;

  const mockPrisma = {
    note: {
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        TrashService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<TrashService>(TrashService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrashNotes', () => {
    it('should return deleted notes', async () => {
      mockPrisma.note.findMany.mockResolvedValue([
        { id: '1', title: 'Deleted Note 1', deletedAt: new Date() },
        { id: '2', title: 'Deleted Note 2', deletedAt: new Date() },
      ] as any);

      const result = await service.getTrashNotes('user-id');

      expect(result.length).toBe(2);
    });

    it('should return empty array if no deleted notes', async () => {
      mockPrisma.note.findMany.mockResolvedValue([]);

      const result = await service.getTrashNotes('user-id');

      expect(result).toEqual([]);
    });
  });

  describe('restoreNote', () => {
    it('should restore deleted note', async () => {
      mockPrisma.note.update.mockResolvedValue({
        id: '1',
        deletedAt: null,
      } as any);

      const result = await service.restoreNote('1');

      expect(result.deletedAt).toBeNull();
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete note', async () => {
      mockPrisma.note.delete.mockResolvedValue({ id: '1' } as any);

      await service.permanentDelete('1');

      expect(mockPrisma.note.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });
  });

  describe('emptyTrash', () => {
    it('should empty all trash notes', async () => {
      mockPrisma.note.findMany.mockResolvedValue([
        { id: '1' },
        { id: '2' },
      ] as any);

      await service.emptyTrash('user-id');

      expect(mockPrisma.note.delete).toHaveBeenCalledTimes(2);
    });
  });
});