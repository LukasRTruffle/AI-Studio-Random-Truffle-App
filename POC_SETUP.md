# Random Truffle - POC Setup Guide

🎉 **Congratulations!** You now have a **real, working POC** with end-to-end tenant creation and Meta OAuth integration.

---

## 🚀 What Works in This POC

### ✅ Fully Functional

1. **Tenant Creation** - Complete end-to-end flow
   - Frontend collects user data
   - Backend stores in PostgreSQL
   - Tenant ID persisted in localStorage

2. **Meta OAuth** - Real authorization flow
   - Initiates OAuth from frontend
   - Redirects to Meta for approval
   - Backend exchanges code for token
   - Stores credentials in database
   - Redirects back to frontend with status

3. **Database Integration** - PostgreSQL with TypeORM
   - Tenants table
   - Platform connections table
   - Migrations system
   - Foreign key relationships

4. **API Integration** - Frontend ↔ Backend
   - Centralized API client
   - Error handling
   - CORS enabled
   - Validation pipes

### ⏳ Partially Functional (Mock Data)

- Google Ads OAuth (frontend mocked)
- TikTok OAuth (frontend mocked)
- Activation wizard (UI only)
- GA4 connection (UI only)

---

## 📋 Prerequisites

- Node.js 18+ and pnpm
- Docker (for PostgreSQL)
- Meta Developer Account (optional, for OAuth testing)

---

## 🛠️ Setup Instructions

### Step 1: Clone and Install

```bash
# Pull latest code
git pull

# Install dependencies
pnpm install
```

### Step 2: Start PostgreSQL Database

```bash
# Start PostgreSQL with Docker
docker run --name random-truffle-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=random_truffle \
  -p 5432:5432 \
  -d postgres:14

# Verify it's running
docker ps | grep random-truffle-postgres
```

### Step 3: Configure Backend

```bash
# Navigate to backend
cd services/api

# Copy environment template
cp .env.example .env

# Edit .env (optional - default values work for local development)
# nano .env
```

### Step 4: Run Database Migrations

```bash
# Still in services/api
npm run migration:run

# Expected output:
# Migration CreateTenantsTable1730041200000 has been executed successfully.
# Migration CreatePlatformConnectionsTable1730042000000 has been executed successfully.
```

### Step 5: Start Backend API

```bash
# Still in services/api
npm run dev

# Expected output:
# [Nest] LOG [TypeOrmModule] Mapped {/tenants, POST} route
# [Nest] LOG [NestApplication] Nest application successfully started
# API server running on http://localhost:3001/api
```

### Step 6: Configure Frontend

```bash
# Open new terminal, navigate to frontend
cd apps/web

# Copy environment template
cp .env.local.example .env.local

# Edit if needed (default works)
# cat .env.local
# NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Step 7: Start Frontend

```bash
# Still in apps/web
npm run dev

# Expected output:
# ▲ Next.js 16.0.0
# - Local: http://localhost:3000
```

---

## ✅ Test the POC

### Test 1: Tenant Creation (Fully Functional)

1. **Open browser:** http://localhost:3000/welcome

2. **Fill onboarding form:**
   - Company name: "Acme Corp"
   - Industry: "E-commerce"
   - Team size: "11-50"
   - Primary goal: "Increase conversions"
   - Platforms: Select any
   - Has GA4: Check yes

3. **Click through the flow**
   - Agent guides you through
   - Creates workspace in background

4. **Verify in database:**

   ```bash
   # Open psql
   docker exec -it random-truffle-postgres psql -U postgres -d random_truffle

   # Query tenants
   SELECT id, name, industry, "teamSize" FROM tenants;

   # Should see your "Acme Corp" tenant!

   # Exit
   \q
   ```

5. **Check browser console:**
   - Open DevTools → Application → Local Storage
   - Should see `tenantId` stored

### Test 2: Meta OAuth (Requires Setup)

**Prerequisites:** Meta App credentials (see below)

1. **Open browser:** http://localhost:3000/connections/ad-platforms

2. **Click "Connect Meta"**

3. **Should redirect to Meta OAuth**
   - If no credentials: See error message
   - If credentials configured: Redirects to Facebook

4. **After approving:**
   - Redirects back to frontend
   - Connection stored in database

5. **Verify in database:**
   ```bash
   docker exec -it random-truffle-postgres psql -U postgres -d random_truffle
   SELECT platform, "accountId", "accountName" FROM platform_connections;
   \q
   ```

---

## 🔑 Setting Up Meta OAuth (Optional)

To test the full OAuth flow, you need Meta API credentials:

### 1. Create Meta App

1. Go to https://developers.facebook.com/apps
2. Click "Create App"
3. Choose "Business" type
4. Fill in app details:
   - App name: "Random Truffle Dev"
   - Contact email: your-email@example.com

### 2. Add Marketing API

1. In your app dashboard → "Add Product"
2. Find "Marketing API" → Click "Set Up"
3. No additional configuration needed

### 3. Get Credentials

1. Go to Settings → Basic
2. Copy:
   - **App ID**
   - **App Secret** (click "Show")

### 4. Configure OAuth Redirect

1. Still in app settings
2. Add platform → Website
3. Site URL: `http://localhost:3001`

### 5. Add to Backend `.env`

```bash
# Edit services/api/.env
META_APP_ID=your_app_id_here
META_APP_SECRET=your_app_secret_here
```

### 6. Restart Backend

```bash
# In services/api terminal
# Ctrl+C to stop, then:
npm run dev
```

### 7. Test OAuth Flow

1. Go to http://localhost:3000/connections/ad-platforms
2. Click "Connect Meta"
3. Should redirect to Meta authorization
4. Approve permissions
5. Redirects back to app with success!

---

## 🐛 Troubleshooting

### Database Issues

**Error: "Connection refused"**

```bash
# Check if PostgreSQL is running
docker ps | grep postgres

# If not running, start it:
docker start random-truffle-postgres

# Or recreate:
docker rm random-truffle-postgres
docker run --name random-truffle-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=random_truffle \
  -p 5432:5432 \
  -d postgres:14
```

**Error: "relation 'tenants' does not exist"**

```bash
# Run migrations
cd services/api
npm run migration:run
```

### Backend API Issues

**Error: "Port 3001 already in use"**

```bash
# Find process using port
lsof -i :3001

# Kill it
kill -9 <PID>

# Or change port in services/api/.env
PORT=3002
```

**Error: "META_APP_ID not configured"**

- This is expected if you haven't set up Meta credentials
- The POC works without it (tenant creation still functional)
- Follow "Setting Up Meta OAuth" above to add credentials

### Frontend Issues

**Error: "fetch failed"**

- Backend API not running
- Check backend is on http://localhost:3001/api
- Verify CORS is enabled (should be by default)

**Error: "Network error"**

- Check `.env.local` has correct API URL
- Restart frontend: Ctrl+C, then `npm run dev`

---

## 📊 What's in the Database

After testing, you should see:

```sql
-- Tenants table
SELECT * FROM tenants;
-- Shows: id, name, industry, teamSize, platforms, hasGA4, settings

-- Platform connections table (after Meta OAuth)
SELECT * FROM platform_connections;
-- Shows: id, tenantId, platform, accountId, accountName, accessToken
```

---

## 🎯 What's Next?

Now that you have a working POC, you can:

### Immediate Next Steps

1. **Test tenant creation** (works now!)
2. **Set up Meta OAuth** (optional but recommended)
3. **Verify data in database**

### Phase 5 Expansion

1. **Add Google Ads OAuth** (similar to Meta)
2. **Add TikTok OAuth** (similar to Meta)
3. **Implement real audience activation**
4. **Connect BigQuery for data**
5. **Add GA4 MCP server**
6. **Deploy to Cloud Run + Vercel**

### For Production

1. **Secret Manager** for credentials
2. **Token encryption** at rest
3. **Token refresh** logic
4. **Error monitoring** (Sentry)
5. **Rate limiting**
6. **Authentication** (Okta OIDC)
7. **RBAC** (tenant isolation)

---

## 🎉 Success Indicators

You'll know the POC is working when:

✅ Backend starts without errors
✅ Frontend connects to backend
✅ Onboarding creates real tenant in database
✅ Tenant ID stored in localStorage
✅ Database queries show your data
✅ (Optional) Meta OAuth redirects work

---

## 📝 API Endpoints Available

### Tenants

- `POST /api/tenants` - Create tenant
- `GET /api/tenants` - List tenants
- `GET /api/tenants/:id` - Get tenant
- `PATCH /api/tenants/:id` - Update tenant
- `DELETE /api/tenants/:id` - Soft delete tenant

### Platform Connections

- `GET /api/auth/meta/authorize` - Initiate Meta OAuth
- `GET /api/auth/meta/callback` - OAuth callback handler

### Activation (Not Implemented Yet)

- `POST /api/activation` - Activate audience (returns error, needs OAuth)

---

## 🤝 Need Help?

If you encounter issues:

1. **Check logs:**
   - Backend: Terminal running `npm run dev` in `services/api`
   - Frontend: Terminal running `npm run dev` in `apps/web`
   - Browser: DevTools Console (F12)

2. **Verify setup:**
   - Database running: `docker ps`
   - Migrations run: `docker exec -it random-truffle-postgres psql -U postgres -d random_truffle -c "\dt"`
   - Backend running: `curl http://localhost:3001/api/tenants`
   - Frontend running: Open http://localhost:3000

3. **Common fixes:**
   - Restart database: `docker restart random-truffle-postgres`
   - Restart backend: Ctrl+C, then `npm run dev`
   - Restart frontend: Ctrl+C, then `npm run dev`
   - Clear browser cache: DevTools → Application → Clear site data

---

## 🎊 Congratulations!

You now have a **real, working POC** of Random Truffle with:

- Database integration
- Backend API
- Frontend UI
- OAuth flows
- End-to-end tenant creation

This is ready to demo and can be expanded with more features from Phase 5!
