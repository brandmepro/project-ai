# Database Migrations Guide

## Overview

Business Pro uses TypeORM migrations for database schema management in production, with auto-sync for development convenience.

---

## Environment Variables

### Development (.env)
```env
DB_SYNCHRONIZE=true          # Auto-sync schema changes
DB_MIGRATIONS_RUN=false      # Don't run migrations
DB_LOGGING=true              # Show SQL queries
```

### Production (.env.production)
```env
DB_SYNCHRONIZE=false         # NEVER auto-sync in production!
DB_MIGRATIONS_RUN=true       # Run migrations on startup
DB_LOGGING=false             # Disable SQL logging
```

---

## Commands

### Generate Migration (from schema changes)
```powershell
# From project root
bun run migration:generate -- InitialSchema

# Or from api directory
cd api
bun run migration:generate -- InitialSchema
```

This compares your entities with the database and generates a migration file.

### Create Empty Migration
```powershell
bun run migration:create -- src/database/migrations/CustomMigration
```

Creates an empty migration file for custom SQL.

### Run Migrations
```powershell
bun run migration:run
```

Runs all pending migrations.

### Revert Last Migration
```powershell
bun run migration:revert
```

Reverts the most recently executed migration.

### Show Migration Status
```powershell
bun run migration:show
```

Shows which migrations have been run and which are pending.

---

## Migration Workflow

### Development (DB_SYNCHRONIZE=true)
1. Make changes to entities
2. Server auto-syncs schema ✅
3. No migrations needed during development

### Production Deploy (DB_SYNCHRONIZE=false)
1. Make changes to entities
2. Generate migration: `bun run migration:generate -- MyChanges`
3. Review generated migration file
4. Commit migration to git
5. Deploy with `DB_MIGRATIONS_RUN=true`
6. Migrations run automatically on startup ✅

---

## Example Migration

### Generated Migration File
```typescript
// src/database/migrations/1706543400000-InitialSchema.ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1706543400000 implements MigrationInterface {
  name = 'InitialSchema1706543400000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password_hash" character varying NOT NULL,
        "name" character varying NOT NULL,
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);
    
    await queryRunner.query(`
      CREATE INDEX "idx_users_email" ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_users_email"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

---

## Initial Schema Setup

### For New Projects

**Option 1: Auto-Sync First (Simple)**
1. Start with `DB_SYNCHRONIZE=true`
2. Let TypeORM create all tables
3. Generate initial migration: `bun run migration:generate -- InitialSchema`
4. For production, use `DB_SYNCHRONIZE=false` + `DB_MIGRATIONS_RUN=true`

**Option 2: Migrations from Start (Production-Ready)**
1. Set `DB_SYNCHRONIZE=false` from the beginning
2. Generate initial migration: `bun run migration:generate -- InitialSchema`
3. Run migration: `bun run migration:run`
4. All changes go through migrations

---

## Best Practices

### ✅ DO
- Use `DB_SYNCHRONIZE=true` in development for speed
- Use `DB_SYNCHRONIZE=false` in production always
- Generate migrations before deploying
- Review generated migrations before running
- Keep migrations in git
- Run migrations as part of deployment
- Test migrations in staging first

### ❌ DON'T
- NEVER use `DB_SYNCHRONIZE=true` in production
- Don't edit migration files after they've been run
- Don't delete old migrations
- Don't skip migration testing
- Don't deploy without running migrations

---

## Common Scenarios

### Adding a New Column
1. Add property to entity:
   ```typescript
   @Column({ nullable: true })
   phoneNumber: string;
   ```

2. **Development**: Server auto-syncs ✅

3. **Production**: Generate migration
   ```powershell
   bun run migration:generate -- AddPhoneNumber
   ```

### Renaming a Column
1. Use `@Column({ name: 'new_name' })`
2. Generate migration
3. Migration will have rename logic

### Complex Changes
1. Create empty migration:
   ```powershell
   bun run migration:create -- src/database/migrations/ComplexUpdate
   ```

2. Write custom SQL:
   ```typescript
   public async up(queryRunner: QueryRunner): Promise<void> {
     // Custom SQL here
     await queryRunner.query(`
       UPDATE users SET status = 'active' WHERE status IS NULL
     `);
   }
   ```

---

## Migration Files Location

```
api/
└── src/
    └── database/
        └── migrations/
            ├── 1706543400000-InitialSchema.ts
            ├── 1706544500000-AddPhoneNumber.ts
            └── 1706545600000-CreateAIModels.ts
```

---

## Troubleshooting

### "QueryFailedError: relation already exists"
- Set `DB_SYNCHRONIZE=false`
- Run migrations instead

### "No changes in database schema were found"
- Make sure entities are properly decorated
- Check TypeORM is loading entities correctly
- Try `DB_LOGGING=true` to see what's happening

### Migration fails in production
- Test in staging first
- Check migration can run on empty database
- Verify all foreign keys exist
- Review migration SQL manually

---

## Environment-Specific Setup

### Development
```env
DB_SYNCHRONIZE=true      # Fast iteration
DB_MIGRATIONS_RUN=false  # Not needed
DB_LOGGING=true          # See queries
```

### Staging
```env
DB_SYNCHRONIZE=false     # Like production
DB_MIGRATIONS_RUN=true   # Test migrations
DB_LOGGING=true          # Debug issues
```

### Production
```env
DB_SYNCHRONIZE=false     # NEVER true!
DB_MIGRATIONS_RUN=true   # Auto-run on deploy
DB_LOGGING=false         # Performance
```

---

## Quick Reference

```powershell
# Generate migration from entity changes
bun run migration:generate -- MigrationName

# Create empty migration
bun run migration:create -- src/database/migrations/CustomName

# Run all pending migrations
bun run migration:run

# Revert last migration
bun run migration:revert

# Show migration status
bun run migration:show
```

---

**Remember**: 
- Development = `DB_SYNCHRONIZE=true` (fast iteration)
- Production = `DB_SYNCHRONIZE=false` + `DB_MIGRATIONS_RUN=true` (safe)
