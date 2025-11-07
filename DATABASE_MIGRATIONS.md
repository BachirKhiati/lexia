# Synapse Database Migrations Guide

This guide explains how to manage database schema changes and migrations for Synapse.

## Table of Contents

1. [Current Schema](#current-schema)
2. [Migration Strategy](#migration-strategy)
3. [Creating Migrations](#creating-migrations)
4. [Running Migrations](#running-migrations)
5. [Rollback Procedures](#rollback-procedures)
6. [Best Practices](#best-practices)

---

## Current Schema

The Synapse database consists of the following tables:

### Tables Overview

```
users
├── id (SERIAL PRIMARY KEY)
├── email (VARCHAR(255) UNIQUE NOT NULL)
├── username (VARCHAR(100) UNIQUE NOT NULL)
├── password_hash (VARCHAR(255) NOT NULL)
├── language (VARCHAR(50) NOT NULL DEFAULT 'finnish')
├── created_at (TIMESTAMP NOT NULL DEFAULT NOW())
└── updated_at (TIMESTAMP NOT NULL DEFAULT NOW())

quests
├── id (SERIAL PRIMARY KEY)
├── user_id (INTEGER NOT NULL → users.id)
├── title (VARCHAR(255) NOT NULL)
├── description (TEXT NOT NULL)
├── solution (TEXT NOT NULL)
├── difficulty (VARCHAR(50) NOT NULL DEFAULT 'beginner')
├── status (VARCHAR(50) NOT NULL DEFAULT 'pending')
├── created_at (TIMESTAMP NOT NULL DEFAULT NOW())
└── completed_at (TIMESTAMP)

words
├── id (SERIAL PRIMARY KEY)
├── user_id (INTEGER NOT NULL → users.id)
├── word (VARCHAR(255) NOT NULL)
├── lemma (VARCHAR(255) NOT NULL)
├── language (VARCHAR(50) NOT NULL)
├── definition (TEXT NOT NULL)
├── part_of_speech (VARCHAR(50))
├── examples (TEXT[])
├── status (VARCHAR(50) NOT NULL DEFAULT 'ghost')
├── added_at (TIMESTAMP NOT NULL DEFAULT NOW())
├── mastered_at (TIMESTAMP)
├── ease_factor (FLOAT NOT NULL DEFAULT 2.5)
├── repetition_count (INTEGER NOT NULL DEFAULT 0)
├── interval (INTEGER NOT NULL DEFAULT 0)
├── next_review_at (TIMESTAMP)
└── last_reviewed_at (TIMESTAMP)

word_conjugations
├── id (SERIAL PRIMARY KEY)
├── word_id (INTEGER NOT NULL → words.id)
├── tense (VARCHAR(50) NOT NULL)
├── person (VARCHAR(10) NOT NULL)
├── form (VARCHAR(255) NOT NULL)
└── language (VARCHAR(50) NOT NULL)

word_relations
├── id (SERIAL PRIMARY KEY)
├── user_id (INTEGER NOT NULL → users.id)
├── source_word_id (INTEGER NOT NULL → words.id)
├── target_word_id (INTEGER NOT NULL → words.id)
├── relation_type (VARCHAR(50) NOT NULL)
└── created_at (TIMESTAMP NOT NULL DEFAULT NOW())

articles
├── id (SERIAL PRIMARY KEY)
├── user_id (INTEGER NOT NULL → users.id)
├── title (VARCHAR(500) NOT NULL)
├── url (TEXT)
├── content (TEXT NOT NULL)
├── language (VARCHAR(50) NOT NULL)
└── added_at (TIMESTAMP NOT NULL DEFAULT NOW())

user_progress
├── id (SERIAL PRIMARY KEY)
├── user_id (INTEGER UNIQUE NOT NULL → users.id)
├── words_mastered (INTEGER NOT NULL DEFAULT 0)
├── quests_completed (INTEGER NOT NULL DEFAULT 0)
├── streak_days (INTEGER NOT NULL DEFAULT 0)
├── last_active_at (TIMESTAMP NOT NULL DEFAULT NOW())
└── updated_at (TIMESTAMP NOT NULL DEFAULT NOW())
```

### Indexes

```sql
CREATE INDEX IF NOT EXISTS idx_words_user_id ON words(user_id);
CREATE INDEX IF NOT EXISTS idx_words_status ON words(status);
CREATE INDEX IF NOT EXISTS idx_quests_user_id ON quests(user_id);
CREATE INDEX IF NOT EXISTS idx_quests_status ON quests(status);
CREATE INDEX IF NOT EXISTS idx_word_relations_user_id ON word_relations(user_id);
```

---

## Migration Strategy

### Automatic Initialization

On first startup, the backend automatically creates all tables if they don't exist. This is handled in `/home/user/lexia/backend/internal/database/postgres.go:InitSchema()`.

### For Production Updates

For production systems, we recommend **versioned SQL migration files** for safety and traceability.

---

## Creating Migrations

### Migration File Naming Convention

```
migrations/
├── 001_initial_schema.up.sql
├── 001_initial_schema.down.sql
├── 002_add_srs_fields.up.sql
├── 002_add_srs_fields.down.sql
├── 003_add_user_progress.up.sql
└── 003_add_user_progress.down.sql
```

### Migration Template

Create a new migration:

```bash
mkdir -p migrations
cd migrations

# Create up migration
cat > 004_add_new_feature.up.sql << 'EOF'
-- Migration: Add new feature
-- Created: 2025-01-07
-- Description: Adds new feature X

BEGIN;

-- Your schema changes here
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

COMMIT;
EOF

# Create down migration (rollback)
cat > 004_add_new_feature.down.sql << 'EOF'
-- Rollback: Add new feature
-- Created: 2025-01-07

BEGIN;

-- Reverse the changes
ALTER TABLE users DROP COLUMN IF EXISTS new_field;

COMMIT;
EOF
```

---

## Running Migrations

### Method 1: Manual Execution

```bash
# Connect to database
docker exec -it synapse-postgres psql -U synapse_user -d synapse_prod

# Run migration
\i /path/to/migrations/004_add_new_feature.up.sql

# Verify changes
\d users

# Exit
\q
```

### Method 2: Using psql from Host

```bash
# Run migration from host
cat migrations/004_add_new_feature.up.sql | docker exec -i synapse-postgres psql -U synapse_user -d synapse_prod
```

### Method 3: Migration Script

Create `/usr/local/bin/synapse-migrate.sh`:

```bash
#!/bin/bash
MIGRATION_FILE=$1
DB_CONTAINER="synapse-postgres"
DB_USER="synapse_user"
DB_NAME="synapse_prod"

if [ -z "$MIGRATION_FILE" ]; then
    echo "Usage: synapse-migrate.sh <migration_file>"
    exit 1
fi

if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

echo "🔄 Running migration: $MIGRATION_FILE"
cat $MIGRATION_FILE | docker exec -i $DB_CONTAINER psql -U $DB_USER -d $DB_NAME

if [ $? -eq 0 ]; then
    echo "✅ Migration completed successfully"
else
    echo "❌ Migration failed"
    exit 1
fi
```

Make it executable:

```bash
chmod +x /usr/local/bin/synapse-migrate.sh
```

Run migrations:

```bash
synapse-migrate.sh migrations/004_add_new_feature.up.sql
```

---

## Rollback Procedures

### Rolling Back a Migration

```bash
# Run the down migration
synapse-migrate.sh migrations/004_add_new_feature.down.sql
```

### Emergency Rollback

If a migration causes issues:

1. **Stop the backend**:
   ```bash
   docker compose -f docker-compose.prod.yml stop backend
   ```

2. **Restore from backup**:
   ```bash
   # Restore latest backup
   gunzip < /var/backups/synapse/db_latest.sql.gz | docker exec -i synapse-postgres psql -U synapse_user synapse_prod
   ```

3. **Verify database**:
   ```bash
   docker exec synapse-postgres psql -U synapse_user -d synapse_prod -c "\dt"
   ```

4. **Restart backend**:
   ```bash
   docker compose -f docker-compose.prod.yml start backend
   ```

---

## Best Practices

### 1. Always Backup Before Migrations

```bash
# Create backup
docker exec synapse-postgres pg_dump -U synapse_user synapse_prod | gzip > backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### 2. Test Migrations in Development

```bash
# Test on development database first
docker compose up -d
cat migrations/004_add_new_feature.up.sql | docker exec -i synapse-postgres-dev psql -U synapse_user synapse_dev
```

### 3. Use Transactions

Always wrap migrations in `BEGIN`/`COMMIT`:

```sql
BEGIN;

-- Your changes here
ALTER TABLE users ADD COLUMN new_field VARCHAR(255);

COMMIT;
```

### 4. Keep Migrations Idempotent

Use `IF EXISTS` and `IF NOT EXISTS`:

```sql
-- Safe to run multiple times
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_field VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_new_field ON users(new_field);
```

### 5. Document Migrations

Add comments to explain:

```sql
-- Migration: Add email verification
-- Created: 2025-01-07
-- Author: DevOps Team
-- Description: Adds email_verified column and verification_token
-- Related ticket: JIRA-123

BEGIN;

ALTER TABLE users ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verification_token VARCHAR(255);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON users(verification_token);

COMMIT;
```

### 6. Version Control

Commit migrations to Git:

```bash
git add migrations/
git commit -m "Add migration: email verification"
git push
```

---

## Specific Migrations

### Migration 1: Add SRS Fields (Already Applied)

This migration adds Spaced Repetition System fields to the `words` table.

**File**: `migrations/001_add_srs_fields.up.sql`

```sql
-- Migration: Add SRS fields to words table
-- Created: 2025-01-07
-- Description: Adds ease_factor, repetition_count, interval, and review timestamps

BEGIN;

ALTER TABLE words ADD COLUMN IF NOT EXISTS ease_factor FLOAT NOT NULL DEFAULT 2.5;
ALTER TABLE words ADD COLUMN IF NOT EXISTS repetition_count INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN IF NOT EXISTS interval INTEGER NOT NULL DEFAULT 0;
ALTER TABLE words ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMP;
ALTER TABLE words ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP;

COMMIT;
```

**Rollback**: `migrations/001_add_srs_fields.down.sql`

```sql
BEGIN;

ALTER TABLE words DROP COLUMN IF EXISTS ease_factor;
ALTER TABLE words DROP COLUMN IF EXISTS repetition_count;
ALTER TABLE words DROP COLUMN IF EXISTS interval;
ALTER TABLE words DROP COLUMN IF EXISTS next_review_at;
ALTER TABLE words DROP COLUMN IF EXISTS last_reviewed_at;

COMMIT;
```

### Migration 2: Add User Progress Table (Already Applied)

**Status**: Already in initial schema.

---

## Checking Migration Status

### View Current Schema

```bash
# Connect to database
docker exec -it synapse-postgres psql -U synapse_user -d synapse_prod

# List all tables
\dt

# Describe a specific table
\d words

# Check if column exists
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'words' AND column_name = 'ease_factor';
```

### Create Migration Tracking Table

For tracking which migrations have been applied:

```sql
CREATE TABLE IF NOT EXISTS schema_migrations (
    version INTEGER PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    applied_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

Track migrations:

```sql
-- After running migration 004
INSERT INTO schema_migrations (version, name) VALUES (4, 'add_new_feature');
```

---

## Troubleshooting

### Migration Failed Mid-Way

If a migration fails without a transaction:

```bash
# Check what changes were made
\d table_name

# Manually fix or rollback
ALTER TABLE ...

# Re-run migration if it's idempotent
```

### Column Already Exists

Use `IF NOT EXISTS`:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS new_field VARCHAR(255);
```

### Foreign Key Violations

If you need to drop a referenced column:

```sql
-- First, drop foreign key constraints
ALTER TABLE child_table DROP CONSTRAINT IF EXISTS fk_constraint_name;

-- Then drop the column
ALTER TABLE parent_table DROP COLUMN column_name;
```

---

## Future Improvements

Consider using a migration tool like:

- **golang-migrate**: Go-based migration tool
- **Flyway**: Java-based migration tool
- **Liquibase**: Database-independent migration tool

Example with golang-migrate:

```bash
# Install
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest

# Create migration
migrate create -ext sql -dir migrations -seq add_new_feature

# Run migrations
migrate -path migrations -database "postgres://user:pass@localhost:5432/synapse_prod?sslmode=disable" up

# Rollback
migrate -path migrations -database "postgres://user:pass@localhost:5432/synapse_prod?sslmode=disable" down 1
```

---

## Summary

- **Always backup** before migrations
- **Test in development** first
- **Use transactions** for safety
- **Document all changes**
- **Keep migrations idempotent**
- **Version control** everything

For questions, see [DEPLOYMENT.md](DEPLOYMENT.md) or contact the dev team.
