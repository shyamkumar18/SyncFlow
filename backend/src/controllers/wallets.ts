import { Request, Response, NextFunction } from 'express';
import { Wallet } from '../models/Wallet';
import { AppError } from '../middleware/errorHandler';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallets = await Wallet.find({ userId: req.userId, isActive: true }).sort({ createdAt: -1 }).lean();
    res.json({ success: true, data: wallets });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await Wallet.create({ ...req.body, userId: req.userId });
    res.status(201).json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await Wallet.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!wallet) throw new AppError('Wallet not found', 404);
    res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await Wallet.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!wallet) throw new AppError('Wallet not found', 404);
    res.json({ success: true, message: 'Wallet deleted' });
  } catch (error) {
    next(error);
  }
};

export const updateBalance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { balance } = req.body;
    const wallet = await Wallet.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { balance } },
      { new: true },
    );
    if (!wallet) throw new AppError('Wallet not found', 404);
    res.json({ success: true, data: wallet });
  } catch (error) {
    next(error);
  }
};
