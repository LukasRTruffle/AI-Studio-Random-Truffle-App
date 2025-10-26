<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Random Truffle

AI-driven marketing intelligence and activation platform powered by Next.js, TypeScript, and Google Cloud.

## Project Status

**Phase 1 Complete** - Monorepo + Backend + Testing Infrastructure

- ✅ Turborepo monorepo with pnpm workspaces
- ✅ NestJS backend API (PostgreSQL ready)
- ✅ Shared workspace packages (types, core, auth, ui, api-client)
- ✅ Comprehensive testing (160+ tests, 95% coverage target)
- ✅ CI/CD pipeline (GitHub Actions)
- ✅ E2E testing with Playwright (5 browsers)

**Previous:** Phase 0 - Foundation & Next.js Migration

**Next:** Phase 2 - Data Plane (BigQuery, MCP Connectors, GA4)

## Tech Stack

- **Monorepo:** Turborepo with pnpm workspaces
- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript (strict mode)
- **Backend:** NestJS + TypeORM + PostgreSQL (Cloud SQL ready)
- **Styling:** Tailwind CSS 4
- **Build:** Turbopack (frontend), TypeScript (backend + packages)
- **Testing:** Vitest (packages), Jest (backend), Playwright (E2E)
- **Quality:** ESLint 9, Prettier, Husky pre-commit hooks
- **CI/CD:** GitHub Actions with quality gates
- **Deployment Target:** Cloud Run (backend), Cloud Storage + CDN (frontend)

## Prerequisites

- **Node.js:** 18.x or later
- **pnpm:** 10.x or later (required for monorepo)
- **Docker:** (optional) For running PostgreSQL locally

## Quick Start

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Configure Environment

Create `.env.local` and add your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Run Development Servers

**Frontend:**

```bash
cd apps/web
pnpm dev
```

**Backend API:**

```bash
cd services/api
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) for frontend.

The frontend development server uses Turbopack for fast hot module replacement.

## Available Commands

### Development

```bash
# Monorepo commands (from root)
pnpm dev            # Run all dev servers (frontend + backend)
pnpm build          # Build all packages and apps
pnpm lint           # Lint all packages
pnpm typecheck      # Type check all packages

# Individual apps
cd apps/web && pnpm dev          # Frontend dev server
cd services/api && pnpm dev      # Backend dev server
```

### Testing

**Run All Tests:**

```bash
pnpm test           # Run all tests (packages + backend)
```

**Package Tests (Vitest):**

```bash
cd packages/core && pnpm test              # Run core package tests
cd packages/core && pnpm test --coverage   # With coverage report
cd packages/types && pnpm test             # Run types tests
```

**Backend Tests (Jest):**

```bash
cd services/api && pnpm test               # Run backend tests
cd services/api && pnpm test --coverage    # With coverage report
```

**E2E Tests (Playwright):**

```bash
cd apps/web && pnpm test:e2e               # Run E2E tests (headless)
cd apps/web && pnpm test:e2e:ui            # Run with UI mode
cd apps/web && pnpm test:e2e:debug         # Debug mode
```

**Test Statistics:**

- 160+ test cases across all layers
- 95% coverage target (ADR-019 compliant)
- 5 browser configurations for E2E tests

See [TESTING.md](TESTING.md) for comprehensive testing documentation.

### Quality Tooling

```bash
make check          # Run ESLint + TypeScript type checking
make format         # Format code with Prettier
```

**Pre-commit Hook:** Husky automatically runs `make check` before each commit.

### CI/CD Pipeline

GitHub Actions automatically runs on every push/PR:

1. **Lint & Type Check** - ESLint + TypeScript across all packages
2. **Package Tests** - Vitest with coverage reporting
3. **Backend Tests** - Jest with PostgreSQL service
4. **E2E Tests** - Playwright on Chromium
5. **Build** - Build all packages and apps
6. **Quality Gate** - Fail if any job fails

Coverage reports are uploaded to Codecov.

See `.github/workflows/ci.yml` for full pipeline configuration.

## Project Structure

```
random-truffle/
├── apps/
│   └── web/                     # Next.js App Router frontend
│       ├── app/                 # Next.js App Router pages
│       ├── components/          # React components
│       ├── contexts/            # React contexts
│       ├── e2e/                 # Playwright E2E tests
│       └── playwright.config.ts # Playwright configuration
├── services/
│   └── api/                     # NestJS backend API
│       ├── src/
│       │   ├── users/          # Users module (service + controller)
│       │   ├── app.module.ts   # Root module
│       │   └── main.ts         # Bootstrap
│       └── jest.config.js      # Jest configuration
├── packages/
│   ├── types/                  # Shared TypeScript types
│   │   └── src/__tests__/     # Type tests (Vitest)
│   ├── core/                   # Core shared utilities
│   │   └── src/__tests__/     # Core tests (Vitest)
│   ├── auth/                   # Authentication package
│   ├── ui/                     # UI components library
│   └── api-client/             # Type-safe API client
├── .github/
│   └── workflows/
│       └── ci.yml              # GitHub Actions CI/CD pipeline
├── thoughts/shared/            # Architecture docs & plans
│   ├── plans/                  # ADRs, roadmap, specifications
│   └── research/               # Research documents
├── turbo.json                  # Turborepo configuration
├── pnpm-workspace.yaml         # pnpm workspace configuration
├── CLAUDE.md                   # AI copilot guidelines
├── TESTING.md                  # Comprehensive testing guide
└── README.md                   # This file
```

## Deployment

The app is configured for static export (`output: 'export'` in next.config.mjs).

### Build for Production

**Frontend (Static Export):**

```bash
cd apps/web && pnpm build
```

This generates a static site in `apps/web/out/` that can be deployed to:

- Google Cloud Storage + CDN
- Vercel
- Netlify
- Any static hosting service

**Backend (NestJS):**

```bash
cd services/api && pnpm build
```

This generates compiled JavaScript in `services/api/dist/` for deployment to:

- Cloud Run
- Any Node.js hosting service

### Production Build Output

All routes are pre-rendered as static HTML:

```
Route (app)
├ ○ /
├ ○ /activation
├ ○ /admin
├ ○ /analytics
├ ○ /audiences
├ ○ /audiences/create
├ ○ /login
├ ○ /profile
├ ○ /setup
├ ○ /superadmin
└ ○ /welcome

○  (Static)  prerendered as static content
```

## Development Guidelines

### Code Quality Standards

- **TypeScript Strict Mode:** Enabled (`strict: true` with all flags)
- **No `any` Types:** Use `unknown` with type guards instead
- **Explicit Return Types:** Required on exported functions
- **ESLint:** Must pass all rules (enforced in pre-commit hook)
- **Prettier:** Code formatted automatically on save

### Commit Workflow

1. Make your changes
2. Run `make check` to verify quality gates
3. Commit your changes (Husky runs pre-commit hook automatically)
4. Push to remote branch

### Pre-commit Hook

Husky automatically runs on every commit:

```bash
npx lint-staged  # Runs ESLint + Prettier on staged files
```

If the hook fails, fix the reported issues and commit again.

## Architecture

See [CLAUDE.md](CLAUDE.md) for detailed architectural guidelines including:

- 25 Architecture Decision Records (ADRs)
- 5-phase implementation roadmap
- Services vs. Agents architecture
- Security and compliance requirements
- AI/Agent best practices

Key architectural documents:

- **Implementation Roadmap:** `thoughts/shared/plans/implementation-roadmap.md`
- **Architecture Decisions:** `thoughts/shared/plans/architecture-decisions.md`
- **Codebase Analysis:** `thoughts/shared/research/2025-10-25_codebase.md`

## Phase 2 Roadmap (Next Steps)

**Weeks 9-14:** Data Plane Foundation

- BigQuery integration (analytics data warehouse)
- MCP connectors (BigQuery, GA4)
- GA4 Consent Mode implementation
- Session stitching (User-ID + user_pseudo_id)
- Multi-currency support (USD, MXN, COP)

See `thoughts/shared/plans/roadmap-updates-v1.1.md` for full roadmap.

## Documentation

- **[CLAUDE.md](CLAUDE.md)** - AI copilot guidelines and quick reference
- **[TESTING.md](TESTING.md)** - Comprehensive testing guide (160+ tests)
- **[thoughts/shared/plans/](thoughts/shared/plans/)** - Implementation plans and ADRs
- **[thoughts/shared/research/](thoughts/shared/research/)** - Technical research and analysis

## Support

For questions or issues, consult the documentation above or package-specific README files.

## License

Proprietary - Random Truffle

---

**Built with:**
Next.js 16 • React 19 • TypeScript • Tailwind CSS 4 • Turbopack
