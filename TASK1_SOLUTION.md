# Task 1: Cache Statistics Endpoint

Added a new endpoint to expose cache statistics. Pretty straightforward - just needed to track hits/misses and expose the data.

## What Changed

### Cache Service (`src/services/cache.service.js`)

Added hit/miss tracking to the existing cache service. The `size()` method was already there, so I just extended it with stats tracking.

- Added a `stats` object in the constructor to keep track of hits and misses
- Modified `get()` to increment counters when cache is hit or missed
- Created `getStats()` method that returns useful metrics:
  - Current cache size
  - Default TTL (both ms and seconds for convenience)
  - Hit/miss counts and total requests
  - Hit rate percentage

The `getStats()` method uses the existing `size()` method, so no breaking changes.

### Cache Controller (`src/controllers/cache.controller.js`)

Simple controller that calls the service and returns the stats:

```javascript
export const cacheController = {
  getStats: asyncHandler(async (_req, res) => {
    const stats = cacheService.getStats();
    sendSuccess(res, stats, 'Cache statistics retrieved successfully');
  }),
};
```

### Routes (`src/routes/cache.routes.js`)

Standard route setup:

```javascript
router.get('/stats', cacheController.getStats);
```

Registered it in `src/routes/index.js` under `/cache`.

## API

**GET** `/api/cache/stats`

Returns something like:
```json
{
  "success": true,
  "data": {
    "size": 5,
    "defaultTTL": 300000,
    "defaultTTLSeconds": 300,
    "hits": 42,
    "misses": 18,
    "totalRequests": 60,
    "hitRate": "70.00%"
  },
  "message": "Cache statistics retrieved successfully",
  "timestamp": "2024-01-01T12:00:00.000Z"
}
```

## Testing

```bash
npm run dev
curl http://localhost:3000/api/cache/stats
```

## Notes

- All files are JavaScript (.js), not TypeScript
- Used the existing `size()` method - just added stats on top
- Follows the same pattern as other controllers/routes/services in the project
