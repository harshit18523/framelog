import { Router } from 'express';
import {
  searchFilms,
  getPopularFilms,
  getTrendingFilms,
  getDiscoverFilms,
  getFilmById,
} from '../controllers/film.controller.js';

const router = Router();

router.get('/search', searchFilms);
router.get('/popular', getPopularFilms);
router.get('/trending', getTrendingFilms);
router.get('/discover', getDiscoverFilms);
router.get('/:id', getFilmById);

export default router;
