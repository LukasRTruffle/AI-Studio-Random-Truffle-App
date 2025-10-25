# Random Truffle: Phased Implementation Roadmap

**Version:** 1.0
**Date:** 2025-10-25
**Status:** Draft for Review
**Current Completion:** 8% (per codebase analysis)
**Target Architecture:** Enterprise AI-driven marketing intelligence platform (see CLAUDE.md)

---

## Executive Summary

This document outlines a **5-phase implementation plan** to transform the current React prototype into the enterprise-grade architecture described in CLAUDE.md. The plan balances speed-to-value with architectural integrity, delivering incremental user value while building toward the full vision.

**Timeline:** 9-12 months with 2-3 engineers
**Investment:** ~$300K-450K (labor + infrastructure)
**Key Risk:** Scope creep without clear phase gates

---

## Current State Assessment

From `thoughts/shared/research/2025-10-25_codebase.md`:

| Component | Status | Completion |
|-----------|--------|------------|
| Frontend | Vite + React prototype | 20% |
| Backend API | Missing | 0% |
| Data Plane | Missing | 0% |
| Agents | Missing | 0% |
| Security | Mock auth only | 5% |
| Infrastructure | Missing | 0% |
| Testing | 3 test files | 10% |
| **Overall** | **Prototype** | **8%** |

---

## Phase 0: Foundation & Stabilization (Weeks 1-2)

**Goal:** Fix critical issues, establish quality baseline
**Team:** 1-2 engineers
**User-Facing Value:** None (infrastructure)

### Deliverables

#### 1. Security Fixes (P0 - Critical)
- [ ] Remove credential logging from `hooks/useAuth.ts:18`
- [ ] Move `GEMINI_API_KEY` to backend (create proxy endpoint)
- [ ] Remove unencrypted localStorage (temporary: keep for Phase 0 only)
- [ ] Add basic Content Security Policy headers

**Acceptance Criteria:**
- No credentials logged to console
- API key not exposed in client bundle
- Security scan passes (npm audit, Snyk)

#### 2. TypeScript Strict Mode
- [ ] Enable `"strict": true` in `tsconfig.json`
- [ ] Fix all type errors (estimate: 20-50 errors)
- [ ] Add explicit return types to all exported functions
- [ ] Remove `skipLibCheck` and `allowJs` flags

**Acceptance Criteria:**
- `npx tsc --noEmit` passes with zero errors
- No `any` types in codebase (except third-party)

#### 3. Quality Tooling
- [ ] Add ESLint with TypeScript config
- [ ] Add Prettier with config
- [ ] Create Makefile with targets:
  - `make check` - Lint + type check
  - `make test` - Run unit tests
  - `make fix` - Auto-fix lint issues
- [ ] Add pre-commit hooks (husky)

**Acceptance Criteria:**
- `make check` passes
- All files formatted consistently
- Git pre-commit hook blocks bad commits

#### 4. Code Quality Fixes
- [ ] Fix `ChatInterface.tsx:46` - Use message ID as key (not array index)
- [ ] Remove duplicate chart library (keep Recharts, remove Chart.js)
- [ ] Add React error boundary to `App.tsx`
- [ ] Add `.env.example` with documented variables

**Acceptance Criteria:**
- No React warnings in console
- Bundle size reduced by ~100KB (chart library removal)
- App doesn't crash on component errors

### Phase 0 Exit Criteria

- [ ] All P0 security issues resolved
- [ ] TypeScript strict mode enabled, zero errors
- [ ] `make check` and `make test` pass
- [ ] Documentation updated (README, .env.example)

**Estimated Effort:** 40-60 hours (1-2 weeks)

---

## Phase 1: MVP Backend + Authentication (Weeks 3-6)

**Goal:** Real authentication + basic API to support current UI
**Team:** 2 engineers (1 backend, 1 frontend)
**User-Facing Value:** Secure login, real data persistence

### Architecture Decisions

**Decision Point 1: Frontend Framework**
- **Option A:** Migrate to Next.js App Router (per CLAUDE.md spec)
- **Option B:** Keep Vite + React, update CLAUDE.md
- **Recommendation:** Option B for Phase 1 (defer Next.js to Phase 3)
- **Rationale:** Minimize scope, get backend running faster

**Decision Point 2: Monorepo Strategy**
- **Option A:** Full monorepo now (Turborepo/Nx)
- **Option B:** Keep separate repos, migrate in Phase 3
- **Recommendation:** Option B (separate repos)
- **Rationale:** Reduce Phase 1 complexity

### Deliverables

#### 1. NestJS Backend API (`services/api/`)
- [ ] Initialize NestJS project with TypeScript strict mode
- [ ] Project structure:
  ```
  services/api/
  ├── src/
  │   ├── auth/          # Authentication module
  │   ├── audiences/     # Audiences CRUD
  │   ├── users/         # User management
  │   ├── common/        # Shared utilities
  │   └── main.ts        # App entry
  ├── test/              # E2E tests
  ├── Dockerfile
  └── package.json
  ```
- [ ] Shared types package (or duplicate types temporarily)
- [ ] API documentation (Swagger/OpenAPI)

**Endpoints (Phase 1 Minimum):**
```
POST   /api/auth/login         # OIDC flow initiation
GET    /api/auth/callback      # OIDC callback
POST   /api/auth/logout        # Session termination
GET    /api/auth/me            # Current user info
GET    /api/audiences          # List audiences
POST   /api/audiences          # Create audience (stub)
GET    /api/audiences/:id      # Get audience details
DELETE /api/audiences/:id      # Delete audience
```

**Acceptance Criteria:**
- All endpoints documented in Swagger UI
- Request/response DTOs with TypeScript types
- Error handling returns consistent error format
- Integration tests for each endpoint

#### 2. Authentication Implementation
- [ ] Choose OIDC provider:
  - **Recommended:** Google Identity Platform (GCP native)
  - **Alternative:** Auth0, Okta
- [ ] Implement Authorization Code Flow with PKCE
- [ ] Backend session management:
  - HttpOnly cookies
  - Secure flag (HTTPS only)
  - SameSite=Strict (CSRF protection)
  - 1-hour expiration, refresh token rotation
- [ ] Frontend auth flow integration
- [ ] Role-based access control (RBAC):
  - Roles: `user`, `admin`, `superadmin`
  - Route guards based on roles
  - Backend middleware for authorization

**Acceptance Criteria:**
- Users can log in with Google/OIDC provider
- Sessions expire after 1 hour
- Logout clears session
- Admin routes blocked for non-admin users
- No credentials in localStorage

#### 3. Database Setup
- [ ] Choose database:
  - **Option A:** PostgreSQL (Cloud SQL) - for transactional data
  - **Option B:** Firestore - for flexibility
  - **Recommendation:** PostgreSQL (better for analytics queries later)
- [ ] Schema design:
  - `users` table (id, email, name, role, created_at)
  - `audiences` table (id, name, description, created_by, created_at, status)
  - `sessions` table (id, user_id, token_hash, expires_at)
- [ ] Database migrations (TypeORM or Prisma)
- [ ] Connection pooling configuration

**Acceptance Criteria:**
- Database deployed on Cloud SQL
- Migrations run successfully
- Connection pooling configured (max 10 connections)
- Backup strategy defined (daily automated backups)

#### 4. Deployment Infrastructure
- [ ] Backend deployed to Cloud Run
  - Dockerfile with multi-stage build
  - Environment variables via Secret Manager
  - Cloud SQL connection via Unix socket
  - Auto-scaling: 0-10 instances
- [ ] Frontend deployed to Cloud Storage + CDN (or Cloud Run)
- [ ] Custom domain with HTTPS (Cloud Load Balancer)
- [ ] CORS configuration

**Acceptance Criteria:**
- Backend accessible at `https://api.randomtruffle.com`
- Frontend accessible at `https://app.randomtruffle.com`
- HTTPS enforced
- CORS allows only frontend domain

#### 5. Frontend Updates
- [ ] Replace mock auth with real OIDC flow
- [ ] Update `services/api.ts`:
  - Add authentication headers
  - Add error handling (retry logic, user-friendly errors)
  - Add TypeScript types for all responses
- [ ] Replace mock data with API calls in:
  - `pages/Analytics.tsx`
  - `pages/Audiences.tsx`
- [ ] Add loading states (Suspense boundaries)
- [ ] Add error states (error boundaries with retry)

**Acceptance Criteria:**
- No mock data in production build
- All API calls have loading/error states
- Frontend handles 401 (redirects to login) and 500 errors gracefully

### Phase 1 Exit Criteria

- [ ] Real authentication working (OIDC)
- [ ] Backend API deployed to Cloud Run
- [ ] Database storing user and audience data
- [ ] Frontend consuming real API
- [ ] `make check` and `make test` pass (backend + frontend)
- [ ] Security scan passes (OWASP ZAP or similar)

**Estimated Effort:** 200-300 hours (4-6 weeks with 2 engineers)

---

## Phase 2: Data Plane Foundation (Weeks 7-12)

**Goal:** BigQuery integration, basic analytics, first MCP connector
**Team:** 2-3 engineers (1 backend, 1 data, 1 frontend)
**User-Facing Value:** Real analytics data, GA4 insights

### Architecture Decisions

**Decision Point 3: Data Warehouse Strategy**
- **Option A:** BigQuery only (per CLAUDE.md)
- **Option B:** PostgreSQL for app data, BigQuery for analytics
- **Recommendation:** Option B
- **Rationale:** Separate transactional data (PostgreSQL) from analytical data (BigQuery)

### Deliverables

#### 1. BigQuery Setup (`data/bq/`)
- [ ] Create BigQuery dataset: `random_truffle_analytics`
- [ ] Create schemas:
  ```
  data/bq/
  ├── schemas/
  │   ├── sessions.sql          # GA4 session data
  │   ├── events.sql            # GA4 event data
  │   ├── conversions.sql       # Conversion events
  │   └── user_attributes.sql   # User attributes
  ├── views/
  │   ├── cortex_ga4_sessions.sql    # Cortex GA4 view
  │   ├── daily_kpis.sql             # Daily KPI aggregations
  │   └── audience_metrics.sql       # Audience performance
  └── queries/
      ├── get_audience_size.sql      # Audience size estimation
      └── get_session_trends.sql     # Session trend analysis
  ```
- [ ] Implement data ingestion:
  - **Option A:** BigQuery Data Transfer Service (GA4 → BigQuery)
  - **Option B:** Cloud Functions for custom ingestion
  - **Recommendation:** Option A (native GA4 integration)

**Acceptance Criteria:**
- BigQuery dataset created with proper IAM roles
- Tables created with partitioning (by date)
- Sample data loaded (test or historical data)
- Queries run successfully and return results

#### 2. First MCP Connector: BigQuery
- [ ] Create MCP connector for BigQuery
  - Use Model Context Protocol specification
  - Authentication via service account (least privilege)
  - Query execution with timeout/cost limits
  - Result caching (Redis or Memorystore)
- [ ] Backend integration:
  - `POST /api/mcp/bigquery/query` - Execute query
  - `GET /api/mcp/bigquery/tables` - List tables
  - `GET /api/mcp/bigquery/schema/:table` - Get schema
- [ ] Security controls:
  - Query validation (prevent DELETE/DROP)
  - Cost estimation before execution
  - Rate limiting (max 100 queries/hour per user)

**Acceptance Criteria:**
- MCP connector can execute SELECT queries
- Queries are validated and reject destructive operations
- Results cached for 5 minutes
- Queries timeout after 30 seconds

#### 3. Analytics Backend (`services/api/src/analytics/`)
- [ ] Analytics module in NestJS:
  - `GET /api/analytics/kpis` - Get KPI summary
  - `GET /api/analytics/sessions` - Session trends
  - `GET /api/analytics/audiences/:id/metrics` - Audience metrics
- [ ] Query BigQuery via MCP connector
- [ ] Transform BigQuery results to frontend DTOs
- [ ] Cache results (5-minute TTL for dashboards)

**Acceptance Criteria:**
- Analytics endpoints return real data from BigQuery
- Response time < 2 seconds (with cache)
- Data format matches existing mock data structure

#### 4. Frontend Analytics Integration
- [ ] Update `pages/Analytics.tsx`:
  - Fetch data from `/api/analytics/kpis`
  - Display in existing Recharts components
  - Add date range selector (last 7/30/90 days)
  - Add refresh button
- [ ] Add data source indicator ("Last updated: X minutes ago")
- [ ] Handle empty states ("No data for selected period")

**Acceptance Criteria:**
- Analytics page displays real data
- Date range selector works
- Loading states show during fetch
- Empty states handled gracefully

#### 5. Consent Registry (Basic)
- [ ] Create `consents` table in PostgreSQL:
  - `id`, `user_id_hash` (SHA-256), `consent_type`, `granted_at`, `withdrawn_at`
- [ ] Backend endpoints:
  - `POST /api/consents` - Record consent
  - `DELETE /api/consents/:id` - Withdraw consent
  - `GET /api/consents/check` - Check consent status
- [ ] Identifier hashing:
  - Use SHA-256 with application salt (from Secret Manager)
  - Never store raw emails/phone numbers
- [ ] Frontend UI stub:
  - Update `components/audience/Step6_Consent.tsx`
  - Basic consent recording (detailed UI in Phase 4)

**Acceptance Criteria:**
- Consent data stored with hashed identifiers
- Consent can be granted and withdrawn
- Audit trail preserved (withdrawn_at timestamp, not deleted)

### Phase 2 Exit Criteria

- [ ] BigQuery dataset created with schemas
- [ ] BigQuery MCP connector working
- [ ] Analytics page displays real data
- [ ] Consent registry operational (basic)
- [ ] Data pipeline tested (GA4 → BigQuery → API → Frontend)
- [ ] Performance acceptable (< 2s for cached queries)

**Estimated Effort:** 300-400 hours (6-8 weeks with 2-3 engineers)

---

## Phase 3: Agent Services + Orchestration (Weeks 13-18)

**Goal:** Conversational AI for audience building and data science
**Team:** 3 engineers (1 backend, 1 AI/ML, 1 frontend)
**User-Facing Value:** AI-assisted audience creation, SQL generation

### Architecture Clarification: Agents vs. Services

See **Architecture Addendum** section below for full distinction. Summary:

| Aspect | Services | Agents |
|--------|----------|--------|
| **Purpose** | API endpoints, CRUD operations | AI-driven workflows |
| **Intelligence** | Rule-based, deterministic | LLM-powered, generative |
| **Examples** | `services/api/` | `agents/data-science/`, `agents/audience-builder/` |
| **Invocation** | Direct HTTP calls | Via orchestrator queue |

### Deliverables

#### 1. Orchestrator Service (`services/orchestrator/`)
- [ ] Cloud Run service for agent coordination
- [ ] Architecture:
  ```
  services/orchestrator/
  ├── src/
  │   ├── agents/
  │   │   ├── registry.ts        # Agent registry
  │   │   ├── executor.ts        # Agent execution
  │   │   └── queue.ts           # Job queue (Cloud Tasks)
  │   ├── workflows/
  │   │   ├── audience-creation.ts
  │   │   └── data-analysis.ts
  │   └── main.ts
  └── Dockerfile
  ```
- [ ] Job queue (Cloud Tasks or Pub/Sub)
- [ ] Agent lifecycle management (start, monitor, retry, timeout)
- [ ] Result storage (Cloud Storage for artifacts)

**Acceptance Criteria:**
- Orchestrator can queue and execute agent jobs
- Jobs retry on failure (max 3 attempts)
- Job status tracked (pending, running, completed, failed)
- Artifacts stored in Cloud Storage

#### 2. Data Science Agent (`agents/data-science/`)
- [ ] Agent capabilities:
  - SQL query generation from natural language
  - Query validation and optimization
  - Query explanation ("This query finds users who...")
  - Result interpretation
- [ ] Implementation:
  - LLM: Gemini 1.5 Pro (or equivalent)
  - Prompt engineering for SQL generation
  - Schema injection (BigQuery schema as context)
  - Safety rails (no DELETE/DROP, cost estimation)
- [ ] Backend integration:
  - `POST /api/agents/data-science/query` - Generate SQL
  - `POST /api/agents/data-science/explain` - Explain query
- [ ] Invocation flow:
  ```
  User → Frontend → API → Orchestrator → Data Science Agent
                                              ↓
                                        BigQuery (via MCP)
                                              ↓
  User ← Frontend ← API ← Orchestrator ← Results
  ```

**Acceptance Criteria:**
- Agent generates valid SQL from natural language
- Queries execute successfully against BigQuery
- Agent refuses dangerous operations
- Responses include explanations

#### 3. Audience Builder Agent (`agents/audience-builder/`)
- [ ] Agent capabilities:
  - Audience strategy recommendations
  - Segment definition assistance
  - Activation channel suggestions
  - Budget/pacing recommendations
- [ ] Implementation:
  - LLM: Gemini 1.5 Pro
  - Context: User goals, historical audience data
  - Multi-turn conversation support
- [ ] Backend integration:
  - `POST /api/agents/audience-builder/chat` - Chat with agent
  - `POST /api/agents/audience-builder/strategy` - Generate strategy
- [ ] Conversation state management (session-based)

**Acceptance Criteria:**
- Agent provides audience strategy recommendations
- Multi-turn conversations work (maintains context)
- Recommendations based on user goals and data

#### 4. Frontend Agent Integration
- [ ] Update `components/ChatInterface.tsx`:
  - Connect to agent endpoints
  - Display streaming responses (SSE or WebSocket)
  - Handle multi-turn conversations
  - Show "Agent is thinking..." state
- [ ] Integrate into audience creation:
  - Step 1: Chat with audience-builder agent
  - Step 2: Agent suggests strategy
  - Steps 3-10: User refines with agent assistance
- [ ] Add data exploration:
  - New page: `/data-explorer`
  - Chat with data-science agent
  - Execute generated queries
  - Display results in tables/charts

**Acceptance Criteria:**
- Users can chat with agents in UI
- Responses stream in real-time
- Conversations maintain context across turns
- Generated queries can be executed from UI

#### 5. Artifact Storage & Versioning
- [ ] Store agent-generated artifacts:
  - SQL queries → `artifacts/queries/`
  - Audience strategies → `artifacts/strategies/`
  - Analysis reports → `artifacts/reports/`
- [ ] Versioning and history:
  - Track all agent interactions in database
  - Users can view past conversations
  - Reuse previous queries/strategies
- [ ] Cloud Storage bucket: `random-truffle-artifacts`

**Acceptance Criteria:**
- All agent outputs saved
- Users can access history
- Artifacts versioned and retrievable

### Phase 3 Exit Criteria

- [ ] Orchestrator service deployed
- [ ] Data science agent operational
- [ ] Audience builder agent operational
- [ ] Frontend integrated with agents
- [ ] Artifact storage working
- [ ] End-to-end agent flow tested
- [ ] Performance acceptable (< 5s for agent responses)

**Estimated Effort:** 350-450 hours (6-9 weeks with 3 engineers)

---

## Phase 4: Multi-Channel Activation (Weeks 19-24)

**Goal:** Activate audiences to Google Ads, Meta, TikTok
**Team:** 2-3 engineers (1 backend, 1 integrations, 1 frontend)
**User-Facing Value:** Push audiences to ad platforms

### Deliverables

#### 1. Additional MCP Connectors
- [ ] **GA4 MCP Connector**
  - Read GA4 data (sessions, events, conversions)
  - Query GA4 reporting API
  - Authentication via service account
- [ ] **Google Ads MCP Connector**
  - Create/update customer match lists
  - Upload hashed identifiers
  - Query campaign performance
  - Multi-account support (MCC)
- [ ] **Meta MCP Connector** (Phase 4 stretch goal)
  - Create custom audiences
  - Upload hashed identifiers
  - Multi-account support (Business Manager)

**Acceptance Criteria:**
- Each connector authenticated and operational
- Multi-account support working
- Rate limits respected (API quotas)

#### 2. Activation Backend (`services/api/src/activation/`)
- [ ] Activation module:
  - `POST /api/activation/audiences/:id/push` - Push to platform
  - `GET /api/activation/jobs/:id` - Get job status
  - `GET /api/activation/history` - Activation history
- [ ] Audience export:
  - Query BigQuery for audience members
  - Hash identifiers (SHA-256)
  - Format for each platform (Google Ads, Meta)
  - Upload via platform API
- [ ] HITL (Human-in-the-Loop) workflow:
  - Push requests require approval
  - Approval UI for admins
  - Notification on approval/rejection
  - Audit log of all activations

**Acceptance Criteria:**
- Audiences can be pushed to Google Ads
- Identifiers properly hashed before upload
- Admins receive approval requests
- Audit trail complete

#### 3. HITL Governance UI
- [ ] Implement `pages/admin/AdminGovernance.tsx`:
  - List pending approvals
  - Approve/reject activation requests
  - View activation details (platform, size, audience)
  - Audit log viewer
- [ ] Notification system:
  - Email notifications for pending approvals
  - In-app notifications (badge on sidebar)
  - Slack webhook integration (optional)

**Acceptance Criteria:**
- Admins can approve/reject activations
- Email notifications sent for new requests
- Audit log shows all approvals/rejections

#### 4. Activation UI
- [ ] Update `pages/Activation.tsx`:
  - List activated audiences
  - Show sync status (pending, syncing, synced, failed)
  - Retry failed syncs
  - View activation history
- [ ] Add activation wizard:
  - Select audience
  - Select platform(s)
  - Configure platform settings (campaign, budget)
  - Submit for approval (if HITL enabled)
- [ ] Real-time status updates (polling or WebSocket)

**Acceptance Criteria:**
- Users can submit activation requests
- Status updates in real-time
- Failed activations show error details
- History shows all past activations

#### 5. Multi-Account Management
- [ ] Account connection UI:
  - OAuth flow for Google Ads, Meta
  - List connected accounts
  - Disconnect accounts
- [ ] Account selection in activation wizard
- [ ] Account-level permissions (RBAC)

**Acceptance Criteria:**
- Users can connect multiple ad accounts
- Account selection works in activation flow
- Disconnecting accounts revokes access

### Phase 4 Exit Criteria

- [ ] GA4 and Google Ads MCP connectors working
- [ ] Activation backend operational
- [ ] HITL governance UI complete
- [ ] Audiences can be pushed to Google Ads
- [ ] Multi-account management working
- [ ] End-to-end activation tested

**Estimated Effort:** 300-400 hours (6-8 weeks with 2-3 engineers)

---

## Phase 5: Enterprise Features & Monorepo (Weeks 25-36)

**Goal:** Production-ready, scalable, fully compliant
**Team:** 3-4 engineers (full stack)
**User-Facing Value:** Enterprise features, performance, compliance

### Deliverables

#### 1. Monorepo Migration
- [ ] Choose tool: **Turborepo** or **Nx**
  - Recommendation: Turborepo (simpler, faster builds)
- [ ] Restructure repository:
  ```
  random-truffle/
  ├── apps/
  │   └── web/              # Frontend (Next.js or current Vite)
  ├── services/
  │   ├── api/              # NestJS API
  │   └── orchestrator/     # Agent orchestrator
  ├── agents/
  │   ├── data-science/
  │   └── audience-builder/
  ├── packages/
  │   ├── core/             # Shared utilities
  │   ├── auth/             # Auth utilities
  │   ├── ui/               # UI component library
  │   ├── cortex-model/     # BigQuery Cortex models
  │   ├── telemetry/        # Logging & monitoring
  │   └── types/            # Shared TypeScript types
  ├── infra/
  │   ├── terraform/        # GCP infrastructure
  │   ├── docker/           # Dockerfiles
  │   └── policies/         # IAM policies
  ├── data/
  │   └── bq/               # BigQuery schemas
  ├── turbo.json            # Turborepo config
  └── package.json          # Root package
  ```
- [ ] Migrate existing code to monorepo structure
- [ ] Configure Turborepo pipelines (build, test, lint)
- [ ] Update CI/CD for monorepo

**Acceptance Criteria:**
- All code in monorepo structure
- `turbo run build` builds all packages
- Shared packages used across apps
- CI/CD builds only changed packages

#### 2. Infrastructure as Code (Terraform)
- [ ] Create `infra/terraform/`:
  - `main.tf` - GCP project setup
  - `bigquery.tf` - BigQuery datasets and tables
  - `cloud-run.tf` - Cloud Run services
  - `cloud-sql.tf` - Cloud SQL instances
  - `secrets.tf` - Secret Manager secrets
  - `iam.tf` - IAM roles and bindings
  - `networking.tf` - VPC, load balancers
- [ ] Terraform state:
  - Remote state in Cloud Storage bucket
  - State locking via Cloud Storage
- [ ] Environment separation (dev, staging, prod)
- [ ] HITL approval for `terraform apply` in production

**Acceptance Criteria:**
- Infrastructure provisioned via Terraform
- Dev and prod environments separated
- `terraform plan` shows no drift
- Production applies require approval

#### 3. Shared Packages
- [ ] **packages/core/** - Utilities
  - Date/time helpers
  - Validation functions
  - Constants
- [ ] **packages/auth/** - Authentication
  - OIDC helpers
  - JWT validation
  - Session management
- [ ] **packages/ui/** - Component library
  - Reusable React components
  - Storybook documentation
- [ ] **packages/types/** - Shared types
  - API DTOs
  - Database models
  - BigQuery schemas
- [ ] **packages/telemetry/** - Observability
  - Logging (Winston or Pino)
  - Tracing (OpenTelemetry)
  - Metrics (Prometheus)

**Acceptance Criteria:**
- All shared code in packages
- Packages published to internal registry (Artifact Registry)
- Apps consume packages via npm
- Storybook deployed for UI library

#### 4. Observability & Monitoring
- [ ] Logging:
  - Structured logging (JSON format)
  - Cloud Logging integration
  - Log levels: DEBUG, INFO, WARN, ERROR
  - Request/response logging with correlation IDs
- [ ] Tracing:
  - OpenTelemetry integration
  - Cloud Trace integration
  - Trace agent calls, database queries, external APIs
- [ ] Metrics:
  - API latency (p50, p95, p99)
  - Error rates
  - Agent invocation counts
  - BigQuery query costs
  - Active users
- [ ] Alerting:
  - Cloud Monitoring alerts
  - Slack/PagerDuty integration
  - Alerts: Error rate > 1%, Latency p95 > 2s, Cost spike
- [ ] Dashboards:
  - Implement `pages/admin/AdminSlos.tsx`
  - SLO tracking (99.9% uptime, < 2s latency)
  - Real-time metrics

**Acceptance Criteria:**
- All services emit structured logs
- Traces visible in Cloud Trace
- Metrics dashboard operational
- Alerts trigger correctly

#### 5. Advanced Security
- [ ] **VPC Service Controls**:
  - Isolate BigQuery, Cloud SQL, Secret Manager
  - Prevent data exfiltration
- [ ] **IAM Policies**:
  - Least privilege for all service accounts
  - Separation of duties (dev vs. prod)
  - Policy stored in `infra/policies/`
- [ ] **Secret Rotation**:
  - 90-day rotation for API keys
  - Automated rotation via Secret Manager
- [ ] **Compliance**:
  - SOC 2 Type II preparation (if needed)
  - GDPR/CCPA compliance audit
  - Data retention policies (90 days for logs)
- [ ] **Penetration Testing**:
  - Third-party security audit
  - Vulnerability scanning (Snyk, OWASP ZAP)

**Acceptance Criteria:**
- VPC-SC enabled for all sensitive resources
- IAM audit passes (no overly permissive roles)
- Secrets rotate automatically
- Security audit completed with no P0 findings

#### 6. Performance Optimization
- [ ] **Frontend**:
  - Code splitting (React.lazy for routes)
  - Image optimization (next/image or similar)
  - Bundle analysis and tree-shaking
  - CDN caching (1 hour for static assets)
  - Lighthouse score > 90
- [ ] **Backend**:
  - Database query optimization (indexes)
  - Response caching (Redis/Memorystore)
  - API rate limiting (100 req/min per user)
  - Background job processing (Cloud Tasks)
- [ ] **BigQuery**:
  - Partitioning and clustering
  - Materialized views for common queries
  - Query cost monitoring and alerts

**Acceptance Criteria:**
- Frontend Lighthouse score > 90
- API p95 latency < 500ms
- BigQuery query costs < $100/day
- All pages load in < 2 seconds

#### 7. Testing & Quality
- [ ] **Unit Tests**:
  - 80% code coverage target
  - All critical paths tested
- [ ] **Integration Tests**:
  - API endpoint tests (Supertest)
  - Database integration tests
  - MCP connector tests
- [ ] **E2E Tests** (Playwright):
  - User login flow
  - Audience creation flow
  - Activation flow
  - Data explorer flow
- [ ] **Load Testing**:
  - 100 concurrent users
  - 1000 req/sec sustained
- [ ] **CI/CD Quality Gates**:
  - `make check` - Lint + type check
  - `make test` - Unit + integration tests
  - `make e2e` - Playwright tests
  - Coverage report (fail if < 80%)

**Acceptance Criteria:**
- 80% code coverage across all packages
- E2E tests pass for all critical flows
- Load test passes (100 concurrent users)
- CI/CD blocks merges if quality gates fail

### Phase 5 Exit Criteria

- [ ] Monorepo structure complete
- [ ] Infrastructure as Code (Terraform) complete
- [ ] Observability stack operational
- [ ] Security hardening complete
- [ ] Performance optimization complete
- [ ] Testing suite comprehensive (80% coverage)
- [ ] Production-ready for enterprise customers

**Estimated Effort:** 500-600 hours (10-12 weeks with 3-4 engineers)

---

## Architecture Addendum: Agents vs. Services

### Definition

**Services** are traditional backend API applications that provide CRUD operations, business logic, and integrations. They respond synchronously to HTTP requests.

**Agents** are AI-powered workers that perform complex, generative tasks using large language models. They are invoked asynchronously via an orchestrator and produce artifacts.

### Comparison

| Aspect | Services (e.g., `services/api/`) | Agents (e.g., `agents/data-science/`) |
|--------|----------------------------------|---------------------------------------|
| **Primary Role** | API endpoints, data persistence | AI-driven task execution |
| **Intelligence** | Rule-based, deterministic | LLM-powered, generative |
| **Invocation** | Synchronous HTTP | Async via orchestrator/queue |
| **Response Time** | < 1 second | Seconds to minutes |
| **Input** | Structured (JSON) | Natural language or structured |
| **Output** | Structured (JSON) | Natural language, code, or artifacts |
| **State** | Stateless (or DB-backed) | Stateful (conversation history) |
| **Examples** | User CRUD, Audience CRUD, Auth | SQL generation, Audience strategy |
| **Scaling** | Horizontal (more instances) | Vertical (larger LLM context) |
| **Cost Model** | Per request (compute) | Per token (LLM usage) |
| **Error Handling** | Return error codes | Retry with refined prompts |

### When to Use Each

**Use a Service when:**
- CRUD operations (create, read, update, delete)
- Deterministic business logic (rules, validations)
- Real-time responses required (< 1 second)
- Traditional API integration (REST, GraphQL)

**Use an Agent when:**
- Natural language understanding required
- Creative/generative output (SQL, strategies, reports)
- Multi-step reasoning needed
- Unpredictable input (user questions, exploratory queries)

### Architecture Pattern

```
User Request
    ↓
Frontend (apps/web/)
    ↓
API Service (services/api/)  ← Synchronous HTTP
    ↓
Orchestrator (services/orchestrator/)  ← Queue job
    ↓
Agent (agents/data-science/)  ← Execute LLM workflow
    ↓
Result (Cloud Storage artifact)
    ↓
Orchestrator → API → Frontend  ← Async callback
```

### Example: Audience Creation Flow

1. **User clicks "Create Audience"**
   - Frontend → `services/api/` → Creates empty audience record (Service)

2. **User chats "Show me high-value customers in California"**
   - Frontend → `services/api/` → `services/orchestrator/` → `agents/audience-builder/` (Agent)
   - Agent generates audience strategy, suggests segments

3. **User refines "Only customers who purchased in last 30 days"**
   - Frontend → Agent (via orchestrator)
   - Agent refines strategy, invokes `agents/data-science/` to generate SQL

4. **User approves SQL**
   - Frontend → `services/api/` → Executes SQL via BigQuery MCP (Service)
   - Results saved to audience record

5. **User clicks "Activate to Google Ads"**
   - Frontend → `services/api/` → Activation logic (Service)
   - HITL approval triggered (Service)

**Summary:** Agents provide the intelligence (strategy, SQL generation), Services provide the infrastructure (persistence, execution, activation).

---

## Risk Register

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Scope Creep** | High | High | Strict phase gates, change control board |
| **LLM Cost Overruns** | Medium | Medium | Token budgets, caching, usage alerts |
| **BigQuery Cost Overruns** | Medium | High | Query cost estimation, daily budget caps |
| **Vendor Lock-in (GCP)** | Low | Medium | Abstract MCP connectors, multi-cloud consideration in Phase 6+ |
| **GDPR/CCPA Non-Compliance** | Low | High | Legal review in Phase 2, consent registry in Phase 2 |
| **Security Breach** | Low | High | Regular audits, penetration testing in Phase 5 |
| **Agent Hallucinations** | High | Medium | Human-in-the-loop for critical operations, validation layers |
| **Team Turnover** | Medium | High | Documentation, knowledge transfer, pair programming |
| **Technical Debt** | High | Medium | Strict code review, refactoring sprints, 20% time for debt |

---

## Success Metrics

| Phase | Metric | Target |
|-------|--------|--------|
| **Phase 0** | TypeScript errors | 0 |
| | Security scan findings (P0/P1) | 0 |
| **Phase 1** | API uptime | 99% |
| | Authentication success rate | > 99.5% |
| **Phase 2** | BigQuery query success rate | > 95% |
| | Analytics page load time | < 2s |
| **Phase 3** | Agent response time (p95) | < 5s |
| | Agent SQL accuracy | > 90% |
| **Phase 4** | Activation success rate | > 98% |
| | HITL approval time | < 2 hours |
| **Phase 5** | Test coverage | > 80% |
| | Lighthouse score | > 90 |
| | Production uptime | 99.9% |

---

## Budget Estimate

| Phase | Duration | Engineers | Cost (Labor @ $150K/yr) | GCP Infra | Total |
|-------|----------|-----------|-------------------------|-----------|-------|
| **Phase 0** | 2 weeks | 2 | $12K | $0 | **$12K** |
| **Phase 1** | 4 weeks | 2 | $24K | $2K | **$26K** |
| **Phase 2** | 6 weeks | 3 | $54K | $5K | **$59K** |
| **Phase 3** | 6 weeks | 3 | $54K | $8K (LLM costs) | **$62K** |
| **Phase 4** | 6 weeks | 3 | $54K | $3K | **$57K** |
| **Phase 5** | 10 weeks | 4 | $120K | $10K | **$130K** |
| **TOTAL** | **34 weeks** | **~3 avg** | **$318K** | **$28K** | **$346K** |

**Notes:**
- Labor costs assume $150K fully-loaded salary ($75/hour)
- GCP infrastructure costs are estimates (will vary by usage)
- LLM costs in Phase 3 assume 10M tokens/month @ $0.80/M tokens
- BigQuery costs depend on query volume (estimate: $100-500/month)

---

## Next Steps

1. **Review & Approve This Plan**
   - Product owner approval
   - Engineering lead approval
   - Budget approval

2. **Kick Off Phase 0 (Immediately)**
   - Assign 1-2 engineers
   - Set up project tracking (Jira, Linear, GitHub Projects)
   - Schedule daily standups

3. **Clarify Open Questions**
   - See `thoughts/shared/research/2025-10-25_codebase.md` Section 8 for 25 open questions
   - Schedule architecture review meeting

4. **Update CLAUDE.md**
   - Add this implementation roadmap
   - Add agent vs. service distinction
   - Add decision records

5. **Communication Plan**
   - Weekly progress updates to stakeholders
   - Monthly demos (end of each phase)
   - Quarterly roadmap reviews

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-25 | Claude Code Agent | Initial draft |

---

**Appendix A: Phase Dependencies**

```
Phase 0 (Foundation)
    ↓
Phase 1 (Backend + Auth)  ← Blocks all other phases
    ↓
Phase 2 (Data Plane)  ← Required for Phase 3, 4
    ↓
Phase 3 (Agents)  ← Can run parallel with Phase 4
    ↓
Phase 4 (Activation)  ← Can run parallel with Phase 3
    ↓
Phase 5 (Enterprise)  ← Requires all previous phases
```

**Appendix B: Tech Stack Summary**

| Component | Technology | Justification |
|-----------|------------|---------------|
| **Frontend** | Vite + React (Phase 1-4), Next.js (Phase 5 optional) | Fast dev, existing code |
| **Backend API** | NestJS + TypeScript | Scalable, typed, enterprise-ready |
| **Database** | PostgreSQL (Cloud SQL) | Relational data, ACID compliance |
| **Data Warehouse** | BigQuery | Analytics at scale, GCP native |
| **Agent LLM** | Gemini 1.5 Pro | Cost-effective, large context |
| **Orchestrator** | Cloud Run + Cloud Tasks | Serverless, auto-scaling |
| **Auth** | Google Identity Platform (OIDC) | GCP native, enterprise SSO |
| **Secrets** | Secret Manager | Secure, auditable |
| **Infrastructure** | Terraform | Declarative, version-controlled |
| **Monorepo** | Turborepo | Fast builds, simple config |
| **Observability** | Cloud Logging + Trace | GCP native, cost-effective |

---

## Plan Status

**Current Phase:** Pre-Phase 0 (Planning)
**Next Milestone:** Phase 0 Kickoff
**Blocker:** Awaiting plan approval

**Review this plan, ask questions, and let's ship! 🚀**
