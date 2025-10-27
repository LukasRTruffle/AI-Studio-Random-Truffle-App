# Random Truffle - Demo Deployment Guide

**Purpose:** Get the POC running for demo presentations
**Timeline:** ~30-45 minutes
**Cost:** Free (Auth0 free tier + local dev)

---

## Prerequisites

- Node.js 18+ installed
- pnpm installed (`npm install -g pnpm`)
- Docker Desktop installed and running
- Git repository cloned

---

## Quick Start (3 Steps)

### Step 1: Install Dependencies (5 minutes)

```bash
# From project root
pnpm install

# Install Auth0 dependencies
bash scripts/setup-auth0.sh
```

### Step 2: Configure Services (20 minutes)

#### 2.1 Start PostgreSQL

```bash
docker run --name random-truffle-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=random_truffle \
  -p 5432:5432 -d postgres:14
```

#### 2.2 Create Auth0 Account

Follow **AUTH0_SETUP.md** (Steps 1-4)

Quick summary:

1. Sign up at https://auth0.com/signup (free, no credit card)
2. Create application (Single Page Application)
3. Create API with identifier: `https://api.random-truffle.com`
4. Copy credentials

#### 2.3 Get Meta App Credentials

**What I need from you:**

- Meta App ID
- Meta App Secret

If you don't have these yet:

1. Go to https://developers.facebook.com/apps
2. Create new app → Add Marketing API product
3. Copy App ID and App Secret from Settings → Basic

#### 2.4 Configure Backend

Create `services/api/.env`:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=random_truffle
NODE_ENV=development
PORT=3001

# API URLs
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Auth0 (from your Auth0 dashboard)
AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN
AUTH0_AUDIENCE=https://api.random-truffle.com
AUTH0_ISSUER=https://YOUR_AUTH0_DOMAIN/

# Meta OAuth (from Meta Developer Portal)
META_APP_ID=YOUR_META_APP_ID
META_APP_SECRET=YOUR_META_APP_SECRET
```

#### 2.5 Configure Frontend

Create `apps/web/.env.local`:

```bash
# Auth0 (from your Auth0 dashboard)
AUTH0_SECRET=use_openssl_rand_hex_32_here
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR_AUTH0_DOMAIN
AUTH0_CLIENT_ID=YOUR_CLIENT_ID
AUTH0_CLIENT_SECRET=YOUR_CLIENT_SECRET
AUTH0_AUDIENCE=https://api.random-truffle.com

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

Generate AUTH0_SECRET:

```bash
openssl rand -hex 32
```

### Step 3: Run Demo (5 minutes)

#### 3.1 Run Database Migrations

```bash
cd services/api
npm run migration:run
```

#### 3.2 Start Backend

```bash
# Terminal 1
cd services/api
npm run dev
```

Wait for: `API server running on http://localhost:3001/api`

#### 3.3 Start Frontend

```bash
# Terminal 2
cd apps/web
npm run dev
```

Wait for: `Ready on http://localhost:3000`

---

## Testing the Demo

### Test 1: Authentication Flow

1. Open http://localhost:3000
2. You should be redirected to Auth0 login
3. Sign up or log in
4. Should redirect back to app authenticated
5. ✅ Success: You see the dashboard

### Test 2: Create Tenant

1. Go to http://localhost:3000/welcome
2. Complete onboarding form
3. Submit tenant creation
4. ✅ Success: Tenant created in database

Verify in database:

```bash
docker exec -it random-truffle-postgres psql -U postgres -d random_truffle

SELECT id, name, industry FROM tenants;
```

### Test 3: Meta OAuth

1. Go to http://localhost:3000/connections/ad-platforms
2. Click "Connect Meta"
3. Authorize on Meta
4. ✅ Success: Redirected back with success message

Verify in database:

```bash
SELECT platform, "accountId", "accountName" FROM platform_connections;
```

---

## Demo Script (For Presentations)

### Introduction (1 minute)

"Random Truffle is an AI-powered marketing intelligence platform that helps marketers build audiences and activate them across multiple channels."

### Feature 1: Agentic Onboarding (2 minutes)

1. Show `/welcome` page
2. Demonstrate conversational UI
3. Fill out company information
4. Show real-time tenant creation
5. **Key point:** "AI guides users through setup"

### Feature 2: Authentication (1 minute)

1. Log out
2. Show Auth0 login redirect
3. Log back in
4. **Key point:** "Enterprise-grade authentication with Auth0"

### Feature 3: Platform Connections (3 minutes)

1. Go to `/connections/ad-platforms`
2. Show platform cards (Google Ads, Meta, TikTok)
3. Click "Connect Meta"
4. Show OAuth flow
5. Show successful connection
6. **Key point:** "Real OAuth integration with ad platforms"

### Feature 4: Database Persistence (1 minute)

1. Open database query
2. Show tenants table
3. Show platform_connections table
4. **Key point:** "All data persisted in PostgreSQL"

### Conclusion (1 minute)

"This is 15% of the final product. Next phases include:

- BigQuery integration for analytics
- AI agents for audience building
- Multi-channel activation
- Campaign management"

---

## Demo Tips

### Do's ✅

- Test the demo flow before presenting
- Have backup slides ready
- Keep terminal windows visible (shows real tech)
- Explain what's happening at each step
- Show the database to prove it's real

### Don'ts ❌

- Don't skip the Auth0 setup (authentication is impressive)
- Don't rush through the Meta OAuth (it's a real integration)
- Don't hide errors (acknowledge and move on)
- Don't promise features that aren't built yet

---

## Troubleshooting

### Issue: "Auth0 configuration error"

**Cause:** Missing or incorrect Auth0 credentials

**Fix:**

1. Double-check `.env.local` has all AUTH0\_\* variables
2. Verify AUTH0_DOMAIN includes `.auth0.com`
3. Ensure AUTH0_AUDIENCE matches API identifier in Auth0

### Issue: "Database connection failed"

**Cause:** PostgreSQL not running

**Fix:**

```bash
docker ps  # Check if postgres container is running
docker start random-truffle-postgres  # If stopped
```

### Issue: "Meta OAuth fails"

**Cause:** Missing Meta credentials or wrong redirect URI

**Fix:**

1. Check META_APP_ID and META_APP_SECRET in `services/api/.env`
2. In Meta Developer Portal, verify redirect URI:
   `http://localhost:3001/api/auth/meta/callback`

### Issue: "CORS error in browser"

**Cause:** Backend CORS not configured for frontend URL

**Fix:**

1. Check `services/api/.env` has `CORS_ORIGIN=http://localhost:3000`
2. Restart backend

### Issue: "JWT verification failed"

**Cause:** Auth0 domain or audience mismatch

**Fix:**

1. Verify `AUTH0_DOMAIN` is same in frontend and backend
2. Verify `AUTH0_AUDIENCE` matches API identifier in Auth0
3. Check `AUTH0_ISSUER` ends with `/`

---

## What's Demo-Ready vs What's Not

### ✅ Demo-Ready (Working)

- Auth0 authentication (login/logout)
- Tenant creation with database persistence
- Meta OAuth integration (real)
- Frontend-backend API communication
- Role-based access control (configured)
- PostgreSQL database with migrations
- Agentic conversational UI

### ⏳ Not Yet Implemented

- Google Ads OAuth (UI shows mock)
- TikTok OAuth (UI shows mock)
- BigQuery integration
- Audience activation (UI only)
- AI agents (placeholder)
- Analytics dashboard (mock data)
- Campaign management

### 🚫 Not Production-Ready

- Token encryption (stored in plain text)
- Rate limiting (not implemented)
- Error monitoring (no Sentry)
- Logging (console.log only)
- Testing (0% coverage)
- CI/CD pipeline

---

## After the Demo

### If Demo Goes Well 🎉

Next steps:

1. Deploy to production (Vercel + Cloud Run)
2. Implement remaining OAuth integrations
3. Add BigQuery integration (Phase 2)
4. Build AI agents (Phase 3)

Estimated timeline: 4-8 weeks for production-ready

### If You Need Changes

Common requests:

1. "Can you add Google Ads?" → Yes, 3-5 days
2. "Can we change the UI?" → Yes, specify what
3. "Can we add feature X?" → Depends, let's discuss

---

## Cost Breakdown

### Development (Local Demo)

- Auth0: Free (up to 7,000 users)
- PostgreSQL: Free (Docker local)
- Meta API: Free (developer mode)
- **Total: $0/month**

### Production Deployment

- Frontend (Vercel): Free hobby tier
- Backend (Cloud Run): ~$15-50/month
- Database (Cloud SQL): ~$20-75/month
- Auth0: Free (up to 7,000 users)
- **Total: ~$35-125/month**

---

## Getting Help

### During Setup

- **Auth0 issues:** See AUTH0_SETUP.md
- **Database issues:** See DATABASE_SETUP.md
- **General setup:** See POC_SETUP.md

### During Demo

- **Quick fix:** Restart services and try again
- **Can't fix quickly:** Have backup slides ready

### After Demo

- **Architecture questions:** See ARCHITECTURE_REVIEW.md
- **Production deployment:** See POC_REVIEW.md (deployment section)

---

## Contact Info for Auth0/Meta

**Auth0 Support:**

- Docs: https://auth0.com/docs
- Community: https://community.auth0.com

**Meta Developer Support:**

- Docs: https://developers.facebook.com/docs/marketing-api
- Support: https://developers.facebook.com/support

---

## Checklist Before Demo

**24 Hours Before:**

- [ ] Test complete flow end-to-end
- [ ] Verify all services start without errors
- [ ] Check Auth0 login works
- [ ] Check Meta OAuth works
- [ ] Prepare backup slides
- [ ] Clear browser cache/cookies

**1 Hour Before:**

- [ ] Start PostgreSQL container
- [ ] Start backend service
- [ ] Start frontend service
- [ ] Test authentication flow
- [ ] Test tenant creation
- [ ] Check database has no test data (or clear it)

**Right Before Demo:**

- [ ] Close unnecessary browser tabs
- [ ] Hide unrelated terminal windows
- [ ] Set browser zoom to readable level
- [ ] Test audio/screen sharing if remote

---

## Success Metrics

**Demo is successful if:**

- ✅ Authentication flow works smoothly
- ✅ Tenant creation persists to database
- ✅ Meta OAuth completes successfully
- ✅ No critical errors during presentation
- ✅ Audience understands the vision

**Bonus points if:**

- ✅ You show database queries in real-time
- ✅ You explain the architecture briefly
- ✅ You demonstrate the agentic UI pattern
- ✅ You answer technical questions confidently

---

**Estimated Total Setup Time:** 30-45 minutes
**Estimated Demo Duration:** 10-15 minutes
**Difficulty:** Intermediate (requires some technical knowledge)

Good luck with your demo! 🚀
