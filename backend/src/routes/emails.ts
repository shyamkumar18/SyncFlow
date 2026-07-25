import { Router } from 'express';
import * as controller from '../controllers/emails';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { syncEmailSchema } from '../validators';
const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.get('/stats', controller.getStats);
router.get('/banks', controller.getBanks);
router.get('/:id', controller.getById);
router.post('/sync', validate(syncEmailSchema), controller.sync);

export default router;
