import { Router } from 'express';
import {
  getDiaryEntries,
  createDiaryEntry,
  updateDiaryEntry,
  deleteDiaryEntry,
} from '../controllers/diary.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// All diary routes require authentication
router.use(authenticate);

router.get('/', getDiaryEntries);
router.post('/', createDiaryEntry);
router.put('/:id', updateDiaryEntry);
router.delete('/:id', deleteDiaryEntry);

export default router;
