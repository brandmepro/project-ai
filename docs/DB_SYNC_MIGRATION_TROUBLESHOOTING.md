# DB Sync / Migration Troubleshooting (BusinessPro API)

This guide is for the recurring issue where NestJS backend starts, but DB sync or migrations do not run as expected.

## Quick Fix (30 seconds)

1. In `api/.env`, use only one mode:
   - **Sync mode (local quick dev):**
     - `DB_SYNCHRONIZE=true`
     - `DB_MIGRATIONS_RUN=false`
   - **Migration mode (recommended for stability):**
     - `DB_SYNCHRONIZE=false`
     - `DB_MIGRATIONS_RUN=true`
2. Restart the API process fully (do not rely on partial hot-reload for env changes).
3. Confirm startup logs show the expected DB mode values.

## Golden Rule

Never run both schema strategies at the same time:

- `DB_SYNCHRONIZE=true` and `DB_MIGRATIONS_RUN=true` together is invalid.
- When both are true, app logic disables synchronize to avoid enum/type conflicts.

## Why This Keeps Happening

### 1) Env variable override drift

In monorepo execution, parent/root process env vars can override API-specific env values unless API env is force-loaded first.

Current fix in this repo:

- `api/src/config/load-env.ts` force-loads `api/.env` with override.
- It is invoked from:
  - `api/src/app.module.ts`
  - `api/src/database/data-source.ts`

This ensures `api/.env` wins for both Nest runtime and TypeORM CLI paths.

### 2) Different env naming styles

Some projects use singular naming (`...MIGRATION_RUN`), others plural (`...MIGRATIONS_RUN`).

Current API supports multiple aliases:

- Sync aliases:
  - `DB_SYNCHRONIZE`
  - `DB_SYNC`
  - `DB_SYNC_TEST`
  - `DATABASE_SYNCHRONIZE`
- Migration aliases:
  - `DB_MIGRATIONS_RUN`
  - `DB_MIGRATION_RUN`
  - `DB_MIGRATION`
  - `DATABASE_MIGRATIONS_RUN`
  - `DATABASE_MIGRATION_RUN`

Boolean values accepted: `true`, `1`, `yes`, `on`.

## Expected Log Signals

On startup, verify these signals:

- DB target is correct (`PostgreSQL (Local)` or remote DB as intended).
- Effective mode values print as expected:
  - `synchronize=true|false`
  - `migrationsRun=true|false`
- DB connection success log appears.

If DB target is wrong (example: remote selected while local expected), env precedence is still wrong in the running process.

## Known Good Configs

### Local development (fast iteration)

Use in `api/.env`:

```env
USE_REMOTE_DB=false
DB_SYNCHRONIZE=true
DB_MIGRATIONS_RUN=false
DB_LOGGING=true
```

### Migration-first mode (safe/default)

Use in `api/.env`:

```env
USE_REMOTE_DB=false
DB_SYNCHRONIZE=false
DB_MIGRATIONS_RUN=true
DB_LOGGING=true
```

## If Migrations Still Do Not Run

1. Confirm there are pending migration files under `api/src/database/migrations`.
2. Confirm migration file glob resolves correctly in runtime config.
3. Run migration manually via API package scripts (from `api` context) to verify datasource path.
4. Ensure no stale process is still running with old env values.

## Emergency Recovery Checklist

When this bug returns, follow this exact order:

1. Stop API process.
2. Open `api/.env` and set one mode only (sync or migration).
3. Verify DB target flag (`USE_REMOTE_DB`) is correct.
4. Restart API from normal dev entrypoint.
5. Check logs for:
   - correct DB target
   - correct `synchronize` / `migrationsRun`
6. If mismatch persists, check whether parent/root env vars are injecting conflicting values.

## Reference for Future Debug Sessions

When asking for help next time, reference this file and include:

- Current `api/.env` DB section
- Startup logs around DB config output
- Which start command was used (`dev:api`, `api:dev`, direct `api/start:dev`, etc.)

This lets troubleshooting be completed quickly with minimal back-and-forth.
