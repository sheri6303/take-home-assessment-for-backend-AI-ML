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

