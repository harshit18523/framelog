import { Router } from 'express';
import {
  getWatchedFilms,
  addWatchedFilm,
  removeWatchedFilm,
} from '../controllers/watched.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All watched routes require authentication
router.use(authenticate);

router.get('/', getWatchedFilms);
router.post('/', addWatchedFilm);
router.delete('/:filmId', removeWatchedFilm);

export default router;
