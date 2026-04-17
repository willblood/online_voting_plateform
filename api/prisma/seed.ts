import 'dotenv/config';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding Côte d\'Ivoire geography...');

  // ── Regions ────────────────────────────────────────────────────────────────

  const regionAbidjan = await prisma.region.upsert({
    where: { name: 'Abidjan' },
    update: {},
    create: { name: 'Abidjan', code: 'AB', population: 5000000 },
  });

  const regionYamoussoukro = await prisma.region.upsert({
    where: { name: 'Yamoussoukro' },
    update: {},
    create: { name: 'Yamoussoukro', code: 'YAM', population: 355000 },
  });

  const regionBouake = await prisma.region.upsert({
    where: { name: 'Bouaké' },
    update: {},
    create: { name: 'Bouaké', code: 'BK', population: 900000 },
  });

  const regionDaloa = await prisma.region.upsert({
    where: { name: 'Daloa' },
    update: {},
    create: { name: 'Daloa', code: 'DL', population: 450000 },
  });

  // ── Départements ──────────────────────────────────────────────────────────

  const deptCocody = await prisma.departement.upsert({
    where: { code: 'COCODY' },
    update: {},
    create: { region_id: regionAbidjan.id, name: 'Cocody', code: 'COCODY', population: 700000 },
  });

  const deptYopougon = await prisma.departement.upsert({
    where: { code: 'YOPOUGON' },
    update: {},
    create: { region_id: regionAbidjan.id, name: 'Yopougon', code: 'YOPOUGON', population: 1200000 },
  });

  const deptAbobo = await prisma.departement.upsert({
    where: { code: 'ABOBO' },
    update: {},
    create: { region_id: regionAbidjan.id, name: 'Abobo', code: 'ABOBO', population: 900000 },
  });

  const deptYamoussoukro = await prisma.departement.upsert({
    where: { code: 'YAMOUSSOUKRO' },
    update: {},
    create: { region_id: regionYamoussoukro.id, name: 'Yamoussoukro', code: 'YAMOUSSOUKRO', population: 320000 },
  });

  const deptBouake = await prisma.departement.upsert({
    where: { code: 'BOUAKE' },
    update: {},
    create: { region_id: regionBouake.id, name: 'Bouaké', code: 'BOUAKE', population: 800000 },
  });

  const deptDaloa = await prisma.departement.upsert({
    where: { code: 'DALOA' },
    update: {},
    create: { region_id: regionDaloa.id, name: 'Daloa', code: 'DALOA', population: 400000 },
  });

  // ── Communes — upsert by name + departement_id ───────────────────────────

  // Helper: find or create commune (no unique constraint on name alone)
  async function upsertCommune(name: string, departement_id: string, population: number) {
    const existing = await prisma.commune.findFirst({ where: { name, departement_id } });
    if (existing) return existing;
    return prisma.commune.create({ data: { name, departement_id, population } });
  }

  const communeCocody       = await upsertCommune('Cocody',       deptCocody.id,       430000);
  const communeBingerville  = await upsertCommune('Bingerville',  deptCocody.id,       120000);
  const communeYopougon     = await upsertCommune('Yopougon',     deptYopougon.id,    1000000);
  const communeAbobo        = await upsertCommune('Abobo',        deptAbobo.id,        750000);
  const communeYamoussoukro = await upsertCommune('Yamoussoukro', deptYamoussoukro.id, 280000);
  const communeBouake       = await upsertCommune('Bouaké',       deptBouake.id,       650000);
  const communeDaloa        = await upsertCommune('Daloa',        deptDaloa.id,        300000);

  // ── Bureaux de vote ───────────────────────────────────────────────────────

  async function upsertBureau(name: string, commune_id: string, address: string, capacity: number) {
    const existing = await prisma.bureauDeVote.findFirst({ where: { name, commune_id } });
    if (existing) return existing;
    return prisma.bureauDeVote.create({ data: { name, commune_id, address, capacity } });
  }

  const bureauRosiers     = await upsertBureau("École Primaire Les Rosiers",   communeCocody.id,       'Cocody, Abidjan',  500);
  await                      upsertBureau("Lycée Technique d'Abidjan",         communeCocody.id,       'Cocody, Abidjan',  800);
  const bureauYopougon    = await upsertBureau('Mairie de Yopougon',            communeYopougon.id,     'Yopougon, Abidjan', 1000);
  const bureauYamoussoukro= await upsertBureau('École Jacques AKA',             communeYamoussoukro.id, 'Yamoussoukro',     400);
  const bureauBouake      = await upsertBureau('CEG Bouaké Centre',             communeBouake.id,       'Bouaké',           600);

  // ── Political parties ─────────────────────────────────────────────────────

  const rhdp = await prisma.politicalParty.upsert({
    where: { acronym: 'RHDP' },
    update: {},
    create: {
      name: 'Rassemblement des Houphouëtistes pour la Démocratie et la Paix',
      acronym: 'RHDP', founded_year: 2005,
      description: 'Parti au pouvoir, héritier politique de Félix Houphouët-Boigny',
    },
  });

  const pdci = await prisma.politicalParty.upsert({
    where: { acronym: 'PDCI-RDA' },
    update: {},
    create: {
      name: 'Parti Démocratique de Côte d\'Ivoire – Rassemblement Démocratique Africain',
      acronym: 'PDCI-RDA', founded_year: 1946,
      description: 'Plus ancien parti de Côte d\'Ivoire',
    },
  });

  const ppaci = await prisma.politicalParty.upsert({
    where: { acronym: 'PPA-CI' },
    update: {},
    create: {
      name: 'Parti des Peuples Africains – Côte d\'Ivoire',
      acronym: 'PPA-CI', founded_year: 2021,
      description: 'Parti de Laurent Gbagbo',
    },
  });

  const independant = await prisma.politicalParty.upsert({
    where: { acronym: 'IND' },
    update: {},
    create: { name: 'Candidat Indépendant', acronym: 'IND', description: 'Sans affiliation partisane' },
  });

  // ── Demo elections ────────────────────────────────────────────────────────

  const now = new Date();
  const votingStart = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const votingEnd   = new Date(now.getTime() + 10 * 60 * 60 * 1000);

  async function upsertElection(title: string, data: object) {
    const existing = await prisma.election.findFirst({ where: { title } });
    if (existing) return existing;
    return prisma.election.create({ data: data as any });
  }

  const presidentielle = await upsertElection('Élection Présidentielle 2026', {
    title: 'Élection Présidentielle 2026',
    type: 'PRESIDENTIELLE', status: 'EN_COURS', geographic_scope: 'NATIONAL',
    description: 'Élection du Président de la République de Côte d\'Ivoire pour un mandat de 5 ans.',
    start_time: votingStart, end_time: votingEnd,
  });

  const legislativesCocody = await upsertElection('Législatives Cocody 2026', {
    title: 'Législatives Cocody 2026',
    type: 'LEGISLATIVES', status: 'EN_COURS', geographic_scope: 'DEPARTEMENTAL',
    scope_departement_id: deptCocody.id,
    description: 'Élection des députés du département de Cocody à l\'Assemblée Nationale.',
    start_time: votingStart, end_time: votingEnd,
  });

  const municipalesYopougon = await upsertElection('Municipales Yopougon 2026', {
    title: 'Municipales Yopougon 2026',
    type: 'MUNICIPALES', status: 'OUVERT', geographic_scope: 'COMMUNAL',
    scope_commune_id: communeYopougon.id,
    description: 'Élection du Conseil Municipal de Yopougon.',
    start_time: new Date(now.getTime() + 24 * 60 * 60 * 1000),
    end_time:   new Date(now.getTime() + 25 * 60 * 60 * 1000),
  });

  await upsertElection('Régionales Abidjan 2026', {
    title: 'Régionales Abidjan 2026',
    type: 'REGIONALES', status: 'BROUILLON', geographic_scope: 'REGIONAL',
    scope_region_id: regionAbidjan.id,
    description: 'Élection du Conseil Régional d\'Abidjan.',
    start_time: new Date(now.getTime() + 48 * 60 * 60 * 1000),
    end_time:   new Date(now.getTime() + 49 * 60 * 60 * 1000),
  });

  // ── Candidates for Présidentielle ─────────────────────────────────────────

  async function upsertCandidate(election_id: string, first_name: string, last_name: string, data: object) {
    const existing = await prisma.candidate.findFirst({ where: { election_id, first_name, last_name } });
    if (existing) return existing;
    return prisma.candidate.create({ data: { election_id, first_name, last_name, ...data } as any });
  }

  await upsertCandidate(presidentielle.id, 'Alassane', 'Ouattara', {
    party_id: rhdp.id,
    biography: 'Économiste et homme d\'État ivoirien, Président de la République depuis 2011.',
    nationality_verified: true, criminal_record_clear: true, age_verified: true,
  });
  await upsertCandidate(presidentielle.id, 'Tidjane', 'Thiam', {
    party_id: pdci.id,
    biography: 'Homme d\'affaires et financier international, ancien PDG du Credit Suisse.',
    nationality_verified: true, criminal_record_clear: true, age_verified: true,
  });
  await upsertCandidate(presidentielle.id, 'Laurent', 'Gbagbo', {
    party_id: ppaci.id,
    biography: 'Ancien Président de la République (2000-2011), fondateur du PPA-CI.',
    nationality_verified: true, criminal_record_clear: true, age_verified: true,
  });
  await upsertCandidate(presidentielle.id, 'Kouadio', 'Konan Bertin', {
    party_id: independant.id,
    biography: 'Homme politique indépendant, candidat à titre indépendant pour la troisième fois.',
    nationality_verified: true, criminal_record_clear: true, age_verified: true,
  });

  // ── Candidates for Législatives Cocody ────────────────────────────────────

  await upsertCandidate(legislativesCocody.id, 'Aya', 'Kouamé', {
    party_id: rhdp.id,
    biography: 'Avocate et militante RHDP, candidate pour le siège de Cocody-Riviera.',
    nationality_verified: true, criminal_record_clear: true, age_verified: true,
  });
  await upsertCandidate(legislativesCocody.id, 'Jean-Marc', 'Yao', {
    party_id: pdci.id,
    biography: 'Ingénieur et entrepreneur, candidat PDCI pour la circonscription de Cocody.',
    nationality_verified: true, criminal_record_clear: true, age_verified: true,
  });
  await upsertCandidate(legislativesCocody.id, 'Nathalie', 'Assi', {
    party_id: independant.id,
    biography: 'Enseignante et militante civique, candidate indépendante à Cocody.',
    nationality_verified: true, criminal_record_clear: true, age_verified: true,
  });

  // ── Candidates for Municipales Yopougon ──────────────────────────────────

  await upsertCandidate(municipalesYopougon.id, 'Gnénéma', 'Coulibaly', {
    party_id: rhdp.id,
    biography: 'Ancien ministre, candidat RHDP pour la mairie de Yopougon.',
    nationality_verified: true, criminal_record_clear: true, age_verified: true,
  });
  await upsertCandidate(municipalesYopougon.id, 'Rosalie', 'Bah', {
    party_id: ppaci.id,
    biography: 'Militante sociale, candidate PPA-CI pour le renouveau de Yopougon.',
    nationality_verified: true, criminal_record_clear: true, age_verified: true,
  });

  // ── Users ─────────────────────────────────────────────────────────────────

  const adminHash  = await bcrypt.hash('Admin@12345', 10);
  const voterHash  = await bcrypt.hash('Voter@12345', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@agora.gov' },
    update: {},
    create: {
      national_id: 'ADMIN001',
      email: 'admin@agora.gov',
      password_hash: adminHash,
      role: 'ADMIN', status: 'ACTIVE',
      first_name: 'Super', last_name: 'Administrateur',
      date_of_birth: new Date('1980-01-01'),
      phone_number: '+2250700000000',
      commune_id: communeCocody.id,
      bureau_de_vote_id: bureauRosiers.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'kouassi@example.com' },
    update: {},
    create: {
      national_id: 'CI0012345678',
      email: 'kouassi@example.com',
      password_hash: voterHash,
      role: 'VOTER', status: 'ACTIVE',
      first_name: 'Kouassi', last_name: 'Amani',
      date_of_birth: new Date('1990-04-15'),
      phone_number: '+2250701234567',
      commune_id: communeCocody.id,
      bureau_de_vote_id: bureauRosiers.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'aminata@example.com' },
    update: {},
    create: {
      national_id: 'CI0087654321',
      email: 'aminata@example.com',
      password_hash: voterHash,
      role: 'VOTER', status: 'ACTIVE',
      first_name: 'Aminata', last_name: 'Coulibaly',
      date_of_birth: new Date('1995-08-22'),
      phone_number: '+2250702345678',
      commune_id: communeYopougon.id,
      bureau_de_vote_id: bureauYopougon.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'ibrahim@example.com' },
    update: {},
    create: {
      national_id: 'CI0011223344',
      email: 'ibrahim@example.com',
      password_hash: voterHash,
      role: 'VOTER', status: 'ACTIVE',
      first_name: 'Ibrahim', last_name: 'Koné',
      date_of_birth: new Date('1988-12-03'),
      phone_number: '+2250703456789',
      commune_id: communeBouake.id,
      bureau_de_vote_id: bureauBouake.id,
    },
  });

  console.log('\n✓ Seed complete');
  console.log('─────────────────────────────────────────────────');
  console.log('  Admin:   admin@agora.gov      / Admin@12345');
  console.log('  Voter 1: kouassi@example.com  / Voter@12345  (Cocody)');
  console.log('  Voter 2: aminata@example.com  / Voter@12345  (Yopougon)');
  console.log('  Voter 3: ibrahim@example.com  / Voter@12345  (Bouaké)');
  console.log('─────────────────────────────────────────────────');
  console.log(`  Commune IDs (for registration testing):`);
  console.log(`    Cocody:       ${communeCocody.id}`);
  console.log(`    Yopougon:     ${communeYopougon.id}`);
  console.log(`    Bouaké:       ${communeBouake.id}`);
  console.log(`    Yamoussoukro: ${communeYamoussoukro.id}`);
  console.log('─────────────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
