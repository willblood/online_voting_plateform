import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as crypto from 'crypto';
import { PrismaService } from '../../database/prisma.service.js';
import { CastVoteDto } from './dto/cast-vote.dto.js';

function encryptVote(payload: string): string {
  const key = process.env.VOTE_ENCRYPTION_KEY;
  const keyBuffer = key ? Buffer.from(key, 'hex') : null;
  if (!keyBuffer || keyBuffer.length !== 32) {
    throw new Error(
      'VOTE_ENCRYPTION_KEY must be set to a 64-character hex string (32 bytes) for AES-256-CBC',
    );
  }

  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', keyBuffer, iv);
  const encrypted = Buffer.concat([cipher.update(payload, 'utf8'), cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

@Injectable()
export class VotingService {
  constructor(private readonly prisma: PrismaService) {}

  // ── POST /elections/:id/vote ──────────────────────────────────────────

  async castVote(electionId: string, dto: CastVoteDto, userId: string, userRole: string) {
    // 1. Only VOTERs can vote
    if (userRole !== 'VOTER') {
      throw new ForbiddenException('Only registered voters can cast votes');
    }

    // 2. Load voter with geo chain
    const voter = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        status: true,
        commune_id: true,
        commune: {
          select: {
            departement_id: true,
            departement: { select: { region_id: true } },
          },
        },
      },
    });

    if (!voter) throw new NotFoundException('Voter not found');

    // 3. Account must be ACTIVE
    if (voter.status !== 'ACTIVE') {
      throw new ForbiddenException('Your account is not verified. Complete OTP verification first.');
    }

    // 4. Election must exist
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
      select: {
        id: true,
        title: true,
        status: true,
        start_time: true,
        end_time: true,
        geographic_scope: true,
        scope_region_id: true,
        scope_departement_id: true,
        scope_commune_id: true,
      },
    });

    if (!election) throw new NotFoundException('Election not found');

    // 5. Election must be EN_COURS
    if (election.status !== 'EN_COURS') {
      throw new BadRequestException('Voting is not currently open for this election');
    }

    // 6. Within voting window
    const now = new Date();
    if (now < election.start_time || now > election.end_time) {
      throw new BadRequestException('You are outside the voting window for this election');
    }

    // 7. Geographic eligibility
    const eligible = this.isEligible(voter, election);
    if (!eligible) {
      throw new ForbiddenException('You are not eligible to vote in this election');
    }

    // 8. Duplicate vote check
    const existingVote = await this.prisma.vote.findUnique({
      where: { user_id_election_id: { user_id: userId, election_id: electionId } },
    });
    if (existingVote) {
      throw new ConflictException('You have already voted in this election');
    }

    // 9. Candidate must belong to this election
    const candidate = await this.prisma.candidate.findFirst({
      where: { id: dto.candidate_id, election_id: electionId },
      select: { id: true, first_name: true, last_name: true },
    });
    if (!candidate) {
      throw new BadRequestException('Invalid candidate for this election');
    }

    // 10. Create vote
    const receipt_code = crypto.randomUUID();
    const payload = JSON.stringify({
      election_id: electionId,
      candidate_id: dto.candidate_id,
      timestamp: now.toISOString(),
    });
    const encrypted_vote = encryptVote(payload);

    try {
      await this.prisma.vote.create({
        data: {
          election_id: electionId,
          user_id: userId,
          candidate_id: dto.candidate_id,
          encrypted_vote,
          receipt_code,
        },
      });
    } catch (e: unknown) {
      // P2002 = unique constraint violation (concurrent duplicate vote)
      if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2002') {
        throw new ConflictException('You have already voted in this election');
      }
      throw e;
    }

    return {
      receipt_code,
      message: 'Your vote has been recorded successfully.',
      candidate: `${candidate.first_name} ${candidate.last_name}`,
      election: election.title,
    };
  }

  // ── GET /elections/:id/my-receipt ─────────────────────────────────────

  async getMyReceipt(electionId: string, userId: string) {
    const vote = await this.prisma.vote.findUnique({
      where: { user_id_election_id: { user_id: userId, election_id: electionId } },
      select: { receipt_code: true, created_at: true },
    });

    if (!vote) {
      throw new NotFoundException('You have not voted in this election');
    }

    return vote;
  }

  private isEligible(
    voter: {
      commune_id: string;
      commune: {
        departement_id: string;
        departement: { region_id: string };
      };
    },
    election: {
      geographic_scope: string;
      scope_region_id: string | null;
      scope_departement_id: string | null;
      scope_commune_id: string | null;
    },
  ): boolean {
    switch (election.geographic_scope) {
      case 'NATIONAL':
        return true;
      case 'REGIONAL':
        return voter.commune.departement.region_id === election.scope_region_id;
      case 'DEPARTEMENTAL':
        return voter.commune.departement_id === election.scope_departement_id;
      case 'COMMUNAL':
        return voter.commune_id === election.scope_commune_id;
      default:
        return false;
    }
  }
}
