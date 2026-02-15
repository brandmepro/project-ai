# Quick Start: AI Model Scheduler

## Installation

**Note:** You must install the new dependencies before running the application.

```powershell
# Navigate to the API folder
cd api

# Install dependencies
bun install
```

## Configuration

The scheduler is already configured in your `.env` file with these settings:

```bash
# Enable the scheduler
MODEL_SYNC_ENABLED=true

# Run every day at 2:00 AM UTC
MODEL_SYNC_CRON_SCHEDULE=0 0 2 * * *
```

## Starting the Application

```powershell
# Development mode (with auto-reload)
cd api
bun run start:dev
```

You should see these logs:
```
[ModelSyncScheduler] AI Model Sync Scheduler initialized with cron: 0 0 2 * * *
```

## Testing the Scheduler

### Option 1: Wait for scheduled run (2 AM UTC)

The scheduler will run automatically at the configured time.

### Option 2: Trigger manual sync immediately

You can trigger a manual sync without waiting for the scheduled time:

**Using curl:**
```powershell
curl -X POST http://localhost:8000/api/v1/scheduler/sync-models `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Using Postman/Insomnia:**
1. Create a POST request to: `http://localhost:8000/api/v1/scheduler/sync-models`
2. Add Authorization header: `Bearer YOUR_JWT_TOKEN`
3. Send the request

**Expected Response:**
```json
{
  "success": true,
  "result": {
    "total": 150,
    "created": 150,
    "updated": 0,
    "failed": 0
  }
}
```

### Check Sync Statistics

```powershell
curl http://localhost:8000/api/v1/scheduler/sync-stats `
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Response:**
```json
{
  "totalModels": 150,
  "activeModels": 150,
  "inactiveModels": 0,
  "lastSyncDate": "2026-02-15T10:30:00.000Z"
}
```

## Verify Database

Check if models were synced to the database:

```sql
-- Count all models
SELECT COUNT(*) FROM ai_models;

-- View recent models
SELECT model_id, model_name, provider, is_active, created_at 
FROM ai_models 
ORDER BY created_at DESC 
LIMIT 10;

-- Check active models by provider
SELECT provider, COUNT(*) as count 
FROM ai_models 
WHERE is_active = true 
GROUP BY provider 
ORDER BY count DESC;
```

## Common CRON Schedules

Update `MODEL_SYNC_CRON_SCHEDULE` in `.env` to change the schedule:

```bash
# Every hour
MODEL_SYNC_CRON_SCHEDULE=0 0 * * * *

# Every 6 hours
MODEL_SYNC_CRON_SCHEDULE=0 0 */6 * * *

# Every 30 minutes
MODEL_SYNC_CRON_SCHEDULE=0 */30 * * * *

# Every day at 2 AM
MODEL_SYNC_CRON_SCHEDULE=0 0 2 * * *

# Every Monday at midnight
MODEL_SYNC_CRON_SCHEDULE=0 0 0 * * 1

# Twice daily (2 AM and 2 PM)
MODEL_SYNC_CRON_SCHEDULE=0 0 2,14 * * *
```

After changing the schedule, restart the application.

## Troubleshooting

### Issue: "Cannot find module '@nestjs/axios'"

**Solution:** Install dependencies
```powershell
cd api
bun install
```

### Issue: Scheduler not running

**Check:**
1. Is `MODEL_SYNC_ENABLED=true` in `.env`?
2. Did you restart the application after changes?
3. Check logs for initialization message

### Issue: 401 Unauthorized on API endpoints

**Solution:** 
1. Login to get a JWT token
2. Use the token in Authorization header: `Bearer YOUR_TOKEN`

### Issue: No logs appearing

**Check:**
1. The CRON hasn't triggered yet (default is 2 AM UTC)
2. Trigger manual sync via API endpoint
3. Check if `MODEL_SYNC_ENABLED=false`

## Logs to Watch For

**Successful sync:**
```
[ModelSyncScheduler] Starting scheduled AI models synchronization...
[ModelSyncService] Fetching models from: https://ai-gateway.vercel.sh/v1/models
[ModelSyncService] Successfully fetched 150 models from AI Gateway
[ModelSyncScheduler] ✅ AI Models sync completed successfully in 2345ms
[ModelSyncScheduler] 📊 Stats: 150 total, 5 created, 145 updated, 0 failed
[ModelSyncScheduler] 📈 Database Stats: 148 active models, 2 inactive models
```

**Errors:**
```
[ModelSyncService] Failed to fetch models from AI Gateway
[ModelSyncScheduler] ❌ Scheduled AI models sync failed
```

## Next Steps

1. **Install dependencies**: `cd api && bun install`
2. **Start the app**: `bun run start:dev`
3. **Trigger manual sync**: Use the API endpoint
4. **Verify in database**: Check `ai_models` table
5. **Configure schedule**: Adjust `MODEL_SYNC_CRON_SCHEDULE` if needed

## Full Documentation

For detailed information, see: [docs/scheduler-module-guide.md](./scheduler-module-guide.md)

---

**Need Help?**
- Check application logs
- Review `.env` configuration
- Test API endpoints manually
- Verify database connectivity
