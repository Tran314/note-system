import { Test, TestingModule } from '@nestjs/testing';
import { TrashService } from './trash.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('TrashService', () => {
  let service: TrashService;

  const mockPrisma = {
    note: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getTrashNotes', () => {
    it('should return deleted notes for user', async () => {
      const mockNotes = [
        { id: '1', userId: 'user-id', isDeleted: true, deletedAt: new Date() },
        { id: '2', userId: 'user-id', isDeleted: true, deletedAt: new Date() },
      ];

      mockPrisma.note.findMany.mockResolvedValue(mockNotes);

      const result = await service.getTrashNotes('user-id');

      expect(result).toHaveLength(2);
      expect(mockPrisma.note.findMany).toHaveBeenCalledWith({
        where: {
          userId: 'user-id',
          isDeleted: true,
        },
      });
    });

    it('should return empty array if no deleted notes', async () => {
      mockPrisma.note.findMany.mockResolvedValue([]);

      const result = await service.getTrashNotes('user-id');

      expect(result).toHaveLength(0);
    });
  });

  describe('restoreNote', () => {
    it('should restore deleted note', async () => {
      const mockNote = { id: '1', userId: 'user-id', isDeleted: true };
      const restoredNote = { id: '1', userId: 'user-id', isDeleted: false, deletedAt: null };

<<<<<<< Updated upstream
      mockPrisma.note.findFirst.mockResolvedValue({
        id: '1',
        userId: 'user-id',
        isDeleted: true,
      } as any);

      await service.restoreNote('user-id', '1');
=======
      mockPrisma.note.findFirst.mockResolvedValue(mockNote);
      mockPrisma.note.update.mockResolvedValue(restoredNote);
>>>>>>> Stashed changes

      const result = await service.restoreNote('user-id', '1');

      expect(result.isDeleted).toBe(false);
      expect(result.deletedAt).toBeNull();
      expect(mockPrisma.note.update).toHaveBeenCalledWith({
        where: { id: '1' },
        data: { isDeleted: false, deletedAt: null },
      });
    });

    it('should throw NotFoundException if note not found', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null);

      await expect(service.restoreNote('user-id', 'invalid-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if note belongs to different user', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null);

      await expect(service.restoreNote('wrong-user', '1'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('permanentDelete', () => {
    it('should permanently delete note', async () => {
      const mockNote = { id: '1', userId: 'user-id' };

      mockPrisma.note.findFirst.mockResolvedValue(mockNote);
      mockPrisma.note.delete.mockResolvedValue(mockNote);

      await service.permanentDelete('user-id', '1');

      expect(mockPrisma.note.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw NotFoundException if note not found', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null);

      await expect(service.permanentDelete('user-id', 'invalid-id'))
        .rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if note belongs to different user', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null);

      await expect(service.permanentDelete('wrong-user', '1'))
        .rejects.toThrow(NotFoundException);
    });
  });
});
