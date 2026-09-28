import { Router } from 'express';
import multer from 'multer';
import { parseDailyReportWithAI } from '../controllers/ai.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
const upload = multer({ dest: 'uploads/' });

router.use(authenticate);

// POST /api/ai/extract-daily-report
router.post(
  '/extract-daily-report',
  authorize(['OWNER', 'PROJECT_MANAGER', 'SITE_ENGINEER']),
  upload.single('file'),
  parseDailyReportWithAI
);

export default router;
