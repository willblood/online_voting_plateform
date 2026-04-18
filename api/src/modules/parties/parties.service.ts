import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { CreatePartyDto } from './dto/create-party.dto.js';
import { UpdatePartyDto } from './dto/update-party.dto.js';

@Injectable()
export class PartiesService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.politicalParty.findMany({
      include: { _count: { select: { candidates: true } } },
      orderBy: { name: 'asc' },
    });
  }

  async create(dto: CreatePartyDto) {
    try {
      return await this.prisma.politicalParty.create({ data: dto });
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
        throw new ConflictException('A party with that name or acronym already exists');
      }
      throw e;
    }
  }

  async update(id: string, dto: UpdatePartyDto) {
    try {
      return await this.prisma.politicalParty.update({ where: { id }, data: dto });
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null) {
        const err = e as { code?: string };
        if (err.code === 'P2025') throw new NotFoundException('Party not found');
        if (err.code === 'P2002') throw new ConflictException('A party with that name or acronym already exists');
      }
      throw e;
    }
  }

  async remove(id: string) {
    const party = await this.prisma.politicalParty.findUnique({
      where: { id },
      include: { _count: { select: { candidates: true } } },
    });

    if (!party) throw new NotFoundException('Party not found');

    if (party._count.candidates > 0) {
      throw new BadRequestException('Cannot delete a party that has candidates');
    }

    await this.prisma.politicalParty.delete({ where: { id } });
  }
}
