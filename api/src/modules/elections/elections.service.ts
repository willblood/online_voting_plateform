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

  // ── GET /elections/browse (public — unauthenticated) ─────────────────

  async findBrowseable() {
    const elections = await this.prisma.election.findMany({
      where: { status: { in: ['OUVERT', 'EN_COURS', 'PUBLIE'] } },
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
        scope_region: { select: { name: true } },
        scope_departement: { select: { name: true } },
        scope_commune: { select: { name: true } },
      },
      orderBy: { end_time: 'asc' },
    });

    return elections.map((el) => ({
      id: el.id,
      title: el.title,
      type: el.type,
      status: el.status,
      description: el.description,
      geographic_scope: el.geographic_scope,
      scope_name:
        el.scope_region?.name ?? el.scope_departement?.name ?? el.scope_commune?.name ?? null,
      start_time: el.start_time,
      end_time: el.end_time,
      round: el.round,
      updated_at: el.updated_at,
      total_votes: el._count.votes,
      candidates: el.candidates.map((c) => ({
        id: c.id,
        first_name: c.first_name,
        last_name: c.last_name,
        party: c.party,
        votes_count: el.status === 'PUBLIE' ? (c.results[0]?.votes_count ?? 0) : null,
        registered_voters:
          el.status === 'PUBLIE' ? (c.results[0]?.registered_voters ?? 0) : null,
        turnout_percentage:
          el.status === 'PUBLIE' ? Number(c.results[0]?.turnout_percentage ?? 0) : null,
      })),
    }));
  }

  // ── GET /elections/public ─────────────────────────────────────────────

  async findPublic() {
    const elections = await this.prisma.election.findMany({
      where: { status: 'PUBLIE' },
      include: {
        candidates: {
          include: {
            party: { select: { name: true, acronym: true } },
            results: {
              select: {
                scope: true,
                scope_id: true,
                votes_count: true,
                registered_voters: true,
                turnout_percentage: true,
              },
            },
          },
        },
        _count: { select: { votes: true } },
      },
      orderBy: { end_time: 'desc' },
    });

    // Collect distinct region scope_ids to resolve names in bulk
    const regionScopeIds = new Set<string>();
    for (const el of elections) {
      for (const cand of el.candidates) {
        for (const r of cand.results) {
          if (r.scope === 'REGIONAL' && r.scope_id) {
            regionScopeIds.add(r.scope_id);
          }
        }
      }
    }

    const regionMap = new Map<string, string>();
    if (regionScopeIds.size > 0) {
      const regions = await this.prisma.region.findMany({
        where: { id: { in: [...regionScopeIds] } },
        select: { id: true, name: true },
      });
      for (const reg of regions) regionMap.set(reg.id, reg.name);
    }

    return elections.map((el) => {
      const nationalResults = el.candidates.map((c) => {
        const nat = c.results.find((r) => r.scope === 'NATIONAL' && !r.scope_id);
        return {
          candidate_id: c.id,
          first_name: c.first_name,
          last_name: c.last_name,
          party: c.party,
          votes_count: nat?.votes_count ?? 0,
          registered_voters: nat?.registered_voters ?? 0,
          turnout_percentage: nat ? Number(nat.turnout_percentage) : 0,
        };
      });

      const totalVotes = nationalResults.reduce((s, r) => s + r.votes_count, 0);
      const registeredVoters = nationalResults[0]?.registered_voters ?? 0;

      // Group regional results by scope_id
      const regionGroups = new Map<string, { region_name: string; candidates: typeof nationalResults }>();
      for (const c of el.candidates) {
        for (const r of c.results) {
          if (r.scope === 'REGIONAL' && r.scope_id) {
            if (!regionGroups.has(r.scope_id)) {
              regionGroups.set(r.scope_id, {
                region_name: regionMap.get(r.scope_id) ?? r.scope_id,
                candidates: [],
              });
            }
            regionGroups.get(r.scope_id)!.candidates.push({
              candidate_id: c.id,
              first_name: c.first_name,
              last_name: c.last_name,
              party: c.party,
              votes_count: r.votes_count,
              registered_voters: r.registered_voters,
              turnout_percentage: Number(r.turnout_percentage),
            });
          }
        }
      }

      return {
        id: el.id,
        title: el.title,
        type: el.type,
        updated_at: el.updated_at,
        total_votes: totalVotes,
        registered_voters: registeredVoters,
        national_results: nationalResults,
        regional_breakdown: [...regionGroups.entries()].map(([id, g]) => ({
          region_id: id,
          region_name: g.region_name,
          candidates: g.candidates,
        })),
      };
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

    // Voters and observers may only access non-draft elections
    if (userRole !== 'ADMIN' && election.status === 'BROUILLON') {
      throw new NotFoundException('Election not found');
    }

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
    } catch (e: unknown) {
      if (typeof e === 'object' && e !== null && (e as { code?: string }).code === 'P2025') {
        throw new NotFoundException('Candidate not found');
      }
      throw e;
    }
  }

  // ── GET /elections/stats (admin) ─────────────────────────────────────

  async getStats() {
    const [totalElections, statusCounts, totalVoters, activeVoters, totalParties, totalVotesCast] =
      await Promise.all([
        this.prisma.election.count(),
        this.prisma.election.groupBy({ by: ['status'], _count: { id: true } }),
        this.prisma.user.count({ where: { role: 'VOTER' } }),
        this.prisma.user.count({ where: { role: 'VOTER', status: 'ACTIVE' } }),
        this.prisma.politicalParty.count(),
        this.prisma.vote.count(),
      ]);

    const byStatus: Record<string, number> = {};
    for (const row of statusCounts) byStatus[row.status] = row._count.id;

    return {
      elections: {
        total: totalElections,
        brouillon: byStatus['BROUILLON'] ?? 0,
        ouvert: byStatus['OUVERT'] ?? 0,
        en_cours: byStatus['EN_COURS'] ?? 0,
        clos: byStatus['CLOS'] ?? 0,
        publie: byStatus['PUBLIE'] ?? 0,
      },
      voters: { total: totalVoters, active: activeVoters },
      parties: totalParties,
      votes_cast: totalVotesCast,
    };
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
