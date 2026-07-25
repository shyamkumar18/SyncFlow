import { Request, Response, NextFunction } from 'express';
import { Budget } from '../models/Budget';
import { Transaction } from '../models/Transaction';
import { AppError } from '../middleware/errorHandler';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budgets = await Budget.find({ userId: req.userId, isActive: true })
      .populate('category', 'name icon color')
      .sort({ year: -1, month: -1 })
      .lean();
    res.json({ success: true, data: budgets });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budget = await Budget.create({ ...req.body, userId: req.userId });
    res.status(201).json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budget = await Budget.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!budget) throw new AppError('Budget not found', 404);
    res.json({ success: true, data: budget });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budget = await Budget.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!budget) throw new AppError('Budget not found', 404);
    res.json({ success: true, message: 'Budget deleted' });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const budgets = await Budget.find({ userId: req.userId, isActive: true })
      .populate('category', 'name icon color')
      .lean();

    const summary = budgets.map((b) => {
      const spent = b.spent || 0;
      const remaining = b.amount - spent;
      const percentage = b.amount > 0 ? Math.round((spent / b.amount) * 100) : 0;
      return {
        _id: b._id,
        category: b.category,
        amount: b.amount,
        spent,
        remaining: Math.max(0, remaining),
        percentage,
        period: b.period,
        month: b.month,
        year: b.year,
      };
    });

    res.json({ success: true, data: summary });
  } catch (error) {
    next(error);
  }
};
