# BigQuery Queries

This directory contains pre-built SQL queries for common analytics tasks.

## Queries

### 1. `get_audience_size.sql` - Audience Size Estimation

Estimates audience size and provides detailed breakdown by various dimensions.

**Parameters:**

- `@audience_conditions` - WHERE clause conditions (injected dynamically)
- `@start_date` - Start date (YYYY-MM-DD)
- `@end_date` - End date (YYYY-MM-DD)

**Returns:**

- Total audience size
- Active users (7d, 30d, 90d)
- Breakdown by lifecycle stage, value segment, device
- Top 5 countries
- Revenue and engagement metrics
- Currency breakdown

**Use Cases:**

- Audience validation before activation
- Forecasting audience reach
- Audience composition analysis

**Example Usage:**

```bash
bq query --use_legacy_sql=false \
  --parameter=start_date:DATE:2025-01-01 \
  --parameter=end_date:DATE:2025-01-31 \
  < data/bq/queries/get_audience_size.sql
```

### 2. `get_session_trends.sql` - Session Trends Analysis

Analyzes session trends over time with customizable grouping.

**Parameters:**

- `@start_date` - Start date (YYYY-MM-DD)
- `@end_date` - End date (YYYY-MM-DD)
- `@group_by` - Grouping dimension: 'date', 'device', 'country', 'traffic_source'
- `@currency` - Currency filter (optional)

**Returns:**

- Session and user counts
- Engagement metrics (duration, events per session, bounce rate)
- Conversion metrics (rate, total conversions)
- Revenue metrics (total, per session, per user)
- Period-over-period growth rates
- Trend direction indicator

**Use Cases:**

- Analytics dashboard trends
- Performance monitoring
- Traffic source analysis
- Device performance comparison

**Example Usage:**

```bash
bq query --use_legacy_sql=false \
  --parameter=start_date:DATE:2025-01-01 \
  --parameter=end_date:DATE:2025-01-31 \
  --parameter=group_by:STRING:date \
  --parameter=currency:STRING:USD \
  < data/bq/queries/get_session_trends.sql
```

### 3. `get_audience_users.sql` - Audience User List

Retrieves detailed user list for audience activation.

**Parameters:**

- `@audience_id` - Audience ID (optional)
- `@audience_conditions` - WHERE clause conditions (injected dynamically)
- `@start_date` - Start date (YYYY-MM-DD)
- `@end_date` - End date (YYYY-MM-DD)
- `@limit` - Maximum users to return (default: 10000)

**Returns:**

- User IDs (unified_user_id and user_id)
- User metrics (sessions, conversions, revenue)
- Segmentation data
- Consent status
- Advertising eligibility flag
- Quality score (0-100)

**Use Cases:**

- Audience activation to ad platforms
- Customer list upload (Google Ads, Meta)
- User targeting
- Audience quality assessment

**Important:** Results ordered by quality_score and recency for best performance.

**Example Usage:**

```bash
bq query --use_legacy_sql=false \
  --parameter=audience_id:STRING:aud_123 \
  --parameter=start_date:DATE:2025-01-01 \
  --parameter=end_date:DATE:2025-01-31 \
  --parameter=limit:INT64:10000 \
  < data/bq/queries/get_audience_users.sql
```

### 4. `get_conversion_funnel.sql` - Conversion Funnel Analysis

Analyzes conversion funnel with step-by-step metrics and drop-off analysis.

**Parameters:**

- `@funnel_steps` - Array of event names (e.g., ['page_view', 'add_to_cart', 'purchase'])
- `@start_date` - Start date (YYYY-MM-DD)
- `@end_date` - End date (YYYY-MM-DD)
- `@device_category` - Device filter (optional)
- `@country` - Country filter (optional)

**Returns:**

- Users at each step
- Conversion rates between steps
- Average time between steps
- Overall funnel metrics
- Drop-off analysis

**Use Cases:**

- Funnel optimization
- Identifying friction points
- A/B testing funnel changes
- UX improvement prioritization

**Example Usage:**

```bash
bq query --use_legacy_sql=false \
  --parameter=start_date:DATE:2025-01-01 \
  --parameter=end_date:DATE:2025-01-31 \
  --parameter=funnel_steps:ARRAY<STRING>:["page_view","add_to_cart","begin_checkout","purchase"] \
  < data/bq/queries/get_conversion_funnel.sql
```

## Using Queries in Code

### TypeScript/Node.js

```typescript
import { BigQueryClient } from '@random-truffle/bigquery';
import { readFileSync } from 'fs';

const client = new BigQueryClient();

// Read query from file
const queryTemplate = readFileSync('data/bq/queries/get_session_trends.sql', 'utf8');

// Replace template variables
const query = queryTemplate
  .replace(/\$\{project_id\}/g, 'your-project-id')
  .replace(/\$\{dataset_id\}/g, 'random_truffle_analytics');

// Execute with parameters
const result = await client.query({
  query,
  params: {
    start_date: '2025-01-01',
    end_date: '2025-01-31',
    group_by: 'date',
    currency: 'USD',
  },
});

console.log(result.rows);
```

### Python

```python
from google.cloud import bigquery

client = bigquery.Client()

# Read query from file
with open('data/bq/queries/get_session_trends.sql', 'r') as f:
    query_template = f.read()

# Replace template variables
query = query_template \
    .replace('${project_id}', 'your-project-id') \
    .replace('${dataset_id}', 'random_truffle_analytics')

# Execute with parameters
job_config = bigquery.QueryJobConfig(
    query_parameters=[
        bigquery.ScalarQueryParameter('start_date', 'DATE', '2025-01-01'),
        bigquery.ScalarQueryParameter('end_date', 'DATE', '2025-01-31'),
        bigquery.ScalarQueryParameter('group_by', 'STRING', 'date'),
        bigquery.ScalarQueryParameter('currency', 'STRING', 'USD'),
    ]
)

results = client.query(query, job_config=job_config)
for row in results:
    print(row)
```

## Dynamic Audience Conditions

For queries that use `@audience_conditions`, conditions must be injected into the SQL before execution. This is done in the application layer for security:

```typescript
// Bad: SQL injection risk
const conditions = userInput; // DANGEROUS!

// Good: Use parameterized conditions
const conditions = buildAudienceConditions({
  total_revenue: { operator: '>', value: 100 },
  country: { operator: '=', value: 'US' },
});
// Returns: "total_revenue > 100 AND country = 'US'"
```

## Performance Optimization

1. **Always use date filters** - Include date range parameters
2. **Set reasonable limits** - Use LIMIT clause to avoid large result sets
3. **Use dry runs** - Estimate costs before running queries
4. **Cache results** - Cache frequently accessed results (5-minute TTL)
5. **Monitor costs** - Set query cost alerts

## References

- ADR-007: BigQuery Integration
- ADR-009: Session Stitching
- ADR-010: Multi-Currency Support
- [BigQuery Query Syntax](https://cloud.google.com/bigquery/docs/reference/standard-sql/query-syntax)
