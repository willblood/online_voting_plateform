https://dbdiagram.io/d/Online-Voting-Systems-6991feb0bd82f5fce2c30c6f

// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs
// This file mirrors api/prisma/schema.prisma — keep them in sync.

// Enums (documented as comments; DBML does not support enums natively)
// Role:            VOTER | ADMIN | OBSERVER
// UserStatus:      PENDING_OTP | ACTIVE | SUSPENDED
// ElectionType:    PRESIDENTIELLE | LEGISLATIVES | REGIONALES | MUNICIPALES | REFERENDUM
// ElectionStatus:  BROUILLON | OUVERT | EN_COURS | CLOS | PUBLIE
// GeographicScope: NATIONAL | REGIONAL | DEPARTEMENTAL | COMMUNAL

/* ======================
   GEOGRAPHY (Côte d'Ivoire)
   Region → Departement → Commune → BureauDeVote
====================== */

Table regions {
  id         uuid      [pk]
  name       varchar   [unique, not null]
  code       varchar   [unique, not null]
  population int       [not null]
  created_at timestamp
}

Table departements {
  id         uuid      [pk]
  region_id  uuid      [not null]
  name       varchar   [not null]
  code       varchar   [unique, not null]
  population int       [not null]
  created_at timestamp
}

Table communes {
  id             uuid      [pk]
  departement_id uuid      [not null]
  name           varchar   [not null]
  population     int       [not null]
  created_at     timestamp
}

Table bureaux_de_vote {
  id         uuid      [pk]
  commune_id uuid      [not null]
  name       varchar   [not null]
  address    varchar
  capacity   int
  created_at timestamp
}

/* ======================
   USERS
====================== */

Table users {
  id                uuid      [pk]
  national_id       varchar   [unique, not null]
  email             varchar   [unique, not null]
  password_hash     varchar   [not null]
  role              varchar   [not null, note: 'VOTER | ADMIN | OBSERVER']
  status            varchar   [not null, note: 'PENDING_OTP | ACTIVE | SUSPENDED']
  first_name        varchar   [not null]
  last_name         varchar   [not null]
  date_of_birth     date      [not null]
  phone_number      varchar   [unique, not null]
  commune_id        uuid      [not null]
  bureau_de_vote_id uuid
  otp_code          varchar
  otp_expires_at    timestamp
  otp_attempts      int       [not null, default: 0]
  created_at        timestamp
  updated_at        timestamp
}

/* ======================
   POLITICAL PARTIES
====================== */

Table political_parties {
  id           uuid    [pk]
  name         varchar [unique, not null]
  acronym      varchar [unique, not null]
  logo_url     text
  founded_year int
  description  text
  created_at   timestamp
}

/* ======================
   ELECTIONS & CANDIDATES
====================== */

Table elections {
  id                   uuid      [pk]
  title                varchar   [not null]
  type                 varchar   [not null, note: 'PRESIDENTIELLE | LEGISLATIVES | REGIONALES | MUNICIPALES | REFERENDUM']
  description          text
  status               varchar   [not null, note: 'BROUILLON | OUVERT | EN_COURS | CLOS | PUBLIE']
  geographic_scope     varchar   [not null, note: 'NATIONAL | REGIONAL | DEPARTEMENTAL | COMMUNAL']
  scope_region_id      uuid
  scope_departement_id uuid
  scope_commune_id     uuid
  start_time           timestamp [not null]
  end_time             timestamp [not null]
  round                int       [not null, default: 1]
  parent_election_id   uuid
  created_at           timestamp
  updated_at           timestamp
}

Table candidates {
  id                    uuid    [pk]
  election_id           uuid    [not null]
  party_id              uuid
  first_name            varchar [not null]
  last_name             varchar [not null]
  photo_url             text
  biography             text
  program_url           text
  running_mate_id       uuid
  nationality_verified  boolean [not null, default: false]
  criminal_record_clear boolean [not null, default: false]
  age_verified          boolean [not null, default: false]
  created_at            timestamp
}

/* ======================
   VOTES
====================== */

Table votes {
  id             uuid      [pk]
  election_id    uuid      [not null]
  user_id        uuid      [not null]
  candidate_id   uuid      [not null]
  encrypted_vote text      [not null]
  receipt_code   varchar   [unique, not null]
  created_at     timestamp [not null]

  Indexes {
    (user_id, election_id) [unique]
  }
}

/* ======================
   RESULTS (polymorphic — single table for all geographic scopes)
====================== */

Table election_results {
  id                 uuid    [pk]
  election_id        uuid    [not null]
  candidate_id       uuid    [not null]
  scope              varchar [not null, note: 'NATIONAL | REGIONAL | DEPARTEMENTAL | COMMUNAL']
  scope_id           uuid    [note: 'NULL for NATIONAL scope; region/departement/commune id otherwise']
  votes_count        int     [not null, default: 0]
  registered_voters  int     [not null, default: 0]
  turnout_percentage decimal
  computed_at        timestamp

  Indexes {
    (election_id, candidate_id, scope, scope_id) [unique]
  }
}

/* ======================
   RELATIONSHIPS
====================== */

Ref: departements.region_id > regions.id
Ref: communes.departement_id > departements.id
Ref: bureaux_de_vote.commune_id > communes.id

Ref: users.commune_id > communes.id
Ref: users.bureau_de_vote_id > bureaux_de_vote.id

Ref: political_parties.id < candidates.party_id

Ref: elections.scope_region_id > regions.id
Ref: elections.scope_departement_id > departements.id
Ref: elections.scope_commune_id > communes.id
Ref: elections.parent_election_id > elections.id

Ref: candidates.election_id > elections.id
Ref: candidates.running_mate_id > candidates.id

Ref: votes.election_id > elections.id
Ref: votes.user_id > users.id
Ref: votes.candidate_id > candidates.id

Ref: election_results.election_id > elections.id
Ref: election_results.candidate_id > candidates.id
