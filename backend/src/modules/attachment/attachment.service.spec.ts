import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentService } from './attachment.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import { NotFoundException } from '@nestjs/common';

jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  unlinkSync: jest.fn(),
}));

describe('AttachmentService', () => {
  let service: AttachmentService;

  const mockPrisma = {
    attachment: {
      findMany: jest.fn(),
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    note: {
      findFirst: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: any) => defaultValue),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AttachmentService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<AttachmentService>(AttachmentService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('upload', () => {
    it('should upload file successfully', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        destination: '/tmp',
        filename: 'test.pdf',
        path: '/tmp/test.pdf',
        buffer: Buffer.from('test content'),
        stream: undefined as any,
      };

      const mockAttachment = {
        id: '1',
        userId: 'user-id',
        filename: 'test.pdf',
        filePath: 'uuid.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
      };

      (fs.existsSync as jest.Mock).mockReturnValue(false);
      (fs.mkdirSync as jest.Mock).mockReturnValue(undefined);
      (fs.writeFileSync as jest.Mock).mockReturnValue(undefined);
      mockPrisma.attachment.create.mockResolvedValue(mockAttachment);

      const result = await service.upload('user-id', mockFile);
      expect(result).toEqual(mockAttachment);
    });

    it('should reject upload to another user note', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'test.pdf',
        encoding: '7bit',
        mimetype: 'application/pdf',
        size: 1024,
        destination: '/tmp',
        filename: 'test.pdf',
        path: '/tmp/test.pdf',
        buffer: Buffer.from('test content'),
        stream: undefined as any,
      };

      mockPrisma.note.findFirst.mockResolvedValue(null);

      await expect(
        service.upload('user-id', mockFile, 'foreign-note'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should return user attachments', async () => {
      const mockAttachments = [
        {
          id: '1',
          userId: 'user-id',
          filename: 'test.pdf',
          fileSize: 1024,
        },
      ];

      mockPrisma.attachment.findMany.mockResolvedValue(mockAttachments);

      const result = await service.findAll('user-id');
      expect(result).toHaveLength(1);
    });
  });

  describe('remove', () => {
    it('should delete attachment', async () => {
      const mockAttachment = {
        id: '1',
        userId: 'user-id',
        filename: 'test.pdf',
        filePath: 'uuid.pdf',
      };

      mockPrisma.attachment.findFirst.mockResolvedValue(mockAttachment);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);
      mockPrisma.attachment.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('user-id', '1');
      expect(result).toEqual({ message: 'Attachment deleted' });
    });
  });
});
