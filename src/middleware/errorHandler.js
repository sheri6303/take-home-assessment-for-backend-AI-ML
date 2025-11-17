import { AppError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';
import { sendError } from '../utils/response.js';

export function errorHandler(err, req, res, _next) {
  const requestId = req?.requestId;
  
  if (err instanceof AppError) {
    logger.warn(`AppError: ${err.message}`, requestId, err);
    sendError(res, err.message, err.statusCode);
    return;
  }

  logger.error('Unhandled error', requestId, err);
  sendError(res, 'Internal server error', 500);
}

