import { Router } from 'express';
import { getLikes, likeFilm, unlikeFilm } from '../controllers/likes.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All likes routes require authentication
router.use(authenticate);

router.get('/', getLikes);
router.post('/', likeFilm);
router.delete('/:filmId', unlikeFilm);

export default router;
