# AGORA — UI/UX Screen Design Plan
## Plateforme Électorale Numérique de Côte d'Ivoire

> **Version:** 1.0 — Pre-implementation planning document
> **Stack:** React 19 + React Router v7 + TailwindCSS v4
> **Methodology:** Mobile-first (CI mobile penetration > desktop), French-primary, CI national identity

---

## 1. DESIGN SYSTEM

### 1.1 Color Palette

Derived from Côte d'Ivoire national flag colors (orange–white–green tricolor) adapted for professional, accessible UI use.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PRIMARY PALETTE — "Forêt Ivoirienne" (Ivorian Forest Green)

  --color-primary-900   #003D1A     Deep forest — sidebar, headers
  --color-primary-800   #005225     Dark green — hover states
  --color-primary-700   #006B30     Default primary (buttons, links, nav)
  --color-primary-600   #008A3E     Lighter — outlined button borders
  --color-primary-500   #009A44     National CI green — success, badges
  --color-primary-100   #E6F5EC     Light tint — selected rows, highlights
  --color-primary-50    #F2FAF5     Subtle bg — page sections

ACCENT PALETTE — "Feu de Savane" (Savanna Fire Orange)

  --color-accent-700    #B35A00     Dark orange — hover on CTAs
  --color-accent-600    #CC6600     Default accent
  --color-accent-500    #E67300     Primary CTA (buttons, countdown)
  --color-accent-400    #FF8200     Flag orange — hero accents only
  --color-accent-100    #FFEEDA     Light tint — warning backgrounds
  --color-accent-50     #FFF7F0     Subtle tint

ADMIN PALETTE — "Nuit d'Abidjan" (Abidjan Night Indigo)

  --color-admin-900     #0D1B2E     Admin sidebar, darkest
  --color-admin-800     #1A3A6B     Admin header bg
  --color-admin-600     #2E5FAC     Admin links, secondary actions
  --color-admin-100     #E8EEF8     Admin highlight bg
  --color-admin-50      #F3F6FC     Admin subtle bg

NEUTRAL SCALE

  --color-neutral-900   #0D1117     Body text
  --color-neutral-700   #3D4A57     Secondary text
  --color-neutral-500   #8897A4     Placeholder, disabled
  --color-neutral-300   #C5CDD5     Borders, dividers
  --color-neutral-200   #D4DDE4     Light borders
  --color-neutral-100   #EEF2F6     Card background
  --color-neutral-50    #F7F9FB     Page background
  --color-white         #FFFFFF     Surface

SEMANTIC COLORS

  --color-success       #009A44     (primary-500)
  --color-warning       #E67300     (accent-500)
  --color-error         #C0392B
  --color-info          #2E5FAC     (admin-600)
  --color-error-bg      #FDECEC
  --color-warning-bg    #FFF3E0
  --color-success-bg    #E6F5EC

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

**Context switching via header color:**
- `#006B30` (green) = Voter-facing public portal
- `#1A3A6B` (indigo) = Admin dashboard — visually distinct, prevents confusion

### 1.2 Typography

```
Font stack:
  Display:    'Plus Jakarta Sans', 'Inter', sans-serif
  Body:       'Inter', system-ui, sans-serif
  Data/Mono:  'JetBrains Mono', 'Fira Code', monospace

Scale:
  --text-xs     12px / 400   captions, legal
  --text-sm     14px / 400   labels, helper text
  --text-base   16px / 400   body (MINIMUM — French text is verbose)
  --text-lg     18px / 500   card titles, nav items
  --text-xl     20px / 600   section titles
  --text-2xl    24px / 700   page titles mobile
  --text-3xl    30px / 700   page titles desktop
  --text-4xl    36px / 800   hero headline mobile
  --text-5xl    48px / 800   hero headline desktop
  --text-data   28px / 700 mono   vote counts, percentages
```

**French language note:** All button labels, form field labels, and UI strings must be written in French. Allow 20–25% more horizontal space than equivalent English labels in component design.

### 1.3 Spacing & Layout

```
Grid: 4px base unit
  --space-1   4px
  --space-2   8px
  --space-3   12px
  --space-4   16px
  --space-5   20px
  --space-6   24px
  --space-8   32px
  --space-10  40px
  --space-12  48px
  --space-16  64px

Breakpoints:
  mobile:   < 640px     (primary voter — single column)
  tablet:   640–1024px  (observer, simplified admin)
  desktop:  > 1024px    (full admin, analytics)

Max content width:
  Public pages:  1200px
  Admin:         1400px

Touch targets: min 48×48px for all interactive elements
Card border radius: 12px (softer, more approachable)
Button border radius: 8px
Input border radius: 8px
```

### 1.4 Iconography & Illustration

- **Icon library:** Lucide React (line-style, consistent 1.5px stroke, excellent SVG)
- **Key icons per section:**
  - Elections: `Vote` / `Ballot` → use `CheckSquare` or `ClipboardList`
  - Candidates: `User` / `Users`
  - Results: `BarChart2` / `PieChart`
  - Geography: `Map` / `MapPin`
  - Auth: `Lock` / `ShieldCheck` / `Smartphone` (OTP)
  - Admin: `Settings` / `LayoutDashboard`
  - Status indicators: `Clock` / `CheckCircle` / `XCircle` / `AlertCircle`
- **Flag strip:** Subtle 3px horizontal strip (orange | white | green) used as a decorative accent on the top of the public portal header — a respectful nod to national identity without being overwhelming
- **No emojis in production UI** — they render inconsistently across Android versions common in CI

### 1.5 Component Patterns

```
Buttons:
  Primary:   bg-primary-700 text-white hover:bg-primary-800
  Accent:    bg-accent-500  text-white hover:bg-accent-700   (vote CTA only)
  Secondary: border border-primary-700 text-primary-700 bg-transparent
  Ghost:     text-primary-700 no-border
  Danger:    bg-error text-white

States:
  Loading: spinner inside button + disabled
  Disabled: opacity-50 cursor-not-allowed
  Success: brief checkmark animation then reset

Form inputs:
  Default:  border-neutral-300 bg-white focus:border-primary-600
  Error:    border-error bg-error-bg
  Success:  border-success
  Label:    above input, text-sm font-medium text-neutral-700
  Helper:   below input, text-xs text-neutral-500
  Error msg: below input, text-xs text-error flex items-center gap-1

Badges / status pills:
  EN_COURS:   bg-success-bg text-success dot-pulse-green
  OUVERT:     bg-info/10    text-info    (upcoming)
  BROUILLON:  bg-neutral-100 text-neutral-500
  CLOS:       bg-neutral-200 text-neutral-600
  PUBLIE:     bg-primary-100 text-primary-700

Card:
  bg-white rounded-xl border border-neutral-200 shadow-sm
  hover: shadow-md border-primary-300 transition-all 200ms
```

---

## 2. SCREEN INVENTORY

### Route Map
```
PUBLIC (no auth required)
  /                     → Landing page (home)
  /login                → Login
  /register             → Registration wizard (Steps 1–2 → OTP)
  /results              → Public results page (PUBLIE elections only)

VOTER (ACTIVE status required)
  /elections            → Eligible elections list
  /elections/:id        → Election detail + candidate grid
  /elections/:id/vote   → Vote confirmation
  /receipt              → Post-vote receipt display
  /profile              → Voter profile (GET /auth/me)

ADMIN (ADMIN role required)
  /dashboard            → Overview stats
  /dashboard/elections  → Election management list
  /dashboard/elections/new       → Create election
  /dashboard/elections/:id       → Election detail (candidates, status)
  /dashboard/users      → Voter management table
  /dashboard/parties    → Political parties CRUD

SHARED
  /403                  → Not authorized
  /404                  → Not found
```

---

## 3. SCREEN SPECIFICATIONS

---

### SCREEN 1 — Landing Page (`/`)

**Purpose:** Convert first-time visitors to registered voters. Build trust in the platform.

**API used:** None (static) + `GET /elections/public` (live results ticker)

**Layout:** Full-width sections, scroll narrative

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (sticky on scroll, frosted glass bg-white/90 backdrop)  │
│  [🟧🟦🟩 flag strip 3px]                                        │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ AGORA (logo)                [À propos]  [Résultats] [Connexion] [S'inscrire →] │
│  └────────────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────────────┤
│  HERO SECTION                                                   │
│  bg: gradient from primary-900 to primary-700                   │
│  Decorative: abstract CI map outline SVG, low opacity           │
│                                                                  │
│  [overline: PLATEFORME OFFICIELLE • CEI • CÔTE D'IVOIRE]       │
│                                                                  │
│  "Votre voix,                                                   │
│   votre avenir."                                                │
│   (Plus Jakarta Sans, 48px desktop / 36px mobile, white)       │
│                                                                  │
│  "Participez aux élections en toute sécurité depuis             │
│   n'importe quel appareil."                                     │
│   (Inter 18px, primary-100)                                     │
│                                                                  │
│  [S'inscrire maintenant →] (accent-500 button)                  │
│  [Voir les résultats] (ghost button, white border)              │
│                                                                  │
│  ─── ou ───                                                     │
│  Trust strip: [🔒 Chiffré] [✓ Anonyme] [📱 Mobile] [🏛 Officiel] │
└─────────────────────────────────────────────────────────────────┘
│  ELECTIONS EN COURS ticker (horizontal scroll, auto-play)       │
│  bg: accent-500 | white text, continuous scrolling if >3 items  │
│  "🗳 Présidentielle 2026 — EN COURS  •  Légis. Cocody — EN COURS" │
├─────────────────────────────────────────────────────────────────┤
│  HOW IT WORKS (3-step process)                                  │
│  bg: neutral-50                                                 │
│                                                                  │
│  "Comment ça marche ?"                                          │
│                                                                  │
│  [  Step 1  ]   [  Step 2  ]   [  Step 3  ]                     │
│  Icon: UserPlus  Icon: Smartphone  Icon: CheckSquare            │
│  S'inscrire     Vérifier via OTP  Voter en ligne                │
│  "Créez votre  "Confirmez votre  "Votez depuis                  │
│  compte avec   identité avec     votre domicile,                │
│  votre CNI"    votre téléphone"  bureau ou mobile"              │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  SECURITY FEATURES (3-column grid)                              │
│  bg: white                                                      │
│                                                                  │
│  [🔒 Chiffrement AES-256]  [🕵 Vote Anonyme]  [📋 Reçu de vote] │
│  "Votre vote est..."       "Votre choix n'est  "Recevez un code │
│                             jamais associé à    unique prouvant  │
│                             votre identité"     votre vote"      │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  LATEST PUBLISHED RESULTS PREVIEW (if any PUBLIE elections)     │
│  bg: primary-50                                                 │
│                                                                  │
│  "Résultats récents"                                            │
│  [Election card with top 2 candidates, bar chart preview]       │
│  [Voir tous les résultats →]                                    │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  CTA BANNER                                                     │
│  bg: gradient accent-600 → accent-500                           │
│  "Prêt à participer à la démocratie ivoirienne ?"              │
│  [S'inscrire maintenant] (white button, primary-700 text)       │
│                                                                  │
├─────────────────────────────────────────────────────────────────┤
│  FOOTER                                                         │
│  bg: primary-900                                                │
│  Cols: À propos | Aide | Légal | Contact | Liens officiels      │
│  Flag strip at bottom: [🟧🟦🟩]                                  │
│  © 2026 CEI — Côte d'Ivoire. Tous droits réservés.             │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile adaptations:**
- Hero: single column, 36px headline
- Steps: vertical stacked cards instead of 3-column
- Header: hamburger menu → slide-out drawer (full screen)
- Bottom sticky CTA strip: "S'inscrire →" always visible

---

### SCREEN 2 — Registration Wizard Step 1: Identité (`/register` → step 1)

**Purpose:** Collect NIN, name, date of birth. Validate format before allowing next step.

**API used:** `GET /communes` (for later step) — prefetch on mount

**Layout:** Centered card, max-width 540px

```
┌──────────────────────────────────────────────────────┐
│  HEADER (minimal: AGORA logo + "Créer un compte")    │
├──────────────────────────────────────────────────────┤
│                                                      │
│  PROGRESS INDICATOR                                  │
│  [●────────○────────○]                               │
│   Identité  Localisation  Vérification               │
│                                                      │
│  "Étape 1 sur 3 — Vos informations personnelles"    │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │  Prénom *                                      │  │
│  │  [________________________]                    │  │
│  │                                                │  │
│  │  Nom de famille *                              │  │
│  │  [________________________]                    │  │
│  │                                                │  │
│  │  Date de naissance *                           │  │
│  │  [JJ / MM / AAAA      📅]                      │  │
│  │  ℹ Vous devez avoir 18 ans ou plus             │  │
│  │                                                │  │
│  │  Numéro CNI / NIN *                            │  │
│  │  [CI__________         ]                       │  │
│  │  Format: CI suivi de 10 chiffres               │  │
│  │  Ex: CI0012345678                              │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [Suivant → Localisation]  (primary-700 button)      │
│                                                      │
│  Déjà inscrit ? [Se connecter]                      │
│                                                      │
├──────────────────────────────────────────────────────┤
│  🔒 Vos données sont chiffrées et sécurisées.       │
└──────────────────────────────────────────────────────┘
```

**Field validation (inline, on blur):**
- CNI: regex `/^CI\d{10}$/` → show green checkmark when valid
- Date of birth: must be ≥18 years before today
- All fields: required, non-empty

**Mobile:** Full screen, native date picker for date of birth on iOS/Android

---

### SCREEN 3 — Registration Wizard Step 2: Localisation & Contact (`/register` → step 2)

**Purpose:** Assign voter to commune + collect contact info.

**API used:** None yet (dropdowns pre-populated from a `GET /geography/regions` we will add later — OR statically embedded for now)

```
┌──────────────────────────────────────────────────────┐
│  HEADER (minimal)                                    │
├──────────────────────────────────────────────────────┤
│  PROGRESS: [●────────●────────○]                     │
│  "Étape 2 sur 3 — Votre localisation et contact"    │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │                                                │  │
│  │  Région *                                      │  │
│  │  [Sélectionnez votre région        ▾]          │  │
│  │                                                │  │
│  │  Département *                                 │  │
│  │  [Sélectionnez le département      ▾]          │  │
│  │  (disabled until Région selected)             │  │
│  │                                                │  │
│  │  Commune *                                     │  │
│  │  [Sélectionnez la commune          ▾]          │  │
│  │  (disabled until Département selected)        │  │
│  │                                                │  │
│  │  ─────────────────────────────────────────    │  │
│  │                                                │  │
│  │  Numéro de téléphone *                         │  │
│  │  [+225 ] [__ __ __ __ __]                      │  │
│  │  +225 forcé, 10 chiffres restants              │  │
│  │                                                │  │
│  │  Adresse e-mail *                              │  │
│  │  [votre@email.com         ]                    │  │
│  │                                                │  │
│  │  Mot de passe *                                │  │
│  │  [••••••••••              👁]                  │  │
│  │  ████████░░  Fort                              │  │
│  │  ≥ 8 caractères, 1 majuscule, 1 chiffre       │  │
│  │                                                │  │
│  │  Confirmer le mot de passe *                   │  │
│  │  [••••••••••              👁]                  │  │
│  │                                                │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  [← Retour]       [Créer mon compte →]               │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**UX details:**
- Cascading dropdowns: Région → Département → Commune (each triggers a filter of the next)
- Phone prefix `+225` is locked, non-editable — only the 10-digit number is typed
- Password strength meter: 4 levels (Faible/Moyen/Fort/Très fort) with colored progress bar
- "Créer mon compte" calls `POST /auth/register` and triggers loading state on button

**Loading state during API call:**
```
[Créer mon compte →]  →  [⟳ Création en cours...]
```

**On success:** Auto-navigate to Screen 4 (OTP), passing `national_id` and `__dev_otp` in navigation state

---

### SCREEN 4 — OTP Verification (`/register` → step 3 or `/verify-otp`)

**Purpose:** 6-digit OTP input, countdown timer, resend option. The moment that activates the account.

**API used:** `POST /auth/verify-otp`, `POST /auth/resend-otp`

```
┌──────────────────────────────────────────────────────┐
│  HEADER (minimal)                                    │
├──────────────────────────────────────────────────────┤
│  PROGRESS: [●────────●────────●]                     │
│                                                      │
│  📱  (large phone icon, primary-700)                 │
│                                                      │
│  "Code de vérification"                             │
│  "Un code à 6 chiffres a été envoyé au"             │
│  +225 07 ●● ●● ●● 43                                │
│  (phone number partially masked for privacy)        │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │   [_] [_] [_]   [_] [_] [_]                │    │
│  │   ← 6 input boxes, one digit each           │    │
│  │   Auto-focus next on input                  │    │
│  │   Paste: auto-fill all 6 boxes              │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
│  ⏱ Code expire dans 09:47                           │
│  (countdown timer, turns red at < 60 seconds)       │
│                                                      │
│  [Vérifier mon code]  (primary-700, full width)     │
│                                                      │
│  ───────────────────────────────────────────────    │
│                                                      │
│  Vous n'avez pas reçu le code ?                     │
│  [Renvoyer le code] (link, active only after 60s,   │
│   grey + countdown until active)                    │
│                                                      │
│  ┌─────────────────────────────────────────────┐    │
│  │ 🟡 [DEV MODE] Votre OTP: 603475             │    │
│  │    Ce bandeau n'apparaît pas en production   │    │
│  └─────────────────────────────────────────────┘    │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**States:**
- **Idle:** OTP boxes empty, countdown running
- **Filling:** Each digit box fills as typed, auto-advance cursor
- **Verifying:** Spinner, boxes disabled
- **Error (wrong OTP):** Boxes shake animation, red border, "Code incorrect. X essai(s) restant(s)"
- **Error (expired):** Yellow banner, "Code expiré. Veuillez en demander un nouveau."
- **Success:** Green checkmark animation, brief "Compte activé !" toast, then redirect to `/elections`

---

### SCREEN 5 — Login (`/login`)

**Purpose:** Authenticate existing users (voters or admins). Clear differentiation of account states.

**API used:** `POST /auth/login`

```
┌──────────────────────────────────────────────────────┐
│  HEADER (logo only, minimal)                         │
├──────────────────────────────────────────────────────┤
│                                                      │
│  SPLIT LAYOUT (desktop only):                       │
│  Left:  bg-primary-700, decorative CI map outline   │
│  Right: white, login form                           │
│                                                      │
│  LEFT PANEL (hidden on mobile):                     │
│  ┌──────────────────────────────────────┐           │
│  │  AGORA logo (white)                  │           │
│  │                                      │           │
│  │  "La voix de chaque                  │           │
│  │   citoyen compte."                   │           │
│  │  (48px, white)                       │           │
│  │                                      │           │
│  │  ─ Stats strip ─                     │           │
│  │  4 élections | 720k électeurs inscrits           │
│  └──────────────────────────────────────┘           │
│                                                      │
│  RIGHT PANEL / Full-screen on mobile:               │
│  ┌──────────────────────────────────────┐           │
│  │  Connexion à AGORA                   │           │
│  │                                      │           │
│  │  Adresse e-mail                      │           │
│  │  [                              ]    │           │
│  │                                      │           │
│  │  Mot de passe                        │           │
│  │  [••••••••••••••            👁 ]    │           │
│  │                                      │           │
│  │  [Se connecter]  (full width, primary-700)       │
│  │                                      │           │
│  │  ─────────────────────────────────   │           │
│  │                                      │           │
│  │  Pas encore de compte ?              │           │
│  │  [Créer un compte]                   │           │
│  │                                      │           │
│  └──────────────────────────────────────┘           │
│                                                      │
└──────────────────────────────────────────────────────┘
```

**Error states:**
- Invalid credentials: inline error below password field (do NOT specify which field is wrong)
- PENDING_OTP account: amber banner "Votre compte n'est pas encore vérifié. [Continuer la vérification →]"
- SUSPENDED: red banner "Votre compte a été suspendu. Contactez l'administration."
- Admin users redirect to `/dashboard` on success; voters redirect to `/elections`

---

### SCREEN 6 — Elections List — Voter (`/elections`)

**Purpose:** Show all elections the logged-in voter is eligible for, with clear voting status.

**API used:** `GET /elections` (voter-aware, returns `can_vote` + `already_voted`)

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (green, primary-700)                                    │
│  [AGORA logo]  "Mes élections"        [👤 kouassi] [Se déconnecter]│
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  "Bonjour, Kouassi 👋"                                           │
│  Commune: Cocody · Département: Cocody · Région: Abidjan        │
│                                                                  │
│  ──── Élections accessibles ────                                │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🗳  [EN COURS ●]                          NATIONAL      │   │
│  │  Élection Présidentielle 2026                            │   │
│  │  Ferme dans 9h 42min                                     │   │
│  │                                                          │   │
│  │  4 candidats  ·  34.2% ont déjà voté                    │   │
│  │                                                          │   │
│  │                         [Voter maintenant →] (accent)   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  🗳  [EN COURS ●]                      DÉPARTEMENTAL     │   │
│  │  Législatives Cocody 2026                                │   │
│  │  Ferme dans 9h 42min                                     │   │
│  │                                                          │   │
│  │  3 candidats  ·  28.7% ont déjà voté                    │   │
│  │                                                          │   │
│  │                        [✓ Voté · Voir le reçu] (teal)   │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  ⏰  [OUVERT]                              COMMUNAL      │   │
│  │  Municipales Yopougon 2026                               │   │
│  │  Ouvre le 25 mars 2026 à 07:00                          │   │
│  │                                                          │   │
│  │  2 candidats  ·  Pas encore commencé                    │   │
│  │                                                          │   │
│  │                        [Pas encore ouverte] (disabled)  │   │
│  └──────────────────────────────────────────────────────────┘   │
│                                                                  │
│  ──── Résultats récents ────                                    │
│  [→ Voir les résultats officiels] (link to /results)            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Card states:**
| Status | Button | Badge color |
|---|---|---|
| EN_COURS + can_vote | `Voter maintenant →` (accent-500) | Green pulse dot |
| EN_COURS + already_voted | `✓ Voté · Voir le reçu` (teal) | Green pulse dot |
| OUVERT (upcoming) | `Ouvre le [date]` (disabled, grey) | Blue badge |
| No eligible elections | Empty state illustration + explanation | — |

**Empty state (no eligible elections):**
```
  [illustration: ballot box]
  "Aucune élection disponible pour votre commune"
  "Les élections pour lesquelles vous êtes éligible
   apparaîtront ici dès qu'elles seront ouvertes."
  [Voir les résultats publiés →]
```

---

### SCREEN 7 — Election Detail & Candidate Grid (`/elections/:id`)

**Purpose:** Browse candidates before voting. Rich candidate profiles.

**API used:** `GET /elections/:id`

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER                                                          │
│  [← Retour aux élections]                                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [EN COURS ●]  NATIONAL                                         │
│  Élection Présidentielle 2026                                   │
│  Du 24 mars 2026 · 07:00 — 18:00                               │
│                                                                  │
│  ⏱ Ferme dans: [09] : [41] : [22]  (live countdown HH:MM:SS)  │
│                                                                  │
│  "Sélectionnez un candidat pour voter"                          │
│                                                                  │
│  ─────────────────────────────────────────────────             │
│                                                                  │
│  CANDIDATE GRID (2-col mobile, 4-col desktop)                   │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │  [Photo / 80px] │  │  [Photo / 80px] │                       │
│  │  Alassane       │  │  Tidjane        │                       │
│  │  Ouattara       │  │  Thiam          │                       │
│  │  ───────────    │  │  ───────────    │                       │
│  │  🟢 RHDP        │  │  🔵 PDCI-RDA   │                       │
│  │                 │  │                 │                       │
│  │  "Économiste   │  │  "Financier    │                       │
│  │  et homme      │  │  international │                       │
│  │  d'État..."    │  │  ancien PDG..." │                       │
│  │  [Lire +]       │  │  [Lire +]       │                       │
│  │                 │  │                 │                       │
│  │ [Choisir →]     │  │ [Choisir →]     │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
│  ┌─────────────────┐  ┌─────────────────┐                       │
│  │  Laurent        │  │  Kouadio        │                       │
│  │  Gbagbo         │  │  Konan Bertin   │                       │
│  │  🔴 PPA-CI      │  │  ⚪ Indép.     │                       │
│  │  ...            │  │  ...            │                       │
│  │ [Choisir →]     │  │ [Choisir →]     │                       │
│  └─────────────────┘  └─────────────────┘                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Candidate card hover/tap:** Expand to show full biography within card (accordion), "Programme électoral [PDF]" link if available

**Already voted state:** All `[Choisir →]` buttons replaced by:
```
  ✓ Vous avez déjà voté dans cette élection
  [Voir mon reçu →]
```

**No `can_vote` (OUVERT, upcoming):**
```
  ⏰ Le vote ouvre le [date] à [heure]
  [← Retour]
```

---

### SCREEN 8 — Vote Confirmation Modal

**Purpose:** Final irreversible confirmation before submitting vote. High-stakes UX.

**Trigger:** User clicks `[Choisir →]` on a candidate card → modal appears over election detail page

**API used:** `POST /elections/:id/vote` (on confirm)

```
┌─────────────────────────────────────────────────────────────────┐
│  (background blurred/darkened)                                  │
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐      │
│  │                                                       │      │
│  │  "Confirmer votre vote"                               │      │
│  │                                                       │      │
│  │  Vous êtes sur le point de voter pour :              │      │
│  │                                                       │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │  [Photo 64px]  Alassane Ouattara              │   │      │
│  │  │                RHDP                            │   │      │
│  │  │                Élection Présidentielle 2026    │   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  │                                                       │      │
│  │  ┌───────────────────────────────────────────────┐   │      │
│  │  │  ⚠️  Cette action est irréversible.           │   │      │
│  │  │  Votre vote est anonyme et chiffré.           │   │      │
│  │  │  Il ne peut pas être modifié après            │   │      │
│  │  │  confirmation.                                │   │      │
│  │  └───────────────────────────────────────────────┘   │      │
│  │                                                       │      │
│  │  [  Annuler  ]        [✓ Confirmer mon vote]         │      │
│  │  (secondary, grey)    (accent-500, large)             │      │
│  │                                                       │      │
│  └───────────────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────────────────┘
```

**Loading state (after Confirmer):**
```
  ┌────────────────────────────────────┐
  │  ⟳  Enregistrement de votre vote... │
  │  (spinner, both buttons disabled)  │
  └────────────────────────────────────┘
```

**Error state:**
```
  ┌────────────────────────────────────────────────────┐
  │  ⚠️  Erreur: Vous avez déjà voté dans cette       │
  │  élection. [Fermer]                               │
  └────────────────────────────────────────────────────┘
```

**On success:** Close modal → navigate to `/receipt` with receipt_code in navigation state

---

### SCREEN 9 — Vote Receipt (`/receipt`)

**Purpose:** Post-vote confirmation page. The voter's proof of participation. Very important for trust.

**API used:** None — data passed via navigation state from vote confirmation

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (green)                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌───────────────────────────────────────────────────────┐      │
│  │                                                       │      │
│  │  ✅  (large, animated checkmark — scale in + fade)   │      │
│  │                                                       │      │
│  │  "Votre vote a été enregistré !"                     │      │
│  │  (Plus Jakarta Sans 28px, primary-700)               │      │
│  │                                                       │      │
│  │  ─────────────────────────────────────────────────   │      │
│  │                                                       │      │
│  │  Élection:     Élection Présidentielle 2026           │      │
│  │  Date:         24 mars 2026 à 14:32:07               │      │
│  │  Candidat:     [REDACTED — anonymous]                 │      │
│  │                                                       │      │
│  │  ─────────────────────────────────────────────────   │      │
│  │                                                       │      │
│  │  Code de reçu                                        │      │
│  │  ┌─────────────────────────────────────────────┐    │      │
│  │  │  542a4b47-b5d1-4ab6-bf16-7b6bea46e634      │    │      │
│  │  │  (monospace font, large, selectable)        │    │      │
│  │  └─────────────────────────────────────────────┘    │      │
│  │                                                       │      │
│  │  [📋 Copier le code]    [📸 Télécharger le reçu]     │      │
│  │                                                       │      │
│  │  ─────────────────────────────────────────────────   │      │
│  │                                                       │      │
│  │  ℹ Ce code prouve que votre vote a été comptabilisé │      │
│  │  sans révéler votre choix. Conservez-le précieusement│      │
│  │                                                       │      │
│  └───────────────────────────────────────────────────────┘      │
│                                                                  │
│  [← Retour aux élections]                                       │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Interactions:**
- "Copier le code" → clipboard API + brief "Copié !" tooltip
- "Télécharger le reçu" → generate a simple PDF/PNG receipt with the AGORA logo, election name, date, receipt code (NO candidate name)
- Animated success checkmark (CSS or Lottie if available)

---

### SCREEN 10 — Public Results Page (`/results`)

**Purpose:** Anyone (no login) can view results of PUBLIE elections. Transparency and legitimacy.

**API used:** `GET /elections/public`

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (minimal, no auth required)                             │
│  AGORA logo  |  Résultats officiels   [Se connecter]            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  "Résultats officiels des élections"                           │
│                                                                  │
│  [Filter tabs: Toutes | Présidentielles | Législatives | ...]   │
│                                                                  │
│  ── IF NO PUBLIE ELECTIONS ──────────────────────────────────   │
│  "Aucun résultat officiel disponible pour le moment."          │
│  "Les résultats apparaîtront ici après la certification."      │
│  ──────────────────────────────────────────────────────────     │
│                                                                  │
│  ── ELECTION RESULT CARD ───────────────────────────────────   │
│  ┌───────────────────────────────────────────────────────┐     │
│  │  PRÉSIDENTIELLE  •  NATIONAL                          │     │
│  │  Élection Présidentielle 2026                         │     │
│  │  [PUBLIE ✓]  Résultats certifiés le 24/03/2026       │     │
│  │                                                       │     │
│  │  Participation: 66.98%   [██████████░░░░░] 4.82M / 7.2M│   │
│  │                                                       │     │
│  │  ─────────── Résultats par candidat ────────────     │     │
│  │                                                       │     │
│  │  [Photo] Candidat A — RHDP                           │     │
│  │  ████████████████████████░░  58.9%  2,841,022 voix   │     │
│  │                                                       │     │
│  │  [Photo] Candidat B — PDCI-RDA                       │     │
│  │  █████████████░░░░░░░░░░░░░  30.2%  1,457,000 voix   │     │
│  │                                                       │     │
│  │  [Photo] Candidat C — PPA-CI                         │     │
│  │  ████░░░░░░░░░░░░░░░░░░░░░░░   8.4%    405,000 voix   │     │
│  │                                                       │     │
│  │  [Voir les résultats par région ▾] (collapsible)     │     │
│  │                                                       │     │
│  │    Région Abidjan:       Candidat A 62.1%  Cand. B 28.3%│  │
│  │    Région Yamoussoukro:  Candidat A 54.3%  Cand. B 35.7%│  │
│  │    ...                                                │     │
│  │                                                       │     │
│  └───────────────────────────────────────────────────────┘     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Progressive bar colors:** Use the neutral categorical palette (blue, green, amber, purple) — not party colors, to maintain neutrality.

**Mobile adaptation:** Single column, horizontal scroll for region breakdown table, no choropleth map (too heavy for mobile)

---

### SCREEN 11 — Admin Dashboard Overview (`/dashboard`)

**Purpose:** At-a-glance admin control center. Different header color signals admin context.

**API used:** `GET /elections`, `GET /users` (counts)

```
┌─────────────────────────────────────────────────────────────────┐
│  ADMIN SIDEBAR (left, 240px, bg-admin-900)                      │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  🟧🟦🟩 AGORA ADMIN                                      │  │
│  │                                                          │  │
│  │  [📊] Vue d'ensemble      ← current (highlighted)       │  │
│  │  [🗳] Élections                                         │  │
│  │  [👤] Utilisateurs                                      │  │
│  │  [🏛] Partis politiques                                 │  │
│  │  [📈] Rapports                                          │  │
│  │                                                          │  │
│  │  ─────────────                                          │  │
│  │  [🚪] Déconnexion                                       │  │
│  │                                                          │  │
│  │  admin@agora.gov                                        │  │
│  │  ADMINISTRATEUR                                         │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  MAIN CONTENT (bg-neutral-50, flex-1)                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  "Tableau de bord — 24 mars 2026, 20:02"                        │
│                                                                  │
│  STAT CARDS (4-col grid desktop, 2-col mobile)                  │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐│
│  │ 2          │  │ 720 000    │  │ 1          │  │ 66.9%      ││
│  │ Élections  │  │ Électeurs  │  │ Vote en    │  │ Partici-   ││
│  │ actives    │  │ inscrits   │  │ cours      │  │ pation     ││
│  │ [🗳 →]    │  │ [👤 →]    │  │ [🔴 →]    │  │ [📊 →]    ││
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘│
│                                                                  │
│  ELECTIONS TABLE                                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │  Titre             │ Type     │ Statut    │ Candidats│ Actions│
│  │  ─────────────────────────────────────────────────────── │ │
│  │  Présidentielle 26 │ PRESID.  │ [EN COURS]│ 4        │ [Gérer]│
│  │  Législatives Coc. │ LEGISL.  │ [EN COURS]│ 3        │ [Gérer]│
│  │  Municipales Yop.  │ MUNICIP. │ [OUVERT]  │ 2        │ [Gérer]│
│  │  Régionales Abjn.  │ REGION.  │ [BROUILLON]│ 0       │ [Gérer]│
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  [+ Créer une nouvelle élection]  (primary-700 button)          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Mobile admin layout:** Sidebar collapses to top hamburger nav. Stat cards stack to 2×2 grid.

---

### SCREEN 12 — Admin Election Management (`/dashboard/elections/:id`)

**Purpose:** Manage a single election: view/edit details, manage candidates, advance status lifecycle.

**API used:** `GET /elections/:id`, `PATCH /elections/:id/status`, `POST /elections/:id/candidates`, `DELETE /elections/:id/candidates/:cid`

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR  |  [← Retour aux élections]                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Élection Présidentielle 2026                                   │
│  NATIONAL · PRÉSIDENTIELLE                                      │
│                                                                  │
│  ── STATUS LIFECYCLE ─────────────────────────────────────     │
│  [BROUILLON] →→ [OUVERT] →→ [EN COURS] →→ [CLOS] →→ [PUBLIE]  │
│                              ▲ current                          │
│  Next step: Close voting     [Clore le vote →] (accent btn)     │
│                                                                  │
│  ── DETAILS PANEL ────────────────────────────────────────     │
│  Description: ...                                               │
│  Début: 24 mars 2026, 07:00  •  Fin: 24 mars 2026, 18:00      │
│  Votes enregistrés: 4,823,100 / 7,200,000 inscrits             │
│  Participation en direct: 66.98%                               │
│                                                                  │
│  ── CANDIDATES ───────────────────────────────────────────     │
│  (table with photo, name, party, eligibility checks, actions)  │
│                                                                  │
│  │ # │ Photo │ Nom              │ Parti  │ Éligible │ Actions  │
│  │ 1 │ [img] │ Alassane Ouattara│ RHDP   │ ✓✓✓     │ [Modifier][↑]│
│  │ 2 │ [img] │ Tidjane Thiam    │ PDCI   │ ✓✓✓     │ [Modifier][↑]│
│  │ 3 │ [img] │ Laurent Gbagbo   │ PPA-CI │ ✓✓✓     │ [Modifier][↑]│
│  │ 4 │ [img] │ K. Konan Bertin  │ IND.   │ ✓✓✓     │ [Modifier][↑]│
│                                                                  │
│  [+ Ajouter un candidat] (only shown if status = BROUILLON)    │
│                                                                  │
│  ── RESULTS (if CLOS or PUBLIE) ──────────────────────────     │
│  [Live results panel with bar chart]                           │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Advance status confirmation modal:**
```
  "Êtes-vous sûr de vouloir [Clore le vote] ?"
  "Cette action ne peut pas être annulée.
   Le vote sera arrêté immédiatement pour tous les électeurs."
  Tapez  "CONFIRMER"  pour continuer:
  [_______________]
  [Annuler]  [Confirmer la clôture →]
```

**Eligibility badges:**
- `✓ Nationalité vérifiée` / `✓ Casier judiciaire vierge` / `✓ Âge vérifié`
- Red `✗` if any is false → blocks publishing

---

### SCREEN 13 — Admin Users Management (`/dashboard/users`)

**Purpose:** Manage registered voters — filter, activate, suspend accounts.

**API used:** `GET /users`, `PATCH /users/:id`

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR  |  "Gestion des électeurs"                            │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  FILTERS BAR:                                                   │
│  [Rechercher par nom/email/CNI...]                              │
│  [Statut: Tous ▾]  [Région: Toutes ▾]  [Commune: Toutes ▾]    │
│                                                                  │
│  STATS STRIP: 4 inscrits  ·  3 actifs  ·  1 en attente         │
│                                                                  │
│  TABLE:                                                         │
│  │ CNI           │ Nom          │ Commune  │ Statut  │ Actions │
│  │ CI0099887766  │ Kofi Asante  │ Cocody   │ [ACTIF] │ [Voir][Suspend.]│
│  │ CI0012345678  │ Kouassi Amani│ Cocody   │ [ACTIF] │ [Voir][Suspend.]│
│  │ CI0087654321  │ Aminata Coul.│ Yopougon │ [ACTIF] │ [Voir][Suspend.]│
│  │ CI0011223344  │ Ibrahim Koné │ Bouaké   │ [ACTIF] │ [Voir][Suspend.]│
│                                                                  │
│  Pagination: [← 1 2 3 ... →]                                   │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Status badge colors:**
- `ACTIVE`: green pill
- `PENDING_OTP`: amber pill
- `SUSPENDED`: red pill

**User detail slide-out panel (opens right):**
```
  ┌───────────────────────────────────────┐
  │  Kofi Asante                          │
  │  CNI: CI0099887766                    │
  │  Email: kofi@example.com              │
  │  Tél: +225 07 09 87 65 43            │
  │  Né(e) le: 20 juin 1992              │
  │  Commune: Cocody (Abidjan)           │
  │                                       │
  │  Statut: [ACTIF]                      │
  │                                       │
  │  Historique de vote: 1 vote(s)       │
  │  (sans révéler quel candidat)        │
  │                                       │
  │  [Suspendre le compte] (danger btn)  │
  │  [Fermer ×]                          │
  └───────────────────────────────────────┘
```

---

### SCREEN 14 — Admin Political Parties (`/dashboard/parties`)

**Purpose:** Simple CRUD for political parties, used when assigning candidates.

**API used:** `GET /parties` (to add later), `POST /parties` (to add later)

```
┌─────────────────────────────────────────────────────────────────┐
│  SIDEBAR  |  "Partis politiques"                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [+ Ajouter un parti]                                           │
│                                                                  │
│  │ Sigle    │ Nom complet            │ Fondé │ Candidats │ Edit│
│  │ RHDP     │ Rassemblement des...   │ 2005  │ 1        │ ✏️  │
│  │ PDCI-RDA │ Parti Démocratique...  │ 1946  │ 1        │ ✏️  │
│  │ PPA-CI   │ Parti des Peuples...   │ 2021  │ 1        │ ✏️  │
│  │ IND      │ Candidat Indépendant   │ —     │ 2        │ ✏️  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### SCREEN 15 — Voter Profile (`/profile`)

**Purpose:** View own registration details. Confirm geographic assignment.

**API used:** `GET /auth/me`

```
┌─────────────────────────────────────────────────────────────────┐
│  HEADER (green)                                                  │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Mon profil                                                     │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  [Avatar initials: KA]  Kouassi Amani                    │  │
│  │                         kouassi@example.com              │  │
│  │                         [ACTIF ✓]                        │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  CNI / NIN:      CI0012345678                            │  │
│  │  Téléphone:      +225 07 01 23 45 67                    │  │
│  │  Date de naissance: 15 avril 1990                       │  │
│  ├──────────────────────────────────────────────────────────┤  │
│  │  Circonscription électorale:                             │  │
│  │  Commune:       Cocody                                   │  │
│  │  Département:   Cocody                                   │  │
│  │  Région:        Abidjan                                  │  │
│  │  Bureau de vote: École Primaire Les Rosiers              │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  [← Mes élections]                                             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

### SCREEN 16 — Error Pages

**403 — Non autorisé:**
```
  [Lock icon, primary-700]
  "Accès refusé"
  "Vous n'avez pas les droits pour accéder à cette page."
  [Se connecter] ou [Retour à l'accueil]
```

**404 — Page introuvable:**
```
  [Map with question mark illustration]
  "Page introuvable"
  "Cette page n'existe pas ou a été déplacée."
  [Retour à l'accueil]
```

---

## 4. NAVIGATION ARCHITECTURE

### Voter Navigation (top bar, mobile bottom tabs)

```
Desktop top bar (green, 64px):
  Left:  [AGORA logo]
  Center: [Accueil] [Élections] [Résultats]
  Right:  [👤 Kouassi] [Se déconnecter]

Mobile bottom tabs (5 items):
  [🏠 Accueil] [🗳 Élections] [📊 Résultats] [👤 Profil] [...]
```

### Admin Navigation (left sidebar, 240px)

```
Top: AGORA ADMIN logo + version
Items (icon + text):
  📊 Vue d'ensemble
  🗳 Élections
  👤 Utilisateurs
  🏛 Partis politiques
  ─────────
  ⚙️  Paramètres (future)
  🚪 Déconnexion
Bottom: user avatar + email + role badge
```

---

## 5. COMPONENT LIBRARY NEEDED

Priority components to build (in order of implementation):

| Priority | Component | Used in |
|---|---|---|
| 1 | `StatusBadge` | Election cards, user table |
| 1 | `ElectionCard` | `/elections` list |
| 1 | `CandidateCard` | `/elections/:id` |
| 1 | `OtpInput` | `/register` step 3 |
| 1 | `ProgressSteps` | Registration wizard |
| 2 | `ConfirmModal` | Vote confirmation, status advance |
| 2 | `StatCard` | Admin dashboard |
| 2 | `ResultBar` | Public results page |
| 2 | `DataTable` | Admin users, parties |
| 3 | `CandidateForm` | Admin add candidate |
| 3 | `ElectionForm` | Admin create election |
| 3 | `CascadeSelect` | Region → Département → Commune |
| 3 | `PasswordStrength` | Registration step 2 |
| 3 | `CountdownTimer` | Election detail page |
| 4 | `ReceiptCard` | Receipt page (downloadable) |
| 4 | `ToastNotification` | Global feedback |
| 4 | `SkeletonLoader` | All loading states |

---

## 6. RESPONSIVE BEHAVIOR SUMMARY

| Screen | Mobile (<640px) | Desktop (>1024px) |
|---|---|---|
| Home | Single col, hamburger nav | 2-3 col sections, sticky nav |
| Register | Full-screen wizard, native date picker | Centered card 540px max-width |
| OTP | Full screen, large OTP boxes | Centered card |
| Login | Full screen, no split | Split left/right |
| Elections | Card stack, bottom tabs | Card grid 2-col, top nav |
| Election detail | Candidate stack, sticky CTA | 4-col candidate grid |
| Vote modal | Bottom sheet (slides up) | Centered modal overlay |
| Receipt | Full screen | Centered card |
| Results | Candidate bars, no map | Candidate bars + region table |
| Admin Dashboard | Hamburger + stacked cards | Left sidebar + content area |
| Admin Election | Accordion sections | Tabs (Details / Candidates / Results) |
| Admin Users | Mobile-friendly rows | Full data table |

---

## 7. ACCESSIBILITY & PERFORMANCE

```
Accessibility:
  - All form inputs: associated <label> elements (not placeholder-only)
  - Color contrast: all text meets WCAG 2.1 AA (≥4.5:1)
  - Focus rings: visible on all interactive elements
  - Screen reader: ARIA labels on icon-only buttons
  - Error messages: associated with inputs via aria-describedby
  - OTP boxes: single digit, auto-focus, paste support

Performance (CI mobile context):
  - Target LCP < 2.5s on 3G
  - Candidate photos: lazy-load, WebP format, max 80×80px
  - Page weight voter portal: < 200KB initial JS
  - Skeleton screens instead of spinners
  - API calls: optimistic UI where safe (e.g., copy button)
  - No animation on reduced-motion preference

Internationalization:
  - Primary: French (fr-CI)
  - All user-facing strings: externalized (for i18n if needed)
  - Date format: DD/MM/YYYY (French convention)
  - Number format: 4 823 100 (French thousand separator)
  - Currency: not used (no payments)
```

---

## 8. ANIMATION & MOTION

```
Transitions (all ≤ 200ms ease-in-out unless noted):
  - Page transitions: fade-in (150ms)
  - Card hover: shadow + border color (200ms)
  - Button loading: content fade-out + spinner fade-in (100ms)
  - Modal open: scale(0.95)→scale(1) + fade (200ms)
  - Bottom sheet (mobile vote confirm): slide-up (300ms cubic)
  - OTP error shake: 3-cycle horizontal translate (400ms)
  - Vote success checkmark: draw + scale (600ms ease-out)
  - Status badge pulse dot: CSS animation infinite (for EN_COURS)
  - Countdown timer: number flip (no animation needed, just update)
  - Elections ticker: CSS marquee / horizontal translate (30s loop)
```

---

## 9. IMPLEMENTATION PRIORITY ORDER

```
Phase 6A — Core voter flow (minimum viable):
  1. Login (Screen 5)
  2. Register Steps 1-2 + OTP (Screens 2, 3, 4)
  3. Elections list (Screen 6)
  4. Election detail + Vote confirm (Screens 7, 8)
  5. Receipt (Screen 9)

Phase 6B — Public access:
  6. Landing page (Screen 1)
  7. Public results page (Screen 10)
  8. Voter profile (Screen 15)

Phase 7 — Admin dashboard:
  9.  Admin dashboard overview (Screen 11)
  10. Admin election management (Screen 12)
  11. Admin users table (Screen 13)
  12. Admin parties (Screen 14)

Phase polish:
  13. Error pages (Screen 16)
  14. Animations + skeleton loaders
  15. Mobile bottom nav
  16. Receipt PDF download
```

---

*Plan version 1.0 — AGORA UI/UX — Côte d'Ivoire Digital Election Platform*
*Colors: CI flag-derived. Typography: Inter + Plus Jakarta Sans. Mobile-first.*
