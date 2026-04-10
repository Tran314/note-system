import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { PrismaService } from '../../database/prisma.service';
import { NotFoundException } from '@nestjs/common';

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
    settings: null,
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

      expect(result?.id).toBe(mockUser.id);
    });

    it('should return null if user not found', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      const result = await service.getProfile('invalid-id');

      expect(result).toBeNull();
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
});