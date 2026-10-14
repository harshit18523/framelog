import { Router } from 'express';
import { getFeed } from '../controllers/feed.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// Feed requires authentication
router.use(authenticate);

router.get('/', getFeed);

export default router;
