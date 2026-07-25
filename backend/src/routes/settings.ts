import { Router } from 'express';
import * as controller from '../controllers/settings';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { updateSettingsSchema, updateProfileSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', controller.getSettings);
router.put('/', validate(updateSettingsSchema), controller.updateSettings);
router.put('/profile', validate(updateProfileSchema), controller.updateProfile);
router.delete('/account', controller.deleteAccount);

export default router;
