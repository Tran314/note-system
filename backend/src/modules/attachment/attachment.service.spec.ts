import { Test, TestingModule } from '@nestjs/testing';
import { AttachmentService } from './attachment.service';
import { PrismaService } from '../../database/prisma.service';
import { ConfigService } from '@nestjs/config';
<<<<<<< Updated upstream
import * as fs from 'fs';
import { NotFoundException } from '@nestjs/common';
=======
import * as fs from 'fs/promises';
>>>>>>> Stashed changes

jest.mock('fs/promises', () => ({
  access: jest.fn(),
  mkdir: jest.fn(),
  writeFile: jest.fn(),
  readFile: jest.fn(),
  unlink: jest.fn(),
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
      deleteMany: jest.fn(),
    },
    note: {
      findFirst: jest.fn(),
    },
  };

  const mockConfigService = {
    get: jest.fn((key: string, defaultValue: unknown) => defaultValue),
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
        stream: undefined as unknown as NodeJS.ReadableStream,
      };

      const mockAttachment = {
        id: '1',
        userId: 'user-id',
        filename: 'test.pdf',
        filePath: 'uuid.pdf',
        fileSize: 1024,
        mimeType: 'application/pdf',
      };

      (fs.access as jest.Mock).mockRejectedValue(new Error('ENOENT'));
      (fs.mkdir as jest.Mock).mockResolvedValue(undefined);
      (fs.writeFile as jest.Mock).mockResolvedValue(undefined);
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
<<<<<<< Updated upstream
        size: 1024,
=======
        size: 20000000,
>>>>>>> Stashed changes
        destination: '/tmp',
        filename: 'test.pdf',
        path: '/tmp/test.pdf',
        buffer: Buffer.from('test content'),
        stream: undefined as unknown as NodeJS.ReadableStream,
      };

<<<<<<< Updated upstream
      mockPrisma.note.findFirst.mockResolvedValue(null);

      await expect(
        service.upload('user-id', mockFile, 'foreign-note'),
      ).rejects.toThrow(NotFoundException);
=======
      mockConfigService.get.mockReturnValue(10485760);

      await expect(service.upload('user-id', mockFile)).rejects.toThrow('文件大小超过限制（10MB）');
    });

    it('should throw if file type not allowed', async () => {
      const mockFile: Express.Multer.File = {
        fieldname: 'file',
        originalname: 'evil.exe',
        encoding: '7bit',
        mimetype: 'application/x-executable',
        size: 1024,
        destination: '/tmp',
        filename: 'evil.exe',
        path: '/tmp/evil.exe',
        buffer: Buffer.from('test content'),
        stream: undefined as unknown as NodeJS.ReadableStream,
      };

      mockConfigService.get.mockReturnValue(10485760);

      await expect(service.upload('user-id', mockFile)).rejects.toThrow('不支持的文件类型');
>>>>>>> Stashed changes
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

    it('should filter by noteId when provided', async () => {
      mockPrisma.attachment.findMany.mockResolvedValue([]);

      await service.findAll('user-id', 'note-id');

      expect(mockPrisma.attachment.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            userId: 'user-id',
            noteId: 'note-id',
          }),
        })
      );
    });
  });

  describe('remove', () => {
    it('should delete attachment and file', async () => {
      const mockAttachment = {
        id: '1',
        userId: 'user-id',
        filename: 'test.pdf',
        filePath: 'uuid.pdf',
      };

      mockPrisma.attachment.findFirst.mockResolvedValue(mockAttachment);
      (fs.unlink as jest.Mock).mockResolvedValue(undefined);
      mockPrisma.attachment.delete.mockResolvedValue({ id: '1' });

      const result = await service.remove('user-id', '1');
<<<<<<< Updated upstream
      expect(result).toEqual({ message: 'Attachment deleted' });
=======
      expect(result).toEqual({ message: '文件已删除' });
      expect(fs.unlink).toHaveBeenCalled();
      expect(mockPrisma.attachment.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should throw if attachment not found', async () => {
      mockPrisma.attachment.findFirst.mockResolvedValue(null);

      await expect(service.remove('user-id', 'invalid-id')).rejects.toThrow('文件不存在');
>>>>>>> Stashed changes
    });
  });
});