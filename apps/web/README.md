# Random Truffle - Web Frontend

Next.js-based web application for Random Truffle AI Marketing Intelligence Platform.

## Features

- **Next.js App Router** - Modern React framework with server components
- **TypeScript** - Full type safety with strict mode
- **Tailwind CSS** - Utility-first CSS framework with custom design system
- **Okta Authentication** - Enterprise SSO with Google and Microsoft login support
- **Design System** - Comprehensive UI component library with CVA variants

## Getting Started

### Prerequisites

- Node.js 20+ and pnpm
- Okta tenant with application configured (see `docs/OKTA-SETUP.md`)
- Backend API running (see `services/api/README.md`)

### Installation

```bash
# Install dependencies (from monorepo root)
pnpm install

# Start development server
pnpm dev
```

The app will be available at http://localhost:3000

### Environment Variables

Create a `.env.local` file in the monorepo root:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:3001

# Okta Configuration (optional for frontend - SSO handled by backend)
NEXT_PUBLIC_OKTA_DOMAIN=your-domain.okta.com
NEXT_PUBLIC_OKTA_CLIENT_ID=your_client_id
```

See `.env.example` for all available configuration options.

## Authentication

### Overview

Random Truffle uses **Okta OIDC (OpenID Connect)** for enterprise authentication with support for:

- Google Workspace accounts
- Microsoft 365 accounts
- Direct Okta accounts

### Authentication Flow

1. User clicks "Sign in with Enterprise SSO" on `/login`
2. Redirected to Okta authorization page
3. User selects Google, Microsoft, or Okta login
4. After successful login, redirected to `/callback`
5. Callback handler exchanges OAuth code for tokens
6. Tokens stored in localStorage
7. User redirected to `/dashboard`

### Using Authentication in Components

#### Auth Context

All authentication state is managed by the `AuthContext`:

```tsx
import { useAuth } from '@/contexts/AuthContext';

function MyComponent() {
  const { user, isLoading, isAuthenticated, login, logout } = useAuth();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!isAuthenticated) {
    return <button onClick={login}>Sign in</button>;
  }

  return (
    <div>
      <p>Welcome, {user.name}!</p>
      <button onClick={logout}>Sign out</button>
    </div>
  );
}
```

#### Protected Routes

Use the `ProtectedRoute` component to require authentication:

```tsx
import { ProtectedRoute } from '@/components/ProtectedRoute';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <div>This page requires authentication</div>
    </ProtectedRoute>
  );
}
```

For role-based access:

```tsx
<ProtectedRoute requiredRoles={['admin', 'superadmin']}>
  <AdminPanel />
</ProtectedRoute>
```

#### User Profile Dropdown

Add the user profile dropdown to your navigation:

```tsx
import { UserProfileDropdown } from '@/components/UserProfileDropdown';

export function Navbar() {
  return (
    <nav>
      {/* ... other nav items ... */}
      <UserProfileDropdown />
    </nav>
  );
}
```

### User Roles

Three user roles are supported:

- **user** - Standard user access
- **admin** - Administrative access
- **superadmin** - Full platform access (HITL governance)

Roles are configured in Okta as custom claims (see `docs/OKTA-SETUP.md`).

### Token Management

- **Access Tokens** - Short-lived (1 hour), used for API authentication
- **Refresh Tokens** - Long-lived, used to refresh access tokens
- **Auto Refresh** - Tokens automatically refresh 5 minutes before expiry
- **Storage** - Tokens stored in localStorage (secure HttpOnly cookies coming in Phase 5)

## Design System

### Overview

Random Truffle uses a comprehensive design system based on Anthropic's principles:

- **Accessibility** - WCAG 2.1 AA compliant
- **Consistency** - Shared design tokens across all components
- **Performance** - Optimized for fast load times
- **Responsive** - Mobile-first design with breakpoints

### Using Components

Import from the `@random-truffle/ui` package:

```tsx
import { Button, Input, Card } from '@random-truffle/ui';

export function MyForm() {
  return (
    <Card>
      <Input label="Email" type="email" />
      <Button variant="primary" size="lg">
        Submit
      </Button>
    </Card>
  );
}
```

### Available Components

- **Button** - 7 variants (primary, secondary, outline, ghost, link, destructive, success)
- **Input** - Text input with validation states
- **Card** - Composable card layout
- **More components coming soon**

See `packages/ui/design-system/README.md` for full documentation.

### Tailwind Configuration

Custom design tokens are configured in `tailwind.config.ts`:

- **Colors** - Primary (Indigo), Semantic (Success, Warning, Error, Info), Neutral (Slate)
- **Typography** - Inter (sans), JetBrains Mono (mono)
- **Spacing** - 8px grid system
- **Shadows** - 4 levels (sm, md, lg, xl)
- **Animations** - Smooth transitions

## Project Structure

```
apps/web/
├── app/                    # Next.js App Router
│   ├── (public)/          # Public routes (no auth)
│   │   ├── login/         # Login page
│   │   └── callback/      # OAuth callback handler
│   ├── (authenticated)/   # Protected routes (auth required)
│   │   └── dashboard/     # Dashboard page
│   └── layout.tsx         # Root layout with AuthProvider
├── components/            # Shared components
│   ├── ProtectedRoute.tsx # Auth guard component
│   └── UserProfileDropdown.tsx # User profile UI
├── contexts/              # React contexts
│   └── AuthContext.tsx    # Authentication state
├── public/                # Static assets
└── tailwind.config.ts     # Tailwind configuration
```

## Development Workflow

### Running the App

```bash
# Development mode
pnpm dev

# Production build
pnpm build

# Start production server
pnpm start

# Lint code
pnpm lint

# Type check
pnpm type-check
```

### Quality Gates

All code must pass:

```bash
# Linting + type checking
make check

# Unit tests
make test

# E2E tests
make e2e
```

### Code Standards

- TypeScript strict mode enabled
- ESLint + Prettier for code formatting
- No `any` types (use `unknown` and type guards)
- Explicit return types on exported functions
- 95% test coverage target

## Deployment

### Cloud Run (Production)

The frontend is deployed to Google Cloud Storage + CDN:

```bash
# Build for production
pnpm build

# Deploy to GCS (coming in Phase 5)
# gcloud storage cp -r out/* gs://random-truffle-frontend/
```

### Environment Variables (Production)

Production environment variables are stored in GCP Secret Manager:

```bash
# Set secret (requires SuperAdmin approval)
gcloud secrets create NEXT_PUBLIC_API_URL --data-file=-
```

## Troubleshooting

### Authentication Issues

**Problem:** "Authorization code is missing" error on callback

**Solution:** Check that `OKTA_REDIRECT_URI` matches exactly in both Okta app config and `.env.local`

---

**Problem:** User redirected to login after successful authentication

**Solution:** Check browser console for token storage errors. Verify localStorage is enabled.

---

**Problem:** "Invalid or expired token" error

**Solution:** Tokens expire after 1 hour. Clear localStorage and sign in again.

### Development Issues

**Problem:** Tailwind styles not applying

**Solution:** Restart dev server after modifying `tailwind.config.ts`

---

**Problem:** Import errors for `@random-truffle/ui`

**Solution:** Run `pnpm install` from monorepo root to link workspace packages

## Contributing

See `CLAUDE.md` for coding guidelines and architecture decisions.

## License

Proprietary - All rights reserved

## Support

For issues or questions:

- **Documentation:** `docs/` directory
- **Architecture Decisions:** `thoughts/shared/plans/architecture-decisions.md`
- **Okta Setup:** `docs/OKTA-SETUP.md`
