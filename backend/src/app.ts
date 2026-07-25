import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import compression from 'compression';
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

// Trust proxy for rate limiting behind reverse proxy
app.set('trust proxy', config.isProduction ? 1 : 0);

// Security headers
app.use(helmet({
  contentSecurityPolicy: config.isProduction ? undefined : false,
  crossOriginEmbedderPolicy: false,
}));

// Compression
app.use(compression());

// CORS
const corsOptions: cors.CorsOptions = {
  origin: config.corsOrigins.length > 0 ? config.corsOrigins : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};
if (config.isProduction) {
  corsOptions.origin = config.corsOrigins;
}
app.use(cors(corsOptions));

app.use(express.json({ limit: '10mb' }));
app.use(morgan(config.isProduction ? 'combined' : 'dev'));

// Global rate limiter
const limiter = rateLimit({
  windowMs: config.rateLimitWindow,
  max: config.isProduction ? Math.min(config.rateLimitMax, 200) : 2000,
  message: { success: false, message: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Auth rate limiter (stricter)
const authLimiter = rateLimit({
  windowMs: 60_000,
  max: config.isProduction ? 10 : 50,
  message: { success: false, message: 'Too many login attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Health endpoint
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '$yncFlow API is running',
    environment: config.nodeEnv,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Routes
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

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Error handler
app.use(errorHandler);

if (process.env.NODE_ENV !== 'test') {
  connectDB().then(() => {
    const server = app.listen(config.port, () => {
      console.log(`$yncFlow API running on port ${config.port} [${config.nodeEnv}]`);
    });

    const shutdown = (signal: string) => {
      console.log(`Received ${signal}, shutting down gracefully...`);
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('Forced shutdown after timeout');
        process.exit(1);
      }, 10000).unref();
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  });
}

export default app;
