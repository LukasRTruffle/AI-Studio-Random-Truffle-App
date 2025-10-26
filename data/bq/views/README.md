# BigQuery Views

This directory contains SQL view definitions for Random Truffle's aggregated analytics.

## Views

### 1. `cortex_ga4_sessions` - Cortex GA4 Sessions View

Transforms raw GA4 BigQuery export data into our standardized sessions format.

**Purpose:** Bridge between GA4's native export format and our internal schema

**Data Source:** `events_*` tables (GA4 raw export, sharded by date)

**Key Transformations:**

- Aggregates events into sessions
- Extracts session ID from event parameters
- Applies session stitching (unified_user_id)
- Extracts consent status from event parameters
- Calculates session metrics (events, conversions, revenue)

**Refresh:** Real-time (view queries raw GA4 data)

**Use Cases:**

- Importing GA4 data into our sessions table
- Validating data pipeline
- Ad-hoc GA4 data analysis

### 2. `daily_kpis` - Daily KPIs View

Aggregates daily metrics from sessions and conversions for analytics dashboards.

**Purpose:** Provide high-level daily metrics for executive dashboards

**Data Source:** `sessions` and `conversions` tables

**Metrics Provided:**

- User metrics: total_users, revenue_per_user
- Session metrics: total_sessions, avg_session_duration, bounce_rate, sessions_per_user
- Event metrics: total_events, events_per_session
- Conversion metrics: total_conversions, conversion_rate, total_revenue, avg_order_value

**Refresh:** Daily (via scheduled query or manual refresh)

**Use Cases:**

- Analytics dashboard
- Daily performance reports
- Trend analysis
- Goal tracking

### 3. `audience_metrics` - Audience Metrics View

Calculates daily performance metrics for each audience.

**Purpose:** Track audience performance for optimization and reporting

**Data Source:** `user_attributes` table

**Metrics Provided:**

- Size metrics: total_users, active_users_7d, active_users_30d
- Revenue metrics: total_revenue, avg_revenue_per_user, avg_order_value
- Conversion metrics: total_conversions, conversions_per_user
- Engagement metrics: active_user_rate_7d, active_user_rate_30d, engagement_score

**Refresh:** Daily (via scheduled query)

**Use Cases:**

- Audience performance dashboards
- A/B testing analysis
- Audience ROI calculation
- Activation optimization

## Multi-Currency Support (ADR-010)

All views support multi-currency tracking:

- Metrics are grouped by `currency`
- Revenue values stored in original currency
- Future: Add `value_usd` for cross-currency comparison

Supported currencies: USD, MXN, COP

## Deployment

To create these views in BigQuery:

```bash
# Set environment variables
export GCP_PROJECT_ID="your-project-id"
export BIGQUERY_DATASET_ID="random_truffle_analytics"

# Create views
for view in data/bq/views/*.sql; do
  # Replace template variables
  sed -e "s/\${project_id}/${GCP_PROJECT_ID}/g" \
      -e "s/\${dataset_id}/${BIGQUERY_DATASET_ID}/g" \
      "$view" | bq query --use_legacy_sql=false
done
```

Or use the provided deployment script:

```bash
./data/bq/scripts/deploy-views.sh
```

## Scheduled Refreshes

### Recommended Schedule

- **cortex_ga4_sessions:** Real-time (view, no refresh needed)
- **daily_kpis:** Daily at 2:00 AM UTC
- **audience_metrics:** Daily at 3:00 AM UTC

### Creating Scheduled Queries

```sql
-- Example: Schedule daily_kpis refresh
CREATE OR REPLACE PROCEDURE `${project_id}.${dataset_id}.refresh_daily_kpis`()
BEGIN
  -- View refresh happens automatically when queried
  -- This procedure can be used for additional processing
  SELECT 'daily_kpis refreshed' AS status;
END;

-- Schedule with Cloud Scheduler
-- gcloud scheduler jobs create pubsub refresh-daily-kpis \
--   --schedule="0 2 * * *" \
--   --topic=bigquery-refresh \
--   --message-body='{"procedure": "refresh_daily_kpis"}'
```

## Performance Optimization

### Best Practices

1. **Use date filters** - All views filter last 90 days by default
2. **Materialize for production** - Consider materializing views as tables for better performance:
   ```sql
   CREATE TABLE `${project_id}.${dataset_id}.daily_kpis_materialized`
   PARTITION BY date
   AS SELECT * FROM `${project_id}.${dataset_id}.daily_kpis`;
   ```
3. **Monitor costs** - Views scan underlying tables on every query
4. **Cache results** - Cache view results in application layer (5-minute TTL)

### Query Cost Estimation

```bash
# Dry run to estimate costs
bq query --dry_run --use_legacy_sql=false \
  "SELECT * FROM \`${GCP_PROJECT_ID}.${BIGQUERY_DATASET_ID}.daily_kpis\`
   WHERE date >= DATE_SUB(CURRENT_DATE(), INTERVAL 7 DAY)"
```

## References

- ADR-007: BigQuery Integration
- ADR-008: GA4 Consent Mode
- ADR-009: Session Stitching
- ADR-010: Multi-Currency Support
- [BigQuery Best Practices](https://cloud.google.com/bigquery/docs/best-practices)
