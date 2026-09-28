import { Router } from 'express';
import { 
  getInvoices, 
  getInvoiceById, 
  createInvoice, 
  updateInvoiceStatus 
} from '../controllers/invoice.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getInvoices);
router.get('/:id', getInvoiceById);
router.post('/', authorize(['OWNER', 'ACCOUNTANT', 'PROJECT_MANAGER']), createInvoice);
router.patch('/:id/status', authorize(['OWNER', 'ACCOUNTANT']), updateInvoiceStatus);

export default router;
