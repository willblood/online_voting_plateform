Loaded Prisma config from prisma.config.ts.

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VOTER', 'ADMIN', 'OBSERVER');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING_OTP', 'ACTIVE', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "ElectionType" AS ENUM ('PRESIDENTIELLE', 'LEGISLATIVES', 'REGIONALES', 'MUNICIPALES', 'REFERENDUM');

-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('BROUILLON', 'OUVERT', 'EN_COURS', 'CLOS', 'PUBLIE');

-- CreateEnum
CREATE TYPE "GeographicScope" AS ENUM ('NATIONAL', 'REGIONAL', 'DEPARTEMENTAL', 'COMMUNAL');

-- CreateTable
CREATE TABLE "regions" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "regions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "departements" (
    "id" UUID NOT NULL,
    "region_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "departements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "communes" (
    "id" UUID NOT NULL,
    "departement_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "communes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bureaux_de_vote" (
    "id" UUID NOT NULL,
    "commune_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "capacity" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "bureaux_de_vote_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "national_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'VOTER',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING_OTP',
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "phone_number" TEXT NOT NULL,
    "commune_id" UUID NOT NULL,
    "bureau_de_vote_id" UUID,
    "otp_code" TEXT,
    "otp_expires_at" TIMESTAMP(3),
    "otp_attempts" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "political_parties" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "logo_url" TEXT,
    "founded_year" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "political_parties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elections" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ElectionType" NOT NULL,
    "description" TEXT,
    "status" "ElectionStatus" NOT NULL DEFAULT 'BROUILLON',
    "geographic_scope" "GeographicScope" NOT NULL DEFAULT 'NATIONAL',
    "scope_region_id" UUID,
    "scope_departement_id" UUID,
    "scope_commune_id" UUID,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "round" INTEGER NOT NULL DEFAULT 1,
    "parent_election_id" UUID,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "party_id" UUID,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "photo_url" TEXT,
    "biography" TEXT,
    "program_url" TEXT,
    "running_mate_id" UUID,
    "nationality_verified" BOOLEAN NOT NULL DEFAULT false,
    "criminal_record_clear" BOOLEAN NOT NULL DEFAULT false,
    "age_verified" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "votes" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "encrypted_vote" TEXT NOT NULL,
    "receipt_code" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "votes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_results" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "scope" "GeographicScope" NOT NULL,
    "scope_id" UUID,
    "votes_count" INTEGER NOT NULL DEFAULT 0,
    "registered_voters" INTEGER NOT NULL DEFAULT 0,
    "turnout_percentage" DECIMAL(5,2) NOT NULL,
    "computed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "election_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "regions_name_key" ON "regions"("name");

-- CreateIndex
CREATE UNIQUE INDEX "regions_code_key" ON "regions"("code");

-- CreateIndex
CREATE UNIQUE INDEX "departements_code_key" ON "departements"("code");

-- CreateIndex
CREATE UNIQUE INDEX "users_national_id_key" ON "users"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE UNIQUE INDEX "political_parties_name_key" ON "political_parties"("name");

-- CreateIndex
CREATE UNIQUE INDEX "political_parties_acronym_key" ON "political_parties"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "votes_receipt_code_key" ON "votes"("receipt_code");

-- CreateIndex
CREATE UNIQUE INDEX "votes_user_id_election_id_key" ON "votes"("user_id", "election_id");

-- CreateIndex
CREATE UNIQUE INDEX "election_results_election_id_candidate_id_scope_scope_id_key" ON "election_results"("election_id", "candidate_id", "scope", "scope_id");

-- AddForeignKey
ALTER TABLE "departements" ADD CONSTRAINT "departements_region_id_fkey" FOREIGN KEY ("region_id") REFERENCES "regions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "communes" ADD CONSTRAINT "communes_departement_id_fkey" FOREIGN KEY ("departement_id") REFERENCES "departements"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bureaux_de_vote" ADD CONSTRAINT "bureaux_de_vote_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_commune_id_fkey" FOREIGN KEY ("commune_id") REFERENCES "communes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_bureau_de_vote_id_fkey" FOREIGN KEY ("bureau_de_vote_id") REFERENCES "bureaux_de_vote"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_scope_region_id_fkey" FOREIGN KEY ("scope_region_id") REFERENCES "regions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_scope_departement_id_fkey" FOREIGN KEY ("scope_departement_id") REFERENCES "departements"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_scope_commune_id_fkey" FOREIGN KEY ("scope_commune_id") REFERENCES "communes"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "elections" ADD CONSTRAINT "elections_parent_election_id_fkey" FOREIGN KEY ("parent_election_id") REFERENCES "elections"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_party_id_fkey" FOREIGN KEY ("party_id") REFERENCES "political_parties"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_running_mate_id_fkey" FOREIGN KEY ("running_mate_id") REFERENCES "candidates"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_results" ADD CONSTRAINT "election_results_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_results" ADD CONSTRAINT "election_results_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

