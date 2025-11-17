class CacheService {
  constructor() {
    this.cache = new Map();
    this.defaultTTL = 5 * 60 * 1000;
    this.cleanupInterval = setInterval(() => this.cleanup(), 60000);
    this.stats = {
      hits: 0,
      misses: 0,
    };
  }

  set(key, value, ttl) {
    this.cache.set(key, { 
      data: value, 
      expiresAt: Date.now() + (ttl || this.defaultTTL) 
    });
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      return null;
    }
    this.stats.hits++;
    return entry.data;
  }

  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }
    return true;
  }

  delete(key) {
    this.cache.delete(key);
  }

  clear() {
    this.cache.clear();
  }

  cleanup() {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  size() {
    return this.cache.size;
  }

  getStats() {
    const totalRequests = this.stats.hits + this.stats.misses;
    const hitRate = totalRequests > 0 
      ? (this.stats.hits / totalRequests * 100).toFixed(2) 
      : 0;
    
    return {
      size: this.cache.size,
      defaultTTL: this.defaultTTL,
      defaultTTLSeconds: Math.floor(this.defaultTTL / 1000),
      hits: this.stats.hits,
      misses: this.stats.misses,
      totalRequests,
      hitRate: `${hitRate}%`,
    };
  }

  destroy() {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
    this.cache.clear();
  }
}

export const cacheService = new CacheService();

export function destroyCacheService() {
  cacheService.destroy();
}
