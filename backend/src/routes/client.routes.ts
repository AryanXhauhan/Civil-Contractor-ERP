import { Router } from 'express';
import { getClients, getClientById, createClient, updateClient, deleteClient } from '../controllers/client.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/', getClients);
router.get('/:id', getClientById);
router.post('/', authorize(['OWNER', 'PROJECT_MANAGER', 'ACCOUNTANT']), createClient);
router.patch('/:id', authorize(['OWNER', 'PROJECT_MANAGER']), updateClient);
router.delete('/:id', authorize(['OWNER']), deleteClient);

export default router;
