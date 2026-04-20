# Agora — Live Demonstration Guide

This guide covers everything needed to run a polished live demo of the Agora
Voting Platform on **Sunday April 20** or **Wednesday April 23, 2026**.

---

## Quick Setup

```bash
# 1. API: migrate and seed (from /api)
cd api
npx prisma migrate dev --name init   # skip if already migrated
npm run seed                         # base geography (regions, communes, bureaux)
npm run seed:demo                    # 300 voters + demo elections + results

# 2. Start backend
npm run start:dev

# 3. Start frontend (new terminal, from /frontend)
cd ../frontend
npm run dev
```

The seed is **idempotent** — re-running it updates stale records safely.

---

## Credentials

### Admin accounts — password `Admin@12345`

| Email | Role | Notes |
|---|---|---|
| `admin@agora.gov` | ADMIN | Super admin — use for all admin demos |
| `admin.abidjan@agora.gov` | ADMIN | Regional admin Abidjan |
| `admin.bouake@agora.gov` | ADMIN | Regional admin Bouaké |
| `admin.yam@agora.gov` | ADMIN | Regional admin Yamoussoukro |
| `observateur@agora.gov` | OBSERVER | Read-only observer account |

### Voter accounts — password `Voter@12345`

300 voters spread across communes, all with the same password.

| Email range | Commune | Count |
|---|---|---|
| `voter000001@demo.ci` → `voter000080@demo.ci` | Cocody (Abidjan) | 80 |
| `voter000081@demo.ci` → `voter000160@demo.ci` | Yopougon (Abidjan) | 80 |
| `voter000161@demo.ci` → `voter000220@demo.ci` | Abobo (Abidjan) | 60 |
| `voter000221@demo.ci` → `voter000250@demo.ci` | Bouaké | 30 |
| `voter000251@demo.ci` → `voter000270@demo.ci` | Yamoussoukro | 20 |
| `voter000271@demo.ci` → `voter000285@demo.ci` | Plateau (Abidjan) | 15 |
| `voter000286@demo.ci` → `voter000293@demo.ci` | San-Pédro | 8 |
| `voter000294@demo.ci` → `voter000300@demo.ci` | Daloa | 7 |

#### Recommended fresh voters for live voting demo

These voters have **not yet voted** in any active election — use them to
demonstrate the full voting flow:

| Email | Commune | Eligible for |
|---|---|---|
| `voter000002@demo.ci` | Cocody | Réf. Numérique (Apr 20) · Présidentielle 26 (Apr 23) |
| `voter000084@demo.ci` | Yopougon | Législ. Yopougon (Apr 20) · Réf. Numérique · Présidentielle 26 |
| `voter000162@demo.ci` | Abobo | Réf. Numérique (Apr 20) · Présidentielle 26 (Apr 23) |
| `voter000222@demo.ci` | Bouaké | Régionales Gbêkê (Apr 23) · Présidentielle 26 (Apr 23) |

---

## Elections Overview

### Past elections — status PUBLIE (results published)

| Election | Scope | Date | Winner |
|---|---|---|---|
| Présidentielle 2025 | National | 21/09/2025 | Ouattara (RHDP) 54.3 % |
| Régionales District Abidjan 2025 | Régional | 10/11/2025 | Diallo (RHDP) 52.4 % |
| Référendum Révision Constitution 2025 | National | 07/12/2025 | OUI 68.7 % |
| Législatives Nationales 2026 — Tour 1 | National | 08/02/2026 | Coulibaly (RHDP) 43.2 % |
| Municipales Cocody 2026 | Communal | 15/03/2026 | Yacé (RHDP) 48.5 % |

### Recent election — status CLOS (ended, results pending)

| Election | Scope | Date | Note |
|---|---|---|---|
| Municipales Abobo 2026 | Communal | 13/04/2026 | Admin must publish results |

### April 20 elections — EN_COURS during demo #1 (turns CLOS on Apr 23)

| Election | Scope | Partial results |
|---|---|---|
| Référendum Transformation Numérique 2026 | National | ~25 % voted (OUI leading) |
| Législatives Spéciales Yopougon 2026 | Communal (Yopougon) | ~30 % voted |

### April 23 elections — OUVERT on Apr 20, EN_COURS during demo #2

| Election | Scope | Candidates |
|---|---|---|
| Présidentielle 2026 — Tour 1 | National | Ouattara · Thiam · Gbagbo · KKB |
| Régionales Gbêkê 2026 | Régional (Bouaké) | Navigué · Coulibaly · Sanogo |
| Municipales Bouaké 2026 | Communal (Bouaké) | Tall · Silué · Sangaré |

---

## Demo Scenario: April 20 (Sunday)

### Storyline

> "Our platform manages the full electoral lifecycle. Today, voters across
> the country are casting their ballots in two live elections. Let's walk
> through the experience end-to-end."

### Step-by-step walkthrough

**1. Public home page**
- Open the app — show the list of elections
- Point out the two **EN_COURS** elections (Référendum Numérique + Législatives Yopougon)
- Show the five **PUBLIE** elections below them with published results badges

**2. Explore published results**
- Click **Présidentielle 2025** → show the results page
  - National turnout: **68.4 %**
  - Ouattara wins with **54.3 %** (2,785,590 votes)
  - Chart shows four candidates, clear majority
- Click **Référendum Révision Constitution 2025**
  - OUI wins: **68.7 %** — 4,590,000 total votes

**3. Voter login and live voting**
- Navigate to Login
- Enter: `voter000002@demo.ci` / `Voter@12345` (Cocody voter)
- Show the voter's dashboard — two active elections visible
- Click **Référendum Transformation Numérique 2026**
  - Current partial results: ~75 voters already voted (OUI leading ~68 %)
  - Cast a vote for **OUI** or **NON**
  - Show the receipt/confirmation screen with the unique receipt code
- Back to dashboard → election now shows "Vous avez déjà voté"

**4. Second voter — Yopougon**
- Log out, log in as `voter000084@demo.ci` / `Voter@12345`
- Show their eligible elections (includes Législatives Spéciales Yopougon)
- Cast a vote in Législatives Yopougon
- Show receipt

**5. Admin view — real-time results**
- Log out, log in as `admin@agora.gov` / `Admin@12345`
- Open the admin dashboard
- Navigate to **Référendum Numérique** results
  - Show the live tally updating with the votes just cast
- Navigate to **Municipales Abobo 2026** (CLOS)
  - 42 votes recorded, results not yet published
  - Demo the **Publish Results** button (or discuss the workflow)

**6. Elections opening next Wednesday**
- In admin panel, show the **Présidentielle 2026 — Tour 1** (status: OUVERT)
  - Opening: Wednesday April 23, 08:00
  - 4 candidates already registered with biographies
- Show Régionales Gbêkê and Municipales Bouaké also scheduled for that day

---

## Demo Scenario: April 23 (Wednesday)

> "The presidential election opens today. Millions of voters will participate
> in the most important election of the cycle."

### What changed since April 20

- April 20 elections (Référendum Numérique, Législatives Yopougon) are now **CLOS**
- April 23 elections are now **EN_COURS** (since 08:00 this morning)
- Re-run `npm run seed:demo` to refresh statuses if needed (idempotent)

### Step-by-step walkthrough

**1. Show the context shift**
- Home page: April 20 elections show CLOS, April 23 elections show EN_COURS
- Emphasise the platform automatically tracks the lifecycle

**2. Admin publishes April 20 results**
- Login as `admin@agora.gov` / `Admin@12345`
- Open **Référendum Transformation Numérique 2026** (CLOS)
- Show the vote tally
- Click **Publier les résultats** → status changes to PUBLIE
- Navigate back — the election now appears in the published results section

**3. Live voting — Présidentielle 2026**
- Login as `voter000002@demo.ci` / `Voter@12345`
- Show that this voter is eligible for **Présidentielle 2026 — Tour 1**
  - (It's a national election — all voters can participate)
- Also eligible for no April 20 elections (they're closed)
- Cast a presidential vote — show the ballot with 4 candidates
- Show receipt code

**4. Bouaké voter — regional + communal elections**
- Login as `voter000222@demo.ci` / `Voter@12345`
- Show 3 eligible elections:
  - Présidentielle 2026 (national)
  - Régionales Gbêkê 2026 (regional — Bouaké only)
  - Municipales Bouaké 2026 (communal — Bouaké only)
- Vote in all three to demonstrate multi-election participation in one session

**5. Admin real-time dashboard**
- Switch back to admin
- Show live vote counters climbing for the Présidentielle
- Point out geographic breakdown if implemented

**6. Observer account**
- Login as `observateur@agora.gov` / `Admin@12345`
- Show that observers can view results and audit data but cannot modify anything

---

## Troubleshooting

**Seed fails: "Commune not found"**  
Run the base seed first: `npm run seed` then retry `npm run seed:demo`.

**Elections show wrong status (CLOS instead of EN_COURS)**  
The April 20 elections end at 20:00 CIV time. After that they become CLOS — this is expected.
For April 23 elections, they start at 08:00 CIV. Run `npm run seed:demo` again to refresh.

**Voter can't see an election**  
Check commune eligibility — regional and communal elections only appear for voters
in the correct geographic scope.

**"Email already in use" when registering during demo**  
The demo voters are pre-registered. Use the accounts from the table above rather
than the registration flow, or register a brand-new email to demonstrate registration.

**Database empty / migration error**  
```bash
cd api
npx prisma migrate reset   # drops + recreates
npm run seed
npm run seed:demo
```
