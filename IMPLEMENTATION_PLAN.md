# AGORA — Ivory Coast Digital Election Platform
## Implementation Plan (Model A — Pure Digital Voting)

> **Context:** School project. Côte d'Ivoire national election platform.
> Voters register once, verify via mock OTP, and cast digital ballots.
> Results are computed automatically from votes cast. Admins manage elections, never touch vote counts.

---

## System Flow (Big Picture)

```
[VOTER]                          [ADMIN / CEI]
   │                                   │
   ├─ Register (NIN + phone + commune) │
   ├─ Receive mock OTP                 │
   ├─ Verify OTP → ACTIVE account      ├─ Create election
   ├─ Login                            ├─ Register candidates
   ├─ See eligible elections           ├─ Open election (EN_COURS)
   ├─ Select candidate                 │
   ├─ Confirm vote                     │
   ├─ Receive receipt token            │
   │                                   ├─ Close election (CLOS)
   │                                   ├─ Review auto-aggregated results
   │                                   └─ Publish (PUBLIE)
   │
[PUBLIC]
   └─ View published results & analytics
```

---

## Geographic Hierarchy (Côte d'Ivoire)

```
Région
  └── Département
        └── Commune
              └── Bureau de vote  ←── Voter is assigned here at registration
```

### Election Scope → Voter Eligibility

| Election Type       | Scope        | Who can vote                                      |
|---------------------|--------------|---------------------------------------------------|
| Présidentielle      | NATIONAL     | All active registered voters                      |
| Référendum          | NATIONAL     | All active registered voters                      |
| Législatives        | DEPARTEMENTAL| Voters whose commune belongs to that département  |
| Régionales          | REGIONAL     | Voters whose commune belongs to that région        |
| Municipales         | COMMUNAL     | Voters whose commune_id matches the election scope|

---

## Phase 1 — Schema Migration
**Branch:** `feat/schema-phase1`
**Goal:** Replace current generic geography with CI hierarchy. Update all models.

### 1.1 — New Geography Models

```prisma
model Region {
  id         String   @id @default(uuid()) @db.Uuid
  name       String   @unique           // "Abidjan", "Yamoussoukro"
  code       String   @unique           // "AB", "YAM"
  population Int
  created_at DateTime @default(now())

  departements Departement[]
  elections    Election[]     // elections scoped to this région

  @@map("regions")
}

model Departement {
  id         String   @id @default(uuid()) @db.Uuid
  region_id  String   @db.Uuid
  name       String                      // "Cocody", "Yopougon"
  code       String   @unique
  population Int
  created_at DateTime @default(now())

  region     Region    @relation(...)
  communes   Commune[]
  elections  Election[]

  @@map("departements")
}

model Commune {
  id             String   @id @default(uuid()) @db.Uuid
  departement_id String   @db.Uuid
  name           String
  population     Int
  created_at     DateTime @default(now())

  departement  Departement    @relation(...)
  bureaux      BureauDeVote[]
  users        User[]
  elections    Election[]

  @@map("communes")
}

model BureauDeVote {
  id         String   @id @default(uuid()) @db.Uuid
  commune_id String   @db.Uuid
  name       String   // "École Primaire Les Rosiers"
  address    String?
  capacity   Int?     // max registered voters
  created_at DateTime @default(now())

  commune    Commune @relation(...)
  users      User[]

  @@map("bureaux_de_vote")
}
```

### 1.2 — Updated User Model

```prisma
enum UserStatus {
  PENDING_OTP   // registered, OTP not yet verified
  ACTIVE        // verified, can vote
  SUSPENDED     // blocked by admin
}

model User {
  id               String     @id @default(uuid()) @db.Uuid
  national_id      String     @unique    // NIN / CNI
  email            String     @unique
  password_hash    String
  role             Role       @default(VOTER)
  status           UserStatus @default(PENDING_OTP)

  // Personal info
  first_name       String
  last_name        String
  date_of_birth    DateTime   @db.Date
  phone_number     String     @unique    // +225 XX XX XX XX XX

  // Geography — determines election eligibility
  commune_id       String     @db.Uuid
  bureau_de_vote_id String?   @db.Uuid  // assigned bureau

  // Mock OTP
  otp_code         String?               // bcrypt-hashed 6-digit code
  otp_expires_at   DateTime?
  otp_attempts     Int        @default(0)

  created_at       DateTime   @default(now())
  updated_at       DateTime   @updatedAt

  commune        Commune       @relation(...)
  bureau         BureauDeVote? @relation(...)
  votes          Vote[]

  @@map("users")
}
```

### 1.3 — Updated Election Model

```prisma
enum ElectionStatus {
  BROUILLON     // draft — not visible to voters
  OUVERT        // published but voting not started yet
  EN_COURS      // voting window active — votes accepted
  CLOS          // voting ended — results being finalized
  PUBLIE        // official results published — public view
}

enum ElectionType {
  PRESIDENTIELLE
  LEGISLATIVES
  REGIONALES
  MUNICIPALES
  REFERENDUM
}

enum GeographicScope {
  NATIONAL
  REGIONAL
  DEPARTEMENTAL
  COMMUNAL
}

model Election {
  id               String          @id @default(uuid()) @db.Uuid
  title            String
  type             ElectionType
  description      String?
  status           ElectionStatus  @default(BROUILLON)
  geographic_scope GeographicScope @default(NATIONAL)

  // For non-national elections: which région/département/commune
  scope_region_id      String?  @db.Uuid
  scope_departement_id String?  @db.Uuid
  scope_commune_id     String?  @db.Uuid

  // Voting window
  start_time  DateTime
  end_time    DateTime

  // Multi-round support
  round              Int      @default(1)
  parent_election_id String?  @db.Uuid

  created_at DateTime @default(now())
  updated_at DateTime @updatedAt

  scope_region      Region?      @relation(...)
  scope_departement Departement? @relation(...)
  scope_commune     Commune?     @relation(...)
  parent_election   Election?    @relation("ElectionRounds", fields: [parent_election_id], references: [id])
  child_elections   Election[]   @relation("ElectionRounds")

  candidates    Candidate[]
  votes         Vote[]
  results       ElectionResult[]

  @@map("elections")
}
```

### 1.4 — Political Party & Updated Candidate

```prisma
model PoliticalParty {
  id          String   @id @default(uuid()) @db.Uuid
  name        String   @unique   // "RHDP", "PPA-CI", "PDCI-RDA"
  acronym     String   @unique
  logo_url    String?
  founded_year Int?
  description String?
  created_at  DateTime @default(now())

  candidates  Candidate[]

  @@map("political_parties")
}

model Candidate {
  id             String   @id @default(uuid()) @db.Uuid
  election_id    String   @db.Uuid
  party_id       String?  @db.Uuid
  first_name     String
  last_name      String
  photo_url      String?
  biography      String?
  program_url    String?            // PDF link to electoral program

  // Running mate (Vice-President, etc.)
  running_mate_id String?  @db.Uuid

  // CEI eligibility fields
  nationality_verified  Boolean @default(false)
  criminal_record_clear Boolean @default(false)
  age_verified          Boolean @default(false)

  created_at DateTime @default(now())

  election     Election        @relation(...)
  party        PoliticalParty? @relation(...)
  running_mate Candidate?      @relation("RunningMate", fields: [running_mate_id], references: [id])

  votes   Vote[]
  results ElectionResult[]

  @@map("candidates")
}
```

### 1.5 — Vote Model (unchanged logic, updated relations)

```prisma
model Vote {
  id             String   @id @default(uuid()) @db.Uuid
  election_id    String   @db.Uuid
  user_id        String   @db.Uuid
  candidate_id   String   @db.Uuid
  encrypted_vote String              // AES-256 encrypted payload
  receipt_code   String   @unique    // anonymous UUID given to voter
  created_at     DateTime @default(now())

  election  Election  @relation(...)
  user      User      @relation(...)
  candidate Candidate @relation(...)

  // One vote per voter per election — enforced at DB level
  @@unique([user_id, election_id])
  @@map("votes")
}
```

### 1.6 — Election Results (auto-computed, never manually entered)

```prisma
// Computed and stored for performance — recalculated when votes change
model ElectionResult {
  id           String   @id @default(uuid()) @db.Uuid
  election_id  String   @db.Uuid
  candidate_id String   @db.Uuid
  scope        GeographicScope
  scope_id     String?  @db.Uuid   // null for NATIONAL

  votes_count          Int     @default(0)
  registered_voters    Int     @default(0)
  turnout_percentage   Decimal @db.Decimal(5, 2)

  computed_at DateTime @default(now())

  election  Election  @relation(...)
  candidate Candidate @relation(...)

  @@unique([election_id, candidate_id, scope, scope_id])
  @@map("election_results")
}
```

### 1.7 — Migration Steps
```bash
# 1. Update schema.prisma with all changes above
npx prisma migrate dev --name phase1_ci_geography

# 2. Regenerate client
npx prisma generate

# 3. Update seed with real CI geography
npx tsx prisma/seed.ts
```

---

## Phase 2 — Backend: Voter Registration & OTP
**Branch:** `feat/voter-registration`
**Goal:** Public registration endpoint with mock OTP. One registration per NIN.

### 2.1 — Module Structure
```
src/
  auth/
    auth.module.ts
    auth.controller.ts    ← register, verify-otp, login, me, resend-otp
    auth.service.ts
    jwt.strategy.ts
    jwt-auth.guard.ts
    dto/
      register.dto.ts
      verify-otp.dto.ts
      login.dto.ts        ← already exists
```

### 2.2 — `POST /auth/register`

**Request:**
```json
{
  "national_id": "CI0012345678",
  "first_name": "Kouassi",
  "last_name": "Amani",
  "date_of_birth": "1990-04-15",
  "phone_number": "+2250701234567",
  "email": "kouassi@example.com",
  "password": "SecurePass123",
  "commune_id": "<uuid>",
  "bureau_de_vote_id": "<uuid>"   // optional at registration
}
```

**Response (200):**
```json
{
  "message": "Registration successful. Check your phone for the OTP.",
  "national_id": "CI0012345678",
  "__dev_otp": "492817"           // MOCK ONLY — remove in production
}
```

**Logic:**
1. Check `national_id` not already registered → `409 Conflict`
2. Check `email` not already registered → `409 Conflict`
3. Hash password (bcrypt, 10 rounds)
4. Generate 6-digit OTP (`Math.floor(100000 + Math.random() * 900000).toString()`)
5. Hash OTP (bcrypt, 10 rounds)
6. Set `otp_expires_at = now + 10 minutes`
7. Create user with `status: PENDING_OTP`
8. **Mock:** return raw OTP in response under `__dev_otp`
9. Log OTP to console: `[OTP] ${phone}: ${otp}`

### 2.3 — `POST /auth/verify-otp`

**Request:**
```json
{ "national_id": "CI0012345678", "otp_code": "492817" }
```

**Response (200):**
```json
{
  "access_token": "eyJ...",
  "user": { "id": "...", "email": "...", "role": "VOTER", "status": "ACTIVE" }
}
```

**Logic:**
1. Find user by `national_id` → `404` if not found
2. Check `status === PENDING_OTP` → `400` if already active
3. Check `otp_attempts < 5` → `429` if exceeded (anti-brute-force)
4. Increment `otp_attempts`
5. Check `otp_expires_at > now` → `400 OTP expired`
6. bcrypt compare `otp_code` with `otp_code` hash → `400 Invalid OTP`
7. Set `status: ACTIVE`, clear `otp_code`, `otp_expires_at`, reset `otp_attempts`
8. Return JWT

### 2.4 — `POST /auth/resend-otp`

**Request:** `{ "national_id": "CI0012345678" }`

**Logic:**
- Only for `PENDING_OTP` users
- Reset OTP attempts counter
- Generate new OTP, reset expiry to `now + 10 min`
- Return new `__dev_otp`

### 2.5 — `GET /auth/me`
Protected (any authenticated user).
Returns full user profile with their commune → département → région chain.

---

## Phase 3 — Backend: Elections & Eligibility
**Branch:** `feat/elections-api`
**Goal:** Voters see and interact with elections they are eligible for.

### 3.1 — Eligibility Service

```typescript
// src/elections/eligibility.service.ts

isEligible(voter: UserWithGeo, election: Election): boolean {
  switch (election.geographic_scope) {
    case 'NATIONAL':
      return true;

    case 'REGIONAL':
      return voter.commune.departement.region_id === election.scope_region_id;

    case 'DEPARTEMENTAL':
      return voter.commune.departement_id === election.scope_departement_id;

    case 'COMMUNAL':
      return voter.commune_id === election.scope_commune_id;
  }
}
```

### 3.2 — `GET /elections`
Protected. Behavior differs by role.

**Voter response:** Only `EN_COURS` + `OUVERT` elections where `isEligible = true`
```json
[
  {
    "id": "...",
    "title": "Présidentielle 2026",
    "type": "PRESIDENTIELLE",
    "status": "EN_COURS",
    "geographic_scope": "NATIONAL",
    "start_time": "2026-10-15T07:00:00Z",
    "end_time": "2026-10-15T18:00:00Z",
    "candidates_count": 4,
    "can_vote": true,
    "already_voted": false,
    "participation_rate": 34.2    // live, computed from votes
  }
]
```

**Admin response:** All elections, all statuses, with full metadata.

### 3.3 — `GET /elections/:id`
Protected.
Returns full election with candidates list (photo, name, party, biography).
Includes `can_vote` and `already_voted` for the requesting voter.

### 3.4 — `GET /elections/public`
**Unprotected.** Returns only `PUBLIE` elections with results summary.
For the public results page — no authentication required.

### 3.5 — Admin Endpoints

```
POST   /elections                        → create (BROUILLON)
PATCH  /elections/:id                    → update details
PATCH  /elections/:id/status             → advance status
POST   /elections/:id/candidates         → add candidate
PATCH  /elections/:id/candidates/:cid   → update candidate
DELETE /elections/:id/candidates/:cid   → remove (only in BROUILLON)
POST   /parties                          → create political party
GET    /parties                          → list parties
```

**Status transition rules (enforced server-side):**
```
BROUILLON → OUVERT      (admin publishes election)
OUVERT    → EN_COURS    (voting window opens — can be auto or manual)
EN_COURS  → CLOS        (voting window closes)
CLOS      → PUBLIE      (CEI admin certifies and publishes)

No skipping. No going backwards.
```

---

## Phase 4 — Backend: Ballot Casting
**Branch:** `feat/voting`
**Goal:** Secure, one-shot digital ballot with receipt token.

### 4.1 — `POST /elections/:id/vote`
Protected (VOTER role only).

**Request:**
```json
{ "candidate_id": "<uuid>" }
```

**Response (201):**
```json
{
  "receipt_code": "a3f9c2e1-84b2-4719-9f31-0012ab3cd456",
  "message": "Your vote has been recorded successfully.",
  "candidate": "Kouamé Adjoumani",
  "election": "Présidentielle 2026"
}
```

**Validation chain (order matters — fail fast):**

| # | Check | Error |
|---|-------|-------|
| 1 | Voter `status === ACTIVE` | 403 Account not verified |
| 2 | Election exists | 404 Election not found |
| 3 | Election `status === EN_COURS` | 400 Voting is not open |
| 4 | Current time within `start_time` / `end_time` | 400 Outside voting window |
| 5 | Voter is geographically eligible | 403 Not eligible for this election |
| 6 | Voter has not already voted | 409 Already voted |
| 7 | `candidate_id` belongs to this election | 400 Invalid candidate |

**Vote creation:**
```typescript
const receipt_code = crypto.randomUUID();

const payload = JSON.stringify({
  election_id,
  candidate_id,
  timestamp: new Date().toISOString(),
});

// AES-256-CBC encryption — decouples vote content from identity
const encrypted_vote = encrypt(payload, process.env.VOTE_ENCRYPTION_KEY);

await prisma.vote.create({
  data: {
    election_id,
    user_id: req.user.id,     // stored for @@unique constraint only
    candidate_id,
    encrypted_vote,
    receipt_code,
  }
});
```

**Note on privacy:** The `user_id` is stored in the `votes` table only to enforce the unique constraint. It is **never returned** in any API response. The `receipt_code` is a random UUID with no connection to the voter's identity.

### 4.2 — `GET /elections/:id/my-receipt`
Protected. Returns the voter's own receipt code for a given election (if they voted).
Does NOT reveal which candidate they voted for.

---

## Phase 5 — Backend: Results Computation
**Branch:** `feat/results`
**Goal:** Auto-compute aggregated results at all geographic levels after each vote.

### 5.1 — Computation Strategy

Results are computed **on-demand** (not after every vote — too slow at scale):
- Triggered when admin calls `PATCH /elections/:id/status` to advance to `CLOS`
- Also available via `GET /elections/:id/results` which computes live

```typescript
// ResultsService.compute(electionId)

// 1. Count votes per candidate
const voteCounts = await prisma.vote.groupBy({
  by: ['candidate_id'],
  where: { election_id },
  _count: { id: true },
});

// 2. For each candidate, join voter's commune → département → région
// 3. Aggregate at each geographic level
// 4. Compute turnout = votes_cast / registered_voters * 100
// 5. Upsert ElectionResult records for each (candidate, scope, scope_id)
```

### 5.2 — `GET /elections/:id/results`

**For PUBLIE elections** (public access):
```json
{
  "election": "Présidentielle 2026",
  "status": "PUBLIE",
  "total_registered": 7200000,
  "total_votes": 4823100,
  "turnout": 66.98,
  "candidates": [
    {
      "name": "Candidate A",
      "party": "RHDP",
      "votes": 2841022,
      "percentage": 58.9,
      "results_by_region": [
        { "region": "Abidjan", "votes": 981000, "percentage": 62.1 },
        { "region": "Yamoussoukro", "votes": 124000, "percentage": 54.3 }
      ]
    }
  ]
}
```

---

## Phase 6 — Frontend: Voter Flow
**Branch:** `feat/frontend-voter`

### 6.1 — Pages & Routes

```
/                    → Landing page (already built)
/register            → Multi-step registration form
/verify-otp          → OTP input screen
/login               → Login form (already built)
/elections           → Eligible elections list (protected)
/elections/:id       → Election detail + vote (protected)
/elections/:id/vote  → Ballot confirmation (protected)
/receipt             → Vote receipt display (protected)
/results             → Public results page (unprotected)
/dashboard           → Admin dashboard (ADMIN role only)
```

### 6.2 — Register Page (`/register`)
Three-step wizard with progress indicator.

**Step 1 — Identity**
- First name, Last name
- Date of birth (date picker)
- NIN / CNI number (format hint: CI + 10 digits)

**Step 2 — Location & Contact**
- Cascading dropdowns: Région → Département → Commune
- Phone number (+225 prefix forced)
- Email address
- Password + confirm password

**Step 3 — OTP Verification**
- 6-box OTP input (one digit per box)
- Countdown timer: "Code expires in 9:47"
- "Resend code" link (active after 60 seconds)
- **Mock notice banner:** `"[DEV MODE] Your OTP is: 492817"`

### 6.3 — Elections List Page (`/elections`)
Only shown to `ACTIVE` voters.

**Card for each eligible election:**
```
┌─────────────────────────────────────────────┐
│  🗳  Présidentielle 2026          NATIONAL   │
│  Voting open until 18:00 today              │
│                                             │
│  4 candidates   │   34.2% voted so far      │
│                                             │
│  [  Vote Now  ]                             │
└─────────────────────────────────────────────┘
```

States:
- **can vote:** gold "Vote Now" button
- **already voted:** teal "✓ Voted · View Receipt" badge
- **upcoming (OUVERT):** grey "Opens Oct 15 at 07:00"
- **not eligible:** not shown at all

### 6.4 — Vote Page (`/elections/:id/vote`)

1. **Candidates grid** — each card shows:
   - Photo
   - Full name
   - Party name + logo
   - Short biography excerpt
   - "Select" button

2. **Confirmation modal** (after selecting):
   ```
   You are about to vote for:
   ┌─────────────────────────────┐
   │  [Photo]  Candidate A       │
   │           RHDP              │
   └─────────────────────────────┘

   ⚠ This action is irreversible.
   Your vote is anonymous and encrypted.

   [  Cancel  ]  [  Confirm Vote  ]
   ```

3. **Loading state** while API call is in progress.

### 6.5 — Receipt Page (`/receipt`)
Shown immediately after successful vote.

```
┌──────────────────────────────────────────────┐
│                                              │
│   ✓  Your vote has been recorded             │
│                                              │
│   Election:  Présidentielle 2026             │
│   Date:      Oct 15, 2026 — 14:32:07        │
│                                              │
│   Your receipt code:                         │
│   ┌──────────────────────────────────────┐   │
│   │  a3f9c2e1-84b2-4719-9f31-0012ab3c   │   │
│   └──────────────────────────────────────┘   │
│   [  Copy  ]                                 │
│                                              │
│   Keep this code. It proves your vote        │
│   was counted without revealing your choice. │
│                                              │
│   [ Back to Elections ]                      │
│                                              │
└──────────────────────────────────────────────┘
```

### 6.6 — Public Results Page (`/results`)
No authentication required.

- List of `PUBLIE` elections
- Per election: candidate bars with percentages
- National totals + collapsible breakdown by région
- Participation rate gauge
- "Last updated" timestamp

---

## Phase 7 — Frontend: Admin Dashboard
**Branch:** `feat/frontend-admin`

### 7.1 — Pages

```
/dashboard                    → Overview stats
/dashboard/elections          → List + create elections
/dashboard/elections/:id      → Manage election (status, candidates)
/dashboard/elections/:id/results → Live results view
/dashboard/users              → Voter management (validate/suspend)
/dashboard/parties            → Political parties CRUD
```

### 7.2 — Key Admin Actions

**Election lifecycle panel:**
```
[BROUILLON] → [Publish →] → [OUVERT] → [Open Voting →] → [EN_COURS]
     → [Close Voting →] → [CLOS] → [Certify & Publish →] → [PUBLIE]
```

**Users table:**
- Filter by status (PENDING_OTP / ACTIVE / SUSPENDED)
- Filter by commune/région
- Actions: Activate, Suspend, Reinstate

---

## Phase 8 — Seed Data (Ivory Coast)
**Branch:** `feat/seed-ci`

### Regions & Geography seeded
```
Région Abidjan
  └── Département Cocody
        └── Commune Cocody
              └── Bureau: "École Primaire les Rosiers"
              └── Bureau: "Lycée Technique d'Abidjan"
        └── Commune Bingerville
  └── Département Yopougon
        └── Commune Yopougon
              └── Bureau: "Mairie de Yopougon"

Région Yamoussoukro
  └── Département Yamoussoukro
        └── Commune Yamoussoukro
              └── Bureau: "École Jacques AKA"

Région Bouaké
  └── Département Bouaké
        └── Commune Bouaké
              └── Bureau: "CEG Bouaké Centre"

Région Daloa
  └── Département Daloa
        └── Commune Daloa

Région San-Pédro
  └── Département San-Pédro
        └── Commune San-Pédro
```

### Demo Elections seeded
```
1. Présidentielle 2026
   scope: NATIONAL | status: EN_COURS
   candidates: 4 (2 with running mates)

2. Législatives Cocody 2026
   scope: DEPARTEMENTAL (Cocody) | status: EN_COURS
   candidates: 3

3. Municipales Yopougon 2026
   scope: COMMUNAL (Yopougon) | status: OUVERT

4. Régionales Abidjan 2026
   scope: REGIONAL (Abidjan) | status: BROUILLON
```

### Demo Users seeded
```
Admin:   admin@agora.gov        / Admin@12345   (role: ADMIN)
Voter 1: kouassi@example.com    / Voter@12345   (commune: Cocody)
         → eligible for: Présidentielle, Législatives Cocody, Régionales Abidjan
Voter 2: aminata@example.com    / Voter@12345   (commune: Yopougon)
         → eligible for: Présidentielle, Municipales Yopougon, Régionales Abidjan
Voter 3: ibrahim@example.com    / Voter@12345   (commune: Bouaké)
         → eligible for: Présidentielle, Régionales Bouaké
```

---

## Environment Variables

```bash
# api/.env

DATABASE_URL="postgresql://user@localhost:5432/agora_ci"
JWT_SECRET="your-super-secret-jwt-key-change-in-prod"
VOTE_ENCRYPTION_KEY="32-byte-hex-key-for-aes-256"   # openssl rand -hex 32
FRONTEND_URL="http://localhost:5173"
PORT=3000
```

---

## Implementation Order (Recommended)

```
Phase 1  → Schema migration + seed CI data
Phase 2  → Registration + OTP backend
Phase 3  → Elections API + eligibility
Phase 4  → Voting endpoint
Phase 5  → Results computation
Phase 6  → Voter frontend (register → vote → receipt)
Phase 7  → Admin dashboard frontend
Phase 8  → Final seed + demo polish
```

---

## Demo Script (Presentation Day)

```
1. Open /register
   → Register as Kouassi Amani, Commune: Cocody
   → Note the __dev_otp in response
   → Enter OTP → account ACTIVE

2. Logged in → /elections
   → See: Présidentielle 2026 ✓ | Législatives Cocody ✓ | Municipales Yopougon ✗

3. Click "Vote Now" on Présidentielle
   → Browse 4 candidate cards
   → Select candidate → confirmation modal
   → Confirm → receipt page with receipt code

4. Try to vote again → blocked with "Already voted"

5. Login as admin@agora.gov
   → Dashboard: 1 vote recorded in Présidentielle
   → Advance Présidentielle to CLOS
   → View results: Candidate X leads with 100% (only 1 vote)
   → Publish → public results visible at /results

6. Open /results (no login)
   → See Présidentielle published results
```

---

*Plan version 1.0 — Model A Pure Digital Voting — Côte d'Ivoire*
