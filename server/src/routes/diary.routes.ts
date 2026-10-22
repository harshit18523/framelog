import { Router } from 'express';
import {
  getDiaryEntries,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from '../controllers/diary.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// All diary routes require authentication
router.use(authenticate);

router.get('/', getDiaryEntries);
router.post('/', createDiaryEntry);
router.put('/:id', updateDiaryEntry);
router.delete('/:id', deleteDiaryEntry);

export default router;
