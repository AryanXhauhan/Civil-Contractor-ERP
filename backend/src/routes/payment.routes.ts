import { Router } from 'express';
import { 
  createPaymentOrder, 
  verifyPayment, 
  handleWebhook, 
  getPayments 
} from '../controllers/payment.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Webhook must be accessible publicly
router.post('/webhook', handleWebhook);

// Protected routes
router.use(authenticate);
router.get('/', authorize(['OWNER', 'ACCOUNTANT']), getPayments);
router.post('/create-order', authorize(['OWNER', 'ACCOUNTANT']), createPaymentOrder);
router.post('/verify', authorize(['OWNER', 'ACCOUNTANT']), verifyPayment);

export default router;
