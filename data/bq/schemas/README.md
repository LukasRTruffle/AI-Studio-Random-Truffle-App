# BigQuery Schemas

This directory contains SQL schema definitions for Random Truffle's BigQuery tables.

## Tables

### 1. `sessions` - GA4 Session Data

Stores session-level data from GA4 BigQuery export with user stitching.

**Key Features:**

- Partitioned by `session_start_date` (required for queries)
- Clustered by `unified_user_id`, `device_category`, `country`
- Includes GA4 Consent Mode status
- Multi-currency support (USD, MXN, COP)

**Primary Use Cases:**

- Session trend analysis
- User journey tracking
- Traffic source attribution

### 2. `events` - GA4 Event Data

Stores event-level data from GA4 BigQuery export with full event parameters.

**Key Features:**

- Partitioned by `event_date` (required for queries)
- Clustered by `event_name`, `unified_user_id`, `session_id`
- JSON event parameters and user properties
- E-commerce transaction data

**Primary Use Cases:**

- Event funnel analysis
- User behavior tracking
- Product analytics

### 3. `conversions` - Conversion Events

Stores conversion events with revenue and attribution data.

**Key Features:**

- Partitioned by `conversion_date` (required for queries)
- Clustered by `conversion_type`, `unified_user_id`, `currency`
- Multi-currency revenue tracking
- Attribution model support
- Audience membership tracking

**Primary Use Cases:**

- Revenue attribution
- Conversion rate optimization
- ROI analysis by audience

### 4. `user_attributes` - User-Level Attributes

Stores aggregated user-level attributes for audience building.

**Key Features:**

- Clustered by `unified_user_id`, `country`, `device_category`, `user_lifecycle_stage`
- Updated daily via scheduled query
- Behavioral segments (lifecycle, value, engagement)
- First and last touch attribution

**Primary Use Cases:**

- Audience segmentation
- User profiling
- Predictive modeling

## Session Stitching (ADR-009)

All tables use `unified_user_id` which is calculated as:

```sql
COALESCE(user_id, user_pseudo_id) AS unified_user_id
```

This enables cross-session tracking for:

- Anonymous users (using `user_pseudo_id`)
- Logged-in users (using `user_id`)
- Cross-device tracking (when user logs in)

## Consent Mode (ADR-008)

All tables include consent status fields per GA4 Consent Mode:

- `consent_ad_storage` - Ad storage consent
- `consent_analytics_storage` - Analytics storage consent
- `consent_ad_user_data` - Ad user data consent
- `consent_ad_personalization` - Ad personalization consent

Values: `'granted'` or `'denied'`

## Multi-Currency Support (ADR-010)

All revenue fields support multiple currencies:

- `currency` - Currency code (USD, MXN, COP)
- `value` - Revenue in original currency
- `value_usd` - Revenue converted to USD (future implementation)

## Deployment

To create these tables in BigQuery:

```bash
# Set environment variables
export GCP_PROJECT_ID="your-project-id"
export BIGQUERY_DATASET_ID="random_truffle_analytics"

# Create tables
for schema in data/bq/schemas/*.sql; do
  # Replace template variables
  sed -e "s/\${project_id}/${GCP_PROJECT_ID}/g" \
      -e "s/\${dataset_id}/${BIGQUERY_DATASET_ID}/g" \
      "$schema" | bq query --use_legacy_sql=false
done
```

Or use the provided deployment script:

```bash
./data/bq/scripts/deploy-schemas.sh
```

## Best Practices

1. **Always use partition filters** - All partitioned tables require partition filters in queries
2. **Use clustering columns** - Include clustering columns in WHERE clauses for better performance
3. **Limit query scope** - Use date ranges to limit data scanned
4. **Monitor costs** - Check query costs before execution (dry run)

## References

- ADR-007: BigQuery Integration
- ADR-008: GA4 Consent Mode
- ADR-009: Session Stitching
- ADR-010: Multi-Currency Support
