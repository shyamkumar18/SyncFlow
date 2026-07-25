import { Router } from 'express';
import * as controller from '../controllers/transactions';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { createTransactionSchema, updateTransactionSchema } from '../validators';

const router = Router();
router.use(authenticate);

router.get('/', controller.getAll);
router.get('/summary', controller.getSummary);
router.get('/grouped', controller.getGrouped);
router.get('/review', controller.getReviewQueue);
router.get('/review/count', controller.getReviewQueueCount);
router.get('/:id', controller.getById);
router.post('/', validate(createTransactionSchema), controller.create);
router.post('/manual', validate(createTransactionSchema), controller.createManual);
router.post('/review/:id/approve', controller.approveReviewItem);
router.post('/review/:id/reject', controller.rejectReviewItem);
router.put('/review/:id', controller.updateReviewItem);
router.patch('/:id', validate(updateTransactionSchema), controller.update);
router.patch('/:id/category', controller.assignCategoryToTransaction);
router.delete('/:id', controller.remove);

export default router;
