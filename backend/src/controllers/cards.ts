import { Request, Response, NextFunction } from 'express';
import { Card } from '../models/Card';
import { AppError } from '../middleware/errorHandler';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cards = await Card.find({ userId: req.userId, isActive: true }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: cards });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await Card.create({ ...req.body, userId: req.userId });
    res.status(201).json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!card) throw new AppError('Card not found', 404);
    res.json({ success: true, data: card });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const card = await Card.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!card) throw new AppError('Card not found', 404);
    res.json({ success: true, message: 'Card deleted' });
  } catch (error) {
    next(error);
  }
};
