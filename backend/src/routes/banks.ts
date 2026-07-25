import { Router } from 'express';
import * as controller from '../controllers/banks';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.patch('/:id', controller.update);

export default router;
