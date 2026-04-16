https://dbdiagram.io/d/Online-Voting-Systems-6991feb0bd82f5fce2c30c6f

// Use DBML to define your database structure
// Docs: https://dbml.dbdiagram.io/docs

Table districts {
  id uuid [pk]
  name varchar [unique, not null]
  population int [not null]
  area_km2 decimal
  created_at timestamp
}

Table cities {
  id uuid [pk]
  district_id uuid [not null]
  name varchar [not null]
  population int [not null]
  area_km2 decimal
  created_at timestamp
}

Table municipalities {
  id uuid [pk]
  city_id uuid [not null]
  name varchar [not null]
  population int [not null]
  created_at timestamp
}

Table users {
  id uuid [pk]
  national_id varchar [unique, not null]
  email varchar [unique, not null]
  password_hash varchar [not null]
  role varchar [not null] // VOTER, ADMIN, OBSERVER
  municipality_id uuid [not null]
  is_active boolean
  created_at timestamp
  updated_at timestamp
}

Table profiles {
  id uuid [pk]
  user_id uuid [unique, not null]
  first_name varchar [not null]
  last_name varchar [not null]
  date_of_birth date [not null]
  phone_number varchar
  gender varchar
  created_at timestamp
}

Table elections {
  id uuid [pk]
  title varchar [not null]
  type varchar [not null] // PRESIDENTIAL, MUNICIPAL, LEGISLATIVE, REFERENDUM
  description text
  start_time timestamp [not null]
  end_time timestamp [not null]
  status varchar [not null] // UPCOMING, OPEN, CLOSED
  created_at timestamp
  updated_at timestamp
}

Table candidates {
  id uuid [pk]
  election_id uuid [not null]
  first_name varchar [not null]
  last_name varchar [not null]
  party_name varchar
  photo_url text
  created_at timestamp
}

Table election_registrations {
  id uuid [pk]
  election_id uuid [not null]
  user_id uuid [not null]
  municipality_id uuid [not null]
  registered_at timestamp [not null]

  Indexes {
    (election_id, user_id) [unique]
  }
}

Table votes {
  id uuid [pk]
  election_id uuid [not null]
  user_id uuid [not null]
  candidate_id uuid [not null]
  encrypted_vote text [not null]
  receipt_code varchar [unique, not null]
  created_at timestamp [not null]

  Indexes {
    (user_id, election_id) [unique]
  }
}

Table municipality_results {
  id uuid [pk]
  election_id uuid [not null]
  municipality_id uuid [not null]
  candidate_id uuid [not null]
  votes_count int
  registered_voters int
  turnout_percentage decimal

  Indexes {
    (election_id, municipality_id, candidate_id) [unique]
  }
}

Table city_results {
  id uuid [pk]
  election_id uuid [not null]
  city_id uuid [not null]
  candidate_id uuid [not null]
  votes_count int
  registered_voters int
  turnout_percentage decimal

  Indexes {
    (election_id, city_id, candidate_id) [unique]
  }
}

Table district_results {
  id uuid [pk]
  election_id uuid [not null]
  district_id uuid [not null]
  candidate_id uuid [not null]
  votes_count int
  registered_voters int
  turnout_percentage decimal

  Indexes {
    (election_id, district_id, candidate_id) [unique]
  }
}

Table national_results {
  id uuid [pk]
  election_id uuid [not null]
  candidate_id uuid [not null]
  votes_count int
  registered_voters int
  turnout_percentage decimal

  Indexes {
    (election_id, candidate_id) [unique]
  }
}

/* ======================
   RELATIONSHIPS
====================== */

Ref: cities.district_id > districts.id
Ref: municipalities.city_id > cities.id
Ref: users.municipality_id > municipalities.id
Ref: profiles.user_id > users.id

Ref: candidates.election_id > elections.id
Ref: election_registrations.election_id > elections.id
Ref: election_registrations.user_id > users.id
Ref: election_registrations.municipality_id > municipalities.id

Ref: votes.election_id > elections.id
Ref: votes.user_id > users.id
Ref: votes.candidate_id > candidates.id

Ref: municipality_results.election_id > elections.id
Ref: municipality_results.municipality_id > municipalities.id
Ref: municipality_results.candidate_id > candidates.id

Ref: city_results.election_id > elections.id
Ref: city_results.city_id > cities.id
Ref: city_results.candidate_id > candidates.id

Ref: district_results.election_id > elections.id
Ref: district_results.district_id > districts.id
Ref: district_results.candidate_id > candidates.id

Ref: national_results.election_id > elections.id
Ref: national_results.candidate_id > candidates.id
