import { Router } from 'express';
import { 
  getDailyReports, 
  getDailyReportById, 
  createDailyReport, 
  updateDailyReport 
} from '../controllers/dailyReport.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getDailyReports);
router.get('/:id', getDailyReportById);
router.post('/', authorize(['OWNER', 'PROJECT_MANAGER', 'SITE_ENGINEER']), createDailyReport);
router.patch('/:id', authorize(['OWNER', 'PROJECT_MANAGER', 'SITE_ENGINEER']), updateDailyReport);

export default router;
