# Deployment Guide

This guide covers deploying Random Truffle to production with proper security headers and configuration.

## Build Configuration

The app uses Next.js static export (`output: 'export'` in next.config.mjs) for deployment to:

- Google Cloud Storage + Cloud CDN
- Vercel
- Netlify
- Any static hosting service

## Building for Production

```bash
npm run build
```

This generates a static site in the `out/` directory with all routes pre-rendered as HTML.

## Security Headers

### Important: Static Export Limitation

**CSP headers cannot be configured in next.config.mjs when using `output: 'export'`.**

The headers section in next.config.mjs only works with Next.js server (not static export). For static exports, headers must be configured at the deployment platform level.

### Content Security Policy (CSP)

Recommended CSP configuration for production:

```
Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://cdn.tailwindcss.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
```

**Breakdown:**

- `default-src 'self'` - Only allow resources from same origin by default
- `script-src 'self' 'unsafe-inline' 'unsafe-eval'` - Allow inline scripts (required for React hydration)
- `style-src 'self' 'unsafe-inline'` - Allow inline styles (required for Tailwind CSS)
- `font-src 'self' https://fonts.gstatic.com` - Allow Google Fonts
- `img-src 'self' data: https:` - Allow images from same origin, data URIs, and HTTPS sources
- `connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com` - Allow API calls to Gemini and GCP APIs
- `frame-ancestors 'none'` - Prevent clickjacking (same as X-Frame-Options: DENY)
- `base-uri 'self'` - Restrict base URL
- `form-action 'self'` - Only allow form submissions to same origin

**Note:** In production, tighten `'unsafe-inline'` and `'unsafe-eval'` by using nonces or hashes once the app moves to server-side rendering in Phase 1.

### Additional Security Headers

Recommended headers for production:

```
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
X-XSS-Protection: 1; mode=block
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: camera=(), microphone=(), geolocation=()
Strict-Transport-Security: max-age=63072000; includeSubDomains; preload
```

## Deployment Platforms

### Google Cloud Storage + Cloud CDN (Recommended)

#### 1. Build the App

```bash
npm run build
```

#### 2. Upload to Cloud Storage

```bash
# Create bucket (one-time setup)
gcloud storage buckets create gs://random-truffle-frontend \
  --location=us-central1 \
  --uniform-bucket-level-access

# Upload static files
gcloud storage rsync out/ gs://random-truffle-frontend/ \
  --recursive \
  --delete-unmatched-destination-objects

# Make bucket public
gcloud storage buckets add-iam-policy-binding gs://random-truffle-frontend \
  --member=allUsers \
  --role=roles/storage.objectViewer
```

#### 3. Configure Cloud CDN

```bash
# Create backend bucket
gcloud compute backend-buckets create random-truffle-backend \
  --gcs-bucket-name=random-truffle-frontend \
  --enable-cdn

# Create URL map
gcloud compute url-maps create random-truffle-url-map \
  --default-backend-bucket=random-truffle-backend

# Create target HTTP proxy
gcloud compute target-http-proxies create random-truffle-http-proxy \
  --url-map=random-truffle-url-map

# Create forwarding rule
gcloud compute forwarding-rules create random-truffle-forwarding-rule \
  --global \
  --target-http-proxy=random-truffle-http-proxy \
  --ports=80
```

#### 4. Configure Security Headers (Cloud CDN)

Currently, Cloud CDN does not support custom response headers directly. Options:

**Option A: Cloud Load Balancer with Cloud Armor** (Recommended for production)

```bash
# Create Cloud Armor security policy
gcloud compute security-policies create random-truffle-security-policy \
  --description "Security policy for Random Truffle"

# Add custom headers via Cloud Armor rules (requires manual setup in Console)
# Navigate to: Network Security > Cloud Armor > Policies > random-truffle-security-policy
# Add custom headers in the policy rules
```

**Option B: Cloud Functions for header injection**

Deploy a Cloud Function that proxies requests and adds headers:

```javascript
exports.addHeaders = (req, res) => {
  res.set('Content-Security-Policy', "default-src 'self'; ...");
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  // ... other headers

  // Proxy request to Cloud Storage
  // (implementation details)
};
```

**Option C: Service Worker** (Client-side, less secure)

Not recommended for security-critical headers like CSP.

**Recommendation:** Use Cloud Load Balancer with Cloud Armor for production deployment.

#### 5. Configure Custom Domain (Optional)

```bash
# Reserve static IP
gcloud compute addresses create random-truffle-ip --global

# Get IP address
gcloud compute addresses describe random-truffle-ip --global

# Update DNS A record to point to this IP
# Configure SSL certificate (managed or upload)
gcloud compute ssl-certificates create random-truffle-cert \
  --domains=app.randomtruffle.com
```

### Vercel (Alternative)

Vercel automatically handles headers and deployment.

#### 1. Install Vercel CLI

```bash
npm install -g vercel
```

#### 2. Deploy

```bash
vercel
```

#### 3. Configure Headers (vercel.json)

Create `vercel.json` in project root:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Content-Security-Policy",
          "value": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
        },
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Referrer-Policy",
          "value": "strict-origin-when-cross-origin"
        },
        {
          "key": "Permissions-Policy",
          "value": "camera=(), microphone=(), geolocation=()"
        }
      ]
    }
  ]
}
```

### Netlify (Alternative)

#### 1. Install Netlify CLI

```bash
npm install -g netlify-cli
```

#### 2. Deploy

```bash
netlify deploy --prod
```

#### 3. Configure Headers (\_headers)

Create `public/_headers` file:

```
/*
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://generativelanguage.googleapis.com https://*.googleapis.com; frame-ancestors 'none'; base-uri 'self'; form-action 'self'
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  X-XSS-Protection: 1; mode=block
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

## Environment Variables

Configure environment variables in deployment platform:

### Required:

- `GEMINI_API_KEY` - Gemini API key for AI features

### Optional (Phase 1+):

- `OKTA_DOMAIN` - Okta domain for authentication
- `OKTA_CLIENT_ID` - Okta client ID
- `OKTA_CLIENT_SECRET` - Okta client secret
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

## Monitoring and Analytics

### Performance Monitoring

- **Lighthouse CI:** Run in CI/CD pipeline to ensure Lighthouse score > 90
- **Web Vitals:** Monitor Core Web Vitals (LCP, FID, CLS)
- **Cloud Monitoring:** Set up uptime checks and alerting

### Error Tracking

Phase 1+ will integrate:

- **Sentry:** Error tracking and performance monitoring
- **Cloud Logging:** Centralized logging for backend services

## Deployment Checklist

Before deploying to production:

- [ ] Run `npm run build` successfully
- [ ] Test production build locally with `npm run start`
- [ ] Verify all routes load correctly
- [ ] Run `make check` to ensure code quality
- [ ] Test all critical user flows (login, audience creation, etc.)
- [ ] Configure security headers in deployment platform
- [ ] Set up custom domain with SSL certificate
- [ ] Configure environment variables
- [ ] Set up monitoring and alerting
- [ ] Review CSP policy for any blocked resources
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices
- [ ] Run Lighthouse audit (target score > 90)

## Rollback Procedure

### Cloud Storage

```bash
# List object versions
gcloud storage ls -L gs://random-truffle-frontend/

# Restore previous version
gcloud storage cp gs://random-truffle-frontend/index.html#<generation> \
  gs://random-truffle-frontend/index.html
```

### Vercel

```bash
# List deployments
vercel ls

# Promote previous deployment
vercel promote <deployment-url>
```

### Netlify

```bash
# Rollback to previous deployment via Netlify UI
# Deploys > Previous deploys > Publish deploy
```

## CI/CD Integration

Phase 1+ will include automated deployment via GitHub Actions:

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 18
      - run: npm install
      - run: make check
      - run: npm run build
      - run: vercel deploy --prod --token ${{ secrets.VERCEL_TOKEN }}
```

## Support

For deployment issues:

1. Check deployment platform logs
2. Verify environment variables are set correctly
3. Test production build locally first
4. Review security headers with browser DevTools
5. Check CSP violations in browser console

## Phase 1 Migration Note

When migrating to server-side rendering in Phase 1 (Turborepo monorepo + NestJS backend):

- Remove `output: 'export'` from next.config.mjs
- Configure headers in next.config.mjs directly
- Deploy frontend to Vercel or Cloud Run
- Deploy backend API to Cloud Run
- Update CORS configuration
- Implement server-side authentication with Okta

---

**Last Updated:** Phase 0 Complete (October 2025)
