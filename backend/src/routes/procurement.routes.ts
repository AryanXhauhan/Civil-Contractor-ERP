import { Router } from 'express';
import { 
  getPurchaseOrders, 
  getPurchaseOrderById, 
  createPurchaseOrder, 
  updatePurchaseOrderStatus 
} from '../controllers/procurement.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getPurchaseOrders);
router.get('/:id', getPurchaseOrderById);
router.post('/', authorize(['OWNER', 'PROJECT_MANAGER']), createPurchaseOrder);
router.patch('/:id/status', authorize(['OWNER', 'PROJECT_MANAGER']), updatePurchaseOrderStatus);

export default router;
