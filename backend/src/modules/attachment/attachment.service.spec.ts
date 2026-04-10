import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentService } from './attachment.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('AttachmentService', () => {
  let service: AttachmentService;
  let prisma: PrismaService;

  const mockAttachment = {
    id: 'attachment-id',
    userId: 'user-id',
    filename: 'test.pdf',
    originalName: 'test.pdf',
    mimeType: 'application/pdf',
    size: 1024,
    path: '/uploads/test.pdf',
    createdAt: new Date(),
  };

  const mockPrisma = {
    attachment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    noteAttachment: {
      create: jest.fn(),
      delete: jest.fn(),
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<AttachmentService>(AttachmentService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findAll', () => {
    it('should return all attachments', async () => {
      mockPrisma.attachment.findMany.mockResolvedValue([mockAttachment] as any);

      const result = await service.findAll('user-id');

      expect(result).toHaveLength(1);
      expect(result[0].filename).toBe(mockAttachment.filename);
    });
  });

  describe('findOne', () => {
    it('should return an attachment', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue(mockAttachment as any);

      const result = await service.findOne('user-id', 'attachment-id');

      expect(result.id).toBe(mockAttachment.id);
    });

    it('should throw NotFoundException if not found', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue(null);

      await expect(service.findOne('user-id', 'invalid-id'))
        .rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete attachment', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue(mockAttachment as any);
      mockPrisma.attachment.delete.mockResolvedValue(mockAttachment as any);

      await service.remove('user-id', 'attachment-id');

      expect(mockPrisma.attachment.delete).toHaveBeenCalled();
    });
  });

  describe('attachToNote', () => {
    it('should attach file to note', async () => {
      mockPrisma.noteAttachment.create.mockResolvedValue({} as any);

      await service.attachToNote('user-id', 'note-id', 'attachment-id');

      expect(mockPrisma.noteAttachment.create).toHaveBeenCalled();
    });
  });

  describe('detachFromNote', () => {
    it('should detach file from note', async () => {
      mockPrisma.noteAttachment.delete.mockResolvedValue({} as any);

      await service.detachFromNote('user-id', 'note-id', 'attachment-id');

      expect(mockPrisma.noteAttachment.delete).toHaveBeenCalled();
    });
  });
});