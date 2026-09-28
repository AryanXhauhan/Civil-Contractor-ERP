import { Router } from 'express';
import { getVendors, createVendor, updateVendor } from '../controllers/vendor.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getVendors);
router.post('/', authorize(['OWNER', 'PROJECT_MANAGER', 'ACCOUNTANT']), createVendor);
router.patch('/:id', authorize(['OWNER', 'PROJECT_MANAGER']), updateVendor);

export default router;
