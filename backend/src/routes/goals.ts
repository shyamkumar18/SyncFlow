import { Router } from 'express';
import * as controller from '../controllers/goals';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createGoalSchema, updateProgressSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.post('/', validate(createGoalSchema), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.patch('/:id/progress', validate(updateProgressSchema), controller.updateProgress);

export default router;
