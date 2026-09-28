import { Router } from 'express';
import { getAuditLogs } from '../controllers/audit.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Only owners and project managers should see audit logs
router.use(authenticate);
router.use(authorize(['OWNER', 'PROJECT_MANAGER', 'ACCOUNTANT']));

router.get('/', getAuditLogs);

export default router;
