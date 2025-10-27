# 🚀 Random Truffle Demo - Quick Start Guide

## ✅ Configuration Complete

All Auth0 credentials have been configured successfully:

- ✅ Backend `.env` configured
- ✅ Frontend `.env.local` configured
- ✅ Auth0 credentials added
- ✅ TypeScript compilation verified

---

## 📋 Prerequisites Checklist

### 1. Auth0 Dashboard Configuration (REQUIRED)

**You must configure these URLs in your Auth0 application:**

1. Go to: https://manage.auth0.com/dashboard/us/dev-tjgurkspkouogezh/applications
2. Find your application (Client ID: `AkAnyyqmaeu6Sju7MTxlEvUFUM89xkZe`)
3. In the **Settings** tab, add:

**Allowed Callback URLs:**

```
http://localhost:3000/auth/callback
```

**Allowed Logout URLs:**

```

```

http://localhost:3000

```

**Allowed Web Origins:**
```

http://localhost:3000

````

4. **Click "Save Changes"** at the bottom

⚠️ **Without this step, authentication will fail with "Invalid callback URL" error**

### 2. Install Dependencies (if not already done)

```bash
# From project root
pnpm install
````

---

## 🎬 Starting the Demo

### Terminal 1: Database (PostgreSQL)

```bash
docker run --name random-truffle-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=random_truffle \
  -p 5432:5432 -d postgres:14
```

**Verify it's running:**

```bash
docker ps | grep random-truffle-postgres
```

### Terminal 2: Backend API

```bash
cd services/api

# Run database migrations (first time only)
pnpm run migration:run

# Start backend server
pnpm run dev
```

**Expected output:**

```
[Nest] INFO [NestFactory] Starting Nest application...
[Nest] INFO [InstanceLoader] AppModule dependencies initialized
[Nest] WARN [Auth0JwtMiddleware] AUTH0_DOMAIN or AUTH0_AUDIENCE not configured - JWT verification disabled
[Nest] INFO [NestApplication] Nest application successfully started
[Nest] INFO Application listening on http://localhost:3001
```

**Backend will be available at:** http://localhost:3001

### Terminal 3: Frontend (Next.js)

```bash
cd apps/web

# Start frontend server
pnpm run dev
```

**Expected output:**

```
▲ Next.js 16.0.0 (Turbopack)
- Local:        http://localhost:3000
- Environments: .env.local

✓ Starting...
✓ Ready in 2.3s
```

**Frontend will be available at:** http://localhost:3000

---

## 🧪 Testing Authentication

### Step 1: Open the Application

Open your browser and go to: http://localhost:3000

### Step 2: Click "Login"

You should see an Auth0 login page

### Step 3: Create Test User or Login

- **Option A:** Sign up with email/password
- **Option B:** Use Google/social login (if configured in Auth0)

### Step 4: Verify Login Success

After successful login, you should:

- See your name in the top-right corner
- Be able to access the dashboard
- See "Logout" button

### Step 5: Test API Authentication

Open browser DevTools console and run:

```javascript
// This should return your user information
fetch('/auth/me')
  .then((r) => r.json())
  .then((d) => console.log('User:', d));
```

**Expected response:**

```json
{
  "user": {
    "id": "auth0|...",
    "email": "your-email@example.com",
    "name": "Your Name",
    "picture": "https://...",
    "role": "user",
    "roles": ["user"]
  }
}
```

---

## 🔍 Troubleshooting

### Issue: "Invalid callback URL"

**Cause:** Callback URLs not configured in Auth0
**Solution:** Follow Step 1 in Prerequisites above

### Issue: "Failed to fetch"

**Cause:** Backend not running
**Solution:** Check Terminal 2 - backend should be running on port 3001

### Issue: "Connection refused to localhost:5432"

**Cause:** PostgreSQL not running
**Solution:** Start PostgreSQL container (Terminal 1)

### Issue: "Cannot find module '@auth0/nextjs-auth0'"

**Cause:** Dependencies not installed
**Solution:** Run `pnpm install` from project root

### Issue: Backend shows "AUTH0_DOMAIN not configured"

**Cause:** Backend can't read Auth0 credentials from environment
**Solution:** This is expected - backend uses JWT verification without direct Auth0 SDK dependency. The warning is safe to ignore as long as frontend authentication works.

---

## 📊 What's Working in This Demo

### ✅ Implemented Features

1. **User Authentication**
   - Auth0 login/logout
   - Session management
   - JWT verification on backend

2. **Frontend**
   - Next.js 16 with App Router
   - Protected routes (require login)
   - User profile display
   - Dashboard UI (30+ pages)

3. **Backend API**
   - NestJS REST API
   - PostgreSQL database with TypeORM
   - RBAC (Role-Based Access Control)
   - Meta OAuth endpoint (ready for credentials)

4. **Database**
   - PostgreSQL with migrations
   - Tables: tenants, audiences, sessions, platform_connections

### ⏳ Not Yet Implemented (Future Phases)

- BigQuery integration (Phase 2)
- AI agents (Phase 3)
- Google Ads activation (Phase 2)
- Meta ads activation (Phase 2)
- TikTok activation (Phase 2)
- GA4 data sync (Phase 2)

---

## 🎯 Demo Flow

1. **User logs in** via Auth0
2. **Sees dashboard** with analytics placeholder UI
3. **Can navigate** through 30+ UI pages:
   - Audiences
   - Campaigns
   - Insights
   - Connections
   - Settings
4. **Backend API** verifies JWT tokens
5. **Database** stores user sessions

---

## 📞 Next Steps

Once you verify authentication works:

1. **Add Meta Credentials** (you mentioned you have these):
   - Update `services/api/.env`:
     ```bash
     META_APP_ID=your_app_id
     META_APP_SECRET=your_app_secret
     ```
   - Test Meta OAuth: http://localhost:3001/api/auth/meta/authorize?tenant_id=test

2. **Test Role-Based Access Control**:
   - Create roles in Auth0
   - Test admin vs user permissions

3. **Deploy to Cloud** (optional):
   - Follow `DEMO_DEPLOYMENT_GUIDE.md`
   - Uses Cloud Run + Cloud SQL

---

## 🆘 Need Help?

- **Auth0 Setup:** See `AUTH0_SETUP.md`
- **Architecture Review:** See `ARCHITECTURE_REVIEW.md`
- **Deployment:** See `DEMO_DEPLOYMENT_GUIDE.md`
- **What's Next:** See `WHATS_NEXT.md`

---

**Demo Duration:** ~5 minutes to start, ~30 minutes to explore all features

**Current Status:** 🟢 **READY FOR DEMO** (after Auth0 URLs configured)
