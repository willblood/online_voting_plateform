-- CreateEnum
CREATE TYPE "Role" AS ENUM ('VOTER', 'ADMIN', 'OBSERVER');

-- CreateEnum
CREATE TYPE "ElectionType" AS ENUM ('PRESIDENTIAL', 'MUNICIPAL', 'LEGISLATIVE', 'REFERENDUM');

-- CreateEnum
CREATE TYPE "ElectionStatus" AS ENUM ('UPCOMING', 'OPEN', 'CLOSED');

-- CreateTable
CREATE TABLE "districts" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "area_km2" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "districts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cities" (
    "id" UUID NOT NULL,
    "district_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "area_km2" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "municipalities" (
    "id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "population" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "municipalities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "national_id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "municipality_id" UUID NOT NULL,
    "is_active" BOOLEAN DEFAULT true,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "date_of_birth" DATE NOT NULL,
    "phone_number" TEXT,
    "gender" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "elections" (
    "id" UUID NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ElectionType" NOT NULL,
    "description" TEXT,
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "status" "ElectionStatus" NOT NULL DEFAULT 'UPCOMING',
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3),

    CONSTRAINT "elections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "candidates" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "first_name" TEXT NOT NULL,
    "last_name" TEXT NOT NULL,
    "party_name" TEXT,
    "photo_url" TEXT,
    "created_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "candidates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "election_registrations" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "municipality_id" UUID NOT NULL,
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "election_registrations_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "municipality_results" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "municipality_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "votes_count" INTEGER,
    "registered_voters" INTEGER,
    "turnout_percentage" DECIMAL(5,2),

    CONSTRAINT "municipality_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "city_results" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "city_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "votes_count" INTEGER,
    "registered_voters" INTEGER,
    "turnout_percentage" DECIMAL(5,2),

    CONSTRAINT "city_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "district_results" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "district_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "votes_count" INTEGER,
    "registered_voters" INTEGER,
    "turnout_percentage" DECIMAL(5,2),

    CONSTRAINT "district_results_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "national_results" (
    "id" UUID NOT NULL,
    "election_id" UUID NOT NULL,
    "candidate_id" UUID NOT NULL,
    "votes_count" INTEGER,
    "registered_voters" INTEGER,
    "turnout_percentage" DECIMAL(5,2),

    CONSTRAINT "national_results_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "districts_name_key" ON "districts"("name");

-- CreateIndex
CREATE UNIQUE INDEX "users_national_id_key" ON "users"("national_id");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "election_registrations_election_id_user_id_key" ON "election_registrations"("election_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "votes_receipt_code_key" ON "votes"("receipt_code");

-- CreateIndex
CREATE UNIQUE INDEX "votes_user_id_election_id_key" ON "votes"("user_id", "election_id");

-- CreateIndex
CREATE UNIQUE INDEX "municipality_results_election_id_municipality_id_candidate__key" ON "municipality_results"("election_id", "municipality_id", "candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "city_results_election_id_city_id_candidate_id_key" ON "city_results"("election_id", "city_id", "candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "district_results_election_id_district_id_candidate_id_key" ON "district_results"("election_id", "district_id", "candidate_id");

-- CreateIndex
CREATE UNIQUE INDEX "national_results_election_id_candidate_id_key" ON "national_results"("election_id", "candidate_id");

-- AddForeignKey
ALTER TABLE "cities" ADD CONSTRAINT "cities_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipalities" ADD CONSTRAINT "municipalities_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "candidates" ADD CONSTRAINT "candidates_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_registrations" ADD CONSTRAINT "election_registrations_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_registrations" ADD CONSTRAINT "election_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "election_registrations" ADD CONSTRAINT "election_registrations_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipality_results" ADD CONSTRAINT "municipality_results_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipality_results" ADD CONSTRAINT "municipality_results_municipality_id_fkey" FOREIGN KEY ("municipality_id") REFERENCES "municipalities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "municipality_results" ADD CONSTRAINT "municipality_results_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_results" ADD CONSTRAINT "city_results_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_results" ADD CONSTRAINT "city_results_city_id_fkey" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "city_results" ADD CONSTRAINT "city_results_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district_results" ADD CONSTRAINT "district_results_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district_results" ADD CONSTRAINT "district_results_district_id_fkey" FOREIGN KEY ("district_id") REFERENCES "districts"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "district_results" ADD CONSTRAINT "district_results_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "national_results" ADD CONSTRAINT "national_results_election_id_fkey" FOREIGN KEY ("election_id") REFERENCES "elections"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "national_results" ADD CONSTRAINT "national_results_candidate_id_fkey" FOREIGN KEY ("candidate_id") REFERENCES "candidates"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
