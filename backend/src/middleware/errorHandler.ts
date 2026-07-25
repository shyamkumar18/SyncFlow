import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public errors?: Array<{ field: string; message: string }>,
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

export function errorHandler(
  err: AppError & { errors?: Array<{ field: string; message: string }> },
  _req: Request,
  res: Response,
  _next: NextFunction,
) {
  const statusCode = err.statusCode || 500;

  if (!err.statusCode) {
    console.error('Unhandled error:', err);
  }

  if (statusCode >= 500 && config.isProduction) {
    res.status(statusCode).json({
      success: false,
      message: 'Internal server error',
    });
    return;
  }

  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal server error',
    ...(err.errors && { errors: err.errors }),
  });
}
