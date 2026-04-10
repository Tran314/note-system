import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

jest.mock('bcrypt');

describe('UserService', () => {
  let service: UserService;
  let prisma: PrismaService;

  const mockUser = {
    id: 'user-id',
    email: 'test@example.com',
    nickname: 'Test User',
    avatarUrl: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrisma = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    userSettings: {
      findUnique: jest.fn(),
      update: jest.fn(),
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
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should return user profile', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

      const result = await service.getProfile('user-id');

      expect(result.id).toBe(mockUser.id);
      expect(result.email).toBe(mockUser.email);
    });

    it('should throw NotFoundException if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.getProfile('invalid-id'))
        .rejects.toThrow(NotFoundException);
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

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const passwordDto = {
        currentPassword: 'oldpass',
        newPassword: 'newpass',
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: 'hashed',
      } as any);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue('newHash');
      
      mockPrisma.user.update.mockResolvedValue(mockUser as any);

      await service.changePassword('user-id', passwordDto);

      expect(mockPrisma.user.update).toHaveBeenCalled();
    });

    it('should throw BadRequestException if current password wrong', async () => {
      const passwordDto = {
        currentPassword: 'wrongpass',
        newPassword: 'newpass',
      };

      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: 'hashed',
      } as any);
      
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.changePassword('user-id', passwordDto))
        .rejects.toThrow(BadRequestException);
    });
  });

  describe('getSettings', () => {
    it('should return user settings', async () => {
      mockPrisma.userSettings.findUnique.mockResolvedValue({
        userId: 'user-id',
        theme: 'dark',
        editorFontSize: 16,
      } as any);

      const result = await service.getSettings('user-id');

      expect(result.theme).toBe('dark');
    });
  });

  describe('updateSettings', () => {
    it('should update user settings', async () => {
      const settingsDto = { theme: 'dark' };

      mockPrisma.userSettings.update.mockResolvedValue({
        userId: 'user-id',
        theme: 'dark',
      } as any);

      const result = await service.updateSettings('user-id', settingsDto);

      expect(result.theme).toBe('dark');
    });
  });
});