/**
 * Cloud Scheduler Configuration
 *
 * Automated daily ETL jobs for ad platform data
 */

/**
 * Cloud Scheduler job configuration
 */
export interface SchedulerJobConfig {
  name: string;
  schedule: string; // Cron expression
  timezone: string;
  httpTarget: {
    uri: string; // Cloud Run service URL
    httpMethod: 'POST' | 'GET';
    headers?: Record<string, string>;
    body?: string; // Base64 encoded
  };
  retryConfig?: {
    retryCount: number;
    maxRetryDuration: string;
    minBackoffDuration: string;
    maxBackoffDuration: string;
  };
}

/**
 * Default scheduler configurations for all platforms
 */
export const SCHEDULER_CONFIGS: Record<string, SchedulerJobConfig> = {
  /**
   * Google Ads daily sync
   * Runs at 3:00 AM UTC every day
   */
  GOOGLE_ADS_DAILY: {
    name: 'google-ads-daily-sync',
    schedule: '0 3 * * *', // 3 AM UTC
    timezone: 'UTC',
    httpTarget: {
      uri: '{CLOUD_RUN_SERVICE_URL}/sync/google-ads/daily', // Replace with actual URL
      httpMethod: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from(
        JSON.stringify({
          type: 'daily',
          platform: 'google-ads',
        })
      ).toString('base64'),
    },
    retryConfig: {
      retryCount: 3,
      maxRetryDuration: '3600s', // 1 hour
      minBackoffDuration: '5s',
      maxBackoffDuration: '300s', // 5 minutes
    },
  },

  /**
   * Meta daily sync
   * Runs at 3:15 AM UTC every day (staggered to avoid resource contention)
   */
  META_DAILY: {
    name: 'meta-daily-sync',
    schedule: '15 3 * * *', // 3:15 AM UTC
    timezone: 'UTC',
    httpTarget: {
      uri: '{CLOUD_RUN_SERVICE_URL}/sync/meta/daily',
      httpMethod: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from(
        JSON.stringify({
          type: 'daily',
          platform: 'meta',
        })
      ).toString('base64'),
    },
    retryConfig: {
      retryCount: 3,
      maxRetryDuration: '3600s',
      minBackoffDuration: '5s',
      maxBackoffDuration: '300s',
    },
  },

  /**
   * TikTok daily sync
   * Runs at 3:30 AM UTC every day
   */
  TIKTOK_DAILY: {
    name: 'tiktok-daily-sync',
    schedule: '30 3 * * *', // 3:30 AM UTC
    timezone: 'UTC',
    httpTarget: {
      uri: '{CLOUD_RUN_SERVICE_URL}/sync/tiktok/daily',
      httpMethod: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: Buffer.from(
        JSON.stringify({
          type: 'daily',
          platform: 'tiktok',
        })
      ).toString('base64'),
    },
    retryConfig: {
      retryCount: 3,
      maxRetryDuration: '3600s',
      minBackoffDuration: '5s',
      maxBackoffDuration: '300s',
    },
  },

  /**
   * Weekly data quality check
   * Runs every Monday at 4:00 AM UTC
   */
  DATA_QUALITY_CHECK: {
    name: 'data-quality-weekly-check',
    schedule: '0 4 * * 1', // Monday 4 AM UTC
    timezone: 'UTC',
    httpTarget: {
      uri: '{CLOUD_RUN_SERVICE_URL}/quality/check',
      httpMethod: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    },
    retryConfig: {
      retryCount: 1,
      maxRetryDuration: '1800s', // 30 minutes
      minBackoffDuration: '10s',
      maxBackoffDuration: '60s',
    },
  },
};

/**
 * Terraform configuration for Cloud Scheduler jobs
 *
 * Copy this to infra/terraform/scheduler.tf
 */
export const TERRAFORM_SCHEDULER_CONFIG = `
# Cloud Scheduler jobs for ad platform data ingestion

resource "google_cloud_scheduler_job" "google_ads_daily_sync" {
  name             = "google-ads-daily-sync"
  description      = "Daily sync of Google Ads campaign performance to BigQuery"
  schedule         = "0 3 * * *"
  time_zone        = "UTC"
  attempt_deadline = "320s"

  retry_config {
    retry_count          = 3
    max_retry_duration   = "3600s"
    min_backoff_duration = "5s"
    max_backoff_duration = "300s"
  }

  http_target {
    http_method = "POST"
    uri         = "\${var.cloud_run_service_url}/sync/google-ads/daily"

    headers = {
      "Content-Type" = "application/json"
    }

    body = base64encode(jsonencode({
      type     = "daily"
      platform = "google-ads"
    }))

    oidc_token {
      service_account_email = google_service_account.data_ingestion.email
    }
  }
}

resource "google_cloud_scheduler_job" "meta_daily_sync" {
  name             = "meta-daily-sync"
  description      = "Daily sync of Meta campaign performance to BigQuery"
  schedule         = "15 3 * * *"
  time_zone        = "UTC"
  attempt_deadline = "320s"

  retry_config {
    retry_count          = 3
    max_retry_duration   = "3600s"
    min_backoff_duration = "5s"
    max_backoff_duration = "300s"
  }

  http_target {
    http_method = "POST"
    uri         = "\${var.cloud_run_service_url}/sync/meta/daily"

    headers = {
      "Content-Type" = "application/json"
    }

    body = base64encode(jsonencode({
      type     = "daily"
      platform = "meta"
    }))

    oidc_token {
      service_account_email = google_service_account.data_ingestion.email
    }
  }
}

resource "google_cloud_scheduler_job" "tiktok_daily_sync" {
  name             = "tiktok-daily-sync"
  description      = "Daily sync of TikTok campaign performance to BigQuery"
  schedule         = "30 3 * * *"
  time_zone        = "UTC"
  attempt_deadline = "320s"

  retry_config {
    retry_count          = 3
    max_retry_duration   = "3600s"
    min_backoff_duration = "5s"
    max_backoff_duration = "300s"
  }

  http_target {
    http_method = "POST"
    uri         = "\${var.cloud_run_service_url}/sync/tiktok/daily"

    headers = {
      "Content-Type" = "application/json"
    }

    body = base64encode(jsonencode({
      type     = "daily"
      platform = "tiktok"
    }))

    oidc_token {
      service_account_email = google_service_account.data_ingestion.email
    }
  }
}

# Service account for data ingestion
resource "google_service_account" "data_ingestion" {
  account_id   = "data-ingestion-sa"
  display_name = "Data Ingestion Service Account"
  description  = "Service account for Cloud Scheduler and Cloud Run data ingestion jobs"
}

# IAM roles for service account
resource "google_project_iam_member" "data_ingestion_bigquery_user" {
  project = var.project_id
  role    = "roles/bigquery.dataEditor"
  member  = "serviceAccount:\${google_service_account.data_ingestion.email}"
}

resource "google_project_iam_member" "data_ingestion_run_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:\${google_service_account.data_ingestion.email}"
}
`;

/**
 * Docker configuration for Cloud Run service
 *
 * Create this as services/data-ingestion/Dockerfile
 */
export const DOCKERFILE_CONFIG = `
FROM node:20-alpine

WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./
COPY packages/data-ingestion/package.json ./packages/data-ingestion/

# Install dependencies
RUN npm install -g pnpm && pnpm install --frozen-lockfile

# Copy source code
COPY packages/data-ingestion ./packages/data-ingestion
COPY packages/types ./packages/types
COPY packages/bigquery ./packages/bigquery
COPY packages/google-ads-client ./packages/google-ads-client

# Build
RUN pnpm --filter @random-truffle/data-ingestion build

# Expose port
EXPOSE 8080

# Start service
CMD ["node", "packages/data-ingestion/dist/server.js"]
`;
