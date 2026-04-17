import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { PrismaService } from '../../database/prisma.service.js';

@UseGuards(JwtAuthGuard)
@Controller('geography')
export class GeographyController {
  constructor(private readonly prisma: PrismaService) {}

  @Get('regions')
  findAllRegions() {
    return this.prisma.region.findMany({
      select: { id: true, name: true, code: true },
      orderBy: { name: 'asc' },
    });
  }

  @Get('departements')
  findAllDepartements() {
    return this.prisma.departement.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        region_id: true,
        region: { select: { name: true } },
      },
      orderBy: { name: 'asc' },
    });
  }

  @Get('departements/:id/communes')
  findCommunesByDepartement(@Param('id', ParseUUIDPipe) id: string) {
    return this.prisma.commune.findMany({
      where: { departement_id: id },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
    });
  }

  @Get('communes/:id')
  findOneCommune(@Param('id', ParseUUIDPipe) id: string) {
    return this.prisma.commune.findUnique({
      where: { id },
      select: { id: true, name: true, departement_id: true },
    });
  }

  @Get('communes/:id/bureaux')
  findBureauxByCommune(@Param('id', ParseUUIDPipe) id: string) {
    return this.prisma.bureauDeVote.findMany({
      where: { commune_id: id },
      select: { id: true, name: true, address: true },
      orderBy: { name: 'asc' },
    });
  }

  @Get('communes')
  findAllCommunes() {
    return this.prisma.commune.findMany({
      select: {
        id: true,
        name: true,
        departement_id: true,
        departement: {
          select: {
            name: true,
            region: { select: { name: true } },
          },
        },
      },
      orderBy: { name: 'asc' },
    });
  }
}
