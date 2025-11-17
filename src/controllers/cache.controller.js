import { cacheService } from '../services/cache.service.js';
import { sendSuccess } from '../utils/response.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

export const cacheController = {
  getStats: asyncHandler(async (_req, res) => {
    const stats = cacheService.getStats();
    sendSuccess(res, stats, 'Cache statistics retrieved successfully');
  }),
};

