import { Router } from 'express';
import {
  getWatchedFilms,
  addWatchedFilm,
  removeWatchedFilm,
} from '../controllers/watched.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All watched routes require authentication
router.use(authenticate);

router.get('/', getWatchedFilms);
router.post('/', addWatchedFilm);
router.delete('/:filmId', removeWatchedFilm);

export default router;
