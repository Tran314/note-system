import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentService } from './attachment.service';
import { PrismaService } from '../../database/prisma.service';

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

  describe('upload', () => {
    it('should upload attachment', async () => {
      mockPrisma.attachment.create.mockResolvedValue(mockAttachment as any);

      const result = await service.upload('user-id', {
        filename: 'test.pdf',
        originalname: 'test.pdf',
        mimetype: 'application/pdf',
        size: 1024,
        path: '/uploads/test.pdf',
      });

      expect(result.filename).toBe('test.pdf');
    });
  });

  describe('findByUser', () => {
    it('should return user attachments', async () => {
      mockPrisma.attachment.findMany.mockResolvedValue([mockAttachment] as any);

      const result = await service.findAll('user-id');

      expect(result.length).toBe(1);
    });
  });

  describe('delete', () => {
    it('should delete attachment', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue(mockAttachment as any);
      mockPrisma.attachment.delete.mockResolvedValue(mockAttachment as any);

      await service.delete('user-id', 'attachment-id');

      expect(mockPrisma.attachment.delete).toHaveBeenCalled();
    });
  });
});