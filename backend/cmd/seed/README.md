# Database Seeder

This tool seeds the database with sample data for development and testing purposes.

## What it seeds

### Users (4 demo accounts)
- **demo@synapse.app** / `Demo1234` - Main demo account with full data
- **alice@example.com** / `Alice1234` - Learning Finnish
- **bob@example.com** / `Bob1234` - Learning Spanish
- **carol@example.com** / `Carol1234` - Learning French

### Words (~22 Finnish words for demo user)
- **8 Solid words** (mastered) - hei, kiitos, kyllä, ei, hyvä, päivä, vesi, ruoka
- **6 Liquid words** (learning) - talo, auto, kirja, koulu, työ, aika
- **8 Ghost words** (new) - opiskella, puhua, syödä, juoda, nähdä, kuulla, ystävä, perhe

Each word includes:
- Definition
- Part of speech
- Status (ghost/liquid/solid)
- SRS data (ease factor, interval, repetitions)
- Next review date (for non-ghost words)

### Quests (4 quests for demo user)
- **2 Completed** - "Introduce Yourself", "Daily Routine"
- **1 In Progress** - "Shopping Trip"
- **1 Pending** - "Weekend Plans"

Each quest includes:
- Title and description
- Target words
- Status
- Completion date (if completed)

### Progress Data
- Streak tracking (7-14 days)
- Last activity date
- Ready for analytics

## Usage

### Run the seeder

From the backend directory:

```bash
cd backend
go run cmd/seed/main.go
```

Or build and run:

```bash
cd backend
go build -o seed cmd/seed/main.go
./seed
```

### Using the helper script

From the project root:

```bash
./seed-database.sh
```

### From docker-compose

If running in Docker:

```bash
docker-compose exec backend go run cmd/seed/main.go
```

## Features

### Idempotent
- The seeder checks if data already exists before inserting
- Safe to run multiple times
- Won't create duplicates

### Realistic Data
- Words have realistic SRS intervals and repetition counts
- Quests have varied statuses
- Progress data includes active streak
- Timestamps are set appropriately

### Development Ready
- Perfect for screenshots
- Good for testing analytics
- Demonstrates all features
- Multiple user accounts for testing

## Login Credentials

After seeding, you can log in with any of these accounts:

| Email | Password | Language | Description |
|-------|----------|----------|-------------|
| demo@synapse.app | Demo1234 | Finnish | Full demo data |
| alice@example.com | Alice1234 | Finnish | Secondary account |
| bob@example.com | Bob1234 | Spanish | Spanish learner |
| carol@example.com | Carol1234 | French | French learner |

## When to Use

### Required
- First-time setup for development
- Creating screenshots for documentation
- Testing the application
- Demonstrating features to stakeholders

### Optional
- After database reset
- When you need fresh test data
- For integration testing

## Customization

To add more seed data, edit `cmd/seed/main.go`:

1. **Add more users**: Extend the `users` slice in `seedUsers()`
2. **Add more words**: Extend the `words` slice in `seedWords()`
3. **Add more quests**: Extend the `quests` slice in `seedQuests()`
4. **Adjust progress**: Modify streak days in `seedProgress()`

## Database Requirements

The seeder requires:
- PostgreSQL database running
- Database schema initialized (via `InitSchema()`)
- Environment variables configured (`.env`)

The seeder will automatically:
- Initialize the schema if needed
- Skip existing data
- Create all necessary records

## Output

The seeder provides clear output:

```
🌱 Starting database seeder...
👤 Seeding users...
  ✅ Created user: demo_user (demo@synapse.app)
  ✅ Created user: alice (alice@example.com)
  ✅ Created user: bob (bob@example.com)
  ✅ Created user: carol (carol@example.com)
📚 Seeding words...
  ✅ Created 22 words with mixed statuses
✍️  Seeding quests...
  ✅ Created 4 quests with various statuses
📈 Seeding progress data...
  ✅ Created progress data with 12 day streak
✅ Database seeding completed successfully!
```

## Troubleshooting

### "Failed to connect to database"
- Check PostgreSQL is running
- Verify `.env` file has correct database credentials
- Ensure database exists

### "Failed to initialize schema"
- Check database permissions
- Verify user has CREATE TABLE privileges
- Check PostgreSQL logs for errors

### "User already exists"
- This is normal if you've run the seeder before
- The seeder will skip existing users
- Safe to continue

## Development Workflow

Typical workflow:

```bash
# 1. Start database
docker-compose up -d postgres

# 2. Run seeder
cd backend
go run cmd/seed/main.go

# 3. Start application
go run cmd/api/main.go

# 4. Login with demo@synapse.app / Demo1234
```

## Production Warning

⚠️ **DO NOT run this seeder in production!**

This seeder is for development and testing only:
- Uses weak passwords (Demo1234, etc.)
- Creates publicly known credentials
- Not designed for production security
- No data validation beyond basic checks

For production data:
- Use proper user registration
- Enforce strong passwords
- Follow security best practices
- Use migrations for schema changes

## Related Files

- `backend/internal/database/schema.go` - Database schema
- `backend/internal/config/config.go` - Configuration
- `dev-setup.sh` - Development setup script
- `.env.example` - Environment variable template

## Technical Details

### Dependencies
- `github.com/BachirKhiati/lexia/internal/config`
- `github.com/BachirKhiati/lexia/internal/database`
- `github.com/BachirKhiati/lexia/internal/services/auth`
- `golang.org/x/crypto/bcrypt`

### Database Tables Used
- `users` - User accounts
- `words` - Vocabulary with SRS data
- `quests` - Writing quests
- `user_progress` - Progress tracking

### SRS Algorithm
Words are seeded with realistic SM-2 algorithm data:
- **Ease Factor**: 2.0-2.6 (difficulty rating)
- **Interval**: 0-45 days (time until next review)
- **Repetitions**: 0-6 (number of successful reviews)

This ensures the SRS system works immediately after seeding.
