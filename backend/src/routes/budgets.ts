import { Router } from 'express';
import * as controller from '../controllers/budgets';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createBudgetSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.get('/summary', controller.getSummary);
router.post('/', validate(createBudgetSchema), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
