# Database Configuration Guide

This guide explains how to switch between local PostgreSQL and remote NeonDB.

## Configuration

The backend supports two database modes controlled by a single environment variable:

```env
USE_REMOTE_DB=false  # Use local PostgreSQL
USE_REMOTE_DB=true   # Use remote NeonDB
```

## Local Database (Default)

**Configuration in `.env`:**
```env
USE_REMOTE_DB=false

LOCAL_DATABASE_HOST=localhost
LOCAL_DATABASE_PORT=5432
LOCAL_DATABASE_USER=postgres
LOCAL_DATABASE_PASSWORD=postgres
LOCAL_DATABASE_NAME=businesspro
```

**When to use:**
- Development on your local machine
- Testing migrations locally
- Faster queries (no network latency)
- No internet connection required

## Remote Database (NeonDB)

**Configuration in `.env`:**
```env
USE_REMOTE_DB=true

REMOTE_DATABASE_HOST=ep-muddy-leaf-ahc3bytv-pooler.c-3.us-east-1.aws.neon.tech
REMOTE_DATABASE_PORT=5432
REMOTE_DATABASE_USER=neondb_owner
REMOTE_DATABASE_PASSWORD=npg_Bqk0zWPcsKm1
REMOTE_DATABASE_NAME=neondb
```

**When to use:**
- Production deployment
- Staging environment
- Team collaboration (shared database)
- Cloud hosting (Vercel, Railway, etc.)

## How to Switch

### Switch to Remote (NeonDB)
1. Open `api/.env`
2. Change `USE_REMOTE_DB=false` to `USE_REMOTE_DB=true`
3. Restart the backend server
4. Verify connection in console: `🔌 Connecting to REMOTE NeonDB database...`

### Switch to Local
1. Open `api/.env`
2. Change `USE_REMOTE_DB=true` to `USE_REMOTE_DB=false`
3. Restart the backend server
4. Verify connection in console: `🔌 Connecting to LOCAL PostgreSQL database...`

## Important Notes

### SSL Connection
- **Remote NeonDB:** SSL is automatically enabled (required by Neon)
- **Local PostgreSQL:** SSL is disabled by default

### Migrations
- Run migrations separately for each database
- Local and remote databases are independent
- Schema changes need to be applied to both

### Data Sync
- Local and remote databases are **NOT** automatically synced
- If you need to sync data, use `pg_dump` and `pg_restore`:

```bash
# Dump local database
pg_dump businesspro > local_backup.sql

# Restore to remote (NeonDB)
psql 'postgresql://neondb_owner:npg_Bqk0zWPcsKm1@ep-muddy-leaf-ahc3bytv-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require' < local_backup.sql
```

## Troubleshooting

### Can't connect to remote database
- Check internet connection
- Verify NeonDB credentials haven't changed
- Ensure `USE_REMOTE_DB=true` is set correctly

### Can't connect to local database
- Ensure PostgreSQL is running: `pg_ctl status`
- Check credentials match your local setup
- Verify database exists: `psql -l`

### Wrong database being used
- Check console output on server start
- Look for: `🔌 Connecting to REMOTE NeonDB database...` or `🔌 Connecting to LOCAL PostgreSQL database...`
- Restart server after changing `.env`

## Direct psql Connection

### Connect to Remote NeonDB:
```bash
psql 'postgresql://neondb_owner:npg_Bqk0zWPcsKm1@ep-muddy-leaf-ahc3bytv-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
```

### Connect to Local PostgreSQL:
```bash
psql -U postgres -d businesspro
```

## Best Practices

1. **Development:** Use local database for faster iterations
2. **Testing:** Use local database to avoid affecting shared data
3. **Staging:** Use remote database to mirror production
4. **Production:** Always use remote database with backups enabled
5. **Never commit** `.env` file with production credentials!

## Environment-Specific Setup

Create environment-specific `.env` files:

- `.env.local` - Local development
- `.env.staging` - Staging environment  
- `.env.production` - Production environment

Load the appropriate file based on your environment.
