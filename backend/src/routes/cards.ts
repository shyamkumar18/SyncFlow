import { Router } from 'express';
import * as controller from '../controllers/cards';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCardSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.post('/', validate(createCardSchema), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);

export default router;
