import { Router } from 'express';
import { 
  getDashboardOverview,
  getProjectProfitability,
  getCashFlow
} from '../controllers/analytics.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/dashboard', getDashboardOverview);
router.get('/profitability/:projectId', getProjectProfitability);
router.get('/cash-flow', getCashFlow);

export default router;
