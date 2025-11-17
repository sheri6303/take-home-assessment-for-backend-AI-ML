import { randomUUID } from 'crypto';

export function requestIdMiddleware(req, res, next) {
  // Generate unique request ID using crypto.randomUUID()
  const requestId = randomUUID();
  
  // Attach to request object
  req.requestId = requestId;
  
  // Set in response headers - use res.header() for Express compatibility
  res.header('X-Request-ID', requestId);
  
  // Ensure header persists when response is sent
  const originalSend = res.send;
  res.send = function(...args) {
    if (!res.headersSent) {
      res.header('X-Request-ID', requestId);
    }
    return originalSend.apply(this, args);
  };
  
  next();
}

