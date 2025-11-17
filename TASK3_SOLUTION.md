# Task 3: Request ID Tracking

Added request ID tracking so we can trace requests through logs. Each request gets a unique UUID that shows up in headers and logs.

## Implementation

### Request ID Middleware (`src/middleware/requestId.js`)

Creates a UUID for each request and attaches it to both the request object and response headers:

```javascript
import { randomUUID } from 'crypto';

export function requestIdMiddleware(req, res, next) {
  const requestId = randomUUID();
  req.requestId = requestId;
  
  res.header('X-Request-ID', requestId);
  
  // Make sure header stays set even if other middleware modifies response
  const originalSend = res.send;
  res.send = function(...args) {
    if (!res.headersSent) {
      res.header('X-Request-ID', requestId);
    }
    return originalSend.apply(this, args);
  };
  
  next();
}
```

The `res.send()` interception ensures the header is set even if something else modifies the response.

### Request Logger (`src/middleware/requestLogger.js`)

Updated to include request ID in logs:

```javascript
const { method, url, ip, requestId } = req;
// ...
logger.info(`${method} ${url} ${statusCode} - ${duration}ms`, requestId, { ip });
```

### Logger Utility (`src/utils/logger.js`)

Enhanced the logger to automatically detect and include request IDs. Added a helper that checks if the first argument looks like a UUID, and if so, includes it in the log format.

The log format now looks like:
```
[timestamp] [INFO] [requestId] GET /api/ai/chat 200 - 150ms
```

It's backward compatible - existing logger calls without request ID still work fine.

### Integration (`src/index.js`)

Placed the middleware first, before everything else, so the request ID is available throughout the request lifecycle:

```javascript
app.use(requestIdMiddleware);
app.use(express.json({ limit: '10mb' }));
// ... rest of middleware
```

### Controllers & Error Handler

Updated `aiController` and `errorHandler` to pass request ID to logger calls. Now all logs include the request ID when available.

## Files Changed

- Created: `src/middleware/requestId.js`
- Modified: `src/middleware/requestLogger.js`, `src/utils/logger.js`, `src/index.js`, `src/controllers/ai.controller.js`, `src/middleware/errorHandler.js`

## Example Output

Response headers:
```
X-Request-ID: 8c0ff0e7-c6b5-46e8-b71f-3a73b76974d4
```

Logs:
```
[2024-01-01T12:00:00.000Z] [INFO] [8c0ff0e7-c6b5-46e8-b71f-3a73b76974d4] GET /health 200 - 5ms
```

## Testing

```bash
# Check header
curl -v http://localhost:3000/health 2>&1 | grep -i "x-request-id"

# Multiple requests should have different IDs
curl -I http://localhost:3000/health | grep "X-Request-ID"
curl -I http://localhost:3000/api/cache/stats | grep "X-Request-ID"
```

## Notes

- JavaScript project - all `.js` files
- Middleware runs first so request ID is available everywhere
- Logger auto-detects UUID format, so it's flexible
- Backward compatible with existing logger calls
- Request ID appears in error logs too, which helps debugging
