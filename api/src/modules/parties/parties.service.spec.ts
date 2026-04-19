import { Test, TestingModule } from '@nestjs/testing';
import { BadRequestException, ConflictException, NotFoundException } from '@nestjs/common';
import { PartiesService } from './parties.service.js';
import { PrismaService } from '../../database/prisma.service.js';

const mockPrisma = () => ({
  politicalParty: {
    findMany: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
    findUnique: jest.fn(),
    delete: jest.fn(),
  },
  $transaction: jest.fn(),
});

describe('PartiesService', () => {
  let service: PartiesService;
  let prisma: ReturnType<typeof mockPrisma>;

  beforeEach(async () => {
    prisma = mockPrisma();
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PartiesService,
        { provide: PrismaService, useValue: prisma },
      ],
    }).compile();

    service = module.get<PartiesService>(PartiesService);
  });

  describe('findAll', () => {
    it('should return all parties ordered by name', async () => {
      const parties = [{ id: '1', name: 'RHDP', acronym: 'RHDP', _count: { candidates: 0 } }];
      (prisma.politicalParty.findMany as jest.Mock).mockResolvedValue(parties);
      expect(await service.findAll()).toEqual(parties);
      expect(prisma.politicalParty.findMany).toHaveBeenCalledWith({
        include: { _count: { select: { candidates: true } } },
        orderBy: { name: 'asc' },
      });
    });
  });

  describe('create', () => {
    it('should create and return a party', async () => {
      const dto = { name: 'RHDP', acronym: 'RHDP' };
      const result = { id: '1', ...dto };
      (prisma.politicalParty.create as jest.Mock).mockResolvedValue(result);
      expect(await service.create(dto as never)).toEqual(result);
    });

    it('should throw ConflictException on duplicate (P2002)', async () => {
      (prisma.politicalParty.create as jest.Mock).mockRejectedValue({ code: 'P2002' });
      await expect(service.create({ name: 'X', acronym: 'X' } as never)).rejects.toBeInstanceOf(ConflictException);
    });

    it('should rethrow unknown errors', async () => {
      const err = new Error('unexpected');
      (prisma.politicalParty.create as jest.Mock).mockRejectedValue(err);
      await expect(service.create({ name: 'X', acronym: 'X' } as never)).rejects.toThrow('unexpected');
    });
  });

  describe('update', () => {
    it('should update and return a party', async () => {
      const result = { id: '1', name: 'RHDP Updated', acronym: 'RHDP' };
      (prisma.politicalParty.update as jest.Mock).mockResolvedValue(result);
      expect(await service.update('1', { name: 'RHDP Updated' } as never)).toEqual(result);
    });

    it('should throw NotFoundException when party not found (P2025)', async () => {
      (prisma.politicalParty.update as jest.Mock).mockRejectedValue({ code: 'P2025' });
      await expect(service.update('bad-id', {} as never)).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw ConflictException on duplicate acronym/name (P2002)', async () => {
      (prisma.politicalParty.update as jest.Mock).mockRejectedValue({ code: 'P2002' });
      await expect(service.update('1', { acronym: 'DUPE' } as never)).rejects.toBeInstanceOf(ConflictException);
    });
  });

  describe('remove', () => {
    beforeEach(() => {
      (prisma.$transaction as jest.Mock).mockImplementation(
        async (fn: (tx: typeof prisma) => Promise<void>) => fn(prisma),
      );
    });

    it('should throw NotFoundException when party does not exist', async () => {
      (prisma.politicalParty.findUnique as jest.Mock).mockResolvedValue(null);
      await expect(service.remove('bad-id')).rejects.toBeInstanceOf(NotFoundException);
    });

    it('should throw BadRequestException when party has candidates', async () => {
      (prisma.politicalParty.findUnique as jest.Mock).mockResolvedValue({
        id: '1', _count: { candidates: 3 },
      });
      await expect(service.remove('1')).rejects.toBeInstanceOf(BadRequestException);
    });

    it('should delete a party that has no candidates', async () => {
      (prisma.politicalParty.findUnique as jest.Mock).mockResolvedValue({
        id: '1', _count: { candidates: 0 },
      });
      (prisma.politicalParty.delete as jest.Mock).mockResolvedValue({ id: '1' });
      await service.remove('1');
      expect(prisma.politicalParty.delete).toHaveBeenCalledWith({ where: { id: '1' } });
    });
  });
});
