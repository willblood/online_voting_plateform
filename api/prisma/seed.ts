import 'dotenv/config';
import * as crypto from 'crypto';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../generated/prisma/client.js';
import * as bcrypt from 'bcrypt';

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// ── Helpers ─────────────────────────────────────────────────────────────────
async function upsertRegion(name: string, code: string, population: number) {
  return prisma.region.upsert({
    where: { name },
    update: { code, population },
    create: { name, code, population },
  });
}

async function upsertCommune(name: string, departement_id: string, population: number) {
  const existing = await prisma.commune.findFirst({ where: { name, departement_id } });
  if (existing) return existing;
  return prisma.commune.create({ data: { name, departement_id, population } });
}

async function upsertBureau(name: string, commune_id: string, address: string, capacity: number) {
  const existing = await prisma.bureauDeVote.findFirst({ where: { name, commune_id } });
  if (existing) return existing;
  return prisma.bureauDeVote.create({ data: { name, commune_id, address, capacity } });
}

async function main() {
  console.log("Seeding Côte d'Ivoire administrative geography…\n");

  // ══════════════════════════════════════════════════════════════════════════
  //  REGIONS & DÉPARTEMENTS
  //  Schema: Region → Departement → Commune
  //  Real structure: District → Region → Département  (District not in schema)
  //  Mapping: DB Region = CIV Region │ DB Departement = CIV Département
  // ══════════════════════════════════════════════════════════════════════════

  // ── DISTRICT AUTONOME D'ABIDJAN ──────────────────────────────────────────
  const rAbidjan = await prisma.region.upsert({
    where: { name: 'Abidjan' },
    update: { code: 'ABJ', population: 5070000 },
    create: { name: 'Abidjan', code: 'ABJ', population: 5070000 },
  });
  const dAbidjan = await prisma.departement.upsert({
    where: { code: 'ABJ-DEP' },
    update: {},
    create: { region_id: rAbidjan.id, name: 'Abidjan', code: 'ABJ-DEP', population: 5070000 },
  });

  // ── DISTRICT AUTONOME DE YAMOUSSOUKRO ────────────────────────────────────
  const rYam = await prisma.region.upsert({
    where: { name: 'Yamoussoukro' },
    update: { code: 'YAM', population: 355000 },
    create: { name: 'Yamoussoukro', code: 'YAM', population: 355000 },
  });
  const dYam = await prisma.departement.upsert({
    where: { code: 'YAM-DEP' },
    update: {},
    create: { region_id: rYam.id, name: 'Yamoussoukro', code: 'YAM-DEP', population: 355000 },
  });

  // ── DISTRICT DES LAGUNES ─────────────────────────────────────────────────
  // Région des Grands-Ponts
  const rGrandsPonts = await prisma.region.upsert({
    where: { code: 'GRP' },
    update: {},
    create: { name: 'Grands-Ponts', code: 'GRP', population: 320000 },
  });
  const dDabou = await prisma.departement.upsert({
    where: { code: 'DAB' },
    update: {},
    create: { region_id: rGrandsPonts.id, name: 'Dabou', code: 'DAB', population: 130000 },
  });
  const dGrandLahou = await prisma.departement.upsert({
    where: { code: 'GLH' },
    update: {},
    create: { region_id: rGrandsPonts.id, name: 'Grand-Lahou', code: 'GLH', population: 80000 },
  });
  const dJacqueville = await prisma.departement.upsert({
    where: { code: 'JAC' },
    update: {},
    create: { region_id: rGrandsPonts.id, name: 'Jacqueville', code: 'JAC', population: 60000 },
  });

  // Région de l'Agnéby-Tiassa
  const rAgneby = await prisma.region.upsert({
    where: { code: 'AGN' },
    update: {},
    create: { name: "Agnéby-Tiassa", code: 'AGN', population: 420000 },
  });
  const dAgboville = await prisma.departement.upsert({
    where: { code: 'AGB' },
    update: {},
    create: { region_id: rAgneby.id, name: 'Agboville', code: 'AGB', population: 200000 },
  });
  const dSikensi = await prisma.departement.upsert({
    where: { code: 'SKS' },
    update: {},
    create: { region_id: rAgneby.id, name: 'Sikensi', code: 'SKS', population: 110000 },
  });
  const dTiassale = await prisma.departement.upsert({
    where: { code: 'TIA' },
    update: {},
    create: { region_id: rAgneby.id, name: 'Tiassalé', code: 'TIA', population: 110000 },
  });

  // Région de la Mé
  const rMe = await prisma.region.upsert({
    where: { code: 'ME' },
    update: {},
    create: { name: 'Mé', code: 'ME', population: 350000 },
  });
  const dAdzope = await prisma.departement.upsert({
    where: { code: 'ADZ' },
    update: {},
    create: { region_id: rMe.id, name: 'Adzopé', code: 'ADZ', population: 110000 },
  });
  const dAkoupe = await prisma.departement.upsert({
    where: { code: 'AKP' },
    update: {},
    create: { region_id: rMe.id, name: 'Akoupé', code: 'AKP', population: 80000 },
  });
  const dAlepe = await prisma.departement.upsert({
    where: { code: 'ALP' },
    update: {},
    create: { region_id: rMe.id, name: 'Alépé', code: 'ALP', population: 80000 },
  });
  const dYakasse = await prisma.departement.upsert({
    where: { code: 'YKA' },
    update: {},
    create: { region_id: rMe.id, name: 'Yakassé-Attobrou', code: 'YKA', population: 70000 },
  });

  // ── DISTRICT DU COMOÉ ───────────────────────────────────────────────────
  // Région du Sud-Comoé
  const rSudComoe = await prisma.region.upsert({
    where: { code: 'SCO' },
    update: {},
    create: { name: 'Sud-Comoé', code: 'SCO', population: 380000 },
  });
  const dAboisso = await prisma.departement.upsert({
    where: { code: 'ABO' },
    update: {},
    create: { region_id: rSudComoe.id, name: 'Aboisso', code: 'ABO', population: 170000 },
  });
  const dAdiake = await prisma.departement.upsert({
    where: { code: 'ADK' },
    update: {},
    create: { region_id: rSudComoe.id, name: 'Adiaké', code: 'ADK', population: 100000 },
  });
  const dGrandBassam = await prisma.departement.upsert({
    where: { code: 'GBS' },
    update: {},
    create: { region_id: rSudComoe.id, name: 'Grand-Bassam', code: 'GBS', population: 110000 },
  });

  // Région de l'Indénié-Djuablin
  const rIndenie = await prisma.region.upsert({
    where: { code: 'IND' },
    update: {},
    create: { name: 'Indénié-Djuablin', code: 'IND', population: 310000 },
  });
  const dAbengourou = await prisma.departement.upsert({
    where: { code: 'ABG' },
    update: {},
    create: { region_id: rIndenie.id, name: 'Abengourou', code: 'ABG', population: 160000 },
  });
  const dAgnibilekrou = await prisma.departement.upsert({
    where: { code: 'ANB' },
    update: {},
    create: { region_id: rIndenie.id, name: 'Agnibilékrou', code: 'ANB', population: 90000 },
  });
  const dBettie = await prisma.departement.upsert({
    where: { code: 'BTT' },
    update: {},
    create: { region_id: rIndenie.id, name: 'Bettié', code: 'BTT', population: 60000 },
  });

  // ── DISTRICT DU BAS-SASSANDRA ────────────────────────────────────────────
  // Région du Gbôklé
  const rGbokle = await prisma.region.upsert({
    where: { code: 'GBK' },
    update: {},
    create: { name: 'Gbôklé', code: 'GBK', population: 250000 },
  });
  const dSassandra = await prisma.departement.upsert({
    where: { code: 'SAS' },
    update: {},
    create: { region_id: rGbokle.id, name: 'Sassandra', code: 'SAS', population: 140000 },
  });
  const dFresco = await prisma.departement.upsert({
    where: { code: 'FRS' },
    update: {},
    create: { region_id: rGbokle.id, name: 'Fresco', code: 'FRS', population: 70000 },
  });

  // Région du Nawa
  const rNawa = await prisma.region.upsert({
    where: { code: 'NAW' },
    update: {},
    create: { name: 'Nawa', code: 'NAW', population: 520000 },
  });
  const dSoubre = await prisma.departement.upsert({
    where: { code: 'SOB' },
    update: {},
    create: { region_id: rNawa.id, name: 'Soubré', code: 'SOB', population: 280000 },
  });
  const dBuyo = await prisma.departement.upsert({
    where: { code: 'BUY' },
    update: {},
    create: { region_id: rNawa.id, name: 'Buyo', code: 'BUY', population: 130000 },
  });
  const dMeagui = await prisma.departement.upsert({
    where: { code: 'MEG' },
    update: {},
    create: { region_id: rNawa.id, name: 'Méagui', code: 'MEG', population: 110000 },
  });

  // Région du San-Pédro
  const rSanPedro = await prisma.region.upsert({
    where: { code: 'SNP' },
    update: {},
    create: { name: 'San-Pédro', code: 'SNP', population: 750000 },
  });
  const dSanPedro = await prisma.departement.upsert({
    where: { code: 'SNP-DEP' },
    update: {},
    create: { region_id: rSanPedro.id, name: 'San-Pédro', code: 'SNP-DEP', population: 620000 },
  });
  const dTabou = await prisma.departement.upsert({
    where: { code: 'TAB' },
    update: {},
    create: { region_id: rSanPedro.id, name: 'Tabou', code: 'TAB', population: 130000 },
  });

  // ── DISTRICT DU SASSANDRA-MARAHOUÉ ──────────────────────────────────────
  // Région du Haut-Sassandra
  const rHautSassandra = await prisma.region.upsert({
    where: { code: 'HSS' },
    update: {},
    create: { name: 'Haut-Sassandra', code: 'HSS', population: 800000 },
  });
  const dDaloa = await prisma.departement.upsert({
    where: { code: 'DLO' },
    update: {},
    create: { region_id: rHautSassandra.id, name: 'Daloa', code: 'DLO', population: 400000 },
  });
  const dIssia = await prisma.departement.upsert({
    where: { code: 'ISS' },
    update: {},
    create: { region_id: rHautSassandra.id, name: 'Issia', code: 'ISS', population: 160000 },
  });
  const dVavoua = await prisma.departement.upsert({
    where: { code: 'VAV' },
    update: {},
    create: { region_id: rHautSassandra.id, name: 'Vavoua', code: 'VAV', population: 140000 },
  });
  const dZoukougbeu = await prisma.departement.upsert({
    where: { code: 'ZKB' },
    update: {},
    create: { region_id: rHautSassandra.id, name: 'Zoukougbeu', code: 'ZKB', population: 80000 },
  });

  // Région de la Marahoué
  const rMarahoue = await prisma.region.upsert({
    where: { code: 'MRH' },
    update: {},
    create: { name: 'Marahoué', code: 'MRH', population: 380000 },
  });
  const dBouafle = await prisma.departement.upsert({
    where: { code: 'BFL' },
    update: {},
    create: { region_id: rMarahoue.id, name: 'Bouaflé', code: 'BFL', population: 170000 },
  });
  const dSinfra = await prisma.departement.upsert({
    where: { code: 'SIN' },
    update: {},
    create: { region_id: rMarahoue.id, name: 'Sinfra', code: 'SIN', population: 120000 },
  });
  const dZuenoula = await prisma.departement.upsert({
    where: { code: 'ZUE' },
    update: {},
    create: { region_id: rMarahoue.id, name: 'Zuénoula', code: 'ZUE', population: 90000 },
  });

  // ── DISTRICT DE LA VALLÉE DU BANDAMA ─────────────────────────────────────
  // Région du Gbêkê
  const rGbeke = await prisma.region.upsert({
    where: { code: 'GBE' },
    update: {},
    create: { name: 'Gbêkê', code: 'GBE', population: 1200000 },
  });
  const dBouake = await prisma.departement.upsert({
    where: { code: 'BKE' },
    update: {},
    create: { region_id: rGbeke.id, name: 'Bouaké', code: 'BKE', population: 900000 },
  });
  const dBeoumi = await prisma.departement.upsert({
    where: { code: 'BEO' },
    update: {},
    create: { region_id: rGbeke.id, name: 'Béoumi', code: 'BEO', population: 130000 },
  });
  const dSakassou = await prisma.departement.upsert({
    where: { code: 'SKS2' },
    update: {},
    create: { region_id: rGbeke.id, name: 'Sakassou', code: 'SKS2', population: 90000 },
  });
  const dBotro = await prisma.departement.upsert({
    where: { code: 'BOT' },
    update: {},
    create: { region_id: rGbeke.id, name: 'Botro', code: 'BOT', population: 80000 },
  });

  // Région du Hambol
  const rHambol = await prisma.region.upsert({
    where: { code: 'HMB' },
    update: {},
    create: { name: 'Hambol', code: 'HMB', population: 350000 },
  });
  const dKatiola = await prisma.departement.upsert({
    where: { code: 'KAT' },
    update: {},
    create: { region_id: rHambol.id, name: 'Katiola', code: 'KAT', population: 170000 },
  });
  const dDabakala = await prisma.departement.upsert({
    where: { code: 'DBK' },
    update: {},
    create: { region_id: rHambol.id, name: 'Dabakala', code: 'DBK', population: 100000 },
  });
  const dNiakaramandougou = await prisma.departement.upsert({
    where: { code: 'NKR' },
    update: {},
    create: { region_id: rHambol.id, name: 'Niakaramandougou', code: 'NKR', population: 80000 },
  });

  // ── DISTRICT DU WOROBA ───────────────────────────────────────────────────
  // Région du Bafing
  const rBafing = await prisma.region.upsert({
    where: { code: 'BAF' },
    update: {},
    create: { name: 'Bafing', code: 'BAF', population: 170000 },
  });
  const dTouba = await prisma.departement.upsert({
    where: { code: 'TBA' },
    update: {},
    create: { region_id: rBafing.id, name: 'Touba', code: 'TBA', population: 90000 },
  });
  const dOuaninou = await prisma.departement.upsert({
    where: { code: 'OUA' },
    update: {},
    create: { region_id: rBafing.id, name: 'Ouaninou', code: 'OUA', population: 50000 },
  });
  const dKoro = await prisma.departement.upsert({
    where: { code: 'KRO' },
    update: {},
    create: { region_id: rBafing.id, name: 'Koro', code: 'KRO', population: 40000 },
  });

  // Région du Béré
  const rBere = await prisma.region.upsert({
    where: { code: 'BRE' },
    update: {},
    create: { name: 'Béré', code: 'BRE', population: 280000 },
  });
  const dMankono = await prisma.departement.upsert({
    where: { code: 'MNK' },
    update: {},
    create: { region_id: rBere.id, name: 'Mankono', code: 'MNK', population: 130000 },
  });
  const dDianra = await prisma.departement.upsert({
    where: { code: 'DIA' },
    update: {},
    create: { region_id: rBere.id, name: 'Dianra', code: 'DIA', population: 80000 },
  });
  const dKounahiri = await prisma.departement.upsert({
    where: { code: 'KNH' },
    update: {},
    create: { region_id: rBere.id, name: 'Kounahiri', code: 'KNH', population: 70000 },
  });

  // Région du Worodougou
  const rWorodougou = await prisma.region.upsert({
    where: { code: 'WRD' },
    update: {},
    create: { name: 'Worodougou', code: 'WRD', population: 230000 },
  });
  const dSeguela = await prisma.departement.upsert({
    where: { code: 'SEG' },
    update: {},
    create: { region_id: rWorodougou.id, name: 'Séguéla', code: 'SEG', population: 160000 },
  });
  const dKani = await prisma.departement.upsert({
    where: { code: 'KNI' },
    update: {},
    create: { region_id: rWorodougou.id, name: 'Kani', code: 'KNI', population: 70000 },
  });

  // ── DISTRICT DU DENGUÉLÉ ─────────────────────────────────────────────────
  // Région du Folon
  const rFolon = await prisma.region.upsert({
    where: { code: 'FOL' },
    update: {},
    create: { name: 'Folon', code: 'FOL', population: 110000 },
  });
  const dMinignan = await prisma.departement.upsert({
    where: { code: 'MGN' },
    update: {},
    create: { region_id: rFolon.id, name: 'Minignan', code: 'MGN', population: 60000 },
  });
  const dKaniasso = await prisma.departement.upsert({
    where: { code: 'KNA' },
    update: {},
    create: { region_id: rFolon.id, name: 'Kaniasso', code: 'KNA', population: 50000 },
  });

  // Région du Kabadougou
  const rKabadougou = await prisma.region.upsert({
    where: { code: 'KBD' },
    update: {},
    create: { name: 'Kabadougou', code: 'KBD', population: 260000 },
  });
  const dOdienne = await prisma.departement.upsert({
    where: { code: 'ODI' },
    update: {},
    create: { region_id: rKabadougou.id, name: 'Odienné', code: 'ODI', population: 150000 },
  });
  const dSamatiguila = await prisma.departement.upsert({
    where: { code: 'SAM' },
    update: {},
    create: { region_id: rKabadougou.id, name: 'Samatiguila', code: 'SAM', population: 60000 },
  });
  const dMadinani = await prisma.departement.upsert({
    where: { code: 'MDN' },
    update: {},
    create: { region_id: rKabadougou.id, name: 'Madinani', code: 'MDN', population: 50000 },
  });

  // ── DISTRICT DU ZANZAN ───────────────────────────────────────────────────
  // Région du Bounkani
  const rBounkani = await prisma.region.upsert({
    where: { code: 'BNK' },
    update: {},
    create: { name: 'Bounkani', code: 'BNK', population: 280000 },
  });
  const dBouna = await prisma.departement.upsert({
    where: { code: 'BNA' },
    update: {},
    create: { region_id: rBounkani.id, name: 'Bouna', code: 'BNA', population: 140000 },
  });
  const dDoropo = await prisma.departement.upsert({
    where: { code: 'DRP' },
    update: {},
    create: { region_id: rBounkani.id, name: 'Doropo', code: 'DRP', population: 80000 },
  });
  const dTehini = await prisma.departement.upsert({
    where: { code: 'THN' },
    update: {},
    create: { region_id: rBounkani.id, name: 'Téhini', code: 'THN', population: 60000 },
  });

  // Région du Gontougo
  const rGontougo = await prisma.region.upsert({
    where: { code: 'GTG' },
    update: {},
    create: { name: 'Gontougo', code: 'GTG', population: 450000 },
  });
  const dBondoukou = await prisma.departement.upsert({
    where: { code: 'BDK' },
    update: {},
    create: { region_id: rGontougo.id, name: 'Bondoukou', code: 'BDK', population: 200000 },
  });
  const dTanda = await prisma.departement.upsert({
    where: { code: 'TND' },
    update: {},
    create: { region_id: rGontougo.id, name: 'Tanda', code: 'TND', population: 110000 },
  });
  const dKounFao = await prisma.departement.upsert({
    where: { code: 'KNF' },
    update: {},
    create: { region_id: rGontougo.id, name: 'Koun-Fao', code: 'KNF', population: 80000 },
  });
  const dTransua = await prisma.departement.upsert({
    where: { code: 'TRS' },
    update: {},
    create: { region_id: rGontougo.id, name: 'Transua', code: 'TRS', population: 60000 },
  });

  // ── DISTRICT DES MONTAGNES ───────────────────────────────────────────────
  // Région du Cavally
  const rCavally = await prisma.region.upsert({
    where: { code: 'CVL' },
    update: {},
    create: { name: 'Cavally', code: 'CVL', population: 350000 },
  });
  const dGuiglo = await prisma.departement.upsert({
    where: { code: 'GGL' },
    update: {},
    create: { region_id: rCavally.id, name: 'Guiglo', code: 'GGL', population: 180000 },
  });
  const dToulepleu = await prisma.departement.upsert({
    where: { code: 'TPL' },
    update: {},
    create: { region_id: rCavally.id, name: 'Toulepleu', code: 'TPL', population: 90000 },
  });
  const dBlolequin = await prisma.departement.upsert({
    where: { code: 'BLQ' },
    update: {},
    create: { region_id: rCavally.id, name: 'Bloléquin', code: 'BLQ', population: 80000 },
  });

  // Région du Guémon
  const rGuemon = await prisma.region.upsert({
    where: { code: 'GEM' },
    update: {},
    create: { name: 'Guémon', code: 'GEM', population: 400000 },
  });
  const dDuekoue = await prisma.departement.upsert({
    where: { code: 'DKE' },
    update: {},
    create: { region_id: rGuemon.id, name: 'Duékoué', code: 'DKE', population: 200000 },
  });
  const dBangolo = await prisma.departement.upsert({
    where: { code: 'BGL' },
    update: {},
    create: { region_id: rGuemon.id, name: 'Bangolo', code: 'BGL', population: 110000 },
  });
  const dKouibly = await prisma.departement.upsert({
    where: { code: 'KBL' },
    update: {},
    create: { region_id: rGuemon.id, name: 'Kouibly', code: 'KBL', population: 90000 },
  });

  // Région du Tonkpi
  const rTonkpi = await prisma.region.upsert({
    where: { code: 'TNK' },
    update: {},
    create: { name: 'Tonkpi', code: 'TNK', population: 550000 },
  });
  const dMan = await prisma.departement.upsert({
    where: { code: 'MAN' },
    update: {},
    create: { region_id: rTonkpi.id, name: 'Man', code: 'MAN', population: 250000 },
  });
  const dDanane = await prisma.departement.upsert({
    where: { code: 'DNN' },
    update: {},
    create: { region_id: rTonkpi.id, name: 'Danané', code: 'DNN', population: 160000 },
  });
  const dBiankouma = await prisma.departement.upsert({
    where: { code: 'BNK2' },
    update: {},
    create: { region_id: rTonkpi.id, name: 'Biankouma', code: 'BNK2', population: 80000 },
  });
  const dSipilou = await prisma.departement.upsert({
    where: { code: 'SPL' },
    update: {},
    create: { region_id: rTonkpi.id, name: 'Sipilou', code: 'SPL', population: 60000 },
  });

  // ── DISTRICT DES SAVANES ─────────────────────────────────────────────────
  // Région du Poro
  const rPoro = await prisma.region.upsert({
    where: { code: 'PRO' },
    update: {},
    create: { name: 'Poro', code: 'PRO', population: 800000 },
  });
  const dKorhogo = await prisma.departement.upsert({
    where: { code: 'KRG' },
    update: {},
    create: { region_id: rPoro.id, name: 'Korhogo', code: 'KRG', population: 500000 },
  });
  const dSinematiali = await prisma.departement.upsert({
    where: { code: 'SNM' },
    update: {},
    create: { region_id: rPoro.id, name: 'Sinématiali', code: 'SNM', population: 110000 },
  });
  const dDikodougou = await prisma.departement.upsert({
    where: { code: 'DKD' },
    update: {},
    create: { region_id: rPoro.id, name: 'Dikodougou', code: 'DKD', population: 100000 },
  });
  const dMbengue = await prisma.departement.upsert({
    where: { code: 'MBG' },
    update: {},
    create: { region_id: rPoro.id, name: "M'Bengué", code: 'MBG', population: 90000 },
  });

  // Région du Tchologo
  const rTchologo = await prisma.region.upsert({
    where: { code: 'TCH' },
    update: {},
    create: { name: 'Tchologo', code: 'TCH', population: 380000 },
  });
  const dFerkessedougou = await prisma.departement.upsert({
    where: { code: 'FRK' },
    update: {},
    create: { region_id: rTchologo.id, name: 'Ferkessédougou', code: 'FRK', population: 220000 },
  });
  const dOuangolodougou = await prisma.departement.upsert({
    where: { code: 'WGL' },
    update: {},
    create: { region_id: rTchologo.id, name: 'Ouangolodougou', code: 'WGL', population: 100000 },
  });
  const dKong = await prisma.departement.upsert({
    where: { code: 'KNG' },
    update: {},
    create: { region_id: rTchologo.id, name: 'Kong', code: 'KNG', population: 60000 },
  });

  // Région du Bagoué
  const rBagoue = await prisma.region.upsert({
    where: { code: 'BGE' },
    update: {},
    create: { name: 'Bagoué', code: 'BGE', population: 310000 },
  });
  const dBoundiali = await prisma.departement.upsert({
    where: { code: 'BND' },
    update: {},
    create: { region_id: rBagoue.id, name: 'Boundiali', code: 'BND', population: 160000 },
  });
  const dTengrela = await prisma.departement.upsert({
    where: { code: 'TNG' },
    update: {},
    create: { region_id: rBagoue.id, name: 'Tengréla', code: 'TNG', population: 90000 },
  });
  const dKouto = await prisma.departement.upsert({
    where: { code: 'KTO' },
    update: {},
    create: { region_id: rBagoue.id, name: 'Kouto', code: 'KTO', population: 60000 },
  });

  console.log('✓ 27 regions and 75 departments seeded');

  // ══════════════════════════════════════════════════════════════════════════
  //  COMMUNES (department capitals + key Abidjan communes)
  // ══════════════════════════════════════════════════════════════════════════

  // Abidjan key communes
  const cCocody       = await upsertCommune('Cocody',       dAbidjan.id, 450000);
  const cPlateau      = await upsertCommune('Plateau',      dAbidjan.id, 25000);
  const cYopougon     = await upsertCommune('Yopougon',     dAbidjan.id, 1100000);
  const cAbobo        = await upsertCommune('Abobo',        dAbidjan.id, 900000);
  const cAdjame       = await upsertCommune('Adjamé',       dAbidjan.id, 330000);
  const cTreichville  = await upsertCommune('Treichville',  dAbidjan.id, 100000);
  const cMarcory      = await upsertCommune('Marcory',      dAbidjan.id, 250000);
  const cKoumassi     = await upsertCommune('Koumassi',     dAbidjan.id, 430000);
  const cPortBouet    = await upsertCommune('Port-Bouët',   dAbidjan.id, 430000);
  const cAttecoubbe   = await upsertCommune('Attécoubé',    dAbidjan.id, 260000);
  await upsertCommune('Bingerville',  dAbidjan.id, 120000);
  await upsertCommune('Anyama',       dAbidjan.id, 180000);

  // Yamoussoukro
  const cYamoussoukro = await upsertCommune('Yamoussoukro', dYam.id, 310000);

  // Department capitals — one commune each
  await upsertCommune('Dabou',              dDabou.id,           100000);
  await upsertCommune('Grand-Lahou',        dGrandLahou.id,       60000);
  await upsertCommune('Jacqueville',        dJacqueville.id,      40000);
  await upsertCommune('Agboville',          dAgboville.id,       150000);
  await upsertCommune('Sikensi',            dSikensi.id,          80000);
  await upsertCommune('Tiassalé',           dTiassale.id,         90000);
  await upsertCommune('Adzopé',             dAdzope.id,           90000);
  await upsertCommune('Akoupé',             dAkoupe.id,           60000);
  await upsertCommune('Alépé',              dAlepe.id,            60000);
  await upsertCommune('Yakassé-Attobrou',   dYakasse.id,          50000);
  await upsertCommune('Aboisso',            dAboisso.id,         130000);
  await upsertCommune('Adiaké',             dAdiake.id,           80000);
  await upsertCommune('Grand-Bassam',       dGrandBassam.id,      90000);
  await upsertCommune('Abengourou',         dAbengourou.id,      130000);
  await upsertCommune('Agnibilékrou',       dAgnibilekrou.id,     70000);
  await upsertCommune('Bettié',             dBettie.id,           40000);
  await upsertCommune('Sassandra',          dSassandra.id,       110000);
  await upsertCommune('Fresco',             dFresco.id,           50000);
  await upsertCommune('Soubré',             dSoubre.id,          220000);
  await upsertCommune('Buyo',               dBuyo.id,            100000);
  await upsertCommune('Méagui',             dMeagui.id,           90000);
  const cSanPedro = await upsertCommune('San-Pédro',          dSanPedro.id,        500000);
  await upsertCommune('Tabou',              dTabou.id,           100000);
  const cDaloa = await upsertCommune('Daloa',              dDaloa.id,           350000);
  await upsertCommune('Issia',              dIssia.id,           130000);
  await upsertCommune('Vavoua',             dVavoua.id,          110000);
  await upsertCommune('Zoukougbeu',         dZoukougbeu.id,       60000);
  await upsertCommune('Bouaflé',            dBouafle.id,         140000);
  await upsertCommune('Sinfra',             dSinfra.id,           90000);
  await upsertCommune('Zuénoula',           dZuenoula.id,         70000);
  const cBouake = await upsertCommune('Bouaké',             dBouake.id,          750000);
  await upsertCommune('Béoumi',             dBeoumi.id,          100000);
  await upsertCommune('Sakassou',           dSakassou.id,         70000);
  await upsertCommune('Botro',              dBotro.id,            60000);
  await upsertCommune('Katiola',            dKatiola.id,         140000);
  await upsertCommune('Dabakala',           dDabakala.id,         80000);
  await upsertCommune('Niakaramandougou',   dNiakaramandougou.id, 60000);
  await upsertCommune('Touba',              dTouba.id,            70000);
  await upsertCommune('Ouaninou',           dOuaninou.id,         40000);
  await upsertCommune('Koro',               dKoro.id,             30000);
  await upsertCommune('Mankono',            dMankono.id,         100000);
  await upsertCommune('Dianra',             dDianra.id,           60000);
  await upsertCommune('Kounahiri',          dKounahiri.id,        50000);
  await upsertCommune('Séguéla',            dSeguela.id,         130000);
  await upsertCommune('Kani',               dKani.id,             50000);
  await upsertCommune('Minignan',           dMinignan.id,         45000);
  await upsertCommune('Kaniasso',           dKaniasso.id,         40000);
  await upsertCommune('Odienné',            dOdienne.id,         120000);
  await upsertCommune('Samatiguila',        dSamatiguila.id,      45000);
  await upsertCommune('Madinani',           dMadinani.id,         40000);
  await upsertCommune('Bouna',              dBouna.id,           110000);
  await upsertCommune('Doropo',             dDoropo.id,           60000);
  await upsertCommune('Téhini',             dTehini.id,           45000);
  await upsertCommune('Bondoukou',          dBondoukou.id,       160000);
  await upsertCommune('Tanda',              dTanda.id,            90000);
  await upsertCommune('Koun-Fao',           dKounFao.id,          60000);
  await upsertCommune('Transua',            dTransua.id,          45000);
  await upsertCommune('Guiglo',             dGuiglo.id,          140000);
  await upsertCommune('Toulepleu',          dToulepleu.id,        70000);
  await upsertCommune('Bloléquin',          dBlolequin.id,        60000);
  await upsertCommune('Duékoué',            dDuekoue.id,         160000);
  await upsertCommune('Bangolo',            dBangolo.id,          90000);
  await upsertCommune('Kouibly',            dKouibly.id,          70000);
  await upsertCommune('Man',                dMan.id,             200000);
  await upsertCommune('Danané',             dDanane.id,          130000);
  await upsertCommune('Biankouma',          dBiankouma.id,        60000);
  await upsertCommune('Sipilou',            dSipilou.id,          45000);
  await upsertCommune('Korhogo',            dKorhogo.id,         430000);
  await upsertCommune('Sinématiali',        dSinematiali.id,      90000);
  await upsertCommune('Dikodougou',         dDikodougou.id,       80000);
  await upsertCommune("M'Bengué",           dMbengue.id,          70000);
  await upsertCommune('Ferkessédougou',     dFerkessedougou.id,  180000);
  await upsertCommune('Ouangolodougou',     dOuangolodougou.id,   80000);
  await upsertCommune('Kong',               dKong.id,             45000);
  await upsertCommune('Boundiali',          dBoundiali.id,       130000);
  await upsertCommune('Tengréla',           dTengrela.id,         70000);
  await upsertCommune('Kouto',              dKouto.id,            45000);

  console.log('✓ Communes seeded');

  // ══════════════════════════════════════════════════════════════════════════
  //  BUREAUX DE VOTE
  // ══════════════════════════════════════════════════════════════════════════

  const bCocody = await upsertBureau('École Primaire Les Rosiers',  cCocody.id,       'Cocody, Abidjan',    500);
                  await upsertBureau('Lycée Technique d\'Abidjan',  cCocody.id,       'Cocody, Abidjan',    800);
  const bYopougon = await upsertBureau('Mairie de Yopougon',        cYopougon.id,     'Yopougon, Abidjan', 1000);
  const bYam     = await upsertBureau('École Jacques AKA',          cYamoussoukro.id, 'Yamoussoukro',       400);
  const bBouake  = await upsertBureau('CEG Bouaké Centre',          cBouake.id,       'Bouaké',             600);

  console.log('✓ Bureaux de vote seeded');

  // ══════════════════════════════════════════════════════════════════════════
  //  POLITICAL PARTIES
  // ══════════════════════════════════════════════════════════════════════════

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
      name: "Parti Démocratique de Côte d'Ivoire – Rassemblement Démocratique Africain",
      acronym: 'PDCI-RDA', founded_year: 1946,
      description: "Plus ancien parti de Côte d'Ivoire",
    },
  });
  const ppaci = await prisma.politicalParty.upsert({
    where: { acronym: 'PPA-CI' },
    update: {},
    create: {
      name: "Parti des Peuples Africains – Côte d'Ivoire",
      acronym: 'PPA-CI', founded_year: 2021,
      description: 'Parti de Laurent Gbagbo',
    },
  });
  const independant = await prisma.politicalParty.upsert({
    where: { acronym: 'IND' },
    update: {},
    create: { name: 'Candidat Indépendant', acronym: 'IND', description: 'Sans affiliation partisane' },
  });

  // ══════════════════════════════════════════════════════════════════════════
  //  ELECTIONS, CANDIDATES, USERS & VOTES
  // ══════════════════════════════════════════════════════════════════════════

  const now = new Date();

  const dAgo  = (n: number) => new Date(now.getTime() - n * 86_400_000);
  const dFwd  = (n: number) => new Date(now.getTime() + n * 86_400_000);
  const hAgo  = (n: number) => new Date(now.getTime() - n * 3_600_000);
  const hFwd  = (n: number) => new Date(now.getTime() + n * 3_600_000);

  // Status is always derived from the time window — re-seeding corrects stale records
  const derivedStatus = (start: Date, end: Date): string => {
    if (now < start) return 'OUVERT';
    if (now > end)   return 'CLOS';
    return 'EN_COURS';
  };

  async function upsertElection(title: string, data: Record<string, unknown>) {
    const existing = await prisma.election.findFirst({ where: { title } });
    if (existing) return prisma.election.update({ where: { id: existing.id }, data });
    return prisma.election.create({ data: { title, ...data } as any });
  }

  async function upsertCandidate(
    election_id: string, first_name: string, last_name: string, data: object,
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
        encrypted_vote: `seed:${Buffer.from(JSON.stringify({ election_id, candidate_id })).toString('base64')}`,
        receipt_code: crypto.randomUUID(),
      },
    });
  }

  // ══════════════════════════════════════════════════════════════════════════
  //  ELECTIONS — PUBLIE (ended, results published)
  // ══════════════════════════════════════════════════════════════════════════

  // 1. Présidentielle 2025 — NATIONAL — ended 120 days ago
  const pres2025 = await upsertElection('Élection Présidentielle 2025', {
    type: 'PRESIDENTIELLE', status: 'PUBLIE', geographic_scope: 'NATIONAL',
    description: "Élection du Président de la République de Côte d'Ivoire pour un mandat de 5 ans.",
    start_time: dAgo(120), end_time: dAgo(119),
  });
  const p25_ouattara = await upsertCandidate(pres2025.id, 'Alassane', 'Ouattara',     { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Président sortant, ancien Premier Ministre et économiste international." });
  const p25_thiam    = await upsertCandidate(pres2025.id, 'Tidjane',  'Thiam',        { party_id: pdci.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Ancien PDG de Credit Suisse, candidat du PDCI-RDA." });
  const p25_gbagbo   = await upsertCandidate(pres2025.id, 'Laurent',  'Gbagbo',       { party_id: ppaci.id,       nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Ancien Président de la République, fondateur du PPA-CI." });
  const p25_kkb      = await upsertCandidate(pres2025.id, 'Kouadio',  'Konan Bertin', { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true, biography: "Candidat indépendant, ancien député." });

  // 2. Référendum Nouvelle Constitution 2025 — NATIONAL — ended 60 days ago
  const ref2025 = await upsertElection('Référendum Nouvelle Constitution 2025', {
    type: 'REFERENDUM', status: 'PUBLIE', geographic_scope: 'NATIONAL',
    description: "Référendum populaire sur l'adoption de la nouvelle Constitution.",
    start_time: dAgo(60), end_time: dAgo(59),
  });
  const ref_oui = await upsertCandidate(ref2025.id, 'OUI', 'Pour la réforme',   { nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const ref_non = await upsertCandidate(ref2025.id, 'NON', 'Contre la réforme', { nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // ══════════════════════════════════════════════════════════════════════════
  //  ELECTIONS — CLOS (ended, results pending)
  // ══════════════════════════════════════════════════════════════════════════

  // 3. Régionales District Abidjan 2026 — REGIONAL — ended 14 days ago
  const regAbj = await upsertElection('Régionales District Abidjan 2026', {
    type: 'REGIONALES', status: derivedStatus(dAgo(14), dAgo(13)), geographic_scope: 'REGIONAL',
    description: "Élections régionales pour le District Autonome d'Abidjan.",
    start_time: dAgo(14), end_time: dAgo(13),
    scope_region_id: rAbidjan.id,
  });
  const rAbj_diallo  = await upsertCandidate(regAbj.id, 'Ibrahim',   'Diallo',  { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const rAbj_lago    = await upsertCandidate(regAbj.id, 'Henriette', 'Lago',    { party_id: pdci.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const rAbj_gnamien = await upsertCandidate(regAbj.id, 'Sylvain',   'Gnamien', { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // 4. Législatives Cocody 2026 — COMMUNAL — ended 5 days ago
  const legCoc = await upsertElection('Législatives Cocody 2026', {
    type: 'LEGISLATIVES', status: derivedStatus(dAgo(5), dAgo(4)), geographic_scope: 'COMMUNAL',
    description: "Élections législatives pour la circonscription de Cocody.",
    start_time: dAgo(5), end_time: dAgo(4),
    scope_commune_id: cCocody.id,
  });
  const lCoc_kone  = await upsertCandidate(legCoc.id, 'Marie-Josée',   'Koné',  { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const lCoc_brou  = await upsertCandidate(legCoc.id, 'Jean-Baptiste', 'Brou',  { party_id: pdci.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const lCoc_sylla = await upsertCandidate(legCoc.id, 'Awa',           'Sylla', { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // 5. Municipales Abobo 2026 — COMMUNAL — ended 3 days ago
  const munAbo = await upsertElection('Municipales Abobo 2026', {
    type: 'MUNICIPALES', status: derivedStatus(dAgo(3), dAgo(2)), geographic_scope: 'COMMUNAL',
    description: "Élections municipales pour la commune d'Abobo.",
    start_time: dAgo(3), end_time: dAgo(2),
    scope_commune_id: cAbobo.id,
  });
  const mAbo_bamba = await upsertCandidate(munAbo.id, 'Adama',     'Bamba', { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const mAbo_toure = await upsertCandidate(munAbo.id, 'Fatoumata', 'Touré', { party_id: ppaci.id,       nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const mAbo_kone  = await upsertCandidate(munAbo.id, 'Seydou',    'Koné',  { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // 6. Régionales Gbêkê 2025 — REGIONAL (Bouaké) — ended 30 days ago
  const regGbeOld = await upsertElection('Régionales Gbêkê 2025', {
    type: 'REGIONALES', status: derivedStatus(dAgo(30), dAgo(29)), geographic_scope: 'REGIONAL',
    description: "Élections régionales pour la région du Gbêkê (cycle 2025).",
    start_time: dAgo(30), end_time: dAgo(29),
    scope_region_id: rGbeke.id,
  });
  const rGbeO_kone     = await upsertCandidate(regGbeOld.id, 'Issouf',    'Koné',      { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const rGbeO_coulibaly = await upsertCandidate(regGbeOld.id, 'Dramane',  'Coulibaly', { party_id: pdci.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const rGbeO_sanogo   = await upsertCandidate(regGbeOld.id, 'Mariam',    'Sanogo',    { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // ══════════════════════════════════════════════════════════════════════════
  //  ELECTIONS — EN_COURS (active now)
  // ══════════════════════════════════════════════════════════════════════════

  // 7. Élections Législatives Nationales 2026 — NATIONAL — active (−3h → +8h)
  const legNat = await upsertElection('Élections Législatives Nationales 2026', {
    type: 'LEGISLATIVES', status: 'EN_COURS', geographic_scope: 'NATIONAL',
    description: "Renouvellement de l'ensemble des sièges de l'Assemblée Nationale.",
    start_time: hAgo(3), end_time: hFwd(8),
  });
  const lNat_coulibaly = await upsertCandidate(legNat.id, 'Amadou',    'Coulibaly', { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const lNat_dosso     = await upsertCandidate(legNat.id, 'Mariam',    'Dosso',     { party_id: pdci.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const lNat_bictogo   = await upsertCandidate(legNat.id, 'Adama',     'Bictogo',   { party_id: ppaci.id,       nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const lNat_soro      = await upsertCandidate(legNat.id, 'Guillaume', 'Soro',      { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // 8. Régionales Gbêkê 2026 — REGIONAL (Bouaké) — active (−2h → +10h)
  const regGbe = await upsertElection('Régionales Gbêkê 2026', {
    type: 'REGIONALES', status: 'EN_COURS', geographic_scope: 'REGIONAL',
    description: "Élections régionales pour la région du Gbêkê.",
    start_time: hAgo(2), end_time: hFwd(10),
    scope_region_id: rGbeke.id,
  });
  const rGbe_navigué   = await upsertCandidate(regGbe.id, 'Koné',  'Navigué',   { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const rGbe_coulibaly = await upsertCandidate(regGbe.id, 'Yves',  'Coulibaly', { party_id: pdci.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const rGbe_sanogo    = await upsertCandidate(regGbe.id, 'Aïssa', 'Sanogo',    { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // 9. Municipales Yopougon 2026 — COMMUNAL — active (−2h → +10h)
  const munYop = await upsertElection('Municipales Yopougon 2026', {
    type: 'MUNICIPALES', status: 'EN_COURS', geographic_scope: 'COMMUNAL',
    description: "Élections municipales pour la commune de Yopougon.",
    start_time: hAgo(2), end_time: hFwd(10),
    scope_commune_id: cYopougon.id,
  });
  const mYop_ouattara = await upsertCandidate(munYop.id, 'Gnénéfoly', 'Ouattara', { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const mYop_kobenan  = await upsertCandidate(munYop.id, 'Séraphin',  'Kobenan',  { party_id: pdci.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const mYop_diallo   = await upsertCandidate(munYop.id, 'Fatou',     'Diallo',   { party_id: ppaci.id,       nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const mYop_traore   = await upsertCandidate(munYop.id, 'Moussa',    'Traoré',   { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // 10. Référendum Réforme Électorale 2026 — NATIONAL — active (−1h → +12h)
  const refElec = await upsertElection('Référendum Réforme Électorale 2026', {
    type: 'REFERENDUM', status: 'EN_COURS', geographic_scope: 'NATIONAL',
    description: "Référendum sur la réforme du code électoral et l'introduction du vote électronique.",
    start_time: hAgo(1), end_time: hFwd(12),
  });
  const refE_oui = await upsertCandidate(refElec.id, 'OUI', 'Pour la réforme électorale',   { nationality_verified: true, criminal_record_clear: true, age_verified: true });
  const refE_non = await upsertCandidate(refElec.id, 'NON', 'Contre la réforme électorale', { nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // ══════════════════════════════════════════════════════════════════════════
  //  ELECTIONS — OUVERT (upcoming)
  // ══════════════════════════════════════════════════════════════════════════

  // 11. Municipales Cocody 2026 — COMMUNAL — starts in 2 days
  const munCoc = await upsertElection('Municipales Cocody 2026', {
    type: 'MUNICIPALES', status: derivedStatus(dFwd(2), dFwd(3)), geographic_scope: 'COMMUNAL',
    description: "Élections municipales pour la commune de Cocody.",
    start_time: dFwd(2), end_time: dFwd(3),
    scope_commune_id: cCocody.id,
  });
  await upsertCandidate(munCoc.id, 'Jean-Marc', 'Yacé',   { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  await upsertCandidate(munCoc.id, 'Estelle',   'Assi',   { party_id: pdci.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  await upsertCandidate(munCoc.id, 'Romuald',   'Akpata', { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // 12. Référendum Réforme Foncière 2026 — NATIONAL — starts in 7 days
  const refFonc = await upsertElection('Référendum Réforme Foncière 2026', {
    type: 'REFERENDUM', status: derivedStatus(dFwd(7), dFwd(8)), geographic_scope: 'NATIONAL',
    description: "Référendum sur la réforme de la politique foncière rurale.",
    start_time: dFwd(7), end_time: dFwd(8),
  });
  await upsertCandidate(refFonc.id, 'OUI', 'Pour la réforme foncière',   { nationality_verified: true, criminal_record_clear: true, age_verified: true });
  await upsertCandidate(refFonc.id, 'NON', 'Contre la réforme foncière', { nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // 13. Présidentielle 2026 — NATIONAL — starts in 15 days (brouillon → open campaign)
  const pres2026 = await upsertElection('Élection Présidentielle 2026', {
    type: 'PRESIDENTIELLE', status: derivedStatus(dFwd(15), dFwd(16)), geographic_scope: 'NATIONAL',
    description: "Élection du Président de la République — scrutin quinquennal 2026.",
    start_time: dFwd(15), end_time: dFwd(16),
  });
  await upsertCandidate(pres2026.id, 'Alassane', 'Ouattara',     { party_id: rhdp.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  await upsertCandidate(pres2026.id, 'Tidjane',  'Thiam',        { party_id: pdci.id,        nationality_verified: true, criminal_record_clear: true, age_verified: true });
  await upsertCandidate(pres2026.id, 'Laurent',  'Gbagbo',       { party_id: ppaci.id,       nationality_verified: true, criminal_record_clear: true, age_verified: true });
  await upsertCandidate(pres2026.id, 'Kouadio',  'Konan Bertin', { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  console.log('✓ 13 elections and candidates seeded');

  // ══════════════════════════════════════════════════════════════════════════
  //  USERS
  // ══════════════════════════════════════════════════════════════════════════

  // Extra bureaux for new communes
  const bAbobo   = await upsertBureau("Mairie d'Abobo",              cAbobo.id,        "Abobo, Abidjan",   800);
  const bPlateau = await upsertBureau("Hôtel de Ville du Plateau",   cPlateau.id,      "Plateau, Abidjan", 300);
  const bYam2    = await upsertBureau("Mairie de Yamoussoukro",      cYamoussoukro.id, "Yamoussoukro",     400);

  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const voterHash = await bcrypt.hash('Voter@12345', 10);

  // ── Admin ────────────────────────────────────────────────────────────────
  await prisma.user.upsert({ where: { email: 'admin@agora.gov' }, update: {}, create: {
    national_id: 'ADMIN001', email: 'admin@agora.gov', password_hash: adminHash,
    role: 'ADMIN', status: 'ACTIVE',
    first_name: 'Super', last_name: 'Administrateur',
    date_of_birth: new Date('1980-01-01'), phone_number: '+2250700000000',
    commune_id: cCocody.id, bureau_de_vote_id: bCocody.id,
  }});

  // ── Voters — Cocody (Abidjan) ────────────────────────────────────────────
  const uKouassi = await prisma.user.upsert({ where: { email: 'kouassi@example.com' }, update: {}, create: {
    national_id: 'CI0012345678', email: 'kouassi@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Kouassi', last_name: 'Amani',
    date_of_birth: new Date('1990-04-15'), phone_number: '+2250701234567',
    commune_id: cCocody.id, bureau_de_vote_id: bCocody.id,
  }});
  const uPierre = await prisma.user.upsert({ where: { email: 'pierre@example.com' }, update: {}, create: {
    national_id: 'CI0023456789', email: 'pierre@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Pierre', last_name: 'Aké',
    date_of_birth: new Date('1985-07-20'), phone_number: '+2250701234568',
    commune_id: cCocody.id, bureau_de_vote_id: bCocody.id,
  }});
  const uRachel = await prisma.user.upsert({ where: { email: 'rachel@example.com' }, update: {}, create: {
    national_id: 'CI0034567890', email: 'rachel@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Rachel', last_name: 'Adjoua',
    date_of_birth: new Date('1992-03-08'), phone_number: '+2250701234569',
    commune_id: cCocody.id, bureau_de_vote_id: bCocody.id,
  }});

  // ── Voters — Yopougon (Abidjan) ──────────────────────────────────────────
  const uAminata = await prisma.user.upsert({ where: { email: 'aminata@example.com' }, update: {}, create: {
    national_id: 'CI0087654321', email: 'aminata@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Aminata', last_name: 'Coulibaly',
    date_of_birth: new Date('1995-08-22'), phone_number: '+2250702345678',
    commune_id: cYopougon.id, bureau_de_vote_id: bYopougon.id,
  }});
  const uOumar = await prisma.user.upsert({ where: { email: 'oumar@example.com' }, update: {}, create: {
    national_id: 'CI0098765432', email: 'oumar@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Oumar', last_name: 'Bamba',
    date_of_birth: new Date('1988-11-15'), phone_number: '+2250702345679',
    commune_id: cYopougon.id, bureau_de_vote_id: bYopougon.id,
  }});
  const uBintou = await prisma.user.upsert({ where: { email: 'bintou@example.com' }, update: {}, create: {
    national_id: 'CI0109876543', email: 'bintou@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Bintou', last_name: 'Traoré',
    date_of_birth: new Date('1997-05-30'), phone_number: '+2250702345680',
    commune_id: cYopougon.id, bureau_de_vote_id: bYopougon.id,
  }});

  // ── Voters — Abobo (Abidjan) ─────────────────────────────────────────────
  const uMamadou = await prisma.user.upsert({ where: { email: 'mamadou@example.com' }, update: {}, create: {
    national_id: 'CI0120987654', email: 'mamadou@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Mamadou', last_name: 'Diallo',
    date_of_birth: new Date('1991-01-25'), phone_number: '+2250703456790',
    commune_id: cAbobo.id, bureau_de_vote_id: bAbobo.id,
  }});
  const uNana = await prisma.user.upsert({ where: { email: 'nana@example.com' }, update: {}, create: {
    national_id: 'CI0131098765', email: 'nana@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Nana', last_name: 'Koné',
    date_of_birth: new Date('1999-09-12'), phone_number: '+2250703456791',
    commune_id: cAbobo.id, bureau_de_vote_id: bAbobo.id,
  }});
  const uDidier = await prisma.user.upsert({ where: { email: 'didier@example.com' }, update: {}, create: {
    national_id: 'CI0141209876', email: 'didier@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Didier', last_name: 'Gba',
    date_of_birth: new Date('1986-04-03'), phone_number: '+2250703456792',
    commune_id: cAbobo.id, bureau_de_vote_id: bAbobo.id,
  }});

  // ── Voter — Plateau (Abidjan) ────────────────────────────────────────────
  const uYvonne = await prisma.user.upsert({ where: { email: 'yvonne@example.com' }, update: {}, create: {
    national_id: 'CI0151320987', email: 'yvonne@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Yvonne', last_name: 'Gnonsoa',
    date_of_birth: new Date('1983-12-01'), phone_number: '+2250704567890',
    commune_id: cPlateau.id, bureau_de_vote_id: bPlateau.id,
  }});

  // ── Voters — Bouaké (Gbêkê) ──────────────────────────────────────────────
  const uIbrahim = await prisma.user.upsert({ where: { email: 'ibrahim@example.com' }, update: {}, create: {
    national_id: 'CI0011223344', email: 'ibrahim@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Ibrahim', last_name: 'Koné',
    date_of_birth: new Date('1988-12-03'), phone_number: '+2250703456789',
    commune_id: cBouake.id, bureau_de_vote_id: bBouake.id,
  }});
  const uAli = await prisma.user.upsert({ where: { email: 'ali@example.com' }, update: {}, create: {
    national_id: 'CI0161431098', email: 'ali@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Ali', last_name: 'Kourouma',
    date_of_birth: new Date('1993-06-14'), phone_number: '+2250705678901',
    commune_id: cBouake.id, bureau_de_vote_id: bBouake.id,
  }});
  const uFatima = await prisma.user.upsert({ where: { email: 'fatima@example.com' }, update: {}, create: {
    national_id: 'CI0171542109', email: 'fatima@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Fatima', last_name: 'Sanogo',
    date_of_birth: new Date('1996-08-07'), phone_number: '+2250705678902',
    commune_id: cBouake.id, bureau_de_vote_id: bBouake.id,
  }});

  // ── Voter — Yamoussoukro ─────────────────────────────────────────────────
  const uPaul = await prisma.user.upsert({ where: { email: 'paul@example.com' }, update: {}, create: {
    national_id: 'CI0181653210', email: 'paul@example.com', password_hash: voterHash,
    role: 'VOTER', status: 'ACTIVE',
    first_name: 'Paul', last_name: 'Koffi',
    date_of_birth: new Date('1980-02-28'), phone_number: '+2250706789012',
    commune_id: cYamoussoukro.id, bureau_de_vote_id: bYam2.id,
  }});

  console.log('✓ 14 voters + 1 admin seeded');

  // ══════════════════════════════════════════════════════════════════════════
  //  VOTES  (closed & published elections + partial votes in active ones)
  //  Eligibility:
  //    NATIONAL       → everyone
  //    REGIONAL ABJ   → Cocody, Yopougon, Abobo, Plateau (rAbidjan)
  //    REGIONAL GBEKE → Bouaké (rGbeke)
  //    COMMUNAL COC   → Cocody voters
  //    COMMUNAL YOP   → Yopougon voters
  //    COMMUNAL ABO   → Abobo voters
  // ══════════════════════════════════════════════════════════════════════════

  // ── Présidentielle 2025 (NATIONAL — all 13 voters voted) ─────────────────
  await seedVote(uKouassi.id, pres2025.id, p25_ouattara.id);
  await seedVote(uPierre.id,  pres2025.id, p25_thiam.id);
  await seedVote(uRachel.id,  pres2025.id, p25_ouattara.id);
  await seedVote(uAminata.id, pres2025.id, p25_ouattara.id);
  await seedVote(uOumar.id,   pres2025.id, p25_gbagbo.id);
  await seedVote(uBintou.id,  pres2025.id, p25_ouattara.id);
  await seedVote(uMamadou.id, pres2025.id, p25_ouattara.id);
  await seedVote(uNana.id,    pres2025.id, p25_thiam.id);
  await seedVote(uDidier.id,  pres2025.id, p25_kkb.id);
  await seedVote(uYvonne.id,  pres2025.id, p25_thiam.id);
  await seedVote(uIbrahim.id, pres2025.id, p25_gbagbo.id);
  await seedVote(uAli.id,     pres2025.id, p25_ouattara.id);
  await seedVote(uFatima.id,  pres2025.id, p25_ouattara.id);
  await seedVote(uPaul.id,    pres2025.id, p25_ouattara.id);

  // ── Référendum Nouvelle Constitution 2025 (NATIONAL — all voted) ──────────
  await seedVote(uKouassi.id, ref2025.id, ref_oui.id);
  await seedVote(uPierre.id,  ref2025.id, ref_oui.id);
  await seedVote(uRachel.id,  ref2025.id, ref_non.id);
  await seedVote(uAminata.id, ref2025.id, ref_oui.id);
  await seedVote(uOumar.id,   ref2025.id, ref_oui.id);
  await seedVote(uBintou.id,  ref2025.id, ref_oui.id);
  await seedVote(uMamadou.id, ref2025.id, ref_non.id);
  await seedVote(uNana.id,    ref2025.id, ref_oui.id);
  await seedVote(uDidier.id,  ref2025.id, ref_oui.id);
  await seedVote(uYvonne.id,  ref2025.id, ref_oui.id);
  await seedVote(uIbrahim.id, ref2025.id, ref_non.id);
  await seedVote(uAli.id,     ref2025.id, ref_oui.id);
  await seedVote(uFatima.id,  ref2025.id, ref_oui.id);
  await seedVote(uPaul.id,    ref2025.id, ref_oui.id);

  // ── Régionales Abidjan (REGIONAL rAbidjan — Cocody/Yopougon/Abobo/Plateau) ─
  await seedVote(uKouassi.id, regAbj.id, rAbj_diallo.id);
  await seedVote(uPierre.id,  regAbj.id, rAbj_diallo.id);
  await seedVote(uRachel.id,  regAbj.id, rAbj_lago.id);
  await seedVote(uAminata.id, regAbj.id, rAbj_diallo.id);
  await seedVote(uOumar.id,   regAbj.id, rAbj_gnamien.id);
  await seedVote(uBintou.id,  regAbj.id, rAbj_diallo.id);
  await seedVote(uMamadou.id, regAbj.id, rAbj_lago.id);
  await seedVote(uNana.id,    regAbj.id, rAbj_diallo.id);
  await seedVote(uDidier.id,  regAbj.id, rAbj_gnamien.id);
  await seedVote(uYvonne.id,  regAbj.id, rAbj_diallo.id);

  // ── Législatives Cocody (COMMUNAL cCocody — Cocody voters only) ───────────
  await seedVote(uKouassi.id, legCoc.id, lCoc_kone.id);
  await seedVote(uPierre.id,  legCoc.id, lCoc_brou.id);
  await seedVote(uRachel.id,  legCoc.id, lCoc_kone.id);

  // ── Municipales Abobo (COMMUNAL cAbobo — Abobo voters only) ─────────────
  await seedVote(uMamadou.id, munAbo.id, mAbo_bamba.id);
  await seedVote(uNana.id,    munAbo.id, mAbo_toure.id);
  await seedVote(uDidier.id,  munAbo.id, mAbo_bamba.id);

  // ── Régionales Gbêkê 2025 (REGIONAL rGbeke — Bouaké voters) ─────────────
  await seedVote(uIbrahim.id, regGbeOld.id, rGbeO_kone.id);
  await seedVote(uAli.id,     regGbeOld.id, rGbeO_coulibaly.id);
  await seedVote(uFatima.id,  regGbeOld.id, rGbeO_kone.id);

  // ── Législatives Nationales 2026 (EN_COURS NATIONAL — partial votes) ─────
  await seedVote(uKouassi.id, legNat.id, lNat_coulibaly.id);
  await seedVote(uAminata.id, legNat.id, lNat_dosso.id);
  await seedVote(uIbrahim.id, legNat.id, lNat_soro.id);
  await seedVote(uPaul.id,    legNat.id, lNat_coulibaly.id);

  // ── Régionales Gbêkê 2026 (EN_COURS REGIONAL — partial votes) ───────────
  await seedVote(uIbrahim.id, regGbe.id, rGbe_navigué.id);

  // ── Municipales Yopougon 2026 (EN_COURS COMMUNAL — partial votes) ────────
  await seedVote(uAminata.id, munYop.id, mYop_ouattara.id);
  await seedVote(uOumar.id,   munYop.id, mYop_kobenan.id);

  // ── Référendum Réforme Électorale 2026 (EN_COURS NATIONAL — partial) ─────
  await seedVote(uKouassi.id, refElec.id, refE_oui.id);
  await seedVote(uAminata.id, refElec.id, refE_oui.id);
  await seedVote(uIbrahim.id, refElec.id, refE_non.id);
  await seedVote(uMamadou.id, refElec.id, refE_oui.id);

  console.log('✓ Votes seeded');

  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n✓ Seed complete');
  console.log('─────────────────────────────────────────────────────────────────────');
  console.log('  Geography: 27 regions  |  75 départements  |  ~87 communes');
  console.log('─────────────────────────────────────────────────────────────────────');
  console.log('  PUBLIE   Présidentielle 2025              (national, ended -120d)');
  console.log('  PUBLIE   Référendum Nouvelle Constitution (national, ended -60d)');
  console.log('  CLOS     Régionales District Abidjan      (regional, ended -14d)');
  console.log('  CLOS     Législatives Cocody              (communal, ended -5d)');
  console.log('  CLOS     Municipales Abobo                (communal, ended -3d)');
  console.log('  CLOS     Régionales Gbêkê 2025            (regional, ended -30d)');
  console.log('  EN_COURS Législatives Nationales 2026     (national,  -3h → +8h)');
  console.log('  EN_COURS Régionales Gbêkê 2026            (regional,  -2h → +10h)');
  console.log('  EN_COURS Municipales Yopougon             (communal,  -2h → +10h)');
  console.log('  EN_COURS Référendum Réforme Électorale    (national,  -1h → +12h)');
  console.log('  OUVERT   Municipales Cocody               (communal,  +2d)');
  console.log('  OUVERT   Référendum Réforme Foncière      (national,  +7d)');
  console.log('  OUVERT   Présidentielle 2026              (national,  +15d)');
  console.log('─────────────────────────────────────────────────────────────────────');
  console.log('  Admin:   admin@agora.gov      / Admin@12345');
  console.log('  Voter:   kouassi@example.com  / Voter@12345  (Cocody)    — can vote legNat, refElec');
  console.log('  Voter:   aminata@example.com  / Voter@12345  (Yopougon)  — can vote regGbe? No. legNat');
  console.log('  Voter:   ibrahim@example.com  / Voter@12345  (Bouaké)    — can vote legNat, regGbe');
  console.log('  Voter:   pierre@example.com   / Voter@12345  (Cocody)');
  console.log('  Voter:   oumar@example.com    / Voter@12345  (Yopougon)  — can vote munYop');
  console.log('  Voter:   bintou@example.com   / Voter@12345  (Yopougon)  — can vote munYop, legNat');
  console.log('  Voter:   mamadou@example.com  / Voter@12345  (Abobo)');
  console.log('  Voter:   nana@example.com     / Voter@12345  (Abobo)');
  console.log('  Voter:   didier@example.com   / Voter@12345  (Abobo)');
  console.log('  Voter:   yvonne@example.com   / Voter@12345  (Plateau)');
  console.log('  Voter:   ali@example.com      / Voter@12345  (Bouaké)    — can vote regGbe, legNat');
  console.log('  Voter:   fatima@example.com   / Voter@12345  (Bouaké)    — can vote regGbe, legNat');
  console.log('  Voter:   paul@example.com     / Voter@12345  (Yamoussoukro)');
  console.log('─────────────────────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
