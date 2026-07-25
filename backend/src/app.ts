import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config/env';
import { connectDB } from './config/database';
import { errorHandler } from './middleware/errorHandler';
import authRoutes from './routes/auth';
import transactionRoutes from './routes/transactions';
import emailRoutes from './routes/emails';
import categoryRoutes from './routes/categories';
import walletRoutes from './routes/wallets';
import cardRoutes from './routes/cards';
import bankRoutes from './routes/banks';
import budgetRoutes from './routes/budgets';
import goalRoutes from './routes/goals';
import notificationRoutes from './routes/notifications';
import settingsRoutes from './routes/settings';
import analyticsRoutes from './routes/analytics';
import emailModuleRoutes from './modules/email/routes';

const app = express();

app.use(helmet());
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));

const limiter = rateLimit({
  windowMs: 60_000,
  max: 200,
  message: { success: false, message: 'Too many requests' },
});
app.use(limiter);

app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: '$yncFlow API is running' });
});

app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/emails', emailRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/cards', cardRoutes);
app.use('/api/banks', bankRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/goals', goalRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/email', emailModuleRoutes);

app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    const server = app.listen(config.port, () => {
      console.log(`$yncFlow API running on port ${config.port}`);
    });

    process.on('SIGTERM', () => {
      server.close(() => process.exit(0));
    });
  });
}

export default app;
