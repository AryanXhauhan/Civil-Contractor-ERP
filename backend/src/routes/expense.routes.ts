import { Router } from 'express';
import { getExpenses, createExpense, updateExpense, deleteExpense } from '../controllers/expense.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getExpenses);
router.post('/', authorize(['OWNER', 'PROJECT_MANAGER', 'ACCOUNTANT', 'SITE_ENGINEER']), createExpense);
router.patch('/:id', authorize(['OWNER', 'PROJECT_MANAGER', 'ACCOUNTANT']), updateExpense);
router.delete('/:id', authorize(['OWNER', 'PROJECT_MANAGER']), deleteExpense);

export default router;
