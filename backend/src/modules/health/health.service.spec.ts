import { Test, TestingModule } from '@nestjs/testing';
import { HealthService } from './health.service';
import { PrismaService } from '../../database/prisma.service';

describe('HealthService', () => {
  let service: HealthService;
  let prisma: PrismaService;

  const mockPrisma = {
    $queryRaw: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HealthService,
        {
          provide: PrismaService,
          useValue: mockPrisma,
        },
      ],
    }).compile();

    service = module.get<HealthService>(HealthService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('check', () => {
    it('should return ok status', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const result = await service.check();

      expect(result.status).toBe('ok');
    });
  });

  describe('checkReady', () => {
    it('should return ready when database connected', async () => {
      mockPrisma.$queryRaw.mockResolvedValue([{ result: 1 }]);

      const result = await service.checkReady();

      expect(result.ready).toBe(true);
    });
  });

  describe('checkLive', () => {
    it('should always return live', () => {
      const result = service.checkLive();

      expect(result.live).toBe(true);
    });
  });
});