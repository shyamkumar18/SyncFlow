import 'dotenv/config';

const nodeEnv = process.env.NODE_ENV || 'development';
const isProduction = nodeEnv === 'production';

const required = [
  'MONGODB_URI',
  'JWT_SECRET',
  'JWT_REFRESH_SECRET',
  'ENCRYPTION_KEY',
  'GOOGLE_CLIENT_ID',
  'GOOGLE_CLIENT_SECRET',
];

if (isProduction) {
  required.push('GOOGLE_REDIRECT_URI', 'EMAIL_REDIRECT_URI', 'CORS_ORIGIN', 'APP_URL');
}

const missing = required.filter((key) => !process.env[key]);
if (missing.length > 0) {
  throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
}

if (process.env.JWT_SECRET && process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters long');
}
if (process.env.JWT_REFRESH_SECRET && process.env.JWT_REFRESH_SECRET.length < 32) {
  throw new Error('JWT_REFRESH_SECRET must be at least 32 characters long');
}
if (process.env.ENCRYPTION_KEY && process.env.ENCRYPTION_KEY.length < 32) {
  throw new Error('ENCRYPTION_KEY must be at least 32 characters long');
}

const port = parseInt(process.env.PORT || '5000', 10);
const corsOriginRaw = process.env.CORS_ORIGIN || 'http://localhost:5173';

const corsOrigins = corsOriginRaw
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

export const config = {
  nodeEnv,
  isProduction,
  isDevelopment: !isProduction,
  port,
  mongodbUri: process.env.MONGODB_URI!,
  jwtSecret: process.env.JWT_SECRET!,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET!,
  jwtExpiry: process.env.JWT_EXPIRY || '15m',
  jwtRefreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY!,
  googleClientId: process.env.GOOGLE_CLIENT_ID!,
  googleClientSecret: process.env.GOOGLE_CLIENT_SECRET!,
  googleRedirectUri: process.env.GOOGLE_REDIRECT_URI || `http://localhost:${port}/api/auth/google/callback`,
  emailRedirectUri: process.env.EMAIL_REDIRECT_URI || `http://localhost:${port}/api/email/callback`,
  corsOrigins,
  corsOrigin: corsOrigins[0] || 'http://localhost:5173',
  rateLimitWindow: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '60000', 10),
  rateLimitMax: parseInt(process.env.RATE_LIMIT_MAX || '200', 10),
  appUrl: process.env.APP_URL || `http://localhost:${port}`,
};
