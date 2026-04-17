import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/jwt-auth.guard.js';
import { CastVoteDto } from './dto/cast-vote.dto.js';
import { VotingService } from './voting.service.js';

interface AuthRequest {
  user: { id: string; email: string; role: string };
}

@Controller('elections')
@UseGuards(JwtAuthGuard)
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @Post(':id/vote')
  @HttpCode(HttpStatus.CREATED)
  castVote(
    @Param('id') id: string,
    @Body() dto: CastVoteDto,
    @Request() req: AuthRequest,
  ) {
    return this.votingService.castVote(id, dto, req.user.id, req.user.role);
  }

  @Get(':id/my-receipt')
  getMyReceipt(@Param('id') id: string, @Request() req: AuthRequest) {
    return this.votingService.getMyReceipt(id, req.user.id);
  }
}
