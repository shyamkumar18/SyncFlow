import { Router } from 'express';
import { authenticate } from '../../../middleware/auth';
import * as controller from '../controllers';

const router = Router();

router.get('/status', authenticate, controller.status);
router.get('/connect', authenticate, controller.connect);
router.get('/callback', controller.callback);
router.post('/disconnect', authenticate, controller.disconnect);
router.get('/profile', authenticate, controller.profile);
router.post('/test-connection', authenticate, controller.testConnection);

export default router;
