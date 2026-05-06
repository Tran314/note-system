import { Test, TestingModule } from '@nestjs/testing';
import { NoteService } from './note.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('NoteService', () => {
  let service: NoteService;

  const mockNote = {
    id: 'note-id',
    userId: 'user-id',
    folderId: null,
    title: 'Test Note',
    content: '<p>Test</p>',
    isPinned: false,
    isDeleted: false,
    deletedAt: null,
    version: 1,
    createdAt: new Date(),
    updatedAt: new Date(),
    folder: null,
    tags: [],
  };

  const mockPrismaClient = {
    note: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      count: jest.fn(),
    },
    noteVersion: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
    folder: {
      findFirst: jest.fn(),
    },
    tag: {
      findMany: jest.fn(),
    },
<<<<<<< Updated upstream
=======
  };

  const mockPrisma = {
    ...mockPrismaClient,
    $transaction: jest.fn(async (callback: (tx: typeof mockPrismaClient) => Promise<unknown>) => {
      return callback(mockPrismaClient);
    }),
>>>>>>> Stashed changes
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NoteService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<NoteService>(NoteService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a note successfully', async () => {
      const createDto = {
        title: 'New Note',
        content: '<p>Content</p>',
      };

      mockPrisma.note.create.mockResolvedValue(mockNote as any);
      mockPrisma.noteVersion.create.mockResolvedValue({} as any);

      const result = await service.create('user-id', createDto);

      expect(result.title).toBe(mockNote.title);
      expect(mockPrisma.note.create).toHaveBeenCalled();
    });

    it('should create note with tags', async () => {
      const createDto = {
        title: 'New Note',
        content: '<p>Content</p>',
        tags: ['tag-1'],
      };

      mockPrisma.tag.findMany.mockResolvedValue([{ id: 'tag-1' }]);
      mockPrisma.note.create.mockResolvedValue(mockNote as any);
      mockPrisma.noteVersion.create.mockResolvedValue({} as any);

      await service.create('user-id', createDto);

      expect(mockPrisma.note.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            tags: expect.anything(),
          }),
        }),
      );
    });

    it('should reject tags from another user', async () => {
      mockPrisma.tag.findMany.mockResolvedValue([]);

      await expect(
        service.create('user-id', {
          title: 'New Note',
          tags: ['foreign-tag'],
        }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('findAll', () => {
    it('should return paginated notes', async () => {
      mockPrisma.note.findMany.mockResolvedValue([mockNote] as any);
      mockPrisma.note.count.mockResolvedValue(1);

      const result = await service.findAll('user-id', { page: 1, limit: 20 });

      expect(result.notes).toHaveLength(1);
      expect(result.pagination.total).toBe(1);
    });
  });

  describe('findOne', () => {
    it('should return a note by id', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(mockNote as any);

      const result = await service.findOne('user-id', 'note-id');

      expect(result.id).toBe(mockNote.id);
    });

    it('should throw NotFoundException if note not found', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-id', 'invalid-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('update', () => {
    it('should update note and create version', async () => {
      const updateDto = { title: 'Updated Title' };

      mockPrisma.note.findFirst.mockResolvedValue(mockNote as any);
      mockPrisma.note.update.mockResolvedValue({
        ...mockNote,
        title: 'Updated Title',
      } as any);
      mockPrisma.noteVersion.create.mockResolvedValue({} as any);

      const result = await service.update('user-id', 'note-id', updateDto);

      expect(result.title).toBe('Updated Title');
      expect(mockPrisma.noteVersion.create).toHaveBeenCalled();
    });

    it('should reject folder access from another user', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(mockNote as any);
      mockPrisma.folder.findFirst.mockResolvedValue(null);

      await expect(
        service.update('user-id', 'note-id', { folderId: 'foreign-folder' }),
      ).rejects.toThrow(ForbiddenException);
    });
  });

  describe('remove', () => {
    it('should soft delete a note', async () => {
      mockPrisma.note.findFirst.mockResolvedValue(mockNote as any);
      mockPrisma.note.update.mockResolvedValue({
        ...mockNote,
        isDeleted: true,
      } as any);

      await service.remove('user-id', 'note-id');

      expect(mockPrisma.note.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            isDeleted: true,
          }),
        }),
      );
    });
  });

  describe('restore', () => {
    it('should restore a deleted note', async () => {
      const deletedNote = { ...mockNote, isDeleted: true };
      mockPrisma.note.findFirst.mockResolvedValue(deletedNote as any);
      mockPrisma.note.update.mockResolvedValue(mockNote as any);

      const result = await service.restore('user-id', 'note-id');

      expect(result.isDeleted).toBe(false);
    });
  });
});
