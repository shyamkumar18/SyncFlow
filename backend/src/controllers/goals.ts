import { Request, Response, NextFunction } from 'express';
import { Goal } from '../models/Goal';
import { AppError } from '../middleware/errorHandler';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goals = await Goal.find({ userId: req.userId, isActive: true })
      .sort({ priority: -1, createdAt: -1 })
      .lean();
    res.json({ success: true, data: goals });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await Goal.create({ ...req.body, userId: req.userId });
    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await Goal.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!goal) throw new AppError('Goal not found', 404);
    res.json({ success: true, data: goal });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const goal = await Goal.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!goal) throw new AppError('Goal not found', 404);
    res.json({ success: true, message: 'Goal deleted' });
  } catch (error) {
    next(error);
  }
};

export const updateProgress = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { currentAmount } = req.body;
    const existing = await Goal.findOne({ _id: req.params.id, userId: req.userId });
    if (!existing) throw new AppError('Goal not found', 404);

    const isCompleted = currentAmount >= existing.targetAmount;
    existing.currentAmount = currentAmount;
    existing.isCompleted = isCompleted;
    if (isCompleted) existing.completedAt = new Date();
    await existing.save();

    res.json({ success: true, data: existing });
  } catch (error) {
    next(error);
  }
};
