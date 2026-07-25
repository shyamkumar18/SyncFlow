import rateLimit from 'express-rate-limit';

export const authLimiter = rateLimit({
  windowMs: 60_000,
  max: 10,
  message: { success: false, message: 'Too many auth attempts' },
});

export const syncLimiter = rateLimit({
  windowMs: 60_000,
  max: 5,
  message: { success: false, message: 'Too many sync requests' },
});
