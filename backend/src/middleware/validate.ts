import { Request, Response, NextFunction } from 'express';
import { ObjectSchema } from 'joi';
import { AppError } from './errorHandler';

export function validate(schema: ObjectSchema) {
  return (req: Request, _res: Response, next: NextFunction) => {
    const { error } = schema.validate(req.body, { abortEarly: false });
    if (error) {
      throw new AppError('Validation failed', 400);
    }
    next();
  };
}
