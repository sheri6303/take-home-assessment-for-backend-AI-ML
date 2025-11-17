# Task 3: Request ID Tracking Middleware - Solution

## Overview

Implemented request ID tracking middleware that generates a unique UUID for each request, attaches it to the request object, includes it in response headers, and enhances all log messages with the request ID for better traceability and debugging.

## Implementation

### 1. Created Request ID Middleware (`src/middleware/requestId.js`)

- Generates unique request ID using `crypto.randomUUID()`
- Attaches ID to `req.requestId` for use throughout request lifecycle
- Sets `X-Request-ID` response header using Express's `res.header()`
- Intercepts `res.send()` to ensure header is set before response is sent
- Ensures header persistence even if other middleware modifies response

```javascript
import { randomUUID } from 'crypto';

export function requestIdMiddleware(req, res, next) {
  const requestId = randomUUID();
  req.requestId = requestId;
  res.header('X-Request-ID', requestId);
  
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

### 2. Updated Request Logger (`src/middleware/requestLogger.js`)

- Extracts `requestId` from request object
- Passes request ID to logger when logging requests
- Log format: `[timestamp] [INFO] [requestId] GET /api/ai/chat 200 - 150ms`

```javascript
export function requestLogger(req, res, next) {
  const { method, url, ip, requestId } = req;
  // ...
  logger.info(`${method} ${url} ${statusCode} - ${duration}ms`, requestId, { ip });
}
```

### 3. Enhanced Logger Utility (`src/utils/logger.js`)

- Added `_extractRequestId()` helper to automatically detect UUID format in arguments
- Updated `formatMessage()` to include request ID in log prefix: `[timestamp] [LEVEL] [requestId]`
- Updated all logger methods (`debug`, `info`, `warn`, `error`) to automatically detect and include request ID
- Backward compatible: existing logger calls without requestId continue to work

```javascript
formatMessage(level, message, requestId, ...args) {
  const requestIdPart = requestId ? `[${requestId}]` : '';
  const prefix = `[${timestamp}] [${level.toUpperCase()}]${requestIdPart ? ` ${requestIdPart}` : ''}`;
  // ...
}

_extractRequestId(...args) {
  if (args.length > 0 && typeof args[0] === 'string' && 
      args[0].match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
    return { requestId: args[0], remainingArgs: args.slice(1) };
  }
  return { requestId: undefined, remainingArgs: args };
}
```

### 4. Integrated Middleware (`src/index.js`)

- Placed `requestIdMiddleware` as the **very first middleware** (before express.json, CORS, etc.)
- Ensures global coverage for all requests
- Request ID available from the start of request processing

```javascript
const app = express();

// Middleware - Request ID must be first to ensure global coverage
app.use(requestIdMiddleware);

// Request size limit (10MB)
app.use(express.json({ limit: '10mb' }));
// ... other middleware
```

### 5. Updated Controllers and Error Handler

- Updated `aiController` to pass `req.requestId` to logger calls
- Updated `errorHandler` to include requestId in error logs
- Request ID now appears in all application logs

## Files Changed

- **Created:** `src/middleware/requestId.js`
- **Modified:** `src/middleware/requestLogger.js`, `src/utils/logger.js`, `src/index.js`, `src/controllers/ai.controller.js`, `src/middleware/errorHandler.js`, `src/middleware/index.js`

## Key Features

- **Automatic UUID Generation**: Each request gets a unique identifier
- **Response Header**: `X-Request-ID` header included in all responses
- **Request Object Attachment**: Available as `req.requestId` throughout request lifecycle
- **Log Integration**: Request ID automatically included in all log messages
- **Backward Compatible**: Existing logger calls work without modification
- **Global Coverage**: Middleware runs first, covering all routes and errors

## Example Output

### Response Headers
```
HTTP/1.1 200 OK
X-Request-ID: 8c0ff0e7-c6b5-46e8-b71f-3a73b76974d4
Content-Type: application/json
```

### Log Messages
```
[2024-01-01T12:00:00.000Z] [INFO] [8c0ff0e7-c6b5-46e8-b71f-3a73b76974d4] GET /health 200 - 5ms
[2024-01-01T12:00:00.000Z] [INFO] [def456-7890-abcd-ef12-34567890abcd] POST /api/ai/chat 200 - 150ms
[2024-01-01T12:00:00.000Z] [ERROR] [abc123-def4-5678-90ab-cdef12345678] Unhandled error {...}
```

## Testing

```bash
# Test header presence
curl -v http://localhost:3000/health 2>&1 | grep -i "x-request-id"

# Test multiple requests (each should have unique ID)
curl -I http://localhost:3000/health | grep "X-Request-ID"
curl -I http://localhost:3000/api/cache/stats | grep "X-Request-ID"

# Test with POST request
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{"messages": [{"role": "user", "content": "Hello"}]}' \
  -v 2>&1 | grep -i "x-request-id"
```

## Implementation Notes

1. **Middleware Order**: Critical that `requestIdMiddleware` runs first to ensure all subsequent middleware and routes have access to `req.requestId`

2. **Header Persistence**: Intercepting `res.send()` ensures the header is set even if other middleware or route handlers modify the response

3. **UUID Detection**: Logger automatically detects UUID format in arguments, allowing flexible usage patterns

4. **Backward Compatibility**: Logger methods work with or without request ID, maintaining compatibility with existing code

5. **Error Handling**: Request ID is included in error logs, making it easier to trace errors back to specific requests

## Benefits

- **Request Tracing**: Easily track a request through all logs and services
- **Debugging**: Quickly identify all logs related to a specific request
- **Monitoring**: Correlate errors and performance issues with specific requests
- **Distributed Systems**: Request ID can be propagated to downstream services
- **Client-Side Debugging**: Clients can include request ID when reporting issues

## Implementation Notes

- ✅ **JavaScript Project**: All files use `.js` extension (not `.ts`)
- ✅ **Architecture Patterns**: Follows established patterns with separate middleware (`requestId.js`, `requestLogger.js`), utilities (`logger.js`), and proper middleware integration in `src/index.js`

