import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';
import { ForbiddenException } from '@nestjs/common';

describe('UserService', () => {
  let service: UserService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    nickname: 'Test User',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    settings: null,
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userSettings: {
      update: jest.fn(),
    },
    folder: {
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.getProfile('user-id');

      expect(result?.id).toBe(mockUser.id);
    });
  });

  describe('updateProfile', () => {
    it('should update user nickname', async () => {
      const updateDto = { nickname: 'New Name' };

      mockPrisma.user.update.mockResolvedValue({
        ...mockUser,
        nickname: 'New Name',
      } as any);

      const result = await service.updateProfile('user-id', updateDto);

      expect(result.nickname).toBe('New Name');
    });
  });

  describe('updateSettings', () => {
    it('should reject another user default folder', async () => {
      mockPrisma.folder.findFirst.mockResolvedValue(null);

      await expect(
        service.updateSettings('user-id', { defaultFolderId: 'foreign-folder' }),
      ).rejects.toThrow(ForbiddenException);
    });

    it('should update settings when folder belongs to user', async () => {
      mockPrisma.folder.findFirst.mockResolvedValue({ id: 'folder-id' });
      mockPrisma.userSettings.update.mockResolvedValue({
        userId: 'user-id',
        defaultFolderId: 'folder-id',
      });

      const result = await service.updateSettings('user-id', {
        defaultFolderId: 'folder-id',
      });

      expect(result.defaultFolderId).toBe('folder-id');
    });
  });
});
