# Phase 4: Multi-Channel Activation Plan

**Status:** In Progress
**Start Date:** 2025-10-27
**Target Completion:** 7-8 weeks (Weeks 21-28 of overall roadmap)

## Executive Summary

Phase 4 delivers multi-channel audience activation to Google Ads, Meta, and TikTok with enterprise-grade governance, latest API versions, and best-in-class UX.

## API Versions & Research

### Google Ads API v22 (October 2025)

- **Latest Version:** v22 (released October 15, 2025)
- **Customer Match Method:** `OfflineUserDataJob` for bulk uploads, `UserDataService` for small updates
- **Key Change (April 2025):** Membership duration max 540 days (was infinite)
- **Upload Types:** CONTACT_INFO, CRM_ID, MOBILE_ADVERTISING_ID (no mixing)
- **Processing Time:** Up to 24 hours
- **Identifier Format:** SHA-256 hashed emails, phones, addresses
- **Multi-Account:** Supported via customer_id

### Meta Marketing API v22.0 (January 2025)

- **Latest Version:** v22.0 (v25.0 coming soon)
- **Custom Audience Endpoint:** `/act_{ad_account_id}/customaudiences`
- **Max Audiences:** 500 per account
- **Types:** Website, mobile app, customer file, engagement, offline
- **New Restrictions:** Housing/employment/financial services compliance
- **Processing Time:** Varies, typically 1-6 hours
- **Identifier Format:** SHA-256 hashed emails, phones, MAIDs
- **Multi-Account:** Supported via ad_account_id

### TikTok Ads API v1.3 (Business API)

- **Latest Version:** v1.3 Business API
- **Segment API:** Real-time batch updates (recommended over file upload)
- **Min Audience Size:** 1,000 matched users
- **Max Audiences:** 400 per advertiser
- **Processing Time:** 24-48 hours
- **Identifier Format:** SHA-256 hashed emails, phones, IDFAs
- **Multi-Account:** Supported via advertiser_id

## Architecture

### Package Structure

```
packages/
├── activation/                 # Core activation logic
│   ├── src/
│   │   ├── types.ts           # Activation types
│   │   ├── base-activator.ts  # Abstract base class
│   │   ├── audience-hasher.ts # SHA-256 identifier hashing
│   │   └── index.ts
│   └── package.json
│
├── mcp-google-ads/            # Google Ads MCP connector
│   ├── src/
│   │   ├── connector.ts       # Customer Match API
│   │   ├── client.ts          # Google Ads API v22 client
│   │   ├── types.ts           # Google Ads types
│   │   └── index.ts
│   └── package.json
│
├── mcp-meta/                  # Meta MCP connector
│   ├── src/
│   │   ├── connector.ts       # Custom Audiences API
│   │   ├── client.ts          # Marketing API v22.0 client
│   │   ├── types.ts           # Meta types
│   │   └── index.ts
│   └── package.json
│
├── mcp-tiktok/                # TikTok MCP connector
│   ├── src/
│   │   ├── connector.ts       # Segment API
│   │   ├── client.ts          # Business API v1.3 client
│   │   ├── types.ts           # TikTok types
│   │   └── index.ts
│   └── package.json
│
└── governance/                # HITL governance
    ├── src/
    │   ├── types.ts           # Approval workflow types
    │   ├── approval-manager.ts # Approval state machine
    │   ├── rules-engine.ts    # Governance rules
    │   └── index.ts
    └── package.json
```

### Service Layer (NestJS Backend)

```
services/api/src/
├── activation/
│   ├── activation.controller.ts    # POST /activation/create, /activate
│   ├── activation.service.ts       # Business logic
│   ├── activation.module.ts
│   └── dto/
│       ├── create-activation.dto.ts
│       └── activate-audience.dto.ts
│
├── governance/
│   ├── governance.controller.ts    # POST /governance/submit, /approve, /reject
│   ├── governance.service.ts       # Approval workflows
│   └── governance.module.ts
│
└── accounts/
    ├── accounts.controller.ts      # POST /accounts/connect, GET /accounts
    ├── accounts.service.ts         # Multi-account management
    └── accounts.module.ts
```

### Frontend UX

```
apps/web/app/(authenticated)/
├── activation/
│   ├── page.tsx                    # Activation dashboard
│   ├── create/
│   │   └── page.tsx                # Create activation wizard
│   └── [id]/
│       └── page.tsx                # Activation details
│
├── accounts/
│   ├── page.tsx                    # Connected accounts
│   └── connect/
│       ├── google-ads/
│       │   └── page.tsx            # OAuth flow
│       ├── meta/
│       │   └── page.tsx            # OAuth flow
│       └── tiktok/
│           └── page.tsx            # OAuth flow
│
└── governance/
    └── page.tsx                    # Approval queue (SuperAdmin)
```

## Implementation Phases

### Phase 4.1: Activation Infrastructure (Week 1)

- [ ] Create `packages/activation` with base types
- [ ] Implement SHA-256 identifier hashing with salt
- [ ] Create base activator abstract class
- [ ] Add activation types to shared types package
- [ ] Build activation service in backend API

### Phase 4.2: Google Ads Integration (Week 2)

- [ ] Create `packages/mcp-google-ads`
- [ ] Implement Google Ads API v22 client
- [ ] Build Customer Match upload via OfflineUserDataJob
- [ ] Add support for CONTACT_INFO, CRM_ID types
- [ ] Implement 540-day membership duration
- [ ] Multi-account support via customer_id
- [ ] Frontend: Google Ads account connection OAuth
- [ ] Frontend: Google Ads activation UX

### Phase 4.3: Meta Integration (Week 3)

- [ ] Create `packages/mcp-meta`
- [ ] Implement Meta Marketing API v22.0 client
- [ ] Build Custom Audiences API integration
- [ ] Add housing/financial services compliance flags
- [ ] Multi-account support via ad_account_id
- [ ] Frontend: Meta account connection OAuth
- [ ] Frontend: Meta activation UX with compliance

### Phase 4.4: TikTok Integration (Week 4)

- [ ] Create `packages/mcp-tiktok`
- [ ] Implement TikTok Business API v1.3 client
- [ ] Build Segment API integration
- [ ] Add 1,000 user minimum validation
- [ ] Multi-account support via advertiser_id
- [ ] Frontend: TikTok account connection OAuth
- [ ] Frontend: TikTok activation UX

### Phase 4.5: HITL Governance (Week 5)

- [ ] Create `packages/governance`
- [ ] Implement approval state machine
- [ ] Build governance rules engine
- [ ] Add SuperAdmin approval workflows
- [ ] Backend: Governance API endpoints
- [ ] Frontend: Approval queue UI (SuperAdmin)
- [ ] Frontend: Approval status tracking (User)

### Phase 4.6: UX & Testing (Week 6-7)

- [ ] Build unified activation dashboard
- [ ] Create activation wizard with channel selection
- [ ] Add activation history and status tracking
- [ ] Implement real-time status updates
- [ ] End-to-end testing for all channels
- [ ] Golden set testing with test accounts
- [ ] Performance testing (1M+ identifiers)

### Phase 4.7: Polish & Documentation (Week 8)

- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance optimization
- [ ] Error handling and retry logic
- [ ] Comprehensive API documentation
- [ ] User guide for activation workflows
- [ ] Admin guide for governance

## UX Flows

### Activation Creation Flow

1. **Select Audience** (from Audiences page)
   - Click "Activate" button on audience
   - Or create new activation from Activation Dashboard

2. **Choose Channels** (multi-select)
   - Google Ads (show connected accounts)
   - Meta (show connected ad accounts)
   - TikTok (show connected advertisers)
   - Display account connection prompts if not connected

3. **Configure Per-Channel Settings**
   - **Google Ads:**
     - Select customer account(s)
     - Choose list type (CONTACT_INFO, CRM_ID, MOBILE_ADVERTISING_ID)
     - Set membership duration (1-540 days, default 540)
     - Name the Customer Match list

   - **Meta:**
     - Select ad account(s)
     - Choose audience type (Customer File)
     - Compliance flags (housing, employment, financial)
     - Name the Custom Audience

   - **TikTok:**
     - Select advertiser account(s)
     - Validate min 1,000 users
     - Name the Custom Audience
     - Set expiration

4. **Review & Submit**
   - Show audience size
   - Show estimated match rates
   - Show identifier types being used
   - Compliance warnings
   - Cost estimate (API calls)
   - **If HITL required:** Submit for approval
   - **If self-service:** Activate immediately

5. **Status Tracking**
   - Show processing status per channel
   - Google Ads: "Processing" → "Ready" (24h)
   - Meta: "Processing" → "Ready" (1-6h)
   - TikTok: "Processing" → "Ready" (24-48h)
   - Display match rates when available
   - Show errors and retry options

### Account Connection Flow

Each platform uses OAuth 2.0:

1. **Initiate Connection**
   - User clicks "Connect [Platform] Account"
   - Show required permissions list
   - "Continue" button

2. **OAuth Redirect**
   - Redirect to platform OAuth page
   - User grants permissions
   - Redirect back to app with auth code

3. **Token Exchange & Storage**
   - Exchange auth code for access/refresh tokens
   - Store in GCP Secret Manager
   - Display connected account info

4. **Multi-Account Support**
   - List all accessible accounts
   - Allow selection of which to activate
   - Save preferences

### Governance Approval Flow (HITL)

**User Perspective:**

1. Submit activation request
2. See "Pending Approval" status
3. Notification when approved/rejected
4. If rejected, see reason and edit

**SuperAdmin Perspective:**

1. See pending approvals in queue
2. Review activation details:
   - Audience name, size, criteria
   - Channels and accounts
   - User who requested
   - Compliance flags
3. Approve or reject with reason
4. On approve: Activation auto-executes

## Technical Requirements

### Security

- **OAuth Tokens:** Store in GCP Secret Manager, 90-day rotation
- **Identifier Hashing:** SHA-256 with unique salt per tenant
- **IAM:** Separate service accounts per platform
- **Least Privilege:** Read-only except for audience upload endpoints
- **Audit Logging:** All activations logged with user, timestamp, audience

### Performance

- **Batch Processing:** Handle 10M+ identifiers per activation
- **Chunking:** Upload in chunks (Google: 5K, Meta: 10K, TikTok: varies)
- **Rate Limiting:** Respect platform rate limits
- **Retry Logic:** Exponential backoff on failures (max 3 retries)
- **Parallel Uploads:** Upload to multiple channels concurrently

### Monitoring

- **Activation Success Rate:** Target >95%
- **Match Rate Tracking:** Store per-channel match rates
- **Processing Time:** Track p50, p95, p99
- **Error Alerts:** Slack/email on failures
- **Cost Tracking:** Track API call costs

### Compliance

- **GA4 Consent Mode:** Check consent before activation
- **Platform Policies:**
  - Google: Customer Match policies
  - Meta: Housing/employment/financial restrictions
  - TikTok: Custom Audience policies
- **GDPR/CCPA:** User right to deletion propagates to platforms
- **Data Retention:** Remove identifiers after upload completes

## Success Metrics

### Phase 4 Completion Criteria

- [ ] All 3 platforms integrated (Google Ads, Meta, TikTok)
- [ ] OAuth account connection working for all platforms
- [ ] HITL governance workflows functional
- [ ] > 95% activation success rate in testing
- [ ] <10s activation submission time (frontend)
- [ ] 95% test coverage for activation packages
- [ ] Accessibility: WCAG 2.1 AA compliance
- [ ] Documentation: User guide, API docs, admin guide

### Business Metrics (Post-Launch)

- **Activation Volume:** Audiences activated per week
- **Match Rates:** Average match rate per platform
- **Channel Usage:** Distribution across Google/Meta/TikTok
- **Multi-Channel:** % of activations using 2+ channels
- **Governance:** Average approval time for HITL requests

## Dependencies

### External APIs

- Google Ads API v22 (OAuth 2.0, API keys)
- Meta Marketing API v22.0 (App ID, App Secret)
- TikTok Business API v1.3 (App ID, Secret Key)

### Infrastructure

- GCP Secret Manager (token storage)
- Cloud Run (backend API)
- PostgreSQL (activation records, approval queue)
- Redis (rate limiting, caching)

### Packages

- `@random-truffle/agents` (audience criteria)
- `@random-truffle/bigquery` (audience queries)
- `@random-truffle/auth` (user authentication)
- `@random-truffle/types` (shared types)

## Risks & Mitigations

### Risk: Platform API Changes

**Mitigation:** Version pinning, monitoring release notes, automated testing

### Risk: Low Match Rates

**Mitigation:** Multiple identifier types, data quality validation, match rate reporting

### Risk: OAuth Token Expiration

**Mitigation:** Refresh token rotation, expiration alerts, auto-refresh

### Risk: Processing Delays

**Mitigation:** Clear status messaging, email notifications, retry logic

### Risk: Compliance Violations

**Mitigation:** Pre-flight compliance checks, governance approvals, audit logs

## Next Steps

1. ✅ Complete Phase 4 planning and API research
2. Start Phase 4.1: Activation infrastructure
3. Implement Google Ads integration (Phase 4.2)
4. Implement Meta integration (Phase 4.3)
5. Implement TikTok integration (Phase 4.4)
6. Build HITL governance (Phase 4.5)
7. UX polish and testing (Phase 4.6-4.7)
