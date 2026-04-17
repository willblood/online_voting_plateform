import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service.js';
import { AdvanceStatusDto } from './dto/advance-status.dto.js';
import { CreateCandidateDto } from './dto/create-candidate.dto.js';
import { CreateElectionDto } from './dto/create-election.dto.js';

// Allowed status transitions — no skipping, no reverting
const STATUS_TRANSITIONS: Record<string, string> = {
  BROUILLON: 'OUVERT',
  OUVERT: 'EN_COURS',
  EN_COURS: 'CLOS',
  CLOS: 'PUBLIE',
};

@Injectable()
export class ElectionsService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Eligibility helper ─────────────────────────────────────────────────

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

  // ── GET /elections (voter: eligible only; admin: all) ─────────────────

  async findAll(userId: string, userRole: string) {
    if (userRole === 'ADMIN' || userRole === 'OBSERVER') {
      return this.prisma.election.findMany({
        include: {
          _count: { select: { candidates: true, votes: true } },
          scope_region: { select: { id: true, name: true } },
          scope_departement: { select: { id: true, name: true } },
          scope_commune: { select: { id: true, name: true } },
        },
        orderBy: { created_at: 'desc' },
      });
    }

    // Voter: load their geo chain for eligibility check
    const voter = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
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

    const elections = await this.prisma.election.findMany({
      where: { status: { in: ['EN_COURS', 'OUVERT'] } },
      include: {
        _count: { select: { candidates: true, votes: true } },
        scope_region: { select: { id: true, name: true } },
        scope_departement: { select: { id: true, name: true } },
        scope_commune: { select: { id: true, name: true } },
      },
      orderBy: { start_time: 'asc' },
    });

    // Filter by eligibility + annotate already_voted
    const votedElectionIds = new Set(
      (
        await this.prisma.vote.findMany({
          where: { user_id: userId },
          select: { election_id: true },
        })
      ).map((v) => v.election_id),
    );

    return elections
      .filter((e) => this.isEligible(voter, e))
      .map((e) => ({
        id: e.id,
        title: e.title,
        type: e.type,
        status: e.status,
        geographic_scope: e.geographic_scope,
        scope: e.scope_region ?? e.scope_departement ?? e.scope_commune ?? null,
        start_time: e.start_time,
        end_time: e.end_time,
        candidates_count: e._count.candidates,
        votes_count: e._count.votes,
        can_vote: e.status === 'EN_COURS',
        already_voted: votedElectionIds.has(e.id),
      }));
  }

  // ── GET /elections/public ─────────────────────────────────────────────

  async findPublic() {
    return this.prisma.election.findMany({
      where: { status: 'PUBLIE' },
      include: {
        candidates: {
          include: {
            party: { select: { name: true, acronym: true } },
            results: {
              where: { scope: 'NATIONAL' },
              select: { votes_count: true, registered_voters: true, turnout_percentage: true },
            },
          },
        },
        _count: { select: { votes: true } },
      },
      orderBy: { end_time: 'desc' },
    });
  }

  // ── GET /elections/:id ────────────────────────────────────────────────

  async findOne(id: string, userId: string, userRole: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
      include: {
        candidates: {
          include: {
            party: { select: { id: true, name: true, acronym: true, logo_url: true } },
          },
        },
        scope_region: { select: { id: true, name: true } },
        scope_departement: { select: { id: true, name: true } },
        scope_commune: { select: { id: true, name: true } },
        _count: { select: { votes: true } },
      },
    });

    if (!election) throw new NotFoundException('Election not found');

    let can_vote = false;
    let already_voted = false;

    if (userRole === 'VOTER') {
      const voter = await this.prisma.user.findUnique({
        where: { id: userId },
        select: {
          commune_id: true,
          commune: {
            select: {
              departement_id: true,
              departement: { select: { region_id: true } },
            },
          },
        },
      });

      if (voter) {
        can_vote =
          election.status === 'EN_COURS' && this.isEligible(voter, election);
        already_voted = !!(await this.prisma.vote.findUnique({
          where: { user_id_election_id: { user_id: userId, election_id: id } },
        }));
      }
    }

    return { ...election, can_vote, already_voted };
  }

  // ── POST /elections (admin) ───────────────────────────────────────────

  async create(dto: CreateElectionDto) {
    return this.prisma.election.create({
      data: {
        title: dto.title,
        type: dto.type,
        description: dto.description ?? null,
        geographic_scope: dto.geographic_scope,
        scope_region_id: dto.scope_region_id ?? null,
        scope_departement_id: dto.scope_departement_id ?? null,
        scope_commune_id: dto.scope_commune_id ?? null,
        start_time: new Date(dto.start_time),
        end_time: new Date(dto.end_time),
        round: dto.round ?? 1,
        parent_election_id: dto.parent_election_id ?? null,
        status: 'BROUILLON',
      },
    });
  }

  // ── PATCH /elections/:id/status (admin) ───────────────────────────────

  async advanceStatus(id: string, dto: AdvanceStatusDto) {
    const election = await this.prisma.election.findUnique({
      where: { id },
      select: { status: true },
    });

    if (!election) throw new NotFoundException('Election not found');

    const expected = STATUS_TRANSITIONS[election.status];
    if (!expected) {
      throw new BadRequestException('Election is already in its final state');
    }

    if (dto.status !== expected) {
      throw new BadRequestException(
        `Invalid transition. From ${election.status} the only allowed next status is ${expected}`,
      );
    }

    return this.prisma.election.update({
      where: { id },
      data: { status: dto.status },
    });
  }

  // ── POST /elections/:id/candidates (admin) ────────────────────────────

  async addCandidate(electionId: string, dto: CreateCandidateDto) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
      select: { status: true },
    });

    if (!election) throw new NotFoundException('Election not found');
    if (election.status !== 'BROUILLON') {
      throw new ForbiddenException('Candidates can only be added while election is in BROUILLON');
    }

    return this.prisma.candidate.create({
      data: {
        election_id: electionId,
        party_id: dto.party_id ?? null,
        first_name: dto.first_name,
        last_name: dto.last_name,
        photo_url: dto.photo_url ?? null,
        biography: dto.biography ?? null,
        program_url: dto.program_url ?? null,
        running_mate_id: dto.running_mate_id ?? null,
        nationality_verified: dto.nationality_verified ?? false,
        criminal_record_clear: dto.criminal_record_clear ?? false,
        age_verified: dto.age_verified ?? false,
      },
    });
  }

  // ── DELETE /elections/:id/candidates/:cid (admin) ─────────────────────

  async removeCandidate(electionId: string, candidateId: string) {
    const election = await this.prisma.election.findUnique({
      where: { id: electionId },
      select: { status: true },
    });

    if (!election) throw new NotFoundException('Election not found');
    if (election.status !== 'BROUILLON') {
      throw new ForbiddenException('Candidates can only be removed while election is in BROUILLON');
    }

    try {
      await this.prisma.candidate.delete({ where: { id: candidateId } });
    } catch {
      throw new NotFoundException('Candidate not found');
    }
  }

  // ── GET /elections/:id/results ────────────────────────────────────────

  async getResults(id: string, callerRole: string) {
    const election = await this.prisma.election.findUnique({
      where: { id },
      select: { id: true, title: true, status: true, geographic_scope: true },
    });

    if (!election) throw new NotFoundException('Election not found');

    if (election.status !== 'PUBLIE' && callerRole !== 'ADMIN') {
      throw new ForbiddenException('Results are not yet published');
    }

    const results = await this.prisma.electionResult.findMany({
      where: { election_id: id },
      include: {
        candidate: {
          select: {
            id: true,
            first_name: true,
            last_name: true,
            party: { select: { name: true, acronym: true } },
          },
        },
      },
      orderBy: { votes_count: 'desc' },
    });

    return { election, results };
  }
}
