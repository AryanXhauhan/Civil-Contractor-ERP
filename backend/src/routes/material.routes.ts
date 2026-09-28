import { Router } from 'express';
import { getMaterials, createMaterial, addMaterialTransaction } from '../controllers/material.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getMaterials);
router.post('/', authorize(['OWNER', 'PROJECT_MANAGER', 'SITE_ENGINEER']), createMaterial);
router.post('/transaction', authorize(['OWNER', 'PROJECT_MANAGER', 'SITE_ENGINEER']), addMaterialTransaction);

export default router;
