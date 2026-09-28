import { Router } from 'express';
import { 
  getProjects, 
  getProjectById, 
  createProject, 
  updateProject, 
  deleteProject,
  addProjectMember
} from '../controllers/project.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getProjects);
router.get('/:id', getProjectById);
router.post('/', authorize(['OWNER', 'PROJECT_MANAGER']), createProject);
router.patch('/:id', authorize(['OWNER', 'PROJECT_MANAGER']), updateProject);
router.delete('/:id', authorize(['OWNER']), deleteProject);

// Members
router.post('/:id/members', authorize(['OWNER', 'PROJECT_MANAGER']), addProjectMember);

export default router;
