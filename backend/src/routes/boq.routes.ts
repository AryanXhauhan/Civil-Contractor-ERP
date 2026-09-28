import { Router } from 'express';
import { 
  getBOQByProject, 
  createBOQItem, 
  updateBOQItem, 
  deleteBOQItem 
} from '../controllers/boq.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

// These routes assume they are mounted on /api/projects/:projectId/boq or similar
// For this example, let's mount them at /api/boq and pass projectId in body/params
// or mount at /api/projects/:projectId/boq
router.get('/project/:projectId', getBOQByProject);
router.post('/', authorize(['OWNER', 'PROJECT_MANAGER', 'SITE_ENGINEER']), createBOQItem);
router.patch('/:id', authorize(['OWNER', 'PROJECT_MANAGER']), updateBOQItem);
router.delete('/:id', authorize(['OWNER', 'PROJECT_MANAGER']), deleteBOQItem);

export default router;
