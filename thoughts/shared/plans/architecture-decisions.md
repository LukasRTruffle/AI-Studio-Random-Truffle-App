# Architecture Decision Records (ADRs)

**Version:** 1.0
**Date:** 2025-10-26
**Status:** Approved
**Owner:** Product & Engineering Team

---

## Overview

This document captures key architectural decisions for Random Truffle. These decisions were made based on business requirements, technical constraints, and best practices. All decisions are binding unless explicitly revised through a formal ADR amendment process.

---

## Decision Summary Table

| ID | Decision Area | Decision | Impact | Phase |
|----|---------------|----------|--------|-------|
| ADR-001 | Frontend Framework | Next.js App Router | Migration required | Phase 0-1 |
| ADR-002 | Repository Structure | Monorepo (Turborepo) ASAP | Early refactoring | Phase 1 |
| ADR-003 | Chart Library | Recharts | Remove Chart.js | Phase 0 |
| ADR-004 | Backend Deployment | Cloud Run | Standard | All |
| ADR-005 | Frontend Deployment | Cloud Storage + CDN | Standard | All |
| ADR-006 | BigQuery Schemas | Create data/bq/ directory | New structure | Phase 2 |
| ADR-007 | Cortex Model Strategy | Direct API integration | No Cortex for Ads | Phase 2-4 |
| ADR-008 | Consent Management | GA4 Consent Mode + future CMP | Standard | Phase 2 |
| ADR-009 | Session Stitching | GA4 User-ID + user_pseudo_id | Standard | Phase 2 |
| ADR-010 | Currency Support | USD, MXN, COP | Limited scope | Phase 2 |
| ADR-011 | OIDC Provider | Okta | Enterprise SSO | Phase 1 |
| ADR-012 | RBAC Model | User/Admin/SuperAdmin | Simple hierarchy | Phase 1 |
| ADR-013 | HITL Workflows | SuperAdmin for platform/agents | Strict governance | Phase 3-4 |
| ADR-014 | Audit Logging | SOC2 compliance | Comprehensive logs | Phase 5 |
| ADR-015 | Secret Rotation | GCP Secret Manager best practices | Standard | All |
| ADR-016 | LLM Platform | Vertex AI Conversational Agents | Multi-model | Phase 3 |
| ADR-017 | Agent Artifacts | GCP Storage (cost-optimized) | Standard | Phase 3 |
| ADR-018 | Agent Invocation | Synchronous API | Simplified architecture | Phase 3 |
| ADR-019 | Agent Failures | Retry logic + fallbacks | Resilient | Phase 3 |
| ADR-020 | Agent Cost Controls | Startup-level budgets | Cost-conscious | Phase 3 |
| ADR-021 | E2E Testing | Complete UAT/QA with Playwright | Comprehensive | All |
| ADR-022 | Test Coverage Target | 95% | High quality bar | All |
| ADR-023 | Integration Testing | Required for all integrations | Comprehensive | All |
| ADR-024 | Performance Testing | Speed + accuracy focus | Standard | All |
| ADR-025 | Accessibility | WCAG 2.1 AA compliance | Standard | All |

---

## ADR-001: Frontend Framework - Next.js App Router

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product & Engineering Team

### Context
Current implementation uses Vite + React. CLAUDE.md specifies Next.js App Router. Need to decide: keep Vite or migrate to Next.js?

### Decision
**Migrate to Next.js App Router**

The current Vite implementation is temporary. We will migrate to Next.js App Router as specified in CLAUDE.md.

### Rationale
- Next.js provides better SEO, SSR/SSG capabilities
- Built-in routing, API routes, middleware
- Better developer experience for enterprise apps
- Industry standard for production React apps
- Easier integration with GCP (Cloud Run)

### Implementation
**Phase 0-1:** Migrate existing Vite app to Next.js
- Create Next.js App Router structure
- Migrate pages to app/ directory
- Update routing from React Router to Next.js routing
- Configure for Cloud Storage + CDN deployment

**Effort:** ~40 hours (1 week)

### Consequences
- **Positive:** Better performance, SEO, developer experience
- **Negative:** Migration effort upfront, learning curve for team
- **Risks:** Migration bugs, routing differences

---

## ADR-002: Repository Structure - Monorepo ASAP

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product & Engineering Team

### Context
Current implementation is single-app. CLAUDE.md specifies monorepo. Original roadmap deferred monorepo to Phase 5.

### Decision
**Migrate to Turborepo monorepo structure ASAP (Phase 1)**

Do not defer monorepo migration. Implement from the start to avoid future refactoring pain.

### Rationale
- Avoid massive refactoring later (Phase 5 → Phase 1)
- Shared code from day one (types, utilities, UI components)
- Better code organization and scalability
- Easier to add services/agents incrementally
- Industry best practice for microservices architecture

### Implementation
**Phase 1:** Set up Turborepo monorepo
```
random-truffle/
├── apps/
│   └── web/              # Next.js frontend
├── services/
│   └── api/              # NestJS backend (Phase 1)
├── packages/
│   ├── types/            # Shared TypeScript types
│   ├── ui/               # Shared UI components
│   └── core/             # Shared utilities
├── turbo.json
└── package.json
```

**Effort:** ~20 hours (setup + migration)

### Consequences
- **Positive:** Clean architecture from start, shared code, easier scaling
- **Negative:** Slight increase in Phase 1 complexity
- **Risks:** Turborepo learning curve, build pipeline complexity

---

## ADR-003: Chart Library - Recharts

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Current implementation has both Recharts and Chart.js (duplicate libraries, ~150KB bundle bloat).

### Decision
**Keep Recharts, remove Chart.js and react-chartjs-2**

### Rationale
- Recharts is React-native (better integration)
- Declarative API (easier to use)
- Better TypeScript support
- Composable chart components
- Active maintenance and community

### Implementation
**Phase 0:** Remove duplicate library
```bash
npm uninstall chart.js react-chartjs-2
```
Update any Chart.js usage to Recharts (if any exists).

**Effort:** ~2 hours

### Consequences
- **Positive:** Smaller bundle (~150KB savings), simpler codebase
- **Negative:** None (Chart.js not currently used)
- **Risks:** None

---

## ADR-004: Backend Deployment - Cloud Run

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need to choose backend deployment platform: Cloud Run, GKE, or App Engine.

### Decision
**Cloud Run for all backend services**

### Rationale
- Serverless (no cluster management)
- Auto-scaling (0 to N instances)
- Pay-per-use (cost-effective for startup)
- Fast cold starts (< 1 second)
- Supports containers (Docker)
- Easy CI/CD integration

### Implementation
All NestJS services deploy to Cloud Run:
- `services/api/` → Cloud Run service
- Future services (orchestrator, etc.) → Cloud Run

**Configuration:**
- Auto-scaling: 0-10 instances (Phase 1-3), 0-50 (Phase 4-5)
- CPU: 1 vCPU, Memory: 512MB (start), scale as needed
- HTTPS only, custom domain

**Effort:** Standard deployment (included in Phase 1)

### Consequences
- **Positive:** Low cost, easy scaling, no ops overhead
- **Negative:** Cold starts (mitigated with min instances if needed)
- **Risks:** Vendor lock-in (GCP)

---

## ADR-005: Frontend Deployment - Cloud Storage + CDN

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need to choose frontend deployment: Cloud Run, Firebase Hosting, or Cloud Storage + CDN.

### Decision
**Cloud Storage + Cloud CDN**

### Rationale
- Static site deployment (Next.js export or SSG)
- Global CDN (low latency)
- Low cost (~$1-5/month)
- High availability
- Easy CI/CD (upload to bucket)

### Implementation
**Next.js Configuration:**
- Use `next export` for static generation (or SSG pages)
- Upload to Cloud Storage bucket
- Enable Cloud CDN
- Custom domain via Cloud Load Balancer

**Alternative for SSR:**
If SSR is required later, deploy Next.js to Cloud Run instead.

**Effort:** Standard deployment (included in Phase 1)

### Consequences
- **Positive:** Very low cost, high performance, global distribution
- **Negative:** No SSR (unless migrate to Cloud Run)
- **Risks:** None for static content

---

## ADR-006: BigQuery Schemas - Create data/bq/ Directory

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
No BigQuery schemas exist. Need structured approach to data warehouse.

### Decision
**Create `data/bq/` directory structure in Phase 2**

### Implementation
**Phase 2:**
```
data/bq/
├── schemas/
│   ├── sessions.sql          # GA4 session data
│   ├── events.sql            # GA4 event data
│   ├── conversions.sql       # Conversion events
│   └── user_attributes.sql   # User attributes
├── views/
│   ├── cortex_ga4_sessions.sql    # Cortex GA4 views
│   ├── daily_kpis.sql             # Daily KPI aggregations
│   └── audience_metrics.sql       # Audience performance
└── queries/
    ├── get_audience_size.sql      # Audience size estimation
    └── get_session_trends.sql     # Session trend analysis
```

**Effort:** Included in Phase 2

### Consequences
- **Positive:** Organized, version-controlled SQL schemas
- **Negative:** None
- **Risks:** Schema evolution complexity (handle with migrations)

---

## ADR-007: Cortex Model Strategy - Direct API Integration

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product Team

### Context
Google Ads API in Cortex model is not working correctly. Need alternative approach.

### Decision
**Use Direct APIs for Google Ads, Meta, TikTok**

GA4 uses native BigQuery sync, but advertising platforms use direct APIs to send data to Cortex model.

### Rationale
- **GA4:** Native BigQuery sync works well → Use Cortex views
- **Google Ads API:** Cortex integration broken → Use Google Ads API directly
- **Meta API:** No native Cortex → Use Meta API directly
- **TikTok API:** No native Cortex → Use TikTok API directly

### Implementation
**Phase 2:**
- Set up GA4 → BigQuery native sync
- Create Cortex views for GA4 data

**Phase 4:**
- MCP connectors for Google Ads, Meta, TikTok APIs
- Custom data pipelines to load into BigQuery
- Create custom views (not Cortex) for ad platform data

**Effort:** Included in Phase 2 and Phase 4

### Consequences
- **Positive:** Reliable data pipelines, full API control
- **Negative:** More custom code vs. native Cortex
- **Risks:** API rate limits, quota management

---

## ADR-008: Consent Management - GA4 Consent Mode + Future CMP

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product Team

### Context
Need consent management for GDPR/CCPA compliance.

### Decision
**Phase 2: Use GA4 Consent Mode**
**Phase 4-5: Integrate Consent Management Platform (CMP)**

### Rationale
- GA4 Consent Mode handles analytics consent
- CMP (e.g., OneTrust, Cookiebot) for broader compliance
- Start simple, add CMP when needed for enterprise customers

### Implementation
**Phase 2:**
- Enable GA4 Consent Mode
- Track consent status in BigQuery
- Basic consent UI in frontend

**Phase 4-5:**
- Integrate CMP (TBD: OneTrust, Cookiebot, or custom)
- Sync CMP consent with GA4
- Store consent records in PostgreSQL (audit trail)

**Effort:** Phase 2 (included), Phase 5 (~40 hours for CMP)

### Consequences
- **Positive:** Compliant from day one, scalable approach
- **Negative:** CMP integration later (acceptable)
- **Risks:** GDPR fines if consent not handled properly (mitigated by GA4 Consent Mode)

---

## ADR-009: Session Stitching - GA4 User-ID + user_pseudo_id

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need user identity resolution across sessions and devices.

### Decision
**Use GA4's native User-ID feature + user_pseudo_id (client ID)**

### Implementation
**GA4 Setup:**
- Enable User-ID for logged-in users
- Use `user_pseudo_id` (client ID) for anonymous users
- Stitch identities in BigQuery using both fields

**BigQuery Query Pattern:**
```sql
SELECT
  COALESCE(user_id, user_pseudo_id) AS unified_user_id,
  ...
FROM `project.dataset.events_*`
```

**Effort:** Included in Phase 2

### Consequences
- **Positive:** Native GA4 feature, accurate cross-device tracking
- **Negative:** Requires logged-in users for best accuracy
- **Risks:** Anonymous user tracking limited (acceptable)

---

## ADR-010: Currency Support - USD, MXN, COP

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product Team

### Context
Need to support revenue tracking in multiple currencies.

### Decision
**Initial support: USD, MXN, COP**
Expand later as needed for other markets.

### Implementation
**Phase 2:**
- Store currency code with revenue events
- Display revenue in original currency (no conversion yet)

**Phase 3-4:**
- Add currency conversion logic (use exchange rate API)
- Normalize all revenue to USD for reporting
- Store exchange rates in BigQuery

**Supported Currencies:**
- USD (US Dollar) - Primary
- MXN (Mexican Peso)
- COP (Colombian Peso)

**Effort:** Included in Phase 2-4

### Consequences
- **Positive:** Simple initial scope, expand as needed
- **Negative:** Currency conversion complexity later
- **Risks:** Exchange rate fluctuations, API reliability

---

## ADR-011: OIDC Provider - Okta

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product Team

### Context
Need enterprise SSO for authentication.

### Decision
**Use Okta for OIDC authentication**

### Rationale
- Enterprise-grade SSO
- Multi-factor authentication (MFA)
- SCIM provisioning for user management
- Integration with corporate identity providers
- Better for B2B SaaS vs. Google Identity Platform

### Implementation
**Phase 1:**
- Set up Okta application
- Implement Authorization Code Flow with PKCE
- Configure Okta groups for RBAC (User, Admin, SuperAdmin)
- Backend NestJS integration (Passport.js + Okta strategy)
- Frontend OIDC client

**Configuration:**
- Session duration: 1 hour
- Refresh token rotation: Enabled
- MFA: Required for Admin/SuperAdmin roles

**Effort:** ~40 hours (included in Phase 1)

### Consequences
- **Positive:** Enterprise SSO, MFA, SCIM provisioning
- **Negative:** Cost (~$2-5/user/month), vendor lock-in
- **Risks:** Okta outages (mitigated with fallback auth)

---

## ADR-012: RBAC Model - User/Admin/SuperAdmin

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product Team

### Context
Need role-based access control.

### Decision
**Three roles: User, Admin, SuperAdmin**

### Role Definitions

**User:**
- View dashboards and analytics
- Create audiences (with approval)
- Create dashboards
- Execute saved queries

**Admin:**
- All User permissions
- Approve audience activations
- Manage users (CRUD)
- View audit logs

**SuperAdmin:**
- All Admin permissions
- Platform configuration (MCP connectors, data sources)
- Agent configuration and approvals
- Infrastructure changes (Terraform)
- Full system access

### Implementation
**Phase 1:**
- Store role in `users` table
- Backend middleware for role checks
- Frontend route guards

**Effort:** Included in Phase 1

### Consequences
- **Positive:** Simple, clear hierarchy
- **Negative:** May need more granular permissions later
- **Risks:** None (can extend with permission flags later)

---

## ADR-013: HITL Workflows - SuperAdmin Governance

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product Team

### Context
Need human-in-the-loop (HITL) approvals for risky actions.

### Decision
**SuperAdmin-only approvals for platform/agent decisions**
**User-level approvals for business operations**

### Approval Requirements

**SuperAdmin Approval Required:**
- Platform configuration changes
- Agent prompt modifications
- Infrastructure changes (Terraform apply in prod)
- MCP connector additions
- Cost threshold changes

**User-level Approval (Self-service):**
- Audience activation (to ad platforms)
- Audience creation
- Dashboard creation
- Query execution (within cost limits)

### Implementation
**Phase 3-4:**
- Approval workflow engine
- Email notifications for pending approvals
- Audit log of all approvals/rejections

**Effort:** Included in Phase 3-4

### Consequences
- **Positive:** Reduced friction for business users, tight control on platform
- **Negative:** SuperAdmin bottleneck for platform changes
- **Risks:** None

---

## ADR-014: Audit Logging - SOC2 Compliance

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product Team

### Context
Need audit logging for compliance.

### Decision
**SOC2 Type II compliance requirements**

### Implementation
**Phase 5:**
- Comprehensive audit logging for all actions:
  - User authentication (login, logout, failed attempts)
  - Data access (audience views, query executions)
  - Data modifications (audience create/update/delete)
  - Configuration changes (platform, agents, connectors)
  - Approvals (HITL workflow decisions)
- Log retention: 7 years (SOC2 requirement)
- Immutable logs (append-only)
- Regular log reviews (quarterly)

**Storage:**
- Cloud Logging (GCP native)
- Export to BigQuery for long-term storage
- Backup to Cloud Storage (immutable)

**Effort:** ~60 hours (included in Phase 5)

### Consequences
- **Positive:** SOC2 compliance, enterprise-ready
- **Negative:** Storage costs (~$50-100/month), compliance overhead
- **Risks:** Log tampering (mitigated with immutability)

---

## ADR-015: Secret Rotation - GCP Secret Manager Best Practices

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need secret management and rotation.

### Decision
**Follow GCP Secret Manager best practices**

### Implementation
**All Phases:**
- Store all secrets in GCP Secret Manager
- Automatic rotation every 90 days
- Version all secrets (enable rollback)
- Least-privilege IAM for secret access
- Audit log secret access

**Secrets:**
- Database credentials
- API keys (Okta, LLM, ad platforms)
- Encryption keys
- Session secrets

**Effort:** Included in all phases

### Consequences
- **Positive:** Secure, auditable, automated rotation
- **Negative:** Slight complexity vs. .env files
- **Risks:** Rotation failures (mitigated with alerts)

---

## ADR-016: LLM Platform - Vertex AI Conversational Agents

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product & Engineering Team

### Context
Need AI/LLM platform for agents.

### Decision
**Vertex AI Conversational Agents with data science capabilities**
Multi-model approach (not single LLM).

### Rationale
- Vertex AI provides enterprise-grade agent framework
- Built-in tools for data science (BigQuery integration, Python code execution)
- Multi-model support (Gemini, PaLM, third-party models)
- GCP native (easier integration)
- Managed platform (less infrastructure)

### Implementation
**Phase 3:**
- **Data Science Agent:** Vertex AI agent with BigQuery tool
- **Audience Builder Agent:** Vertex AI agent with custom tools
- Agent configuration stored in version control
- Prompt versioning and A/B testing

**Models:**
- Primary: Gemini 1.5 Pro (general intelligence)
- Fallback: Gemini 1.5 Flash (cost optimization)
- Future: OpenAI GPT-4 (via Vertex AI Model Garden)

**Effort:** Included in Phase 3

### Consequences
- **Positive:** Enterprise features, multi-model, managed platform
- **Negative:** Vendor lock-in (GCP), higher cost than raw API
- **Risks:** Model deprecation (mitigated with multi-model)

---

## ADR-017: Agent Artifacts - GCP Storage (Cost-Optimized)

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need storage for agent-generated artifacts (SQL queries, strategies, reports).

### Decision
**Cloud Storage with cost-optimized lifecycle policies**

### Implementation
**Phase 3:**
- Bucket: `random-truffle-artifacts`
- Structure:
  ```
  artifacts/
  ├── queries/           # SQL queries
  ├── strategies/        # Audience strategies
  └── reports/           # Analysis reports
  ```
- Lifecycle policy:
  - Standard storage: 0-30 days
  - Nearline storage: 31-90 days
  - Coldline storage: 91-365 days
  - Archive storage: 365+ days
  - Delete: After 2 years

**Cost Estimate:**
- Standard: $0.02/GB/month (first 30 days)
- Nearline: $0.01/GB/month (31-90 days)
- Coldline: $0.004/GB/month (91-365 days)
- Total: ~$10-20/month for 1TB

**Effort:** Included in Phase 3

### Consequences
- **Positive:** Low cost, automatic lifecycle management
- **Negative:** Slower access for old artifacts (acceptable)
- **Risks:** None

---

## ADR-018: Agent Invocation - Synchronous API

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Original roadmap proposed async orchestrator queue. Need to decide: sync or async?

### Decision
**Synchronous API invocation (simplified architecture)**

### Rationale
- Simpler architecture (no orchestrator service, no queue)
- Faster response (no queue delay)
- Easier debugging (synchronous flow)
- Vertex AI agents are fast enough for sync calls (< 5 seconds)
- Startup MVP doesn't need queue complexity yet

### Implementation
**Phase 3:**
- Direct API calls from backend to Vertex AI agents
- Frontend → Backend API → Vertex AI Agent → Response
- Timeout: 30 seconds (return error if agent takes longer)
- Streaming responses for chat (SSE)

**No orchestrator service needed**

**Migration Path (if async needed later):**
- Add orchestrator service in Phase 4-5 if sync performance insufficient
- Use Cloud Tasks for queuing

**Effort:** Removes ~80 hours from Phase 3 (orchestrator service)

### Consequences
- **Positive:** Simpler architecture, faster MVP, easier debugging
- **Negative:** Blocked API requests (mitigated with timeouts)
- **Risks:** Agent latency spikes (mitigated with monitoring, can add async later)

---

## ADR-019: Agent Failures - Retry Logic + Fallbacks

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need resilient agent invocations.

### Decision
**Retry logic with exponential backoff + fallback strategies**

### Implementation
**Phase 3:**
- **Retry Logic:**
  - Max retries: 3
  - Backoff: 1s, 2s, 4s
  - Retry on: Timeout, 5xx errors, rate limits
  - No retry on: 4xx errors (bad request)

- **Fallback Strategies:**
  - Primary model fails → Fallback to Gemini Flash
  - All models fail → Return cached response (if available)
  - No cache → Return user-friendly error message

- **Monitoring:**
  - Alert on retry rate > 10%
  - Alert on fallback rate > 5%
  - Track agent latency and success rate

**Effort:** Included in Phase 3

### Consequences
- **Positive:** Resilient system, better user experience
- **Negative:** Increased latency on failures (acceptable)
- **Risks:** Retry storms (mitigated with exponential backoff)

---

## ADR-020: Agent Cost Controls - Startup-Level Budgets

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product Team

### Context
Need cost controls for LLM usage.

### Decision
**Startup-level budgets with monitoring and alerts**

### Implementation
**Phase 3:**
- **Daily Budgets:**
  - Dev environment: $10/day
  - Staging environment: $25/day
  - Production environment: $100/day (Month 1-3), $250/day (Month 4-6)

- **Per-Request Limits:**
  - Max input tokens: 100K
  - Max output tokens: 4K
  - Timeout: 30 seconds

- **User Quotas:**
  - Free tier: 50 agent calls/day
  - Paid tier: 500 agent calls/day
  - Enterprise: Unlimited (with budget alerts)

- **Alerts:**
  - 50% of daily budget → Slack notification
  - 75% of daily budget → Email engineering lead
  - 90% of daily budget → PagerDuty alert
  - 100% of daily budget → Throttle requests

**Effort:** ~20 hours (included in Phase 3)

### Consequences
- **Positive:** Prevent cost overruns, predictable spending
- **Negative:** User frustration if quota hit (mitigated with clear messaging)
- **Risks:** Budget too low (adjust based on usage)

---

## ADR-021: E2E Testing - Complete UAT/QA with Playwright

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need end-to-end testing strategy.

### Decision
**Complete UAT/QA using Playwright**

### Implementation
**All Phases:**
- **Critical User Flows:**
  - User authentication (login, logout, session expiry)
  - Audience creation (10-step wizard)
  - Audience activation (push to ad platform)
  - Data explorer (chat with data science agent)
  - Dashboard creation and viewing
  - Admin workflows (user management, approvals)

- **Test Environments:**
  - Staging environment (pre-production)
  - Run E2E tests on every PR
  - Run full suite nightly

- **Coverage Target:**
  - All critical flows: 100%
  - All pages: Smoke tests

**Effort:** ~40 hours initial setup, ongoing maintenance

### Consequences
- **Positive:** Catch regressions early, confident deployments
- **Negative:** Test maintenance overhead
- **Risks:** Flaky tests (mitigated with retry logic)

---

## ADR-022: Test Coverage Target - 95%

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need unit test coverage target.

### Decision
**95% code coverage target (up from 80% in original roadmap)**

### Rationale
- High quality bar for enterprise product
- Reduce production bugs
- Easier refactoring with confidence
- Industry best practice for critical systems

### Implementation
**All Phases:**
- Jest for unit tests (frontend + backend)
- Coverage enforcement in CI/CD
- Block PR merge if coverage drops below 95%
- Coverage reports in PR comments

**Exclusions from coverage:**
- Configuration files
- Type definitions
- Migration scripts

**Effort:** ~20% increase in development time (acceptable for quality)

### Consequences
- **Positive:** Fewer bugs, easier refactoring, maintainable code
- **Negative:** Slower development (20% overhead)
- **Risks:** False sense of security (need good tests, not just coverage)

---

## ADR-023: Integration Testing - Required for All Integrations

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need integration testing for external dependencies.

### Decision
**Integration tests required for:**
- Backend + PostgreSQL
- Backend + BigQuery
- MCP connectors (BigQuery, GA4, Google Ads, Meta)
- Vertex AI agents
- Okta authentication

### Implementation
**All Phases:**
- Use test databases (not production)
- Mock external APIs when possible
- Use actual APIs in staging (with test accounts)
- Run integration tests in CI/CD (parallel with unit tests)

**Effort:** ~40 hours initial setup, ongoing maintenance

### Consequences
- **Positive:** Catch integration bugs early
- **Negative:** Slower CI/CD (mitigated with parallel execution)
- **Risks:** Test data costs (use free tiers or test accounts)

---

## ADR-024: Performance Testing - Speed + Accuracy

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Engineering Team

### Context
Need performance testing strategy.

### Decision
**Focus on speed and accuracy**

### Implementation
**Phase 4-5:**
- **Load Testing:**
  - Tool: k6 or Artillery
  - Target: 100 concurrent users, 1000 req/sec sustained
  - Test environments: Staging (before production deploy)

- **Performance Budgets:**
  - Frontend: Lighthouse score > 90
  - Backend API: p95 latency < 500ms
  - BigQuery queries: p95 latency < 2 seconds
  - Agent responses: p95 latency < 5 seconds

- **Accuracy Testing:**
  - Agent SQL generation: 90% accuracy (golden set tests)
  - Analytics calculations: 100% accuracy (compare with source data)
  - Currency conversion: 99.9% accuracy (compare with exchange rate API)

**Effort:** ~40 hours (included in Phase 5)

### Consequences
- **Positive:** Catch performance regressions, meet SLAs
- **Negative:** Test maintenance overhead
- **Risks:** Load tests may hit rate limits (use test environments)

---

## ADR-025: Accessibility - WCAG 2.1 AA Compliance

**Status:** ✅ Approved
**Date:** 2025-10-26
**Decision Maker:** Product Team

### Context
Need accessibility standards.

### Decision
**WCAG 2.1 AA compliance**

### Implementation
**All Phases:**
- **Automated Testing:**
  - Tool: axe-core (Playwright integration)
  - Run on every PR
  - Block merge if violations found

- **Manual Testing:**
  - Screen reader testing (NVDA, JAWS)
  - Keyboard navigation testing
  - Color contrast testing

- **Requirements:**
  - All interactive elements keyboard-accessible
  - All images have alt text
  - All forms have labels
  - Color contrast ratio ≥ 4.5:1 (text), ≥ 3:1 (UI components)
  - No keyboard traps

**Effort:** ~20 hours initial audit + fixes, ongoing maintenance

### Consequences
- **Positive:** Inclusive product, legal compliance, better UX for all
- **Negative:** Development overhead (acceptable)
- **Risks:** None

---

## Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-26 | Product & Engineering Team | Initial ADRs based on 25 open questions |

---

## Amendment Process

To amend an ADR:
1. Create amendment proposal (new markdown file)
2. Review with engineering team
3. Product approval required
4. Update this document with amendment
5. Notify all stakeholders

**Contact:** engineering@randomtruffle.com
