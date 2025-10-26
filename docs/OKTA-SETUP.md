# Okta Setup Instructions for Random Truffle

Follow these steps to set up your Okta tenant and configure it for Random Truffle.

---

## Step 1: Create Okta Developer Account

1. Go to [Okta Developer Portal](https://developer.okta.com/signup/)
2. Sign up for a **free developer account**
3. Fill in your details:
   - First Name
   - Last Name
   - Email (use your work email)
   - Company (Random Truffle or your company name)
4. Click **Sign Up**
5. Check your email and **verify your account**
6. Set your password

**Result:** You'll get an Okta domain like `dev-12345678.okta.com`

---

## Step 2: Create a New Application

1. Log into your Okta Admin Console (https://your-domain.okta.com)
2. Navigate to **Applications** → **Applications** in the left sidebar
3. Click **Create App Integration**
4. Select:
   - **Sign-in method:** OIDC - OpenID Connect
   - **Application type:** Web Application
5. Click **Next**

---

## Step 3: Configure Application Settings

### General Settings

**App integration name:** `Random Truffle`

### Sign-in redirect URIs

Add these URIs (one per line):

```
http://localhost:3000/api/auth/callback
http://localhost:3001/api/auth/callback
https://your-staging-domain.com/api/auth/callback
https://your-production-domain.com/api/auth/callback
```

_Note: Start with localhost for development. Add staging/production later._

### Sign-out redirect URIs

Add these URIs:

```
http://localhost:3000
http://localhost:3001
https://your-staging-domain.com
https://your-production-domain.com
```

### Assignments

- **Controlled access:** Choose who can access the app
- For development: Select **Allow everyone in your organization to access**

Click **Save**

---

## Step 4: Get Your Credentials

After creating the app, you'll see:

1. **Client ID** (looks like: `0oa2abc3def4GHI5jk6l`)
2. **Client Secret** (click **Show** to reveal)

**Save these credentials securely!**

---

## Step 5: Configure Authorization Server

1. Navigate to **Security** → **API** in the left sidebar
2. You should see a **default** authorization server
3. Click on **default**
4. Note your **Issuer URI** (looks like: `https://dev-12345678.okta.com/oauth2/default`)

---

## Step 6: Add Random Truffle Environment Variables

Add these to your `.env.local` file:

```bash
# Okta Configuration
OKTA_DOMAIN=dev-12345678.okta.com
OKTA_CLIENT_ID=0oa2abc3def4GHI5jk6l
OKTA_CLIENT_SECRET=your-client-secret-here
OKTA_ISSUER=https://dev-12345678.okta.com/oauth2/default
OKTA_REDIRECT_URI=http://localhost:3000/api/auth/callback

# Session Configuration
SESSION_SECRET=your-random-secret-here-min-32-chars
SESSION_COOKIE_NAME=random_truffle_session
SESSION_MAX_AGE=3600000  # 1 hour in milliseconds
```

**Generate SESSION_SECRET:**

```bash
# On macOS/Linux:
openssl rand -base64 32

# Or use Node.js:
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Step 7: Test Users

### Create Test Users

1. Navigate to **Directory** → **People**
2. Click **Add Person**
3. Fill in:
   - First name
   - Last name
   - Username (email format)
   - Password (or send activation email)
4. Click **Save**

### Assign to Application

1. Navigate to **Applications** → **Applications**
2. Click on **Random Truffle**
3. Go to **Assignments** tab
4. Click **Assign** → **Assign to People**
5. Select your test user
6. Click **Assign** and **Done**

---

## Step 8: Optional - Multi-Factor Authentication (MFA)

For admin and superadmin roles, you should enforce MFA:

1. Navigate to **Security** → **Authenticators**
2. Click **Add Authenticator**
3. Choose **Google Authenticator** or **Okta Verify**
4. Configure policies for different user groups

---

## Step 9: User Roles (Custom Claims)

To add roles to JWT tokens:

1. Navigate to **Security** → **API** → **default**
2. Go to **Claims** tab
3. Click **Add Claim**
4. Configure:
   - **Name:** `roles`
   - **Include in token type:** ID Token, Always
   - **Value type:** Expression
   - **Value:** `user.roles` (or custom attribute)
   - **Include in:** Any scope
5. Click **Create**

### Add Custom Attribute to Users

1. Navigate to **Directory** → **Profile Editor**
2. Select **Okta User (default)**
3. Click **Add Attribute**
4. Configure:
   - **Data type:** String array
   - **Display name:** Roles
   - **Variable name:** roles
   - **Description:** User roles (user, admin, superadmin)
5. Click **Save**

### Assign Roles to Users

1. Navigate to **Directory** → **People**
2. Click on a user
3. Go to **Profile** tab
4. Click **Edit**
5. Add roles (e.g., `["user"]`, `["admin"]`, `["superadmin"]`)
6. Click **Save**

---

## Step 10: Verify Configuration

Once you've completed steps 1-9, verify your configuration:

### Your Okta Configuration Should Look Like:

```
Domain: dev-12345678.okta.com
Client ID: 0oa2abc3def4GHI5jk6l
Client Secret: ••••••••••••••••••••
Issuer: https://dev-12345678.okta.com/oauth2/default
Redirect URI: http://localhost:3000/api/auth/callback
```

### Test the Integration

After I build the Okta integration, you can test:

1. Start the backend: `cd services/api && pnpm dev`
2. Start the frontend: `cd apps/web && pnpm dev`
3. Navigate to `http://localhost:3000/login`
4. You should be redirected to Okta login
5. Enter your test user credentials
6. You should be redirected back to the app

---

## Troubleshooting

### Common Issues

**"Invalid redirect URI"**

- Make sure the redirect URI in Okta matches exactly
- No trailing slashes
- http vs https must match

**"Invalid client credentials"**

- Double-check CLIENT_ID and CLIENT_SECRET
- Make sure no extra spaces or newlines

**"User not assigned to application"**

- Go to Applications → Random Truffle → Assignments
- Assign your user to the app

**"Token validation failed"**

- Check OKTA_ISSUER matches your authorization server
- Make sure clock sync is correct on your machine

---

## Next Steps

After completing this setup:

1. ✅ Fill in `.env.local` with your Okta credentials
2. ✅ Restart the backend and frontend servers
3. ✅ Test login flow
4. ✅ Verify user roles in JWT tokens

---

## Production Considerations

When moving to production:

1. **Use Okta Production Tenant** (not developer tenant)
2. **Update Redirect URIs** to production domain
3. **Enable MFA** for admin/superadmin roles
4. **Rotate Client Secret** every 90 days
5. **Monitor Auth Logs** in Okta dashboard
6. **Set up Rate Limiting** in Okta
7. **Configure Session Timeout** appropriately

---

## Resources

- [Okta Developer Documentation](https://developer.okta.com/docs/)
- [OIDC & OAuth 2.0 Guide](https://developer.okta.com/docs/concepts/oauth-openid/)
- [Okta Node.js SDK](https://github.com/okta/okta-oidc-js/tree/master/packages/oidc-middleware)

---

**Status:** Ready for implementation once credentials are provided.
