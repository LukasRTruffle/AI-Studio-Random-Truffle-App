# Phase 4: Multi-Channel Activation Plan (Revised for MMM)

**Status:** In Progress (Revised Architecture)
**Start Date:** 2025-10-27
**Target Completion:** 7-8 weeks (Weeks 21-28 of overall roadmap)

## Architecture Revision: Direct API Clients for MMM

**Key Change:** Pivoted from MCP connectors to direct API clients for better MMM integration.

### Why Direct API Clients?

**MCP is NOT the right pattern for ad platforms because:**

- MCP is for AI agent tool invocations (synchronous queries)
- Ad platform data needs: Activation (one-way upload) + ETL (batch sync to BigQuery)
- MMM requires historical data in BigQuery, not real-time agent queries

**Better approach:**

```
Ad Platforms → Direct API Clients → BigQuery
                                        ↓
                              Data Science Agent (via MCP BigQuery)
                                        ↓
                                   MMM Models
```

### Benefits for Advanced MMM:

✅ **Complete data in BigQuery:** GA4 + ad platforms unified
✅ **Identity resolution:** Match user_id/user_pseudo_id across sources
✅ **Historical analysis:** Years of data for time-series models
✅ **Fast analytics queries:** BigQuery optimized for OLAP
✅ **Agent access:** Data Science Agent queries via MCP BigQuery (already built)
✅ **Incrementality testing:** Compare exposed vs. control users
✅ **Multi-touch attribution:** Full customer journey in BigQuery

## Revised Package Structure

```
packages/
├── activation/                 # ✓ Core activation logic (already built)
├── governance/                 # ✓ HITL workflows (already built)
│
├── google-ads-client/          # NEW: Google Ads API v22 client
│   ├── src/
│   │   ├── customer-match.ts       # Audience upload (Customer Match)
│   │   ├── reporting-api.ts        # Campaign performance data
│   │   ├── bq-data-transfer.ts     # Configure BQ Data Transfer Service
│   │   ├── oauth-client.ts         # OAuth 2.0 flow
│   │   ├── types.ts                # Google Ads types
│   │   └── index.ts
│   └── package.json
│
├── meta-client/                # NEW: Meta Marketing API v22.0 client
│   ├── src/
│   │   ├── custom-audiences.ts     # Audience upload
│   │   ├── insights-api.ts         # Campaign insights & performance
│   │   ├── oauth-client.ts         # OAuth 2.0 flow
│   │   ├── types.ts                # Meta types
│   │   └── index.ts
│   └── package.json
│
├── tiktok-client/              # NEW: TikTok Business API v1.3 client
│   ├── src/
│   │   ├── segments.ts             # Custom audience segments
│   │   ├── reporting-api.ts        # Campaign reporting
│   │   ├── oauth-client.ts         # OAuth 2.0 flow
│   │   ├── types.ts                # TikTok types
│   │   └── index.ts
│   └── package.json
│
└── data-ingestion/             # NEW: ETL orchestration for ad data
    ├── src/
    │   ├── sync-scheduler.ts       # Daily sync job scheduler
    │   ├── google-ads-sync.ts      # Sync Google Ads to BigQuery
    │   ├── meta-sync.ts            # Sync Meta to BigQuery
    │   ├── tiktok-sync.ts          # Sync TikTok to BigQuery
    │   ├── bigquery-loader.ts      # Load data into BigQuery
    │   └── index.ts
    └── package.json
```

### Key Difference from Original Plan:

- ❌ **Dropped:** MCP connectors for ad platforms (mcp-google-ads, mcp-meta, mcp-tiktok)
- ✅ **Added:** Direct API clients + data-ingestion package
- ✅ **Kept:** MCP BigQuery (agents query ALL data - GA4 + ads)

## BigQuery Schema for MMM

### Tables Structure:

```sql
-- GA4 native exports (already configured)
`project.analytics_PROPERTY_ID.events_*`
`project.analytics_PROPERTY_ID.users_*`

-- Ad platform performance (NEW - daily ETL)
CREATE TABLE `project.marketing_data.google_ads_campaign_performance` (
  date DATE,
  customer_id STRING,
  campaign_id STRING,
  campaign_name STRING,
  impressions INT64,
  clicks INT64,
  cost_micros INT64,  -- Cost in micro currency units
  conversions FLOAT64,
  conversion_value FLOAT64,
  currency STRING
);

CREATE TABLE `project.marketing_data.meta_campaign_performance` (
  date DATE,
  account_id STRING,
  campaign_id STRING,
  campaign_name STRING,
  impressions INT64,
  clicks INT64,
  spend FLOAT64,
  actions ARRAY<STRUCT<action_type STRING, value INT64>>,
  currency STRING
);

CREATE TABLE `project.marketing_data.tiktok_campaign_performance` (
  date DATE,
  advertiser_id STRING,
  campaign_id STRING,
  campaign_name STRING,
  impressions INT64,
  clicks INT64,
  spend FLOAT64,
  conversions INT64,
  currency STRING
);

-- MMM training data view (joined)
CREATE VIEW `project.marketing_data.mmm_training_data` AS
SELECT
  date,
  -- Ad spend by channel
  COALESCE(SUM(google.cost_micros / 1000000), 0) as google_ads_spend,
  COALESCE(SUM(meta.spend), 0) as meta_spend,
  COALESCE(SUM(tiktok.spend), 0) as tiktok_spend,
  -- Conversions from GA4
  COUNT(DISTINCT ga4.user_pseudo_id) as unique_converters,
  SUM(ga4.event_value_in_usd) as total_revenue,
  -- Seasonality features
  EXTRACT(DAYOFWEEK FROM date) as day_of_week,
  EXTRACT(MONTH FROM date) as month,
  -- Holiday indicator (TODO: add holiday table join)
FROM `analytics_PROPERTY_ID.events_*` ga4
LEFT JOIN `marketing_data.google_ads_campaign_performance` google USING(date)
LEFT JOIN `marketing_data.meta_campaign_performance` meta USING(date)
LEFT JOIN `marketing_data.tiktok_campaign_performance` tiktok USING(date)
WHERE ga4._TABLE_SUFFIX BETWEEN '20240101' AND '20251231'
  AND ga4.event_name IN ('purchase', 'conversion')
GROUP BY date;
```

### Identity Matching Example:

```sql
-- Match GA4 users with ad platform exposure
WITH ga4_users AS (
  SELECT DISTINCT
    user_pseudo_id,
    user_id,
    LOWER(user_properties.value.string_value) as email
  FROM `analytics_PROPERTY_ID.events_*`,
  UNNEST(user_properties) as user_properties
  WHERE user_properties.key = 'email'
    AND _TABLE_SUFFIX >= FORMAT_DATE('%Y%m%d', DATE_SUB(CURRENT_DATE(), INTERVAL 30 DAY))
),
google_ads_audience AS (
  SELECT
    user_list_id,
    SHA256(LOWER(email)) as hashed_email,
    added_date
  FROM `marketing_data.google_ads_user_lists`
)
SELECT
  ga4.user_pseudo_id,
  ga4.user_id,
  google.user_list_id,
  google.added_date as ad_exposure_date
FROM ga4_users ga4
JOIN google_ads_audience google
  ON SHA256(ga4.email) = google.hashed_email;
```

## API Versions & Capabilities

### Google Ads API v22

**Customer Match (Activation):**

- Endpoint: `googleads.googleapis.com/v22/customers/{customer_id}/offlineUserDataJobs`
- Method: OfflineUserDataJob for bulk uploads
- Upload types: CONTACT_INFO (email/phone), CRM_ID, MOBILE_ADVERTISING_ID
- Max membership duration: 540 days
- Processing time: Up to 24 hours

**Reporting API (Data Ingestion):**

- Endpoint: `googleads.googleapis.com/v22/customers/{customer_id}/googleAds:searchStream`
- Resources: campaign, ad_group, ad_group_ad, campaign_criterion
- Metrics: impressions, clicks, cost_micros, conversions, conversion_value
- Date range: Custom (for historical MMM data)

**BigQuery Data Transfer:**

- Google Ads → BigQuery native integration
- Daily automatic sync
- Pre-built schema
- Cost: Free (just BQ storage)

### Meta Marketing API v22.0

**Custom Audiences (Activation):**

- Endpoint: `graph.facebook.com/v22.0/act_{ad_account_id}/customaudiences`
- Method: POST to create, POST to /{audience_id}/users to add
- Identifier types: EMAIL, PHONE, MADID, FN+LN+ZIP
- Max audiences: 500 per account
- Processing time: 1-6 hours

**Insights API (Data Ingestion):**

- Endpoint: `graph.facebook.com/v22.0/act_{ad_account_id}/insights`
- Breakdowns: campaign_id, adset_id, ad_id
- Metrics: impressions, clicks, spend, actions, action_values
- Date presets: last_30d, last_90d, maximum (for historical)

**No Native BigQuery Transfer:**

- Must build custom ETL
- Daily cron job to fetch insights
- Load into BigQuery via Streaming Insert or Batch Load

### TikTok Business API v1.3

**Segments (Activation):**

- Endpoint: `business-api.tiktok.com/open_api/v1.3/dmp/custom_audience/create`
- Method: POST with file_paths or identity_id array
- Identifier types: EMAIL, PHONE, IDFA, GAID
- Min size: 1,000 users
- Max audiences: 400 per advertiser
- Processing time: 24-48 hours

**Reporting API (Data Ingestion):**

- Endpoint: `business-api.tiktok.com/open_api/v1.3/report/integrated/get`
- Dimensions: campaign_id, adgroup_id, ad_id
- Metrics: impressions, clicks, spend, conversions
- Date range: Custom (up to 90 days per request)

**No Native BigQuery Transfer:**

- Custom ETL required
- Daily batch job
- Load into BigQuery

## Implementation Phases (Revised)

### Phase 4.1: ✅ Activation Infrastructure (Complete)

- [x] Activation types and base classes
- [x] SHA-256 identifier hashing
- [x] HITL governance system
- [x] Committed and pushed

### Phase 4.2: Google Ads Integration (In Progress)

- [ ] Create `packages/google-ads-client`
- [ ] Implement OAuth 2.0 client
- [ ] Implement Customer Match API (activation)
- [ ] Implement Reporting API (data ingestion)
- [ ] Configure BigQuery Data Transfer Service
- [ ] Build Google Ads activator (extends BaseActivator)
- [ ] Daily sync job to BigQuery

### Phase 4.3: Meta Integration

- [ ] Create `packages/meta-client`
- [ ] Implement OAuth 2.0 client
- [ ] Implement Custom Audiences API (activation)
- [ ] Implement Insights API (data ingestion)
- [ ] Build Meta activator (extends BaseActivator)
- [ ] Daily sync job to BigQuery

### Phase 4.4: TikTok Integration

- [ ] Create `packages/tiktok-client`
- [ ] Implement OAuth 2.0 client
- [ ] Implement Segments API (activation)
- [ ] Implement Reporting API (data ingestion)
- [ ] Build TikTok activator (extends BaseActivator)
- [ ] Daily sync job to BigQuery

### Phase 4.5: Data Ingestion Orchestration

- [ ] Create `packages/data-ingestion`
- [ ] Implement daily sync scheduler (Cloud Scheduler + Cloud Run)
- [ ] Build BigQuery loader (batch inserts)
- [ ] Create MMM training data view
- [ ] Add identity matching queries
- [ ] Data quality validation

### Phase 4.6: Backend API & MMM Endpoints

- [ ] Activation controller (POST /activation/create, /activate)
- [ ] Connected accounts controller (OAuth flows)
- [ ] Data ingestion controller (trigger syncs, check status)
- [ ] MMM controller (POST /mmm/train, /mmm/predict)
- [ ] Integrate with governance approval workflows

### Phase 4.7: Frontend UX

- [ ] Activation wizard (select channels, configure settings)
- [ ] OAuth account connection flows
- [ ] Activation dashboard (status tracking)
- [ ] Approval queue (SuperAdmin)
- [ ] MMM dashboard (view model results)

### Phase 4.8: Testing & Polish

- [ ] End-to-end activation tests (all 3 platforms)
- [ ] Data ingestion validation
- [ ] MMM model training test
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Performance testing (1M+ identifiers)
- [ ] Documentation

## MMM Integration Flow

### 1. Data Collection (Automated Daily)

```
Google Ads API → BigQuery (google_ads_campaign_performance)
Meta Insights API → BigQuery (meta_campaign_performance)
TikTok Reporting API → BigQuery (tiktok_campaign_performance)
GA4 → BigQuery (events_*, users_*) [already configured]
```

### 2. Data Preparation (Data Science Agent)

```
User: "Prepare MMM training data for the last 12 months"
Agent → BigQuery (via MCP):
  - Execute SQL to create mmm_training_data
  - Add seasonality features
  - Handle missing data
  - Export to CSV for modeling
```

### 3. Model Training (Vertex AI Workbench / Custom Service)

```python
# Example: LightweightMMM (Google's open-source MMM)
import lightweight_mmm

# Load data from BigQuery
data = client.query("SELECT * FROM mmm_training_data").to_dataframe()

# Train model
mmm_model = lightweight_mmm.LightweightMMM()
mmm_model.fit(
    media=data[['google_ads_spend', 'meta_spend', 'tiktok_spend']],
    target=data['total_revenue'],
    extra_features=data[['day_of_week', 'month']]
)

# Get channel attribution
attribution = mmm_model.get_posterior_metrics()
```

### 4. Optimization (Agent-Assisted)

```
User: "What's the optimal budget allocation across channels?"
Agent → BigQuery:
  - Fetch MMM model results
  - Calculate ROAS by channel
  - Recommend budget reallocation
```

## Data Pipeline Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Ad Platforms (APIs)                       │
│  Google Ads API v22  │  Meta API v22.0  │  TikTok API v1.3  │
└─────────┬────────────┴──────────┬───────┴──────────┬────────┘
          │                       │                   │
          ↓                       ↓                   ↓
    ┌─────────────────────────────────────────────────────┐
    │         Data Ingestion Service (Cloud Run)          │
    │  Daily ETL jobs triggered by Cloud Scheduler        │
    └────────────────────────┬────────────────────────────┘
                             │
                             ↓
    ┌─────────────────────────────────────────────────────┐
    │              Google BigQuery                         │
    │  ├── GA4 events/users (native export)               │
    │  ├── google_ads_campaign_performance                │
    │  ├── meta_campaign_performance                      │
    │  ├── tiktok_campaign_performance                    │
    │  └── mmm_training_data (view)                       │
    └────────────────────────┬────────────────────────────┘
                             │
                             ↓
    ┌─────────────────────────────────────────────────────┐
    │    Data Science Agent (via MCP BigQuery)            │
    │  - Query all data (GA4 + ad platforms)              │
    │  - Generate SQL for MMM prep                        │
    │  - Identity matching queries                        │
    └────────────────────────┬────────────────────────────┘
                             │
                             ↓
    ┌─────────────────────────────────────────────────────┐
    │        MMM Models (Vertex AI Workbench)             │
    │  - LightweightMMM (Google)                          │
    │  - Robyn (Meta)                                     │
    │  - PyMC-Marketing                                   │
    │  - Custom time-series models                        │
    └─────────────────────────────────────────────────────┘
```

## Success Metrics

### Phase 4 Completion Criteria

- [ ] All 3 platform clients implemented (Google Ads, Meta, TikTok)
- [ ] OAuth connection working for all platforms
- [ ] Audience activation >95% success rate
- [ ] Daily data sync to BigQuery operational
- [ ] MMM training data view created
- [ ] Identity matching queries validated
- [ ] HITL governance workflows functional
- [ ] Frontend activation wizard complete
- [ ] 95% test coverage for new packages
- [ ] WCAG 2.1 AA accessibility compliance

### Business Metrics (Post-Launch)

- **Activation Volume:** Audiences activated per week
- **Match Rates:** Average match rate per platform (target >50%)
- **Data Freshness:** Ad data lag (target <24 hours)
- **MMM Model Accuracy:** MAPE <15% on holdout set
- **Channel ROAS:** By platform (from MMM model)
- **User Journey Coverage:** % of conversions with full attribution path

## Next Steps

1. ✅ Revise Phase 4 architecture
2. Build Google Ads client (Customer Match + Reporting + BQ Transfer)
3. Build Meta client (Custom Audiences + Insights)
4. Build TikTok client (Segments + Reporting)
5. Build data ingestion orchestration
6. Create MMM service endpoints
7. Build activation UX
8. Test end-to-end flow

---

**This revised architecture enables:**

- ✅ Advanced MMM with complete historical data
- ✅ GA4 identity matching in BigQuery
- ✅ Multi-touch attribution
- ✅ Incrementality testing
- ✅ Channel optimization via data-driven insights
