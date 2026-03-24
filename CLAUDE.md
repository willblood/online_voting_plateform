# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

An Election Management & Results Platform — a full-stack app for managing multiple elections, recording results at municipality/city/district/national levels, and providing analytics. Built with:

- **Backend (`/api`)**: NestJS + Prisma + PostgreSQL, TypeScript (ESM/NodeNext modules)
- **Frontend (`/frontend`)**: React 19 + React Router v7 + TailwindCSS v4, TypeScript

## Commands

### Backend (`/api`)

```bash
npm run start:dev       # Start with hot reload (development)
npm run build           # Compile TypeScript
npm run start:prod      # Run compiled output
npm run lint            # ESLint with auto-fix
npm run format          # Prettier format

npm run test            # Run unit tests (Jest)
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # End-to-end tests

npx prisma migrate dev  # Run migrations and regenerate client
npx prisma generate     # Regenerate Prisma client
npx prisma studio       # Open Prisma GUI
```

### Frontend (`/frontend`)

```bash
npm run dev             # Start Vite dev server
npm run build           # Production build
npm run typecheck       # Run react-router typegen + tsc
```

## Environment Setup

The API requires a `.env` file in `/api/`:

```
DATABASE_URL="postgresql://user@localhost:5432/online_voting"
JWT_SECRET="your-secret-here"
PORT=3000
```

## Architecture

### Backend Structure (`/api/src`)

```
src/
├── main.ts                    # Bootstrap: global ValidationPipe (whitelist, transform)
├── app.module.ts              # Root module: PrismaModule, AuthModule, UsersModule
├── database/
│   ├── prisma.module.ts       # @Global() module — PrismaService available everywhere
│   └── prisma.service.ts
├── auth/
│   ├── auth.module.ts         # JwtModule + PassportModule; exports JwtAuthGuard
│   ├── jwt.strategy.ts        # Extracts sub/email/role from Bearer token
│   └── jwt-auth.guard.ts
├── common/
│   └── enums/role.enum.ts     # Role: VOTER | ADMIN | OBSERVER
└── modules/
    └── users/                 # Pattern for all domain modules
        ├── users.module.ts
        ├── users.controller.ts  # All routes protected by @UseGuards(JwtAuthGuard)
        ├── users.service.ts
        ├── dto/               # class-validator decorators for input validation
        └── entities/
```

**Key patterns:**
- `PrismaModule` is `@Global()` — import it only in `AppModule`, inject `PrismaService` directly in any service
- All CRUD endpoints under `UsersController` require a valid JWT (`@UseGuards(JwtAuthGuard)`)
- JWT payload shape: `{ sub: userId, email, role }` — available as `req.user` in controllers
- DTOs use `class-validator` decorators; the global `ValidationPipe` enforces `whitelist: true` (strips unknown fields) and `forbidNonWhitelisted: true`
- TypeScript is configured with `"module": "nodenext"` — all local imports **must** include the `.js` extension (e.g., `import { Foo } from './foo.js'`)

### Database Schema (`/api/prisma/schema.prisma`)

Geographic hierarchy: `District → City → Municipality`

Users belong to a `Municipality` and have a `Profile` (1:1). The `Role` enum drives RBAC.

Elections are independent entities. Result aggregation flows upward:
`Vote → MunicipalityResult → CityResult → DistrictResult → NationalResult`

All result tables share the same structure: `(election_id, geography_id, candidate_id)` with a unique constraint preventing duplicates.

### Frontend Structure (`/frontend/app`)

Uses React Router v7 (file-based routing via `app/routes.ts`). Currently minimal — only a `home.tsx` route exists. The intended feature structure (from project spec) is:

```
features/
├── auth/
├── elections/
├── districts/
├── candidates/
└── results/
```

## Adding a New Domain Module (Backend)

1. Create `src/modules/<domain>/` with `<domain>.module.ts`, `<domain>.service.ts`, `<domain>.controller.ts`, and `dto/` subfolder
2. Register in `app.module.ts` imports
3. Inject `PrismaService` directly (it's global — no need to import `PrismaModule`)
4. Add `@UseGuards(JwtAuthGuard)` at the controller level for protected routes
5. Add a spec file alongside the service (`<domain>.service.spec.ts`)
