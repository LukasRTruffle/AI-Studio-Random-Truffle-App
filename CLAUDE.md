# Claude Coding Copilot Guidelines for Random Truffle

This document provides guidelines for AI assistants working on the Random Truffle codebase.

## Project Overview

Random Truffle is an enterprise AI-driven marketing intelligence and activation platform.

### Current State & Roadmap

**Status:** Early-stage development (~8% complete per `thoughts/shared/research/2025-10-25_codebase.md`)

**Current Implementation:**

- Frontend: Vite + React prototype (30+ UI pages, mostly placeholders)
- Backend: Not yet implemented (NestJS planned)
- Data Plane: Not yet implemented (BigQuery planned)
- Agents: Not yet implemented

**Target Architecture:** Full monorepo with services, agents, data plane (see structure below)

**Implementation Plan:** See `thoughts/shared/plans/implementation-roadmap.md` for detailed 5-phase plan:

- **Phase 0** (Weeks 1-3): Foundation & Next.js migration (TypeScript strict mode, security fixes, Next.js)
- **Phase 1** (Weeks 4-8): Monorepo + backend + Okta auth (Turborepo, NestJS, OIDC, PostgreSQL)
- **Phase 2** (Weeks 9-14): Data plane foundation (BigQuery, MCP connectors, GA4 Consent Mode)
- **Phase 3** (Weeks 15-20): Vertex AI agents (data-science, audience-builder - synchronous API)
- **Phase 4** (Weeks 21-28): Multi-channel activation (Google Ads, Meta, TikTok, HITL governance)
- **Phase 5** (Weeks 29-38): Enterprise features (Terraform, SOC2 compliance, 95% test coverage, WCAG 2.1 AA)

**Timeline:** 38 weeks (~9 months) with 2-3 engineers
**Budget:** ~$364K (labor + infrastructure)

### Key Architectural Decisions

**Status:** 25 Architecture Decision Records (ADRs) approved (see `thoughts/shared/plans/architecture-decisions.md`)

**Critical Decisions:**

- **Frontend:** Next.js App Router (migrating from Vite in Phase 0)
- **Monorepo:** Turborepo (implementing in Phase 1, not Phase 5)
- **Authentication:** Okta OIDC (not Google Identity Platform)
- **Agents:** Vertex AI Conversational Agents with synchronous API (no orchestrator queue)
- **LLM:** Multi-model (Gemini Pro/Flash primary, GPT-4 fallback)
- **Ad Platform APIs:** Direct integration (Google Ads, Meta, TikTok APIs - Cortex not working for ads)
- **Consent:** GA4 Consent Mode (Phase 2) + CMP integration (Phase 4-5)
- **Test Coverage:** 95% (not 80%)
- **Accessibility:** WCAG 2.1 AA compliance
- **Compliance:** SOC2 Type II audit preparation

**See:** `thoughts/shared/plans/architecture-decisions.md` for full ADR details
**See:** `thoughts/shared/plans/roadmap-updates-v1.1.md` for roadmap changes based on ADRs

## Tech Stack

### Monorepo Structure

```
random-truffle/
├── apps/
│   └── web/                    # Next.js App Router frontend
├── services/
│   └── api/                    # NestJS backend API
├── agents/
│   ├── data-science/           # Vertex AI data science agent config
│   └── audience-builder/       # Vertex AI audience builder agent config
├── packages/
│   ├── types/                  # Shared TypeScript types
│   ├── core/                   # Core shared utilities
│   ├── auth/                   # Authentication package (Okta)
│   ├── ui/                     # UI components library
│   └── telemetry/              # Telemetry & monitoring
├── infra/
│   ├── terraform/              # Infrastructure as Code
│   ├── docker/                 # Docker configurations
│   └── policies/               # IAM & security policies
└── data/
    └── bq/                     # BigQuery schemas & queries
```

### Technology Choices

- **Frontend**: Next.js App Router (migrating from Vite)
- **Monorepo**: Turborepo with pnpm workspaces
- **Backend API**: NestJS (TypeScript strict mode throughout)
- **Authentication**: Okta OIDC (enterprise SSO)
- **Database**: PostgreSQL (Cloud SQL for transactional data)
- **Data Warehouse**: BigQuery (analytics data, GA4 native sync)
- **AI Agents**: Vertex AI Conversational Agents (multi-model: Gemini Pro/Flash, GPT-4)
- **Ad Platform APIs**: Direct integration (Google Ads, Meta, TikTok APIs)
- **Deployment**: Cloud Run (backend), Cloud Storage + CDN (frontend)
- **TypeScript**: Strict mode everywhere
- **Test Coverage**: 95% target
- **Accessibility**: WCAG 2.1 AA compliance
- **Compliance**: SOC2 Type II audit preparation
- **Cloud Platform**: Google Cloud Platform (GCP)

## Architecture Principles

### Services vs. Agents (Critical Distinction)

Random Truffle uses two distinct architectural patterns:

**Services** (`services/`) - Traditional backend APIs

- Deterministic, rule-based logic
- Synchronous HTTP endpoints (REST/GraphQL)
- Fast response times (< 1 second)
- Examples: User CRUD, Authentication, Audience CRUD
- Tech: NestJS, PostgreSQL, Redis

**Agents** (`agents/`) - AI-powered workers

- LLM-driven, generative capabilities using Vertex AI
- Synchronous API invocation (< 5 second response time goal)
- Multi-model support (Gemini Pro/Flash, GPT-4)
- Built-in data science tools (BigQuery, Python execution)
- Examples: SQL generation, Audience strategy recommendations
- Tech: Vertex AI Conversational Agents, Cloud Storage (artifacts)

**Decision Framework:**

- Use a **Service** for: CRUD operations, business logic, real-time responses, traditional integrations
- Use an **Agent** for: Natural language understanding, creative/generative output, multi-step reasoning, domain expertise simulation

**Agent Invocation Pattern:**

```
User → Frontend → Service (API) → Vertex AI Agent (sync) → Response
                                        ↓
                                  BigQuery / Tools
```

**Detailed Guide:** See `thoughts/shared/research/agents-vs-services-architecture.md`

### Human-in-the-Loop (HITL) Governance

**SuperAdmin Approval Required:**

- Platform configuration changes
- Agent prompt modifications
- Infrastructure changes (Terraform apply in production)
- MCP connector additions
- Cost threshold changes

**User-Level (Self-Service):**

- Audience activation (to ad platforms)
- Audience creation
- Dashboard creation
- Query execution (within cost limits)

### Data Plane

- **BigQuery**: Central data warehouse (analytics data)
- **PostgreSQL**: Transactional data (users, audiences, sessions)
- **Cortex Views**: GA4 integration via native BigQuery sync
- **Ad Platform Data**: Direct API integration (Google Ads, Meta, TikTok - Cortex not working)
- **Consent Management**: GA4 Consent Mode (Phase 2), CMP integration (Phase 4-5)
- **Session Stitching**: GA4 User-ID + user_pseudo_id
- **Currencies**: USD, MXN, COP (initial support)
- **Identifiers**: SHA-256 hashed with salt for ad platform uploads

### Activation Channels

Multi-account support for:

- Google Ads (via Google Ads API)
- Meta / Facebook / Instagram (via Meta API)
- TikTok (via TikTok Ads API)

### MCP Connectors

Model Context Protocol integrations:

- BigQuery MCP (query execution, schema retrieval)
- GA4 MCP (reporting API)
- Google Ads MCP (customer match lists, campaign performance)
- Meta MCP (custom audiences)
- TikTok MCP (custom audiences)

**Security**:

- Secrets via GCP Secret Manager (90-day rotation)
- Least-privilege IAM roles
- No hardcoded credentials
- SOC2 Type II audit preparation

## Development Workflow

### Quality Gates

All code must pass:

```bash
make check    # Linting + type checking
make test     # Unit tests
make e2e      # End-to-end tests (Playwright)
```

**CI/CD**: All quality gates must pass in continuous integration.

### Code Standards

- TypeScript strict mode enabled in all packages
- Shared types/DTOs between frontend and backend
- Follow Next.js App Router patterns
- NestJS best practices for API development

### Artifact Management

Store development artifacts under:

```
thoughts/shared/
├── research/     # Research documents
├── plans/        # Project plans & specifications
└── prs/          # Pull request templates & notes
```

### Context Management

- Keep chat context under ~60% to avoid token limits
- Write comprehensive documentation to files
- Use `/clear` command after writing to files when context is high

## Architectural Decision Framework

When implementing new features, use this decision tree:

### 1. Is this a new capability?

**YES** → Continue to Step 2
**NO** (modifying existing) → Follow existing patterns in that module

### 2. Does it need LLM/AI capabilities?

**YES** → Build an **Agent** (`agents/[name]/`)

- Examples: SQL generation, strategy recommendations, natural language queries
- Use LLM (Gemini, GPT, Claude)
- Invoke asynchronously via orchestrator
- Store outputs as artifacts in Cloud Storage

**NO** → Build a **Service** or **Package**

- Continue to Step 3

### 3. Does it serve HTTP requests or manage data?

**YES** → Build a **Service** (`services/[name]/`)

- Examples: REST API, authentication, data processing
- Use NestJS for services
- Deploy to Cloud Run

**NO** → Build a **Package** (`packages/[name]/`)

- Examples: Utility functions, shared types, UI components
- No HTTP endpoints, no state
- Import from other packages/apps

### 4. Where does it fit in the data flow?

```
User Input → Frontend (apps/web/)
                ↓
          Service (services/api/)  ← CRUD, business logic
                ↓
          Vertex AI Agent (agents/*)  ← AI workflows (synchronous)
                ↓
          MCP Connector / BigQuery  ← External data via agent tools
```

### 5. What are the dependencies?

- **Phase 0** required: Next.js migration, TypeScript strict mode, ESLint, Prettier
- **Phase 1** required: Turborepo monorepo, Backend API, Okta authentication
- **Phase 2** required: BigQuery, MCP connectors, GA4 Consent Mode
- **Phase 3** required: Vertex AI agents (no orchestrator needed)
- **Phase 4** required: Ad platform activation channels (Google Ads, Meta, TikTok)

See `thoughts/shared/plans/implementation-roadmap.md` for phase dependencies.

## Best Practices

### Code Quality

1. **Type Safety**:
   - TypeScript strict mode in all packages (`"strict": true`)
   - No `any` types (use `unknown` and type guards instead)
   - Explicit return types on exported functions
   - Shared types/DTOs between frontend and backend

2. **Shared Code**:
   - Extract common utilities to `packages/core/`
   - Extract types to `packages/types/`
   - Extract UI components to `packages/ui/`
   - Use workspace protocol in package.json: `"@random-truffle/core": "workspace:*"`

3. **Testing**:
   - Write tests before pushing code
   - Target: 95% code coverage (enforced in CI/CD)
   - Unit tests for all services and packages
   - Integration tests for API endpoints and MCP connectors
   - E2E tests (Playwright) for all critical user flows (complete UAT/QA)
   - Golden set tests for agent prompts (90% accuracy target)
   - Accessibility tests (WCAG 2.1 AA compliance with axe-core)

4. **Documentation**:
   - Keep README files updated in each package
   - Document all environment variables in .env.example
   - Add JSDoc comments to exported functions
   - Maintain ADRs (Architecture Decision Records) in `thoughts/shared/plans/`

### Security

5. **Secrets Management**:
   - Never commit secrets to git (.env files in .gitignore)
   - Use GCP Secret Manager for all credentials
   - Rotate secrets every 90 days
   - Use least-privilege service accounts

6. **IAM**:
   - Follow principle of least privilege
   - Separate dev and prod IAM roles
   - Document all roles in `infra/policies/`
   - Regular IAM audits (quarterly)

7. **Input Validation**:
   - Validate all user input (use class-validator in NestJS)
   - Sanitize SQL queries (parameterized queries only)
   - Validate agent-generated outputs before execution
   - Prevent prompt injection in agent inputs

8. **Authentication & Authorization**:
   - OIDC for user authentication (Okta - enterprise SSO)
   - MFA enforced for Admin and SuperAdmin roles
   - RBAC for authorization (user, admin, superadmin roles)
   - HttpOnly cookies for session tokens (never localStorage)
   - CSRF protection for mutating requests
   - 1-hour session expiration with refresh token rotation

### AI/Agent Best Practices

9. **Prompt Engineering**:
   - Store prompts in version control (`agents/*/prompts/`)
   - Use Vertex AI Agent Builder for prompt management
   - Use template variables for dynamic content
   - Include examples in prompts (few-shot learning)
   - Add safety rails ("Never generate DELETE/DROP queries")
   - Golden set testing for agent outputs (90% accuracy target)

10. **Cost Control**:

- Daily budgets: $10 (dev), $25 (staging), $100 (prod - startup level)
- Cache LLM responses (5-minute TTL for identical queries)
- Set token limits (100K input, 4K output tokens max)
- Use Gemini Flash for simple tasks, Gemini Pro for complex
- Monitor and alert at 50%, 75%, 90%, 100% of budget
- User quotas: 50 calls/day (free), 500 calls/day (paid)

11. **Resilience**:

- Retry logic: Max 3 retries with exponential backoff (1s, 2s, 4s)
- Fallback models: Gemini Pro → Gemini Flash → Cached response → Error
- Timeout: 30 seconds per agent call
- Alert on retry rate > 10% or fallback rate > 5%

12. **Governance**:
    - Implement HITL for sensitive operations:
      - Platform/agent configuration changes (SuperAdmin only)
      - Infrastructure changes (`terraform apply` in prod)
      - MCP connector additions
    - Audit log all agent invocations (SOC2 compliance)
    - Review agent outputs before production deployment

### Performance

13. **Frontend Optimization**:
    - Code splitting (React.lazy for routes)
    - Image optimization (Next.js Image component)
    - CDN caching (1 hour for static assets)
    - Lighthouse score target: > 90 (enforced in CI/CD)

14. **Backend Optimization**:
    - Redis caching for expensive queries (5-minute TTL)
    - Database indexes on frequently queried columns
    - Connection pooling (max 10 connections per service)
    - API rate limiting (100 req/min per user)
    - Performance budget: p95 latency < 500ms

15. **BigQuery Optimization**:
    - Partition tables by date
    - Cluster tables on frequently filtered columns
    - Use materialized views for common aggregations
    - Monitor query costs (alert if > $100/day)
    - Query timeout: 30 seconds

16. **Load Testing** (Phase 5):
    - Tool: k6 or Artillery
    - Target: 100 concurrent users, 1000 req/sec sustained
    - Run in staging before production deployments

## Getting Started

```bash
# Install dependencies
npm install

# Run quality checks
make check

# Run tests
make test

# Start development
npm run dev
```

## Related Documentation

### Planning & Architecture

- **Architecture Decision Records (ADRs):** `thoughts/shared/plans/architecture-decisions.md` - 25 approved decisions (auth, agents, testing, etc.)
- **Implementation Roadmap v1.0:** `thoughts/shared/plans/implementation-roadmap.md` - Original 5-phase plan
- **Roadmap Updates v1.1:** `thoughts/shared/plans/roadmap-updates-v1.1.md` - Updated plan based on ADRs
- **Agents vs. Services Architecture:** `thoughts/shared/research/agents-vs-services-architecture.md` - Deep dive on architectural patterns

### Research & Analysis

- **Codebase Analysis:** `thoughts/shared/research/2025-10-25_codebase.md` - Current state assessment, gap analysis, and recommendations

### Implementation Guides

- **Package READMEs:** Each package has its own README with specific documentation

## Questions?

For architectural decisions, refer to:

1. **This document (CLAUDE.md)** for high-level guidelines and quick reference
2. **`thoughts/shared/plans/architecture-decisions.md`** for all 25 approved ADRs
3. **`thoughts/shared/plans/roadmap-updates-v1.1.md`** for current phasing and priorities
4. **`thoughts/shared/research/agents-vs-services-architecture.md`** for services vs. agents distinction
5. **Package-specific README files** for implementation details

For questions about what to build next, consult the implementation roadmap updates (v1.1) and current phase.
