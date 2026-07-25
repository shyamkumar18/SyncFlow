import { Router } from 'express';
import * as controller from '../controllers/wallets';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createWalletSchema, updateBalanceSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.post('/', validate(createWalletSchema), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/balance', validate(updateBalanceSchema), controller.updateBalance);

export default router;
