# AI Models Scheduler Module

## Overview

The Scheduler Module provides automated synchronization of AI models from the Vercel AI Gateway into our database. This ensures our application always has up-to-date information about available AI models, their capabilities, and pricing.

## Architecture

```
api/src/scheduler/
├── scheduler.module.ts           # Main module configuration
├── scheduler.controller.ts       # REST API endpoints for manual control
├── services/
│   └── model-sync.service.ts    # Core sync logic and data transformation
├── schedulers/
│   └── model-sync.scheduler.ts  # CRON scheduler implementation
└── types/
    └── vercel-models.types.ts   # TypeScript interfaces for Vercel API
```

## Features

### 1. **Automated Model Synchronization**
- Fetches all AI models from Vercel AI Gateway: `https://ai-gateway.vercel.sh/v1/models`
- Runs on a configurable CRON schedule (default: daily at 2 AM UTC)
- Updates existing models and creates new ones
- Deactivates models that are no longer available

### 2. **Smart Data Transformation**
- Converts Vercel model data to our database schema
- Parses pricing (including tiered pricing structures)
- Extracts capabilities from model tags
- Determines cost buckets automatically
- Preserves user-configured settings (recommendations, priority)

### 3. **Manual Control**
- Manual sync trigger via API endpoint
- Real-time sync statistics
- Enable/disable via environment variables

## Configuration

### Environment Variables

Add these to your `api/.env` file:

```bash
# AI Model Sync Scheduler Configuration
# Enable/disable the AI model sync scheduler
MODEL_SYNC_ENABLED=true

# CRON schedule for AI model synchronization
# Default: "0 0 2 * * *" (Every day at 2:00 AM UTC)
MODEL_SYNC_CRON_SCHEDULE=0 0 2 * * *
```

### CRON Expression Format

```
┌────────────── second (0-59)
│ ┌──────────── minute (0-59)
│ │ ┌────────── hour (0-23)
│ │ │ ┌──────── day of month (1-31)
│ │ │ │ ┌────── month (1-12)
│ │ │ │ │ ┌──── day of week (0-7) (0 or 7 is Sunday)
│ │ │ │ │ │
* * * * * *
```

### Common CRON Patterns

```bash
# Every day at 2:00 AM
MODEL_SYNC_CRON_SCHEDULE=0 0 2 * * *

# Every 6 hours
MODEL_SYNC_CRON_SCHEDULE=0 0 */6 * * *

# Every 30 minutes
MODEL_SYNC_CRON_SCHEDULE=0 */30 * * * *

# Every Monday at midnight
MODEL_SYNC_CRON_SCHEDULE=0 0 0 * * 1

# First day of every month at noon
MODEL_SYNC_CRON_SCHEDULE=0 0 12 1 * *

# Every hour
MODEL_SYNC_CRON_SCHEDULE=0 0 * * * *
```

## API Endpoints

### 1. Manual Sync Trigger

**POST** `/api/v1/scheduler/sync-models`

Manually trigger AI models synchronization.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "success": true,
  "result": {
    "total": 150,
    "created": 5,
    "updated": 145,
    "failed": 0
  }
}
```

### 2. Get Sync Statistics

**GET** `/api/v1/scheduler/sync-stats`

Get current synchronization statistics.

**Headers:**
```
Authorization: Bearer <jwt-token>
```

**Response:**
```json
{
  "totalModels": 150,
  "activeModels": 148,
  "inactiveModels": 2,
  "lastSyncDate": "2026-02-15T02:00:00.000Z"
}
```

## Data Transformation

### Vercel Model Structure
```json
{
  "id": "anthropic/claude-sonnet-4",
  "object": "model",
  "created": 1755815280,
  "released": 1747872000,
  "owned_by": "anthropic",
  "name": "Claude Sonnet 4",
  "description": "...",
  "context_window": 1000000,
  "max_tokens": 64000,
  "type": "language",
  "tags": ["file-input", "reasoning", "tool-use", "vision"],
  "pricing": {
    "input": "0.000003",
    "output": "0.000015",
    "input_cache_read": "0.0000003",
    "input_cache_write": "0.00000375",
    "web_search": "10"
  }
}
```

### Our Database Schema (ai_models table)

The sync service transforms Vercel models into our `AIModel` entity with these key mappings:

| Vercel Field | Our Field | Transformation |
|-------------|-----------|----------------|
| `id` | `modelId` | Direct mapping |
| `name` | `modelName` | Direct mapping |
| `id.split('/')[0]` | `provider` | Extract provider from ID |
| `tags` | `capabilities[]` | Convert tags to capabilities |
| `pricing.input` | `costPer1mInput` | Parse to decimal |
| `pricing.output` | `costPer1mOutput` | Parse to decimal |
| `tags.includes('tool-use')` | `supportsFunctionCalling` | Boolean flag |
| `tags.includes('vision')` | `supportsVision` | Boolean flag |
| `tags.includes('reasoning')` | Capability array | Add reasoning |

### Cost Bucket Calculation

```typescript
if (outputCost < 0.000001) costBucket = 'free';
else if (outputCost < 0.000005) costBucket = 'ultra-low';
else if (outputCost < 0.00002) costBucket = 'low';
else if (outputCost < 0.0001) costBucket = 'medium';
else if (outputCost < 0.001) costBucket = 'high';
else costBucket = 'premium';
```

## Usage Examples

### Starting the Application

The scheduler starts automatically when the NestJS application boots:

```bash
cd api
bun run start:dev
```

You'll see logs like:
```
[ModelSyncScheduler] AI Model Sync Scheduler initialized with cron: 0 0 2 * * *
[ModelSyncScheduler] Starting scheduled AI models synchronization...
[ModelSyncService] Fetching models from: https://ai-gateway.vercel.sh/v1/models
[ModelSyncService] Successfully fetched 150 models from AI Gateway
[ModelSyncScheduler] ✅ AI Models sync completed successfully in 2345ms
[ModelSyncScheduler] 📊 Stats: 150 total, 5 created, 145 updated, 0 failed
```

### Manual Sync via API

```bash
# Using curl
curl -X POST http://localhost:8000/api/v1/scheduler/sync-models \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"

# Using httpie
http POST localhost:8000/api/v1/scheduler/sync-models \
  Authorization:"Bearer YOUR_JWT_TOKEN"
```

### Check Sync Statistics

```bash
curl http://localhost:8000/api/v1/scheduler/sync-stats \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Logging

The scheduler provides detailed logging:

- **Info**: Sync start/completion, statistics
- **Debug**: Individual model updates/creations
- **Warn**: Unexpected API responses, disabled scheduler
- **Error**: Sync failures, API errors

Example log output:
```
[ModelSyncScheduler] Starting scheduled AI models synchronization...
[ModelSyncService] Fetching models from: https://ai-gateway.vercel.sh/v1/models
[ModelSyncService] Successfully fetched 150 models from AI Gateway
[ModelSyncService] Updated model: anthropic/claude-sonnet-4
[ModelSyncService] Created model: openai/gpt-5.2
[ModelSyncService] Deactivated 2 models that are no longer available
[ModelSyncScheduler] ✅ AI Models sync completed successfully in 2345ms
[ModelSyncScheduler] 📊 Stats: 150 total, 1 created, 147 updated, 2 failed
[ModelSyncScheduler] 📈 Database Stats: 148 active models, 2 inactive models
```

## Error Handling

The scheduler includes robust error handling:

1. **Network Failures**: Retries with timeout (30s)
2. **Partial Failures**: Continues processing remaining models
3. **Database Errors**: Logs errors but doesn't crash the app
4. **Invalid Data**: Skips invalid models and logs warnings

## Deployment Considerations

### Production Settings

```bash
# Recommended production schedule (once per day)
MODEL_SYNC_CRON_SCHEDULE=0 0 2 * * *

# Or twice per day
MODEL_SYNC_CRON_SCHEDULE=0 0 2,14 * * *
```

### Monitoring

Monitor these logs in production:
- Sync success/failure rates
- Number of new/updated/failed models
- Sync duration
- API response times

### Database Impact

- **Read Load**: Minimal (one query per model to check existence)
- **Write Load**: Moderate during sync (upsert per model)
- **Recommended**: Run during low-traffic hours (default: 2 AM UTC)

## Testing

### Test the Sync Service

```bash
cd api
bun run test scheduler
```

### Manual Testing

1. **Disable auto-sync**: Set `MODEL_SYNC_ENABLED=false`
2. **Test API endpoint**: Call POST `/scheduler/sync-models`
3. **Check database**: Query `ai_models` table
4. **Verify logs**: Check application logs

## Troubleshooting

### Issue: Scheduler not running

**Check:**
1. Is `MODEL_SYNC_ENABLED=true`?
2. Is SchedulerModule imported in AppModule?
3. Check logs for initialization message

### Issue: API endpoint returns 401

**Solution:** Ensure you're sending a valid JWT token in Authorization header

### Issue: Models not updating

**Check:**
1. Vercel AI Gateway accessibility
2. Database connection
3. Error logs for specific model IDs

### Issue: Duplicate models

**Solution:** Models are upserted by `modelId`, duplicates shouldn't occur. Check database unique constraints.

## Future Enhancements

- [ ] Add Webhook support for real-time updates
- [ ] Implement model versioning history
- [ ] Add model performance tracking
- [ ] Create admin dashboard for sync monitoring
- [ ] Add model recommendation scoring algorithm
- [ ] Support multiple AI gateway providers

## Dependencies

```json
{
  "@nestjs/schedule": "^4.0.0",
  "@nestjs/axios": "^3.0.0",
  "@nestjs/typeorm": "^10.0.1",
  "rxjs": "^7.8.1"
}
```

## Related Documentation

- [NestJS Schedule Documentation](https://docs.nestjs.com/techniques/task-scheduling)
- [Vercel AI Gateway API](https://ai-gateway.vercel.sh/v1/models)
- [AI Models Entity Schema](../ai/entities/ai-model.entity.ts)
- [TypeORM Documentation](https://typeorm.io/)

## Support

For issues or questions:
1. Check application logs
2. Review this documentation
3. Test manually via API endpoints
4. Contact development team

---

**Last Updated:** February 15, 2026
**Version:** 1.0.0
