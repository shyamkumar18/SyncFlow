import { Router } from 'express';
import * as controller from '../controllers/transactions';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTransactionSchema, updateTransactionSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.get('/summary', controller.getSummary);
router.get('/grouped', controller.getGrouped);
router.get('/:id', controller.getById);
router.post('/', validate(createTransactionSchema), controller.create);
router.post('/manual', validate(createTransactionSchema), controller.createManual);
router.patch('/:id', validate(updateTransactionSchema), controller.update);
router.delete('/:id', controller.remove);

export default router;
