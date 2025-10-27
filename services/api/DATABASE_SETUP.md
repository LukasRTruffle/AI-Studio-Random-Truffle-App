# Database Setup for Random Truffle API

## Prerequisites

1. PostgreSQL 14+ installed locally or accessible remotely
2. Database user with CREATE DATABASE privileges

## Quick Start (Local Development)

### 1. Install PostgreSQL (if not installed)

**macOS:**

```bash
brew install postgresql@14
brew services start postgresql@14
```

**Ubuntu/Debian:**

```bash
sudo apt-get update
sudo apt-get install postgresql postgresql-contrib
sudo systemctl start postgresql
```

**Docker (easiest for development):**

```bash
docker run --name random-truffle-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=random_truffle \
  -p 5432:5432 \
  -d postgres:14
```

### 2. Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database
CREATE DATABASE random_truffle;

# Exit
\q
```

### 3. Configure Environment

Copy `.env.example` to `.env` and update if needed:

```bash
cp .env.example .env
```

Default configuration (works with Docker setup above):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_NAME=random_truffle
```

### 4. Run Migrations

```bash
# Install dependencies (if not done)
pnpm install

# Run migrations
npm run migration:run
```

### 5. Verify Setup

```bash
# Connect to database
psql -U postgres -d random_truffle

# List tables
\dt

# Should see: tenants table

# Exit
\q
```

## Available Scripts

```bash
# Run pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert

# Drop all tables (DANGER!)
npm run schema:drop

# Generate new migration (after entity changes)
npm run migration:generate src/database/migrations/MigrationName
```

## Verify Database Connection

Start the API server:

```bash
npm run dev
```

You should see:

```
[Nest] LOG [TypeOrmModule] Mapped {/tenants, POST} route
[Nest] LOG [NestApplication] Nest application successfully started
```

## Test API Endpoints

### Create a Tenant

```bash
curl -X POST http://localhost:3001/tenants \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Acme Corp",
    "industry": "E-commerce",
    "teamSize": "11-50",
    "primaryGoal": "Increase conversions",
    "platforms": ["google-ads", "meta"],
    "hasGA4": true
  }'
```

### List Tenants

```bash
curl http://localhost:3001/tenants
```

## Troubleshooting

### Connection Refused

- Ensure PostgreSQL is running: `pg_isready`
- Check port 5432 is not in use: `lsof -i :5432`
- Verify credentials in `.env`

### Migration Errors

- Drop and recreate database:
  ```bash
  psql -U postgres -c "DROP DATABASE random_truffle;"
  psql -U postgres -c "CREATE DATABASE random_truffle;"
  npm run migration:run
  ```

### TypeORM Errors

- Ensure `typeorm` and `pg` are installed
- Check `.env` file exists with correct values
- Verify PostgreSQL version: `psql --version` (should be 12+)

## Production Setup

For production deployment:

1. Use managed PostgreSQL (Cloud SQL, RDS, etc.)
2. Update connection string in environment variables
3. Enable SSL: `ssl: { rejectUnauthorized: false }` in data-source.ts
4. Use connection pooling
5. Never use `synchronize: true` - always use migrations
6. Set up automated backups
7. Configure read replicas for scaling

## Next Steps

Once database is running:

1. Test tenant CRUD endpoints
2. Add authentication (Okta OIDC)
3. Implement OAuth flows for ad platforms
4. Connect frontend to backend API
