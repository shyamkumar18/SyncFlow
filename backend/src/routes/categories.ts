import { Router } from 'express';
import * as controller from '../controllers/categories';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createCategorySchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.post('/', validate(createCategorySchema), controller.create);
router.put('/:id', controller.update);
router.delete('/:id', controller.remove);
router.post('/reset', controller.reset);

export default router;
