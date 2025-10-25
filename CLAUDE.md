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
- **Phase 0** (Weeks 1-2): Foundation & stabilization (TypeScript strict mode, security fixes, quality tooling)
- **Phase 1** (Weeks 3-6): MVP backend + authentication (NestJS, OIDC, PostgreSQL)
- **Phase 2** (Weeks 7-12): Data plane foundation (BigQuery, first MCP connector, analytics)
- **Phase 3** (Weeks 13-18): Agent services + orchestration (data-science agent, audience-builder agent)
- **Phase 4** (Weeks 19-24): Multi-channel activation (Google Ads, Meta, HITL governance)
- **Phase 5** (Weeks 25-36): Enterprise features & monorepo (Terraform, observability, 80% test coverage)

**Timeline:** 9-12 months with 2-3 engineers
**Budget:** ~$350K (labor + infrastructure)

## Tech Stack

### Monorepo Structure

```
random-truffle/
├── apps/
│   └── web/                    # Next.js App Router frontend
├── services/
│   ├── api/                    # NestJS backend API
│   └── orchestrator/           # Cloud Run worker service
├── agents/
│   ├── data-science/           # Data science agent
│   └── audience-builder/       # Audience builder agent
├── packages/
│   ├── core/                   # Core shared utilities
│   ├── auth/                   # Authentication package
│   ├── ui/                     # UI components library
│   ├── cortex-model/           # Cortex model definitions
│   └── telemetry/              # Telemetry & monitoring
├── infra/
│   ├── terraform/              # Infrastructure as Code
│   ├── docker/                 # Docker configurations
│   └── policies/               # IAM & security policies
└── data/
    └── bq/                     # BigQuery schemas & queries
```

### Technology Choices

- **Frontend**: Next.js App Router (standardized)
- **Backend API**: NestJS (TypeScript throughout, shared DTOs/types)
- **Worker Services**: Cloud Run (orchestrator)
- **TypeScript**: Strict mode everywhere
- **Data Warehouse**: BigQuery with Cortex views
- **Cloud Platform**: Google Cloud Platform

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
- LLM-driven, generative capabilities
- Asynchronous invocation via orchestrator
- Slower response times (seconds to minutes)
- Examples: SQL generation, Audience strategy recommendations
- Tech: Gemini/GPT, Cloud Run, Cloud Storage

**Decision Framework:**
- Use a **Service** for: CRUD operations, business logic, real-time responses, traditional integrations
- Use an **Agent** for: Natural language understanding, creative/generative output, multi-step reasoning, domain expertise simulation

**Detailed Guide:** See `thoughts/shared/research/agents-vs-services-architecture.md`

### Human-in-the-Loop (HITL) Governance

Risky actions require human approval:
- Device approvals
- Audience pushes to ad platforms
- Infrastructure applies (Terraform)

### Data Plane

- **BigQuery**: Central data warehouse
- **Cortex Views**: GA4 integration, Ads network data
- **Consent Registry**: SHA-256 hashed identifiers with salt
- **Data Sources**: GA4, Google Ads networks

### Activation Channels (Phase 5 Target)

Multi-account support for:
- Google Ads
- Meta (Facebook/Instagram)
- TikTok

### MCP Connectors

Model Context Protocol integrations:
- BigQuery
- GA4 (Google Analytics 4)
- Looker
- Google Ads

**Security**:
- Secrets via GCP Secret Manager
- Least-privilege IAM roles
- No hardcoded credentials

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
          Orchestrator (services/orchestrator/)  ← Agent coordination
                ↓
          Agent (agents/*)  ← AI workflows
                ↓
          MCP Connector (packages/mcp-*)  ← External data
                ↓
          BigQuery / External APIs  ← Data sources
```

### 5. What are the dependencies?

- **Phase 0** required: TypeScript strict mode, ESLint, Prettier
- **Phase 1** required: Backend API, authentication
- **Phase 2** required: BigQuery, MCP connectors
- **Phase 3** required: Orchestrator, agents
- **Phase 4** required: Activation channels

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
   - Target: 80% code coverage
   - Unit tests for all services and packages
   - Integration tests for API endpoints
   - E2E tests (Playwright) for critical user flows
   - Golden set tests for agent prompts

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
   - OIDC for user authentication (Google Identity Platform)
   - RBAC for authorization (user, admin, superadmin roles)
   - HttpOnly cookies for session tokens (never localStorage)
   - CSRF protection for mutating requests

### AI/Agent Best Practices

9. **Prompt Engineering**:
   - Store prompts in version control (`agents/*/prompts/`)
   - Use template variables for dynamic content
   - Include examples in prompts (few-shot learning)
   - Add safety rails ("Never generate DELETE/DROP queries")

10. **Cost Control**:
    - Cache LLM responses (5-minute TTL for identical queries)
    - Set token limits (e.g., 4K max output tokens)
    - Use smaller models for simple tasks (Gemini Flash vs Pro)
    - Monitor and alert on daily LLM costs (> $100/day)

11. **Governance**:
    - Implement HITL for sensitive operations:
      - Audience pushes to ad platforms
      - Infrastructure changes (`terraform apply` in prod)
      - High-cost agent operations (> $10/query)
    - Audit log all agent invocations
    - Review agent outputs before user-facing deployment

### Performance

12. **Frontend Optimization**:
    - Code splitting (React.lazy for routes)
    - Image optimization (next/image or Vite plugins)
    - CDN caching (1 hour for static assets)
    - Lighthouse score target: > 90

13. **Backend Optimization**:
    - Redis caching for expensive queries (5-minute TTL)
    - Database indexes on frequently queried columns
    - Connection pooling (max 10 connections per service)
    - API rate limiting (100 req/min per user)

14. **BigQuery Optimization**:
    - Partition tables by date
    - Cluster tables on frequently filtered columns
    - Use materialized views for common aggregations
    - Monitor query costs (alert if > $100/day)

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

- **Implementation Roadmap:** `thoughts/shared/plans/implementation-roadmap.md` - Detailed 5-phase plan with timelines, budgets, and deliverables
- **Agents vs. Services Architecture:** `thoughts/shared/research/agents-vs-services-architecture.md` - Deep dive on architectural patterns
- **Codebase Analysis:** `thoughts/shared/research/2025-10-25_codebase.md` - Current state assessment, gap analysis, and recommendations
- **Package READMEs:** Each package has its own README with specific documentation

## Questions?

For architectural decisions, refer to:
1. This document (CLAUDE.md) for high-level guidelines
2. `thoughts/shared/plans/implementation-roadmap.md` for phasing and priorities
3. `thoughts/shared/research/agents-vs-services-architecture.md` for services vs. agents distinction
4. Package-specific README files for implementation details

For questions about what to build next, consult the implementation roadmap and current phase.
