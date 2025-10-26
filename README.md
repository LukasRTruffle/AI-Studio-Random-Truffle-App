<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Random Truffle

AI-driven marketing intelligence and activation platform powered by Next.js, TypeScript, and Google Cloud.

## Project Status

**Phase 0 Complete** - Foundation & Next.js Migration

- ✅ Next.js 16 App Router with Turbopack
- ✅ TypeScript strict mode enabled
- ✅ Quality tooling (ESLint, Prettier, Husky, Makefile)
- ✅ All pages migrated to Next.js App Router
- ✅ Production build working (static export)

**Next:** Phase 1 - Monorepo + Backend + Okta Auth

## Tech Stack

- **Frontend:** Next.js 16 (App Router) + React 19 + TypeScript (strict mode)
- **Styling:** Tailwind CSS 4
- **Build:** Turbopack
- **Quality:** ESLint 9, Prettier, Husky pre-commit hooks
- **Deployment Target:** Cloud Storage + CDN (static export)

## Prerequisites

- **Node.js:** 18.x or later
- **npm:** 9.x or later

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create `.env.local` and add your Gemini API key:

```bash
GEMINI_API_KEY=your_api_key_here
```

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The development server uses Turbopack for fast hot module replacement.

## Available Commands

### Development

```bash
npm run dev          # Start Next.js dev server with Turbopack
npm run build        # Build production static export
npm run start        # Serve production build locally (after npm run build)
```

### Quality Tooling

```bash
make check          # Run ESLint + TypeScript type checking
make format         # Format code with Prettier
make test           # Run tests (placeholder - tests coming in Phase 1)
make e2e            # Run E2E tests (placeholder - coming in Phase 5)
```

**Pre-commit Hook:** Husky automatically runs `make check` before each commit.

### Linting & Type Checking

```bash
npm run lint        # Run ESLint
npm run type-check  # Run TypeScript compiler check
```

## Project Structure

```
random-truffle/
├── app/                          # Next.js App Router pages
│   ├── (authenticated)/          # Route group with sidebar layout
│   │   ├── layout.tsx           # Authenticated layout with sidebar
│   │   ├── welcome/             # Welcome dashboard
│   │   ├── analytics/           # Analytics page
│   │   ├── audiences/           # Audience management
│   │   │   └── create/          # Multi-step audience wizard
│   │   ├── activation/          # Channel activation
│   │   ├── profile/             # User profile
│   │   ├── admin/               # Admin section (nested layout)
│   │   ├── setup/               # Setup section (nested layout)
│   │   └── superadmin/          # SuperAdmin section (nested layout)
│   ├── login/                   # Login page
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (redirects to login)
│   └── globals.css              # Global styles + Tailwind
├── components/                  # React components
│   ├── audience/                # Audience wizard steps (Step1-Step10)
│   ├── ui/                      # Reusable UI components
│   ├── SidebarNext.tsx          # Main navigation sidebar
│   └── ErrorBoundary.tsx        # Error boundary wrapper
├── contexts/                    # React contexts
│   ├── AuthContext.tsx          # Authentication state (placeholder)
│   └── CreateAudienceContext.tsx # Audience wizard state
├── hooks/                       # Custom React hooks
│   └── useAuth.tsx              # Auth hook (placeholder)
├── public/                      # Static assets
├── __tests__/                   # Test files
├── pages-old-vite/              # Old Vite pages (archived)
├── vite-old-files/              # Old Vite config files (archived)
├── next.config.mjs              # Next.js configuration
├── tailwind.config.ts           # Tailwind CSS configuration
├── tsconfig.json                # TypeScript configuration (strict mode)
├── eslint.config.js             # ESLint 9 flat config
├── .prettierrc                  # Prettier configuration
├── Makefile                     # Quality tooling commands
└── CLAUDE.md                    # AI copilot guidelines
```

## Deployment

The app is configured for static export (`output: 'export'` in next.config.mjs).

### Build for Production

```bash
npm run build
```

This generates a static site in the `out/` directory that can be deployed to:

- Google Cloud Storage + CDN
- Vercel
- Netlify
- Any static hosting service

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

## Phase 1 Roadmap (Next Steps)

**Weeks 4-8:** Monorepo + Backend + Okta Auth

- Turborepo monorepo setup with pnpm workspaces
- NestJS backend API service
- Okta OIDC authentication (enterprise SSO)
- PostgreSQL database (Cloud SQL)
- Shared packages (types, core, auth, UI)

See `thoughts/shared/plans/roadmap-updates-v1.1.md` for full roadmap.

## Support

For questions or issues, consult:

1. **CLAUDE.md** - AI copilot guidelines and quick reference
2. **thoughts/shared/plans/** - Detailed implementation plans and ADRs
3. **thoughts/shared/research/** - Technical research and analysis

## License

Proprietary - Random Truffle

---

**Built with:**
Next.js 16 • React 19 • TypeScript • Tailwind CSS 4 • Turbopack
