# Implementation Roadmap Updates v1.1

**Date:** 2025-10-26
**Status:** Approved
**Previous Version:** 1.0 (2025-10-25)
**Changes:** Based on Architecture Decision Records (ADRs)

---

## Summary of Changes

This document outlines updates to the implementation roadmap based on 25 architectural decisions captured in `architecture-decisions.md`.

### Major Changes

1. **Next.js Migration:** Added to Phase 0 (was deferred)
2. **Monorepo Setup:** Moved to Phase 1 (was Phase 5)
3. **Authentication:** Changed to Okta (was Google Identity Platform)
4. **Agent Architecture:** Vertex AI Conversational Agents with synchronous API (was custom LLM + orchestrator queue)
5. **Test Coverage:** Increased to 95% (was 80%)
6. **Timeline:** Reduced by ~4 weeks due to simplified agent architecture

### Budget Impact

- **Original:** ~$346K (labor + infrastructure)
- **Updated:** ~$320K (labor + infrastructure)
- **Savings:** ~$26K due to:
  - No orchestrator service (~$80 hours saved)
  - Simpler agent architecture
  - Offset by monorepo setup in Phase 1 (+$20 hours)

---

## Phase 0: Foundation & Stabilization (Updated)

**Original Timeline:** Weeks 1-2
**Updated Timeline:** Weeks 1-3 (extended by 1 week for Next.js migration)

### New Deliverables

#### 5. Next.js Migration (NEW)
**ADR:** ADR-001

- [ ] Create Next.js 14+ App Router project
- [ ] Migrate existing pages to `app/` directory
  - Convert React Router routes to Next.js file-based routing
  - Update imports and path handling
- [ ] Migrate components (no changes needed, just imports)
- [ ] Update build process:
  - Remove Vite config
  - Add Next.js config for static export
  - Configure for Cloud Storage + CDN deployment
- [ ] Update package.json scripts:
  ```json
  {
    "dev": "next dev",
    "build": "next build",
    "export": "next export",
    "start": "next start"
  }
  ```

**Acceptance Criteria:**
- All existing pages work in Next.js
- `next build && next export` produces static site
- No broken links or 404s
- Lighthouse score maintained or improved

**Estimated Effort:** +40 hours

### Updated Exit Criteria

- [ ] All P0 security issues resolved
- [ ] TypeScript strict mode enabled, zero errors
- [ ] **Next.js migration complete** (NEW)
- [ ] `make check` and `make test` pass
- [ ] Documentation updated (README, .env.example)

**Updated Estimated Effort:** 80-100 hours (2-3 weeks)

---

## Phase 1: MVP Backend + Authentication (Updated)

**Original Timeline:** Weeks 3-6
**Updated Timeline:** Weeks 4-8 (adjusted for Phase 0 extension)

### Architecture Decisions - REVISED

**Decision Point 1: Frontend Framework** ✅ RESOLVED
- ~~**Option A:** Migrate to Next.js App Router (per CLAUDE.md spec)~~
- ~~**Option B:** Keep Vite + React, update CLAUDE.md~~
- **DECISION:** Next.js migration completed in Phase 0
- **Rationale:** ADR-001

**Decision Point 2: Monorepo Strategy** ✅ CHANGED
- ~~**Option A:** Full monorepo now (Turborepo/Nx)~~
- ~~**Option B:** Keep separate repos, migrate in Phase 3~~
- ~~**Recommendation:** Option B (separate repos)~~
- **NEW DECISION:** Implement Turborepo monorepo in Phase 1 (ADR-002)
- **Rationale:** Avoid massive refactoring later, shared code from day one

### New Deliverables

#### 0. Turborepo Monorepo Setup (NEW - FIRST PRIORITY)
**ADR:** ADR-002

- [ ] Initialize Turborepo project
- [ ] Create monorepo structure:
  ```
  random-truffle/
  ├── apps/
  │   └── web/              # Next.js frontend (migrated from Phase 0)
  ├── services/
  │   └── api/              # NestJS backend (will create in this phase)
  ├── packages/
  │   ├── types/            # Shared TypeScript types
  │   ├── ui/               # Shared UI components
  │   └── core/             # Shared utilities
  ├── turbo.json            # Turborepo config
  ├── package.json          # Root package
  └── pnpm-workspace.yaml   # Workspace config (using pnpm)
  ```
- [ ] Configure Turborepo pipelines:
  - `turbo run build` - Build all apps/packages
  - `turbo run test` - Run all tests
  - `turbo run lint` - Lint all code
- [ ] Update CI/CD for monorepo (GitHub Actions)

**Acceptance Criteria:**
- Monorepo builds successfully
- Frontend and backend can share types
- CI/CD builds only changed packages
- `turbo run build` completes in < 5 minutes

**Estimated Effort:** +20 hours

#### 2. Authentication Implementation - UPDATED
**ADR:** ADR-011

- [ ] ~~Choose OIDC provider~~
  - ~~**Recommended:** Google Identity Platform (GCP native)~~
  - ~~**Alternative:** Auth0, Okta~~
- **DECISION:** Use Okta for OIDC (ADR-011)
- [ ] Set up Okta application
  - Create Okta developer account
  - Configure application (Web App, OIDC)
  - Set up groups for RBAC (User, Admin, SuperAdmin)
- [ ] Implement Authorization Code Flow with PKCE
- [ ] Backend session management:
  - HttpOnly cookies
  - Secure flag (HTTPS only)
  - SameSite=Strict (CSRF protection)
  - 1-hour expiration, refresh token rotation
- [ ] Frontend Okta integration
  - Use `@okta/okta-react` or similar
  - Login/logout flows
  - Token management
- [ ] Role-based access control (RBAC):
  - Roles: `user`, `admin`, `superadmin` (mapped from Okta groups)
  - Route guards based on roles
  - Backend middleware for authorization

**Acceptance Criteria:**
- Users can log in with Okta
- MFA enforced for Admin/SuperAdmin roles
- Sessions expire after 1 hour
- Logout clears session
- Admin routes blocked for non-admin users
- No credentials in localStorage

**Updated Effort:** ~40 hours (same, different provider)

### Updated Phase 1 Exit Criteria

- [ ] **Turborepo monorepo operational** (NEW)
- [ ] Real authentication working (Okta OIDC)
- [ ] Backend API deployed to Cloud Run
- [ ] Database storing user and audience data
- [ ] Frontend consuming real API
- [ ] `make check` and `make test` pass (all packages)
- [ ] Security scan passes (OWASP ZAP or similar)

**Updated Estimated Effort:** 220-320 hours (5-7 weeks with 2 engineers)

---

## Phase 2: Data Plane Foundation (Updated)

**Original Timeline:** Weeks 7-12
**Updated Timeline:** Weeks 9-14 (adjusted for Phase 1 changes)

### Minor Updates

#### 1. BigQuery Setup - UPDATED
**ADR:** ADR-006, ADR-007

- [ ] Create BigQuery dataset: `random_truffle_analytics`
- [ ] Create schemas (in `data/bq/` directory):
  ```
  data/bq/
  ├── schemas/
  │   ├── sessions.sql          # GA4 session data
  │   ├── events.sql            # GA4 event data
  │   ├── conversions.sql       # Conversion events
  │   └── user_attributes.sql   # User attributes
  ├── views/
  │   ├── cortex_ga4_sessions.sql    # Cortex GA4 views (ADR-007)
  │   ├── daily_kpis.sql             # Daily KPI aggregations
  │   └── audience_metrics.sql       # Audience performance
  └── queries/
      ├── get_audience_size.sql      # Audience size estimation
      └── get_session_trends.sql     # Session trend analysis
  ```
- [ ] Implement data ingestion:
  - ~~**Option A:** BigQuery Data Transfer Service (GA4 → BigQuery)~~
  - **DECISION:** Use native GA4 → BigQuery sync (ADR-007)
  - **NOTE:** For Google Ads, Meta, TikTok, use direct APIs (Cortex not working)

**Acceptance Criteria:**
- BigQuery dataset created with proper IAM roles
- Tables created with partitioning (by date)
- GA4 data flowing to BigQuery
- Sample data loaded (test or historical data)
- Queries run successfully and return results

#### 5. Consent Registry (Basic) - UPDATED
**ADR:** ADR-008

- [ ] ~~Create `consents` table in PostgreSQL~~
- **DECISION:** Use GA4 Consent Mode (Phase 2), add CMP later (Phase 4-5)
- [ ] Enable GA4 Consent Mode:
  - Configure consent defaults
  - Track consent status in BigQuery export
- [ ] Backend endpoints (minimal for now):
  - `GET /api/consents/status` - Check GA4 consent status
- [ ] Frontend UI stub:
  - Update `components/audience/Step6_Consent.tsx`
  - Link to GA4 consent documentation
  - Placeholder for future CMP integration

**Acceptance Criteria:**
- GA4 Consent Mode enabled
- Consent status visible in BigQuery
- Frontend shows consent requirements

**Updated Effort:** -20 hours (simpler GA4 approach vs. custom registry)

### New Additions

#### 6. Currency Support (NEW)
**ADR:** ADR-010

- [ ] Add currency tracking to revenue events
- [ ] Supported currencies: USD, MXN, COP
- [ ] Store currency code with all revenue data
- [ ] Display revenue in original currency (no conversion yet in Phase 2)
- [ ] Add currency field to BigQuery schemas

**Acceptance Criteria:**
- Revenue events include currency code
- Analytics displays currency alongside amounts
- No conversion errors or data loss

**Estimated Effort:** +10 hours

#### 7. Session Stitching (NEW)
**ADR:** ADR-009

- [ ] Configure GA4 User-ID feature for logged-in users
- [ ] Create BigQuery queries using `user_id` + `user_pseudo_id`
- [ ] Unified user ID logic:
  ```sql
  COALESCE(user_id, user_pseudo_id) AS unified_user_id
  ```
- [ ] Documentation for team on session stitching

**Acceptance Criteria:**
- Logged-in users tracked with user_id
- Anonymous users tracked with user_pseudo_id
- Cross-session tracking working

**Estimated Effort:** +10 hours

### Updated Phase 2 Exit Criteria

- [ ] BigQuery dataset created with schemas
- [ ] BigQuery MCP connector working
- [ ] Analytics page displays real data
- [ ] GA4 Consent Mode enabled (simplified from full consent registry)
- [ ] **Currency support operational (USD, MXN, COP)** (NEW)
- [ ] **Session stitching configured** (NEW)
- [ ] Data pipeline tested (GA4 → BigQuery → API → Frontend)
- [ ] Performance acceptable (< 2s for cached queries)

**Updated Estimated Effort:** 300-400 hours (6-8 weeks with 2-3 engineers) - UNCHANGED

---

## Phase 3: Agent Services + Orchestration (Updated)

**Original Timeline:** Weeks 13-18
**Updated Timeline:** Weeks 15-20 (adjusted for Phase 2 timeline)

### Major Architecture Changes

**ARCHITECTURE DECISION:** Synchronous API instead of async orchestrator (ADR-018)

This significantly simplifies the agent architecture:
- ~~Remove orchestrator service~~
- ~~Remove Cloud Tasks job queue~~
- Direct synchronous calls to Vertex AI agents
- Streaming responses via Server-Sent Events (SSE)

**Cost Impact:** Saves ~80 hours of development time

### Updated Architecture: Agents vs. Services

**Agent Platform Change:** Vertex AI Conversational Agents (ADR-016)

| Aspect | Original Plan | Updated Plan |
|--------|---------------|--------------|
| **Platform** | Custom LLM integration | Vertex AI Conversational Agents |
| **Invocation** | Async via orchestrator | Synchronous API |
| **Models** | Gemini 1.5 Pro | Multi-model (Gemini Pro/Flash, GPT-4) |
| **Tools** | Custom tools | Built-in data science tools |
| **Orchestrator** | Required | Not needed |
| **Complexity** | High | Medium |

### Removed Deliverable

#### ~~1. Orchestrator Service (`services/orchestrator/`)~~ - REMOVED
**Reason:** ADR-018 (Synchronous API)

This entire deliverable is removed. Agent invocations will be synchronous API calls directly to Vertex AI.

### Updated Deliverables

#### 1. Data Science Agent (`agents/data-science/`) - UPDATED
**ADR:** ADR-016, ADR-018

- [ ] Create Vertex AI Conversational Agent
  - Use Vertex AI Agent Builder
  - Configure with data science tools:
    - BigQuery query execution
    - Python code execution (for analysis)
    - Result visualization
- [ ] Agent capabilities:
  - SQL query generation from natural language
  - Query validation and optimization
  - Query explanation ("This query finds users who...")
  - Result interpretation
- [ ] Implementation:
  - **LLM:** Gemini 1.5 Pro (primary), Gemini 1.5 Flash (fallback)
  - Prompt engineering for SQL generation (stored in version control)
  - BigQuery schema injection (context for agent)
  - Safety rails (no DELETE/DROP, cost estimation)
- [ ] Backend integration:
  - `POST /api/agents/data-science/query` - Generate + execute SQL (synchronous)
  - `POST /api/agents/data-science/explain` - Explain query
  - Streaming responses via SSE
- [ ] Invocation flow (SIMPLIFIED):
  ```
  User → Frontend → API → Vertex AI Agent → Response (sync)
                                ↓
                         BigQuery (via agent tool)
  ```

**Acceptance Criteria:**
- Agent generates valid SQL from natural language
- Queries execute successfully against BigQuery
- Agent refuses dangerous operations (DELETE, DROP)
- Responses include explanations
- Response time < 5 seconds (p95)

**Updated Effort:** -40 hours (Vertex AI simplifies implementation)

#### 2. Audience Builder Agent (`agents/audience-builder/`) - UPDATED
**ADR:** ADR-016, ADR-018

- [ ] Create Vertex AI Conversational Agent
  - Configure with marketing/audience tools
  - Multi-turn conversation support
- [ ] Agent capabilities:
  - Audience strategy recommendations
  - Segment definition assistance
  - Activation channel suggestions (Google Ads, Meta, TikTok)
  - Budget/pacing recommendations
- [ ] Implementation:
  - **LLM:** Gemini 1.5 Pro
  - Context: User goals, historical audience data
  - Multi-turn conversation state (managed by Vertex AI)
- [ ] Backend integration:
  - `POST /api/agents/audience-builder/chat` - Chat with agent (synchronous)
  - `POST /api/agents/audience-builder/strategy` - Generate strategy
  - Streaming responses via SSE
- [ ] Conversation state management:
  - Session-based (stored in PostgreSQL)
  - Resume conversations across browser sessions

**Acceptance Criteria:**
- Agent provides audience strategy recommendations
- Multi-turn conversations work (maintains context)
- Recommendations based on user goals and data
- Response time < 5 seconds (p95)

**Updated Effort:** -40 hours (Vertex AI simplifies implementation)

#### 3. Frontend Agent Integration - UPDATED
- [ ] Update `components/ChatInterface.tsx`:
  - Connect to agent endpoints
  - **Display streaming responses via SSE** (not WebSocket)
  - Handle multi-turn conversations
  - Show "Agent is thinking..." state with animation
- [ ] Integrate into audience creation:
  - Step 1: Chat with audience-builder agent
  - Step 2: Agent suggests strategy
  - Steps 3-10: User refines with agent assistance
- [ ] Add data exploration:
  - New page: `/data-explorer`
  - Chat with data-science agent
  - Execute generated queries (synchronous)
  - Display results in tables/charts (Recharts)
- [ ] Error handling:
  - Timeout after 30 seconds
  - Retry on failure (max 3 attempts, exponential backoff)
  - Fallback to cached responses if available
  - User-friendly error messages

**Acceptance Criteria:**
- Users can chat with agents in UI
- Responses stream in real-time (SSE)
- Conversations maintain context across turns
- Generated queries execute from UI
- Errors handled gracefully

**Updated Effort:** -20 hours (simpler sync integration)

#### 4. Artifact Storage & Versioning - UPDATED
**ADR:** ADR-017

- [ ] Create Cloud Storage bucket: `random-truffle-artifacts`
- [ ] Structure:
  ```
  artifacts/
  ├── queries/           # SQL queries
  ├── strategies/        # Audience strategies
  └── reports/           # Analysis reports
  ```
- [ ] Lifecycle policy (cost optimization):
  - Standard storage: 0-30 days
  - Nearline storage: 31-90 days
  - Coldline storage: 91-365 days
  - Archive storage: 365+ days
  - Delete: After 2 years
- [ ] Versioning enabled (track all changes)
- [ ] Metadata in PostgreSQL:
  - Track artifact ID, user, timestamp, agent used
  - Link artifacts to conversations
- [ ] Frontend integration:
  - View artifact history
  - Reuse previous queries/strategies

**Acceptance Criteria:**
- All agent outputs saved to Cloud Storage
- Users can access history via UI
- Artifacts versioned and retrievable
- Lifecycle policy reduces storage costs

**Updated Effort:** UNCHANGED

#### 5. Agent Cost Controls (NEW)
**ADR:** ADR-019, ADR-020

- [ ] Implement retry logic with exponential backoff:
  - Max retries: 3
  - Backoff: 1s, 2s, 4s
  - Retry on: Timeout, 5xx, rate limits
  - No retry on: 4xx errors
- [ ] Implement fallback strategies:
  - Primary model fails → Gemini Flash
  - All models fail → Cached response
  - No cache → User-friendly error
- [ ] Cost controls:
  - Daily budgets: $10 (dev), $25 (staging), $100 (prod)
  - Per-request limits: 100K input tokens, 4K output tokens
  - User quotas: 50 calls/day (free), 500 calls/day (paid)
  - Alerts at 50%, 75%, 90%, 100% of budget
- [ ] Monitoring:
  - Track agent latency, success rate, cost
  - Alert on retry rate > 10%
  - Alert on fallback rate > 5%

**Acceptance Criteria:**
- Agents retry on transient failures
- Fallbacks work when retries exhausted
- Budget alerts trigger correctly
- Costs within startup-level budgets

**Estimated Effort:** +20 hours

### Updated Phase 3 Exit Criteria

- [ ] ~~Orchestrator service deployed~~ - REMOVED
- [ ] Data science agent operational (Vertex AI)
- [ ] Audience builder agent operational (Vertex AI)
- [ ] Frontend integrated with agents (SSE streaming)
- [ ] Artifact storage working (Cloud Storage)
- [ ] **Agent cost controls implemented** (NEW)
- [ ] **Retry logic and fallbacks working** (NEW)
- [ ] End-to-end agent flow tested
- [ ] Performance acceptable (< 5s for agent responses, p95)

**Updated Estimated Effort:** 270-370 hours (5-7 weeks with 3 engineers)
**Savings:** ~80 hours from removing orchestrator

---

## Phase 4: Multi-Channel Activation (Updated)

**Original Timeline:** Weeks 19-24
**Updated Timeline:** Weeks 21-26 (adjusted for Phase 3 savings)

### Minor Updates

#### 1. Additional MCP Connectors - UPDATED
**ADR:** ADR-007

- [ ] **GA4 MCP Connector**
  - Read GA4 data (sessions, events, conversions)
  - Query GA4 reporting API
  - Authentication via service account
- [ ] **Google Ads MCP Connector** - UPDATED
  - ~~Use Cortex model (not working)~~ - REMOVED
  - **Use Google Ads API directly** (ADR-007)
  - Create/update customer match lists
  - Upload hashed identifiers (SHA-256)
  - Query campaign performance
  - Multi-account support (MCC)
- [ ] **Meta MCP Connector** - UPDATED
  - ~~Use Cortex model~~ - REMOVED
  - **Use Meta API directly** (ADR-007)
  - Create custom audiences
  - Upload hashed identifiers (SHA-256)
  - Multi-account support (Business Manager)
- [ ] **TikTok MCP Connector** (NEW)
  - Use TikTok Ads API directly
  - Create custom audiences
  - Upload hashed identifiers
  - Multi-account support

**Acceptance Criteria:**
- Each connector authenticated and operational
- Multi-account support working
- Rate limits respected (API quotas)
- Data flows to BigQuery for analytics

**Updated Effort:** +20 hours (TikTok connector added)

#### 3. HITL Governance UI - UPDATED
**ADR:** ADR-013

- [ ] Implement `pages/admin/AdminGovernance.tsx`:
  - List pending approvals
  - Approve/reject activation requests
  - View activation details (platform, size, audience)
  - Audit log viewer
- [ ] **Approval levels** (ADR-013):
  - **SuperAdmin:** Platform/agent configuration changes
  - **User-level:** Audience activation, creation, dashboards (self-service)
- [ ] Notification system:
  - Email notifications for pending approvals (SuperAdmin only)
  - In-app notifications (badge on sidebar)
  - Slack webhook integration (optional)

**Acceptance Criteria:**
- SuperAdmins can approve/reject platform changes
- Users can self-approve business operations
- Email notifications sent for SuperAdmin approvals
- Audit log shows all approvals/rejections

**Updated Effort:** -10 hours (simpler approval model)

#### 5. Consent Management Platform (CMP) Integration (NEW)
**ADR:** ADR-008

- [ ] Research CMP options:
  - OneTrust
  - Cookiebot
  - Custom solution
- [ ] Integrate chosen CMP (deferred to Phase 5 if time constrained)
- [ ] Sync CMP consent with GA4
- [ ] Store consent records in PostgreSQL (audit trail)

**Acceptance Criteria:**
- CMP integrated (or documented for Phase 5)
- Consent synced with GA4
- Audit trail complete

**Estimated Effort:** +40 hours (or defer to Phase 5)

### Updated Phase 4 Exit Criteria

- [ ] GA4, Google Ads, Meta, **TikTok** MCP connectors working
- [ ] Activation backend operational
- [ ] HITL governance UI complete (with updated approval levels)
- [ ] Audiences can be pushed to Google Ads, Meta, **TikTok**
- [ ] Multi-account management working
- [ ] **CMP integrated or planned for Phase 5** (NEW)
- [ ] End-to-end activation tested

**Updated Estimated Effort:** 350-450 hours (7-9 weeks with 2-3 engineers)

---

## Phase 5: Enterprise Features & ~~Monorepo~~ (Updated)

**Original Timeline:** Weeks 25-36
**Updated Timeline:** Weeks 27-36 (adjusted for earlier phases)

### Major Changes

#### ~~1. Monorepo Migration~~ - REMOVED
**Reason:** Moved to Phase 1 (ADR-002)

This entire deliverable is removed from Phase 5.

**Effort Savings:** ~80 hours

### Updated Deliverables

#### 1. Infrastructure as Code (Terraform) - UNCHANGED
No changes to this deliverable.

#### 2. Shared Packages - UPDATED
**Status:** Most packages already created in Phase 1

- [x] **packages/core/** - Created in Phase 1
- [x] **packages/auth/** - Created in Phase 1
- [x] **packages/ui/** - Created in Phase 1
- [x] **packages/types/** - Created in Phase 1
- [x] **packages/telemetry/** - Created in Phase 1 (basic version)

**Phase 5 work:**
- [ ] Enhance **packages/telemetry/**:
  - Advanced logging (structured, JSON)
  - Tracing (OpenTelemetry)
  - Metrics (Prometheus)
- [ ] Create **packages/cortex-model/** (if needed):
  - BigQuery Cortex model definitions
  - Shared queries for GA4 Cortex views

**Updated Effort:** -60 hours (most work done in Phase 1)

#### 3. Observability & Monitoring - UPDATED
**ADR:** ADR-014

- [ ] Logging:
  - Structured logging (JSON format)
  - Cloud Logging integration
  - Log levels: DEBUG, INFO, WARN, ERROR
  - Request/response logging with correlation IDs
  - **SOC2 compliance requirements** (ADR-014):
    - Log retention: 7 years
    - Immutable logs (append-only)
    - Regular log reviews (quarterly)
- [ ] Tracing:
  - OpenTelemetry integration
  - Cloud Trace integration
  - Trace agent calls, database queries, external APIs
- [ ] Metrics:
  - API latency (p50, p95, p99)
  - Error rates
  - Agent invocation counts, success rates, costs
  - BigQuery query costs
  - Active users
- [ ] Alerting:
  - Cloud Monitoring alerts
  - Slack/PagerDuty integration
  - Alerts: Error rate > 1%, Latency p95 > 2s, Cost spike, Budget thresholds
- [ ] Dashboards:
  - Implement `pages/admin/AdminSlos.tsx`
  - SLO tracking (99.9% uptime, < 2s latency)
  - Real-time metrics
  - **SOC2 audit dashboard** (NEW)

**Acceptance Criteria:**
- All services emit structured logs
- Logs retained for 7 years (SOC2)
- Traces visible in Cloud Trace
- Metrics dashboard operational
- Alerts trigger correctly
- SOC2 audit trail complete

**Updated Effort:** +20 hours (SOC2 requirements)

#### 4. Advanced Security - UPDATED
**ADR:** ADR-014, ADR-015

- [ ] **VPC Service Controls**:
  - Isolate BigQuery, Cloud SQL, Secret Manager
  - Prevent data exfiltration
- [ ] **IAM Policies**:
  - Least privilege for all service accounts
  - Separation of duties (dev vs. prod)
  - Policy stored in `infra/policies/`
- [ ] **Secret Rotation** (ADR-015):
  - 90-day rotation for all secrets
  - Automated rotation via Secret Manager
  - Alerts on rotation failures
- [ ] **Compliance** (ADR-014):
  - **SOC 2 Type II audit preparation**
  - GDPR/CCPA compliance review
  - Data retention policies (90 days for logs, 7 years for audit)
- [ ] **Penetration Testing**:
  - Third-party security audit
  - Vulnerability scanning (Snyk, OWASP ZAP)

**Acceptance Criteria:**
- VPC-SC enabled for all sensitive resources
- IAM audit passes (no overly permissive roles)
- Secrets rotate automatically every 90 days
- SOC 2 audit-ready
- Security audit completed with no P0 findings

**Updated Effort:** +20 hours (SOC2 preparation)

#### 5. Performance Optimization - UPDATED
**ADR:** ADR-024

- [ ] **Frontend**:
  - Code splitting (React.lazy for routes)
  - Image optimization (Next.js Image component)
  - Bundle analysis and tree-shaking
  - CDN caching (1 hour for static assets)
  - **Lighthouse score > 90** (ADR-024)
- [ ] **Backend**:
  - Database query optimization (indexes)
  - Response caching (Redis/Memorystore)
  - API rate limiting (100 req/min per user)
  - Background job processing (Cloud Tasks)
- [ ] **BigQuery**:
  - Partitioning and clustering
  - Materialized views for common queries
  - Query cost monitoring and alerts
- [ ] **Load Testing** (ADR-024):
  - Tool: k6 or Artillery
  - Target: 100 concurrent users, 1000 req/sec
  - Performance budgets enforced

**Acceptance Criteria:**
- Frontend Lighthouse score > 90
- API p95 latency < 500ms
- BigQuery query costs < $100/day
- All pages load in < 2 seconds
- Load test passes (100 concurrent users)

**Updated Effort:** +10 hours (load testing)

#### 6. Testing & Quality - UPDATED
**ADR:** ADR-021, ADR-022, ADR-023

- [ ] **Unit Tests**:
  - **95% code coverage target** (was 80%) (ADR-022)
  - All critical paths tested
  - Coverage enforcement in CI/CD
- [ ] **Integration Tests** (ADR-023):
  - API endpoint tests (Supertest)
  - Database integration tests
  - MCP connector tests (BigQuery, GA4, Ads, Meta, TikTok)
  - Vertex AI agent tests
- [ ] **E2E Tests** (Playwright) (ADR-021):
  - User login flow
  - Audience creation flow (10-step wizard)
  - Audience activation flow
  - Data explorer flow
  - Dashboard creation and viewing
  - Admin workflows (user management, approvals)
  - **Complete UAT/QA** (ADR-021)
- [ ] **Accessibility Tests** (ADR-025):
  - **WCAG 2.1 AA compliance**
  - Automated: axe-core (Playwright integration)
  - Manual: Screen reader testing (NVDA, JAWS)
  - Keyboard navigation testing
  - Color contrast testing
- [ ] **CI/CD Quality Gates**:
  - `make check` - Lint + type check
  - `make test` - Unit + integration tests
  - `make e2e` - Playwright tests
  - Coverage report (fail if < 95%)
  - Accessibility audit (fail if violations)

**Acceptance Criteria:**
- 95% code coverage across all packages
- E2E tests pass for all critical flows
- Integration tests pass for all external services
- WCAG 2.1 AA compliance verified
- Load test passes (100 concurrent users)
- CI/CD blocks merges if quality gates fail

**Updated Effort:** +40 hours (higher coverage target + accessibility)

### Updated Phase 5 Exit Criteria

- [ ] ~~Monorepo structure complete~~ - REMOVED (done in Phase 1)
- [ ] Infrastructure as Code (Terraform) complete
- [ ] Observability stack operational (with SOC2 audit trail)
- [ ] Security hardening complete (SOC2 ready)
- [ ] Performance optimization complete (Lighthouse > 90)
- [ ] Testing suite comprehensive (95% coverage, WCAG 2.1 AA)
- [ ] Production-ready for enterprise customers

**Updated Estimated Effort:** 420-520 hours (9-10 weeks with 3-4 engineers)
**Savings:** ~80 hours from monorepo removal

---

## Updated Budget Estimate

| Phase | Duration | Engineers | Cost (Labor @ $150K/yr) | GCP Infra | Total |
|-------|----------|-----------|-------------------------|-----------|-------|
| **Phase 0** | 3 weeks (was 2) | 2 | $18K (was $12K) | $0 | **$18K** |
| **Phase 1** | 5 weeks (was 4) | 2 | $30K (was $24K) | $2K | **$32K** |
| **Phase 2** | 6 weeks | 3 | $54K | $5K | **$59K** |
| **Phase 3** | 6 weeks | 3 | $54K | $8K | **$62K** |
| **Phase 4** | 8 weeks (was 6) | 3 | $72K (was $54K) | $3K | **$75K** |
| **Phase 5** | 9 weeks (was 10) | 4 | $108K (was $120K) | $10K | **$118K** |
| **TOTAL** | **37 weeks** | **~3 avg** | **$336K** | **$28K** | **$364K** |

**Original Total:** $346K
**Updated Total:** $364K
**Difference:** +$18K (5% increase)

**Reasons for increase:**
- Phase 0 extended (+1 week for Next.js migration)
- Phase 1 extended (+1 week for monorepo setup)
- Phase 4 extended (+2 weeks for CMP + TikTok)
- Phase 5 reduced (-1 week from monorepo removal)
- Higher quality bar (95% coverage, WCAG 2.1 AA)

**Offset by savings:**
- Phase 3: -80 hours (no orchestrator)
- Phase 5: -80 hours (monorepo done in Phase 1)
- Simpler agent architecture

**Net:** +$18K acceptable for higher quality and earlier monorepo

---

## Updated Timeline Summary

| Phase | Original Timeline | Updated Timeline | Change |
|-------|------------------|------------------|--------|
| Phase 0 | Weeks 1-2 | Weeks 1-3 | +1 week |
| Phase 1 | Weeks 3-6 | Weeks 4-8 | +1 week |
| Phase 2 | Weeks 7-12 | Weeks 9-14 | Adjusted |
| Phase 3 | Weeks 13-18 | Weeks 15-20 | Adjusted |
| Phase 4 | Weeks 19-24 | Weeks 21-28 | +2 weeks |
| Phase 5 | Weeks 25-36 | Weeks 29-38 | Adjusted |
| **Total** | **36 weeks** | **38 weeks** | **+2 weeks** |

**Total Duration:** 38 weeks (~9 months)
**Original:** 36 weeks (~8.5 months)
**Difference:** +2 weeks

**Rationale for extension:**
- Front-load architectural changes (Next.js, monorepo)
- Higher quality bar (95% coverage, WCAG 2.1 AA, SOC2)
- Additional integrations (TikTok, CMP)
- More realistic timelines based on ADRs

---

## Key Decisions Impact Summary

| Decision | Impact on Roadmap | Effort Change | Phase Affected |
|----------|-------------------|---------------|----------------|
| ADR-001: Next.js | Migration in Phase 0 | +40 hours | Phase 0 |
| ADR-002: Monorepo ASAP | Move to Phase 1 | +20 hours (Ph1), -80 hours (Ph5) | Phase 1, 5 |
| ADR-003: Recharts only | Remove Chart.js | -2 hours | Phase 0 |
| ADR-007: Direct APIs for Ads | No Cortex for Ads | +20 hours | Phase 4 |
| ADR-008: GA4 Consent + CMP | Simpler Phase 2, add CMP Phase 4 | -20 hours (Ph2), +40 hours (Ph4) | Phase 2, 4 |
| ADR-011: Okta | Different OIDC provider | 0 hours (same effort) | Phase 1 |
| ADR-013: Simplified HITL | Fewer approvals | -10 hours | Phase 4 |
| ADR-014: SOC2 compliance | More audit logging | +40 hours | Phase 5 |
| ADR-016: Vertex AI agents | Managed platform | -80 hours | Phase 3 |
| ADR-018: Sync API | Remove orchestrator | -80 hours | Phase 3 |
| ADR-022: 95% coverage | Higher testing bar | +40 hours | Phase 5 |
| ADR-025: WCAG 2.1 AA | Accessibility testing | +20 hours | Phase 5 |

**Net Effort Change:** ~+20 hours (~0.5% increase)
**Net Timeline Change:** +2 weeks

---

## Next Steps

1. **Review & Approve** these roadmap updates
2. **Update CLAUDE.md** with key decisions (next task)
3. **Kick Off Phase 0** with updated scope:
   - TypeScript strict mode
   - Security fixes
   - Next.js migration
   - Remove Chart.js
   - ESLint/Prettier setup
4. **Set up project tracking** with updated Phase 0-5 milestones
5. **Schedule architecture review** to align team on ADRs

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-25 | Claude Code Agent | Initial roadmap |
| 1.1 | 2025-10-26 | Claude Code Agent | Updated based on 25 ADRs |

---

**Related Documents:**
- `architecture-decisions.md` - Full ADR details (25 decisions)
- `implementation-roadmap.md` - Original roadmap v1.0
- `CLAUDE.md` - Updated coding guidelines (next)
