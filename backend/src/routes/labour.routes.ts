import { Router } from 'express';
import { getLabours, createLabour, markAttendance } from '../controllers/labour.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getLabours);
router.post('/', authorize(['OWNER', 'PROJECT_MANAGER', 'SITE_ENGINEER']), createLabour);
router.post('/attendance', authorize(['OWNER', 'PROJECT_MANAGER', 'SITE_ENGINEER']), markAttendance);

export default router;
