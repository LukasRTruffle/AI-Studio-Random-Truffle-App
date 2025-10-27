# Auth0 Setup Guide for Random Truffle

This guide will walk you through setting up Auth0 authentication for the Random Truffle POC.

---

## Step 1: Create Auth0 Account (5 minutes)

1. Go to https://auth0.com/signup
2. Sign up for a **free account** (no credit card required)
3. Choose a tenant name (e.g., `random-truffle-dev`)
4. Select region (choose closest to your users)

---

## Step 2: Create Auth0 Application (3 minutes)

### 2.1 Create Application

1. In Auth0 Dashboard, go to **Applications** → **Applications**
2. Click **"Create Application"**
3. Name: `Random Truffle Web App`
4. Type: **Single Page Application** (SPA)
5. Click **Create**

### 2.2 Configure Application

In the **Settings** tab:

**Allowed Callback URLs:**

```
http://localhost:3000/api/auth/callback
https://your-domain.vercel.app/api/auth/callback
```

**Allowed Logout URLs:**

```
http://localhost:3000
https://your-domain.vercel.app
```

**Allowed Web Origins:**

```
http://localhost:3000
https://your-domain.vercel.app
```

Click **Save Changes**

### 2.3 Copy Credentials

You'll need these values:

- **Domain**: (e.g., `random-truffle-dev.us.auth0.com`)
- **Client ID**: (e.g., `a1b2c3d4e5f6g7h8i9j0`)
- **Client Secret**: (under "Basic Information" → show)

---

## Step 3: Configure Backend API (2 minutes)

### 3.1 Create API in Auth0

1. Go to **Applications** → **APIs**
2. Click **"Create API"**
3. Name: `Random Truffle API`
4. Identifier: `https://api.random-truffle.com` (this is your API identifier, not a real URL)
5. Signing Algorithm: **RS256**
6. Click **Create**

### 3.2 Copy API Identifier

You'll need:

- **API Identifier**: `https://api.random-truffle.com`

---

## Step 4: Configure Environment Variables

### 4.1 Frontend (apps/web/.env.local)

Create `apps/web/.env.local` with:

```bash
# Auth0 Configuration
AUTH0_SECRET='use [openssl rand -hex 32] for production'
AUTH0_BASE_URL='http://localhost:3000'
AUTH0_ISSUER_BASE_URL='https://YOUR_AUTH0_DOMAIN'
AUTH0_CLIENT_ID='YOUR_CLIENT_ID'
AUTH0_CLIENT_SECRET='YOUR_CLIENT_SECRET'
AUTH0_AUDIENCE='https://api.random-truffle.com'

# Backend API URL
NEXT_PUBLIC_API_URL='http://localhost:3001/api'
```

**Replace:**

- `YOUR_AUTH0_DOMAIN` with your Auth0 domain (e.g., `random-truffle-dev.us.auth0.com`)
- `YOUR_CLIENT_ID` with your Application Client ID
- `YOUR_CLIENT_SECRET` with your Application Client Secret

**Generate AUTH0_SECRET:**

```bash
openssl rand -hex 32
```

### 4.2 Backend (services/api/.env)

Add to `services/api/.env`:

```bash
# Auth0 Configuration
AUTH0_DOMAIN='YOUR_AUTH0_DOMAIN'
AUTH0_AUDIENCE='https://api.random-truffle.com'
AUTH0_ISSUER='https://YOUR_AUTH0_DOMAIN/'

# Existing variables...
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=random_truffle
NODE_ENV=development
PORT=3001
API_URL=http://localhost:3001
FRONTEND_URL=http://localhost:3000
CORS_ORIGIN=http://localhost:3000

# Meta OAuth (you already have this)
META_APP_ID=YOUR_META_APP_ID
META_APP_SECRET=YOUR_META_APP_SECRET
```

---

## Step 5: Install Dependencies

### 5.1 Frontend

```bash
cd apps/web
npm install @auth0/nextjs-auth0
```

### 5.2 Backend

```bash
cd services/api
npm install jsonwebtoken jwks-rsa express-jwt
npm install --save-dev @types/jsonwebtoken
```

---

## Step 6: Test Authentication

### 6.1 Start Services

```bash
# Terminal 1: Database
docker run --name random-truffle-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=random_truffle \
  -p 5432:5432 -d postgres:14

# Terminal 2: Backend
cd services/api
npm run migration:run
npm run dev

# Terminal 3: Frontend
cd apps/web
npm run dev
```

### 6.2 Test Login Flow

1. Go to http://localhost:3000
2. Click "Login" (will redirect to Auth0)
3. Sign up or log in
4. Should redirect back to app authenticated
5. Check that you can access protected routes

---

## Step 7: Configure User Roles (Optional - for RBAC)

### 7.1 Create Roles

1. Go to **User Management** → **Roles**
2. Create roles:
   - `user` - Basic access
   - `admin` - Tenant admin
   - `superadmin` - Platform admin

### 7.2 Add Roles to Token

1. Go to **Actions** → **Flows** → **Login**
2. Click **"+"** → **Build Custom**
3. Name: `Add Roles to Token`
4. Code:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const namespace = 'https://random-truffle.com';

  if (event.authorization) {
    // Add roles to access token
    api.accessToken.setCustomClaim(`${namespace}/roles`, event.authorization.roles);

    // Add user metadata
    api.accessToken.setCustomClaim(`${namespace}/email`, event.user.email);
    api.accessToken.setCustomClaim(`${namespace}/name`, event.user.name);
  }
};
```

5. Click **Deploy**
6. Drag action to the flow
7. Click **Apply**

### 7.3 Assign Roles to Users

1. Go to **User Management** → **Users**
2. Select a user
3. Go to **Roles** tab
4. Click **Assign Roles**
5. Select role (e.g., `superadmin` for yourself)

---

## Step 8: Test Protected API Endpoints

### 8.1 Get Access Token

After logging in, open browser DevTools:

```javascript
// In console
fetch('/api/auth/me')
  .then((r) => r.json())
  .then((d) => console.log(d));
```

### 8.2 Test Backend API

```bash
# Get access token from frontend
TOKEN="your-access-token-here"

# Test protected endpoint
curl http://localhost:3001/api/tenants \
  -H "Authorization: Bearer $TOKEN"
```

Should return list of tenants if authenticated.

---

## Troubleshooting

### Issue: "Invalid state" error

**Solution:** Clear browser cookies and try again.

### Issue: "Invalid redirect URI"

**Solution:** Make sure the callback URL in Auth0 matches exactly (including http/https and port).

### Issue: "Audience validation failed"

**Solution:** Ensure `AUTH0_AUDIENCE` matches the API identifier in Auth0.

### Issue: "JWT verification failed"

**Solution:** Check that `AUTH0_DOMAIN` and `AUTH0_ISSUER` are correct in backend .env.

### Issue: Can't see roles in token

**Solution:** Make sure the Login Action is deployed and added to the flow.

---

## Production Deployment

### Vercel (Frontend)

Add environment variables in Vercel dashboard:

```bash
AUTH0_SECRET=<generate-new-secret>
AUTH0_BASE_URL=https://your-app.vercel.app
AUTH0_ISSUER_BASE_URL=https://YOUR_AUTH0_DOMAIN
AUTH0_CLIENT_ID=YOUR_CLIENT_ID
AUTH0_CLIENT_SECRET=YOUR_CLIENT_SECRET
AUTH0_AUDIENCE=https://api.random-truffle.com
NEXT_PUBLIC_API_URL=https://your-api.run.app/api
```

Update Auth0 Application settings with production URLs.

### Cloud Run (Backend)

Add environment variables:

```bash
gcloud run deploy random-truffle-api \
  --set-env-vars="AUTH0_DOMAIN=YOUR_AUTH0_DOMAIN,AUTH0_AUDIENCE=https://api.random-truffle.com,AUTH0_ISSUER=https://YOUR_AUTH0_DOMAIN/"
```

---

## Security Best Practices

### Do's ✅

- Use HTTPS in production
- Rotate AUTH0_SECRET regularly
- Use different Auth0 tenants for dev/staging/prod
- Enable MFA for admin users
- Log authentication events

### Don'ts ❌

- Don't commit .env files to git
- Don't share Client Secret publicly
- Don't use development keys in production
- Don't disable HTTPS redirect in production

---

## What You Get with Auth0

**Free Tier Includes:**

- 7,000 active users
- Unlimited logins
- Email/password authentication
- Social login (Google, Facebook, etc.)
- MFA support
- User management dashboard
- SDK and API support

**No credit card required for free tier**

---

## Next Steps

After Auth0 is configured:

1. ✅ Test login/logout flow
2. ✅ Test protected routes
3. ✅ Test API authentication
4. ✅ Verify roles are in JWT token
5. 📱 Ready for demo!

---

## Support

**Auth0 Documentation:**

- Next.js: https://auth0.com/docs/quickstart/webapp/nextjs
- Backend API: https://auth0.com/docs/quickstart/backend
- Roles: https://auth0.com/docs/manage-users/access-control/rbac

**Random Truffle Docs:**

- See `ARCHITECTURE_REVIEW.md` for security details
- See `POC_SETUP.md` for general setup

---

**Estimated Setup Time:** 15-20 minutes
**Cost:** Free (up to 7,000 users)
