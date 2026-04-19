import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { Roles } from '../../common/decorators/roles.decorator.js';
import { RolesGuard } from '../../common/guards/roles.guard.js';
import { AdvanceStatusDto } from './dto/advance-status.dto.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { CreateElectionDto } from './dto/create-election.dto.js';
import { ElectionsService } from './elections.service.js';

interface AuthRequest {
  user: { id: string; email: string; role: string };
}

@Controller('elections')
export class ElectionsController {
  constructor(private readonly electionsService: ElectionsService) {}

  // Public — no auth required
  @Get('public')
  findPublic() {
    return this.electionsService.findPublic();
  }

  // Authenticated routes — any role
  @UseGuards(JwtAuthGuard)
  @Get()
  findAll(@Request() req: AuthRequest) {
    return this.electionsService.findAll(req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Get('stats')
  getStats() {
    return this.electionsService.getStats();
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.electionsService.findOne(id, req.user.id, req.user.role);
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id/results')
  getResults(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.electionsService.getResults(id, req.user.role);
  }

  // Admin-only routes
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post()
  create(@Body() dto: CreateElectionDto) {
    return this.electionsService.create(dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Patch(':id/status')
  @HttpCode(HttpStatus.OK)
  advanceStatus(@Param('id') id: string, @Body() dto: AdvanceStatusDto) {
    return this.electionsService.advanceStatus(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Post(':id/candidates')
  @HttpCode(HttpStatus.CREATED)
  addCandidate(@Param('id') id: string, @Body() dto: CreateCandidateDto) {
    return this.electionsService.addCandidate(id, dto);
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('ADMIN')
  @Delete(':id/candidates/:cid')
  @HttpCode(HttpStatus.NO_CONTENT)
  removeCandidate(@Param('id') id: string, @Param('cid') cid: string) {
    return this.electionsService.removeCandidate(id, cid);
  }
}
