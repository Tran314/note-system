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
        { id: '1', deletedAt: new Date() },
      ] as any);

      const result = await service.getTrashNotes('user-id');

      expect(result.length).toBe(1);
    });
  });

  describe('restoreNote', () => {
    it('should restore deleted note', async () => {
      mockPrisma.note.update.mockResolvedValue({
        id: '1',
        deletedAt: null,
      } as any);

      await service.restoreNote('1');

      expect(mockPrisma.note.update).toHaveBeenCalled();
    });
  });
});