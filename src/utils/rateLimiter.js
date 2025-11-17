class RateLimiter {
  constructor(windowMs, maxRequests) {
    this.store = new Map();
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.store.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.store.entries()) {
      if (entry.resetTime < now) {
        this.store.delete(key);
      }
    }
  }

  isAllowed(identifier) {
    const now = Date.now();
    const entry = this.store.get(identifier);

    if (!entry || entry.resetTime < now) {
      const resetTime = now + this.windowMs;
      this.store.set(identifier, { count: 1, resetTime });
      return { allowed: true, remaining: this.maxRequests - 1, resetTime };
    }

    if (entry.count >= this.maxRequests) {
      return { allowed: false, remaining: 0, resetTime: entry.resetTime };
    }

    entry.count++;
    return { allowed: true, remaining: this.maxRequests - entry.count, resetTime: entry.resetTime };
  }

  getSize() {
    return this.store.size;
  }
}
export const rateLimiter = new RateLimiter(15 * 60 * 1000, 100);
