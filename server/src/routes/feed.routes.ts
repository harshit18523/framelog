import { Router } from 'express';
import { getFeed } from '../controllers/feed.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Feed requires authentication
router.use(authenticate);

router.get('/', getFeed);

export default router;
