import { Router } from 'express';
import { cacheController } from '../controllers/cache.controller.js';

const router = Router();

router.get('/stats', cacheController.getStats);

export default router;

