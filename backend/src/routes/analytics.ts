import { Router } from 'express';
import * as controller from '../controllers/analytics';
import { authenticate } from '../middleware/auth';

const router = Router();
router.use(authenticate);

router.get('/overview', controller.getOverview);
router.get('/spending-by-category', controller.spendingByCategory);
router.get('/spending-by-merchant', controller.spendingByMerchant);
router.get('/monthly-trend', controller.monthlyTrend);
router.get('/bank-distribution', controller.bankDistribution);
router.get('/card-spending', controller.cardSpending);
router.get('/cash-flow', controller.cashFlow);
router.get('/yearly-overview', controller.yearlyOverview);
router.get('/export', controller.exportData);

export default router;
