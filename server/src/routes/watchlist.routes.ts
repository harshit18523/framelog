import { Router } from 'express';
import {
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
} from '../controllers/watchlist.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All watchlist routes require authentication
router.use(authenticate);

router.get('/', getWatchlist);
router.post('/', addToWatchlist);
router.delete('/:filmId', removeFromWatchlist);

export default router;
