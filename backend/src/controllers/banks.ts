import { Request, Response, NextFunction } from 'express';
import { Bank } from '../models/Bank';
import { AppError } from '../middleware/errorHandler';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banks = await Bank.find({ userId: req.userId }).sort({ name: 1 }).lean();
    res.json({ success: true, data: banks });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bank = await Bank.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!bank) throw new AppError('Bank not found', 404);
    res.json({ success: true, data: bank });
  } catch (error) {
    next(error);
  }
};
