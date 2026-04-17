import 'dotenv/config';
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
  //  ELECTIONS & CANDIDATES
  // ══════════════════════════════════════════════════════════════════════════

  const now = new Date();
  const votingStart = new Date(now.getTime() - 2 * 60 * 60 * 1000);
  const votingEnd   = new Date(now.getTime() + 10 * 60 * 60 * 1000);

  async function upsertElection(title: string, data: object) {
    const existing = await prisma.election.findFirst({ where: { title } });
    if (existing) return existing;
    return prisma.election.create({ data: data as any });
  }
  async function upsertCandidate(election_id: string, first_name: string, last_name: string, data: object) {
    const existing = await prisma.candidate.findFirst({ where: { election_id, first_name, last_name } });
    if (existing) return existing;
    return prisma.candidate.create({ data: { election_id, first_name, last_name, ...data } as any });
  }

  const presidentielle = await upsertElection('Élection Présidentielle 2026', {
    title: 'Élection Présidentielle 2026',
    type: 'PRESIDENTIELLE', status: 'EN_COURS', geographic_scope: 'NATIONAL',
    description: "Élection du Président de la République de Côte d'Ivoire pour un mandat de 5 ans.",
    start_time: votingStart, end_time: votingEnd,
  });
  await upsertCandidate(presidentielle.id, 'Alassane', 'Ouattara', { party_id: rhdp.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });
  await upsertCandidate(presidentielle.id, 'Tidjane', 'Thiam',    { party_id: pdci.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });
  await upsertCandidate(presidentielle.id, 'Laurent', 'Gbagbo',   { party_id: ppaci.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });
  await upsertCandidate(presidentielle.id, 'Kouadio', 'Konan Bertin', { party_id: independant.id, nationality_verified: true, criminal_record_clear: true, age_verified: true });

  // ══════════════════════════════════════════════════════════════════════════
  //  USERS
  // ══════════════════════════════════════════════════════════════════════════

  const adminHash = await bcrypt.hash('Admin@12345', 10);
  const voterHash = await bcrypt.hash('Voter@12345', 10);

  await prisma.user.upsert({
    where: { email: 'admin@agora.gov' },
    update: {},
    create: {
      national_id: 'ADMIN001', email: 'admin@agora.gov', password_hash: adminHash,
      role: 'ADMIN', status: 'ACTIVE',
      first_name: 'Super', last_name: 'Administrateur',
      date_of_birth: new Date('1980-01-01'), phone_number: '+2250700000000',
      commune_id: cCocody.id, bureau_de_vote_id: bCocody.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'kouassi@example.com' },
    update: {},
    create: {
      national_id: 'CI0012345678', email: 'kouassi@example.com', password_hash: voterHash,
      role: 'VOTER', status: 'ACTIVE',
      first_name: 'Kouassi', last_name: 'Amani',
      date_of_birth: new Date('1990-04-15'), phone_number: '+2250701234567',
      commune_id: cCocody.id, bureau_de_vote_id: bCocody.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'aminata@example.com' },
    update: {},
    create: {
      national_id: 'CI0087654321', email: 'aminata@example.com', password_hash: voterHash,
      role: 'VOTER', status: 'ACTIVE',
      first_name: 'Aminata', last_name: 'Coulibaly',
      date_of_birth: new Date('1995-08-22'), phone_number: '+2250702345678',
      commune_id: cYopougon.id, bureau_de_vote_id: bYopougon.id,
    },
  });

  await prisma.user.upsert({
    where: { email: 'ibrahim@example.com' },
    update: {},
    create: {
      national_id: 'CI0011223344', email: 'ibrahim@example.com', password_hash: voterHash,
      role: 'VOTER', status: 'ACTIVE',
      first_name: 'Ibrahim', last_name: 'Koné',
      date_of_birth: new Date('1988-12-03'), phone_number: '+2250703456789',
      commune_id: cBouake.id, bureau_de_vote_id: bBouake.id,
    },
  });

  // ══════════════════════════════════════════════════════════════════════════
  console.log('\n✓ Seed complete');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('  Geography: 27 regions  |  75 départements  |  ~87 communes');
  console.log('─────────────────────────────────────────────────────────────');
  console.log('  Admin:   admin@agora.gov      / Admin@12345');
  console.log('  Voter 1: kouassi@example.com  / Voter@12345  (Cocody, ABJ)');
  console.log('  Voter 2: aminata@example.com  / Voter@12345  (Yopougon, ABJ)');
  console.log('  Voter 3: ibrahim@example.com  / Voter@12345  (Bouaké, GBE)');
  console.log('─────────────────────────────────────────────────────────────\n');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
