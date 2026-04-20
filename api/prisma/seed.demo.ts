/**
 * seed.demo.ts — Demo seed for live presentation of the Agora Voting Platform
 *
 * Depends on the base seed (seed.ts) having been run first to populate the
 * administrative geography (regions, départements, communes, bureaux).
 *
 * Run:
 *   npm run seed:demo       (from /api)
 *   npx prisma db seed:demo (alternative)
 *
 * Passwords:
 *   Voters  → Voter@12345
 *   Admins  → Admin@12345
 */

import 'dotenv/config';
import * as crypto from 'crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Ivorian name pools ─────────────────────────────────────────────────────
const FIRST_M = [
  'Kouassi', 'Koffi', 'Konan', 'Yao', 'Amani', 'Kouakou', 'Niamkey', 'Tanoh', 'Anoh', 'Séka',
  'Oumar', 'Ibrahima', 'Moussa', 'Amadou', 'Mamadou', 'Seydou', 'Souleymane', 'Adama', 'Brahima', 'Djibril',
  'Jean', 'Pierre', 'Paul', 'Philippe', 'Henri', 'Marcel', 'Arsène', 'Théodore', 'Gervais', 'Hervé',
  'Julien', 'Robert', 'René', 'François', 'Alain', 'Bernard', 'Armand', 'Ange', 'Blaise', 'Christian',
];
const FIRST_F = [
  'Aminata', 'Fatoumata', 'Mariama', 'Awa', 'Bintou', 'Oumou', 'Nana', 'Saran', 'Adjoua', 'Affoué',
  'Amenan', 'Aya', 'Pélagie', 'Rosalie', 'Cécile', 'Marie', 'Hortense', 'Adèle', 'Chantal', 'Estelle',
  'Martine', 'Joséphine', 'Brigitte', 'Véronique', 'Sylvie', 'Florence', 'Clarisse', 'Danielle', 'Édith', 'Gloria',
];
const LAST = [
  'Koné', 'Coulibaly', 'Traoré', 'Diallo', 'Bamba', 'Sanogo', 'Doumbia', 'Diabaté', 'Touré', 'Camara',
  'Ouattara', 'Sylla', 'Fofana', 'Soro', 'Bakayoko', 'Amani', 'Aké', 'Gnonsoa', 'Gba', 'Kouassi',
  'Koffi', 'Ahi', 'Assi', 'Yacé', 'Alla', 'Brou', 'Tano', 'Niamkey', 'Gnahoré', 'Dié',
  'Ehui', 'Yapi', 'Guédé', 'Akpan', 'Kobenan', 'Kouadio', 'Bah', 'Keïta', 'Cissé', 'Kourouma',
];

// ── Helpers ────────────────────────────────────────────────────────────────
async function upsertBureau(name: string, commune_id: string, address: string, capacity: number) {
  const existing = await prisma.bureauDeVote.findFirst({ where: { name, commune_id } });
  if (existing) return existing;
  return prisma.bureauDeVote.create({ data: { name, commune_id, address, capacity } });
}

async function upsertElection(title: string, data: Record<string, unknown>) {
  const existing = await prisma.election.findFirst({ where: { title } });
  if (existing) return prisma.election.update({ where: { id: existing.id }, data });
  return prisma.election.create({ data: { title, ...data } as any });
}

async function upsertCandidate(
  election_id: string,
  first_name: string,
  last_name: string,
  data: object = {},
) {
  const existing = await prisma.candidate.findFirst({ where: { election_id, first_name, last_name } });
  if (existing) return existing;
  return prisma.candidate.create({ data: { election_id, first_name, last_name, ...data } as any });
}

async function seedVote(user_id: string, election_id: string, candidate_id: string) {
  const exists = await prisma.vote.findUnique({
    where: { user_id_election_id: { user_id, election_id } },
  });
  if (exists) return exists;
  return prisma.vote.create({
    data: {
      user_id, election_id, candidate_id,
      encrypted_vote: `demo:${Buffer.from(JSON.stringify({ election_id, candidate_id })).toString('base64')}`,
      receipt_code: crypto.randomUUID(),
    },
  });
}

async function upsertElectionResult(
  election_id: string,
  candidate_id: string,
  scope: string,
  scope_id: string | null,
  votes_count: number,
  registered_voters: number,
  turnout_percentage: number,
) {
  const existing = await prisma.electionResult.findFirst({
    where: { election_id, candidate_id, scope: scope as any, scope_id },
  });
  if (existing) {
    return prisma.electionResult.update({
      where: { id: existing.id },
      data: { votes_count, registered_voters, turnout_percentage: turnout_percentage as any },
    });
  }
  return prisma.electionResult.create({
    data: {
      election_id, candidate_id,
      scope: scope as any, scope_id,
      votes_count, registered_voters,
      turnout_percentage: turnout_percentage as any,
    },
  });
}

/**
 * Deterministic vote distribution for 4 candidates:
 *   0–49  → candidate[0]  (RHDP  ~50 %)
 *   50–74 → candidate[1]  (PDCI  ~25 %)
 *   75–91 → candidate[2]  (PPA-CI ~17 %)
 *   92–99 → candidate[3]  (IND   ~8 %)
 */
function voteWeight4(idx: number): number {
  const r = idx % 100;
  if (r < 50) return 0;
  if (r < 75) return 1;
  if (r < 92) return 2;
  return 3;
}

/**
 * Deterministic vote distribution for 2 options (referendum):
 *   0–67 → option[0]  (OUI ~68 %)
 *   68–99 → option[1]  (NON ~32 %)
 */
function voteWeight2(idx: number): number {
  return (idx % 100) < 68 ? 0 : 1;
}

// ── Main ───────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n🗳  Agora — Demo Seed\n');

  const now = new Date();

  // Fixed presentation dates
  const apr20_8am = new Date('2026-04-20T08:00:00.000Z');
  const apr20_8pm = new Date('2026-04-20T20:00:00.000Z');
  const apr23_8am = new Date('2026-04-23T08:00:00.000Z');
  const apr23_8pm = new Date('2026-04-23T20:00:00.000Z');
  const apr24_6pm = new Date('2026-04-24T18:00:00.000Z');

  // Derive status from time window so the seed stays correct across both demo dates
  const derivedStatus = (start: Date, end: Date): string => {
    if (now < start) return 'OUVERT';
    if (now > end)   return 'CLOS';
    return 'EN_COURS';
  };

  // ── 1. Geography lookup ────────────────────────────────────────────────
  const requireCommune = async (name: string) => {
    const c = await prisma.commune.findFirst({ where: { name } });
    if (!c) throw new Error(`Commune "${name}" not found — run base seed (npm run seed) first.`);
    return c;
  };

  const cCocody    = await requireCommune('Cocody');
  const cYopougon  = await requireCommune('Yopougon');
  const cAbobo     = await requireCommune('Abobo');
  const cPlateau   = await requireCommune('Plateau');
  const cBouake    = await requireCommune('Bouaké');
  const cYam       = await requireCommune('Yamoussoukro');
  const cSanPedro  = await requireCommune('San-Pédro');
  const cDaloa     = await requireCommune('Daloa');
  const cKorhogo   = await requireCommune('Korhogo');

  // Region IDs for scoped elections
  const dAbj  = await prisma.departement.findUnique({ where: { code: 'ABJ-DEP' } });
  const rAbj  = dAbj  ? await prisma.region.findUnique({ where: { id: dAbj.region_id } })  : null;
  const dBke  = await prisma.departement.findUnique({ where: { code: 'BKE' } });
  const rGbke = dBke  ? await prisma.region.findUnique({ where: { id: dBke.region_id } })  : null;

  // ── 2. Bureaux de vote ─────────────────────────────────────────────────
  const bCocody   = await upsertBureau('École Primaire Les Rosiers',   cCocody.id,  'Cocody, Abidjan',    500);
  const bYopougon = await upsertBureau('Mairie de Yopougon',           cYopougon.id,'Yopougon, Abidjan', 1000);
  const bAbobo    = await upsertBureau("Mairie d'Abobo",               cAbobo.id,   'Abobo, Abidjan',     800);
  const bPlateau  = await upsertBureau("Hôtel de Ville du Plateau",    cPlateau.id, 'Plateau, Abidjan',   300);
  const bBouake   = await upsertBureau('CEG Bouaké Centre',            cBouake.id,  'Bouaké',             600);
  const bYam      = await upsertBureau('Mairie de Yamoussoukro',       cYam.id,     'Yamoussoukro',       400);
  const bSanPedro = await upsertBureau('Lycée Moderne de San-Pédro',   cSanPedro.id,'San-Pédro',          500);
  const bDaloa    = await upsertBureau('CEG Daloa Nord',               cDaloa.id,   'Daloa',              400);
  const bKorhogo  = await upsertBureau('Lycée Municipal de Korhogo',   cKorhogo.id, 'Korhogo',            500);

  console.log('✓ Bureaux de vote ready');

  // ── 3. Political parties ───────────────────────────────────────────────
  const rhdp = await prisma.politicalParty.upsert({
    where: { acronym: 'RHDP' }, update: {},
    create: {
      name: 'Rassemblement des Houphouëtistes pour la Démocratie et la Paix',
      acronym: 'RHDP', founded_year: 2005,
      description: 'Parti au pouvoir, héritier politique de Félix Houphouët-Boigny',
    },
  });
  const pdci = await prisma.politicalParty.upsert({
    where: { acronym: 'PDCI-RDA' }, update: {},
    create: {
      name: "Parti Démocratique de Côte d'Ivoire – Rassemblement Démocratique Africain",
      acronym: 'PDCI-RDA', founded_year: 1946,
      description: "Plus ancien parti de Côte d'Ivoire",
    },
  });
  const ppaci = await prisma.politicalParty.upsert({
    where: { acronym: 'PPA-CI' }, update: {},
    create: {
      name: "Parti des Peuples Africains – Côte d'Ivoire",
      acronym: 'PPA-CI', founded_year: 2021,
      description: 'Parti de Laurent Gbagbo',
    },
  });
  const ind = await prisma.politicalParty.upsert({
    where: { acronym: 'IND' }, update: {},
    create: { name: 'Candidat Indépendant', acronym: 'IND', description: 'Sans affiliation partisane' },
  });

  console.log('✓ Political parties ready');

  // ── 4. Passwords ───────────────────────────────────────────────────────
  console.log('  Hashing passwords…');
  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const voterHash = await bcrypt.hash('Voter@12345', 10);

  // ── 5. Admin / Observer accounts ───────────────────────────────────────
  await prisma.user.upsert({
    where: { email: 'admin@agora.gov' }, update: {},
    create: {
      national_id: 'ADMIN001', email: 'admin@agora.gov', password_hash: adminHash,
      role: 'ADMIN', status: 'ACTIVE',
      first_name: 'Super', last_name: 'Administrateur',
      date_of_birth: new Date('1978-05-15'), phone_number: '+2250700000001',
      commune_id: cPlateau.id, bureau_de_vote_id: bPlateau.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'admin.abidjan@agora.gov' }, update: {},
    create: {
      national_id: 'ADMIN002', email: 'admin.abidjan@agora.gov', password_hash: adminHash,
      role: 'ADMIN', status: 'ACTIVE',
      first_name: 'Koffi', last_name: 'Annan',
      date_of_birth: new Date('1982-09-03'), phone_number: '+2250700000002',
      commune_id: cPlateau.id, bureau_de_vote_id: bPlateau.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'admin.bouake@agora.gov' }, update: {},
    create: {
      national_id: 'ADMIN003', email: 'admin.bouake@agora.gov', password_hash: adminHash,
      role: 'ADMIN', status: 'ACTIVE',
      first_name: 'Ibrahim', last_name: 'Coulibaly',
      date_of_birth: new Date('1979-12-20'), phone_number: '+2250700000003',
      commune_id: cBouake.id, bureau_de_vote_id: bBouake.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'admin.yam@agora.gov' }, update: {},
    create: {
      national_id: 'ADMIN004', email: 'admin.yam@agora.gov', password_hash: adminHash,
      role: 'ADMIN', status: 'ACTIVE',
      first_name: 'Adama', last_name: 'Koné',
      date_of_birth: new Date('1985-06-10'), phone_number: '+2250700000004',
      commune_id: cYam.id, bureau_de_vote_id: bYam.id,
    },
  });
  await prisma.user.upsert({
    where: { email: 'observateur@agora.gov' }, update: {},
    create: {
      national_id: 'ADMIN005', email: 'observateur@agora.gov', password_hash: adminHash,
      role: 'OBSERVER', status: 'ACTIVE',
      first_name: 'Awa', last_name: 'Dosso',
      date_of_birth: new Date('1990-03-25'), phone_number: '+2250700000005',
      commune_id: cCocody.id, bureau_de_vote_id: bCocody.id,
    },
  });

  console.log('✓ 5 admin/observer accounts ready');

  // ── 6. Voter generation ────────────────────────────────────────────────
  // 300 voters spread across 9 communes.
  // national_id : DEMO000001 … DEMO000300
  // email       : voter000001@demo.ci … voter000300@demo.ci
  // phone       : +22577_0000001 … +22577_0000300   (avoids base-seed collision)
  // password    : Voter@12345

  type VoterBatch = { communeId: string; bureauId: string; start: number; count: number; label: string };
  const batches: VoterBatch[] = [
    { communeId: cCocody.id,   bureauId: bCocody.id,   start: 1,   count: 80, label: 'Cocody'        },
    { communeId: cYopougon.id, bureauId: bYopougon.id, start: 81,  count: 80, label: 'Yopougon'      },
    { communeId: cAbobo.id,    bureauId: bAbobo.id,    start: 161, count: 60, label: 'Abobo'          },
    { communeId: cBouake.id,   bureauId: bBouake.id,   start: 221, count: 30, label: 'Bouaké'         },
    { communeId: cYam.id,      bureauId: bYam.id,      start: 251, count: 20, label: 'Yamoussoukro'   },
    { communeId: cPlateau.id,  bureauId: bPlateau.id,  start: 271, count: 15, label: 'Plateau'        },
    { communeId: cSanPedro.id, bureauId: bSanPedro.id, start: 286, count: 8,  label: 'San-Pédro'     },
    { communeId: cDaloa.id,    bureauId: bDaloa.id,    start: 294, count: 7,  label: 'Daloa'          },
  ];

  // votersByCommuneId[communeId] = array of { id, idx } (idx is 0-based global index)
  const votersByCommuneId: Record<string, { id: string; idx: number }[]> = {};

  for (const batch of batches) {
    votersByCommuneId[batch.communeId] = [];
    for (let i = batch.start; i < batch.start + batch.count; i++) {
      const idx  = i - 1;                                     // 0-based global index
      const pad  = String(i).padStart(6, '0');
      const male = i % 2 === 0;
      const fn   = male ? FIRST_M[idx % FIRST_M.length] : FIRST_F[idx % FIRST_F.length];
      const ln   = LAST[idx % LAST.length];
      const year = 1955 + (idx % 45);
      const mon  = String((idx % 12) + 1).padStart(2, '0');
      const day  = String((idx % 28) + 1).padStart(2, '0');

      const voter = await prisma.user.upsert({
        where: { email: `voter${pad}@demo.ci` },
        update: {},
        create: {
          national_id:       `DEMO${pad}`,
          email:             `voter${pad}@demo.ci`,
          password_hash:     voterHash,
          role:              'VOTER',
          status:            'ACTIVE',
          first_name:        fn,
          last_name:         ln,
          date_of_birth:     new Date(`${year}-${mon}-${day}`),
          phone_number:      `+22577${String(i).padStart(7, '0')}`,
          commune_id:        batch.communeId,
          bureau_de_vote_id: batch.bureauId,
        },
      });
      votersByCommuneId[batch.communeId].push({ id: voter.id, idx });
    }
    console.log(`  ✓ ${batch.count} voters — ${batch.label}`);
  }

  // Voter groups for scoped elections
  const allVoters      = Object.values(votersByCommuneId).flat();
  const abidjanVoters  = [
    ...votersByCommuneId[cCocody.id],
    ...votersByCommuneId[cYopougon.id],
    ...votersByCommuneId[cAbobo.id],
    ...votersByCommuneId[cPlateau.id],
  ];
  const cocodyVoters   = votersByCommuneId[cCocody.id];
  const yopougonVoters = votersByCommuneId[cYopougon.id];
  const aboboVoters    = votersByCommuneId[cAbobo.id];
  const bouakeVoters   = votersByCommuneId[cBouake.id];

  console.log(`✓ ${allVoters.length} demo voters seeded\n`);

  // ── 7. Elections ────────────────────────────────────────────────────────
  console.log('  Creating elections…');

  // ════════════════════════════════════════════════════════
  //  PUBLIE — past elections with official results published
  // ════════════════════════════════════════════════════════

  // [1] Présidentielle 2025 — 21 sept 2025
  const pres25 = await upsertElection('Présidentielle 2025', {
    type: 'PRESIDENTIELLE', status: 'PUBLIE', geographic_scope: 'NATIONAL',
    description: "Élection du Président de la République de Côte d'Ivoire — scrutin quinquennal du 21 septembre 2025.",
    start_time: new Date('2025-09-21T08:00:00.000Z'),
    end_time:   new Date('2025-09-21T20:00:00.000Z'),
  });
  const p25_ouat  = await upsertCandidate(pres25.id, 'Alassane', 'Ouattara',     { party_id: rhdp.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Président sortant, économiste international — 3e mandat." });
  const p25_thiam = await upsertCandidate(pres25.id, 'Tidjane',  'Thiam',        { party_id: pdci.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Ancien PDG de Credit Suisse, candidat PDCI-RDA." });
  const p25_gbag  = await upsertCandidate(pres25.id, 'Laurent',  'Gbagbo',       { party_id: ppaci.id, nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Ancien Président acquitté par la CPI, fondateur du PPA-CI." });
  const p25_kkb   = await upsertCandidate(pres25.id, 'Kouadio',  'Konan Bertin', { party_id: ind.id,   nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Candidat indépendant, ancienne tentative 2020." });

  // [2] Régionales District Abidjan 2025 — 10 nov 2025
  const regAbj25 = await upsertElection('Régionales District Abidjan 2025', {
    type: 'REGIONALES', status: 'PUBLIE', geographic_scope: 'REGIONAL',
    description: "Élections régionales pour le District Autonome d'Abidjan — 10 novembre 2025.",
    start_time: new Date('2025-11-10T08:00:00.000Z'),
    end_time:   new Date('2025-11-10T20:00:00.000Z'),
    scope_region_id: rAbj?.id ?? null,
  });
  const ra25_dial = await upsertCandidate(regAbj25.id, 'Ibrahim',   'Diallo',  { party_id: rhdp.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const ra25_lago = await upsertCandidate(regAbj25.id, 'Henriette', 'Lago',    { party_id: pdci.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const ra25_gnam = await upsertCandidate(regAbj25.id, 'Sylvain',   'Gnamien', { party_id: ind.id,   nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // [3] Référendum Révision Constitutionnelle 2025 — 7 déc 2025
  const ref25 = await upsertElection('Référendum Révision Constitutionnelle 2025', {
    type: 'REFERENDUM', status: 'PUBLIE', geographic_scope: 'NATIONAL',
    description: "Référendum sur la révision de la Constitution de la 3e République — 7 décembre 2025.",
    start_time: new Date('2025-12-07T08:00:00.000Z'),
    end_time:   new Date('2025-12-07T20:00:00.000Z'),
  });
  const r25_oui = await upsertCandidate(ref25.id, 'OUI', 'Pour la révision constitutionnelle',   { nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const r25_non = await upsertCandidate(ref25.id, 'NON', 'Contre la révision constitutionnelle', { nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // [4] Législatives Nationales 2026 — Tour 1 — 8 fév 2026
  const leg26 = await upsertElection('Législatives Nationales 2026 — Tour 1', {
    type: 'LEGISLATIVES', status: 'PUBLIE', geographic_scope: 'NATIONAL',
    description: "Premier tour des élections législatives — renouvellement de l'Assemblée Nationale — 8 février 2026.",
    start_time: new Date('2026-02-08T08:00:00.000Z'),
    end_time:   new Date('2026-02-08T20:00:00.000Z'),
  });
  const l26_coul  = await upsertCandidate(leg26.id, 'Amadou',    'Coulibaly', { party_id: rhdp.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const l26_dosso = await upsertCandidate(leg26.id, 'Mariam',    'Dosso',     { party_id: pdci.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const l26_bict  = await upsertCandidate(leg26.id, 'Adama',     'Bictogo',   { party_id: ppaci.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const l26_soro  = await upsertCandidate(leg26.id, 'Guillaume', 'Soro',      { party_id: ind.id,   nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // [5] Municipales Cocody 2026 — 15 mars 2026
  const munCoc26 = await upsertElection('Municipales Cocody 2026', {
    type: 'MUNICIPALES', status: 'PUBLIE', geographic_scope: 'COMMUNAL',
    description: "Élections municipales pour la commune de Cocody — 15 mars 2026.",
    start_time: new Date('2026-03-15T08:00:00.000Z'),
    end_time:   new Date('2026-03-15T20:00:00.000Z'),
    scope_commune_id: cCocody.id,
  });
  const mc_yace   = await upsertCandidate(munCoc26.id, 'Jean-Marc', 'Yacé',   { party_id: rhdp.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const mc_assi   = await upsertCandidate(munCoc26.id, 'Estelle',   'Assi',   { party_id: pdci.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const mc_akpata = await upsertCandidate(munCoc26.id, 'Romuald',   'Akpata', { party_id: ind.id,   nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // ════════════════════════════════════════════════════════
  //  CLOS — ended recently, results not yet published
  // ════════════════════════════════════════════════════════

  // [6] Municipales Abobo 2026 — 13 avril 2026 (last week)
  const munAbo26 = await upsertElection('Municipales Abobo 2026', {
    type: 'MUNICIPALES', status: 'CLOS', geographic_scope: 'COMMUNAL',
    description: "Élections municipales pour la commune d'Abobo — 13 avril 2026.",
    start_time: new Date('2026-04-13T08:00:00.000Z'),
    end_time:   new Date('2026-04-13T20:00:00.000Z'),
    scope_commune_id: cAbobo.id,
  });
  const ma26_bamba = await upsertCandidate(munAbo26.id, 'Adama',     'Bamba', { party_id: rhdp.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const ma26_toure = await upsertCandidate(munAbo26.id, 'Fatoumata', 'Touré', { party_id: ppaci.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const ma26_kone  = await upsertCandidate(munAbo26.id, 'Seydou',    'Koné',  { party_id: ind.id,   nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // ════════════════════════════════════════════════════════
  //  TODAY — 20 April 2026 (EN_COURS during demo day #1)
  // ════════════════════════════════════════════════════════

  const todayStatus = derivedStatus(apr20_8am, apr20_8pm);

  // [7] Référendum Transformation Numérique 2026 — ouverture 20 avril
  const refNum26 = await upsertElection('Référendum Transformation Numérique 2026', {
    type: 'REFERENDUM', status: todayStatus, geographic_scope: 'NATIONAL',
    description: "Référendum sur l'introduction du vote électronique sécurisé et la transformation numérique des services publics.",
    start_time: apr20_8am, end_time: apr20_8pm,
  });
  const rn26_oui = await upsertCandidate(refNum26.id, 'OUI', 'Pour la transformation numérique',   { nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const rn26_non = await upsertCandidate(refNum26.id, 'NON', 'Contre la transformation numérique', { nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // [8] Législatives Spéciales Yopougon 2026 — ouverture 20 avril
  const legYop26 = await upsertElection('Législatives Spéciales Yopougon 2026', {
    type: 'LEGISLATIVES', status: todayStatus, geographic_scope: 'COMMUNAL',
    description: "Élection législative partielle pour la circonscription de Yopougon-Centre.",
    start_time: apr20_8am, end_time: apr20_8pm,
    scope_commune_id: cYopougon.id,
  });
  const ly26_gnene  = await upsertCandidate(legYop26.id, 'Gnénéfoly', 'Ouattara', { party_id: rhdp.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const ly26_kob    = await upsertCandidate(legYop26.id, 'Séraphin',  'Kobenan',  { party_id: pdci.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const ly26_diallo = await upsertCandidate(legYop26.id, 'Fatou',     'Diallo',   { party_id: ppaci.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // ════════════════════════════════════════════════════════
  //  NEXT WEDNESDAY — 23 April 2026 (OUVERT / EN_COURS on demo day #2)
  // ════════════════════════════════════════════════════════

  const wedStatus = derivedStatus(apr23_8am, apr23_8pm);

  // [9] Présidentielle 2026 — Tour 1 — ouverture 23 avril
  const pres26 = await upsertElection('Présidentielle 2026 — Tour 1', {
    type: 'PRESIDENTIELLE', status: wedStatus, geographic_scope: 'NATIONAL',
    description: "Premier tour de l'élection présidentielle — scrutin quinquennal 2026.",
    start_time: apr23_8am, end_time: apr24_6pm,
  });
  const pr26_ouat  = await upsertCandidate(pres26.id, 'Alassane', 'Ouattara',     { party_id: rhdp.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Président sortant — candidature au 4e mandat." });
  const pr26_thiam = await upsertCandidate(pres26.id, 'Tidjane',  'Thiam',        { party_id: pdci.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Leader de l'opposition PDCI-RDA." });
  const pr26_gbag  = await upsertCandidate(pres26.id, 'Laurent',  'Gbagbo',       { party_id: ppaci.id, nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Candidat du PPA-CI, retour aux urnes." });
  const pr26_kkb   = await upsertCandidate(pres26.id, 'Kouadio',  'Konan Bertin', { party_id: ind.id,   nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "3e candidature présidentielle indépendante." });

  // [10] Régionales Gbêkê 2026 — ouverture 23 avril
  const regGbe26 = await upsertElection('Régionales Gbêkê 2026', {
    type: 'REGIONALES', status: wedStatus, geographic_scope: 'REGIONAL',
    description: "Élections régionales pour la région du Gbêkê (Bouaké) — 23 avril 2026.",
    start_time: apr23_8am, end_time: apr23_8pm,
    scope_region_id: rGbke?.id ?? null,
  });
  const rg26_nave = await upsertCandidate(regGbe26.id, 'Koné',    'Navigué',   { party_id: rhdp.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const rg26_coul = await upsertCandidate(regGbe26.id, 'Yves',    'Coulibaly', { party_id: pdci.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const rg26_sang = await upsertCandidate(regGbe26.id, 'Aïssa',   'Sanogo',    { party_id: ind.id,   nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // [11] Municipales Bouaké 2026 — ouverture 23 avril
  const munBka26 = await upsertElection('Municipales Bouaké 2026', {
    type: 'MUNICIPALES', status: wedStatus, geographic_scope: 'COMMUNAL',
    description: "Élections municipales pour la ville de Bouaké — 23 avril 2026.",
    start_time: apr23_8am, end_time: apr23_8pm,
    scope_commune_id: cBouake.id,
  });
  const mb26_tall    = await upsertCandidate(munBka26.id, 'Sory',    'Tall',    { party_id: rhdp.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const mb26_silue   = await upsertCandidate(munBka26.id, 'Mariame', 'Silué',   { party_id: pdci.id,  nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const mb26_sang    = await upsertCandidate(munBka26.id, 'Lacine',  'Sangaré', { party_id: ind.id,   nationality_verified: true, criminal_record_clear: true, age_verified: true });

  console.log('✓ 11 elections and candidates seeded');

  // ── 8. Official election results (PUBLIE elections) ────────────────────
  console.log('  Seeding official results…');

  const NAT_REG = 7_500_000; // national registered voters (CI 2025)

  // [1] Présidentielle 2025 — 68.4 % turnout
  const p25_total = Math.round(NAT_REG * 0.684);
  await upsertElectionResult(pres25.id, p25_ouat.id,  'NATIONAL', null, Math.round(p25_total * 0.543), NAT_REG, 68.40);
  await upsertElectionResult(pres25.id, p25_thiam.id, 'NATIONAL', null, Math.round(p25_total * 0.271), NAT_REG, 68.40);
  await upsertElectionResult(pres25.id, p25_gbag.id,  'NATIONAL', null, Math.round(p25_total * 0.152), NAT_REG, 68.40);
  await upsertElectionResult(pres25.id, p25_kkb.id,   'NATIONAL', null, Math.round(p25_total * 0.034), NAT_REG, 68.40);

  // [2] Régionales Abidjan 2025 — 55.1 % turnout (regional)
  const ra25_reg   = 2_800_000;
  const ra25_total = Math.round(ra25_reg * 0.551);
  await upsertElectionResult(regAbj25.id, ra25_dial.id, 'REGIONAL', rAbj?.id ?? null, Math.round(ra25_total * 0.524), ra25_reg, 55.10);
  await upsertElectionResult(regAbj25.id, ra25_lago.id, 'REGIONAL', rAbj?.id ?? null, Math.round(ra25_total * 0.319), ra25_reg, 55.10);
  await upsertElectionResult(regAbj25.id, ra25_gnam.id, 'REGIONAL', rAbj?.id ?? null, Math.round(ra25_total * 0.157), ra25_reg, 55.10);

  // [3] Référendum Révision Constitutionnelle 2025 — 61.2 % turnout
  const r25_total = Math.round(NAT_REG * 0.612);
  await upsertElectionResult(ref25.id, r25_oui.id, 'NATIONAL', null, Math.round(r25_total * 0.687), NAT_REG, 61.20);
  await upsertElectionResult(ref25.id, r25_non.id, 'NATIONAL', null, Math.round(r25_total * 0.313), NAT_REG, 61.20);

  // [4] Législatives 2026 — Tour 1 — 52.8 % turnout
  const l26_total = Math.round(NAT_REG * 0.528);
  await upsertElectionResult(leg26.id, l26_coul.id,  'NATIONAL', null, Math.round(l26_total * 0.432), NAT_REG, 52.80);
  await upsertElectionResult(leg26.id, l26_dosso.id, 'NATIONAL', null, Math.round(l26_total * 0.287), NAT_REG, 52.80);
  await upsertElectionResult(leg26.id, l26_bict.id,  'NATIONAL', null, Math.round(l26_total * 0.189), NAT_REG, 52.80);
  await upsertElectionResult(leg26.id, l26_soro.id,  'NATIONAL', null, Math.round(l26_total * 0.092), NAT_REG, 52.80);

  // [5] Municipales Cocody 2026 — 47.3 % turnout (communal)
  const mc_reg   = 180_000;
  const mc_total = Math.round(mc_reg * 0.473);
  await upsertElectionResult(munCoc26.id, mc_yace.id,   'COMMUNAL', cCocody.id, Math.round(mc_total * 0.485), mc_reg, 47.30);
  await upsertElectionResult(munCoc26.id, mc_assi.id,   'COMMUNAL', cCocody.id, Math.round(mc_total * 0.352), mc_reg, 47.30);
  await upsertElectionResult(munCoc26.id, mc_akpata.id, 'COMMUNAL', cCocody.id, Math.round(mc_total * 0.163), mc_reg, 47.30);

  console.log('✓ Official results seeded');

  // ── 9. Votes ───────────────────────────────────────────────────────────
  console.log('  Seeding votes…');

  async function voteAll(
    voters: { id: string; idx: number }[],
    electionId: string,
    candidates: { id: string }[],
    weightFn: (idx: number) => number,
  ) {
    for (const v of voters) {
      await seedVote(v.id, electionId, candidates[weightFn(v.idx)].id);
    }
  }

  // ── PUBLIE: full participation in past elections ────────────────────────

  // Présidentielle 2025 — all 300 voters voted
  await voteAll(allVoters, pres25.id, [p25_ouat, p25_thiam, p25_gbag, p25_kkb], voteWeight4);

  // Régionales Abidjan 2025 — Abidjan-district voters only
  await voteAll(abidjanVoters, regAbj25.id, [ra25_dial, ra25_lago, ra25_gnam], voteWeight4);

  // Référendum Constitution 2025 — all voters
  await voteAll(allVoters, ref25.id, [r25_oui, r25_non], voteWeight2);

  // Législatives 2026 — all voters
  await voteAll(allVoters, leg26.id, [l26_coul, l26_dosso, l26_bict, l26_soro], voteWeight4);

  // Municipales Cocody 2026 — Cocody voters only
  await voteAll(cocodyVoters, munCoc26.id, [mc_yace, mc_assi, mc_akpata], voteWeight4);

  // ── CLOS: majority voted (70 % of Abobo voters) ────────────────────────
  const aboboVoted = aboboVoters.filter((_, i) => i % 10 < 7);
  await voteAll(aboboVoted, munAbo26.id, [ma26_bamba, ma26_toure, ma26_kone], voteWeight4);

  // ── EN_COURS (April 20): partial votes (~25 %) ─────────────────────────
  // Voters at positions i % 4 === 0 have already voted.
  // The remaining 75 % are available for live demo.
  const alreadyVotedRef = allVoters.filter((_, i) => i % 4 === 0);
  await voteAll(alreadyVotedRef, refNum26.id, [rn26_oui, rn26_non], voteWeight2);

  // Yopougon législatives: first 30 % of Yopougon voters have voted
  const yopAlreadyVoted = yopougonVoters.filter((_, i) => i % 10 < 3);
  await voteAll(yopAlreadyVoted, legYop26.id, [ly26_gnene, ly26_kob, ly26_diallo], voteWeight4);

  // April 23 elections: no votes yet (they're OUVERT / future)

  console.log('✓ Votes seeded');

  // ── 10. Summary ─────────────────────────────────────────────────────────
  const pad = (s: string, n = 9) => s.padEnd(n);
  console.log('\n══════════════════════════════════════════════════════════════════════');
  console.log('  DEMO SEED COMPLETE — Agora Voting Platform');
  console.log(`  Voters: ${allVoters.length}  |  Admins/Observers: 5  |  Elections: 11`);
  console.log('══════════════════════════════════════════════════════════════════════');
  console.log(`  ${pad('PUBLIE')}  Présidentielle 2025                  (national  21/09/2025)`);
  console.log(`  ${pad('PUBLIE')}  Régionales District Abidjan 2025     (regional  10/11/2025)`);
  console.log(`  ${pad('PUBLIE')}  Référendum Révision Constitution 2025 (national  07/12/2025)`);
  console.log(`  ${pad('PUBLIE')}  Législatives 2026 — Tour 1           (national  08/02/2026)`);
  console.log(`  ${pad('PUBLIE')}  Municipales Cocody 2026              (communal  15/03/2026)`);
  console.log(`  ${pad('CLOS')}    Municipales Abobo 2026               (communal  13/04/2026)`);
  console.log(`  ${pad(todayStatus)}  Référendum Transformation Numérique  (national  20/04/2026)`);
  console.log(`  ${pad(todayStatus)}  Législatives Spéciales Yopougon      (communal  20/04/2026)`);
  console.log(`  ${pad(wedStatus)}  Présidentielle 2026 — Tour 1         (national  23/04/2026)`);
  console.log(`  ${pad(wedStatus)}  Régionales Gbêkê 2026                (regional  23/04/2026)`);
  console.log(`  ${pad(wedStatus)}  Municipales Bouaké 2026              (communal  23/04/2026)`);
  console.log('──────────────────────────────────────────────────────────────────────');
  console.log('  ADMIN ACCOUNTS  —  password: Admin@12345');
  console.log('  admin@agora.gov          Super Admin');
  console.log('  admin.abidjan@agora.gov  Admin Abidjan');
  console.log('  admin.bouake@agora.gov   Admin Bouaké');
  console.log('  admin.yam@agora.gov      Admin Yamoussoukro');
  console.log('  observateur@agora.gov    Observateur (lecture seule)');
  console.log('──────────────────────────────────────────────────────────────────────');
  console.log('  VOTER ACCOUNTS  —  password: Voter@12345');
  console.log('  voter000001@demo.ci … voter000080@demo.ci  Cocody       (80 voters)');
  console.log('  voter000081@demo.ci … voter000160@demo.ci  Yopougon     (80 voters)');
  console.log('  voter000161@demo.ci … voter000220@demo.ci  Abobo        (60 voters)');
  console.log('  voter000221@demo.ci … voter000250@demo.ci  Bouaké       (30 voters)');
  console.log('  voter000251@demo.ci … voter000270@demo.ci  Yamoussoukro (20 voters)');
  console.log('  voter000271@demo.ci … voter000285@demo.ci  Plateau      (15 voters)');
  console.log('  voter000286@demo.ci … voter000293@demo.ci  San-Pédro     (8 voters)');
  console.log('  voter000294@demo.ci … voter000300@demo.ci  Daloa         (7 voters)');
  console.log('──────────────────────────────────────────────────────────────────────');
  console.log('  FRESH VOTERS (have NOT yet voted in active elections):');
  console.log('  voter000002@demo.ci  Cocody    — can vote Réf. Numérique + Présidentielle 26');
  console.log('  voter000084@demo.ci  Yopougon  — can vote Législ. Yopougon + Réf. Numérique');
  console.log('  voter000162@demo.ci  Abobo     — can vote Réf. Numérique + Présidentielle 26');
  console.log('  voter000222@demo.ci  Bouaké    — can vote Régionales Gbêkê + Présidentielle 26');
  console.log('══════════════════════════════════════════════════════════════════════\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
