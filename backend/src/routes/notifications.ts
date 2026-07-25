import { Router } from 'express';
import * as controller from '../controllers/notifications';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.patch('/:id/read', controller.markRead);
router.patch('/read-all', controller.markAllRead);

export default router;
