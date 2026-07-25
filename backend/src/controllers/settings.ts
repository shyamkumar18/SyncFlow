import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Setting } from '../models/Setting';
import { AppError } from '../middleware/errorHandler';

export const getSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    let settings = await Setting.findOne({ userId: req.userId }).lean();
    if (!settings) {
      settings = await Setting.create({ userId: req.userId });
    }
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateSettings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const settings = await Setting.findOneAndUpdate(
      { userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true, upsert: true },
    );
    res.json({ success: true, data: settings });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: req.body },
      { new: true, runValidators: true },
    ).select('-password -refreshTokens -googleAccessToken -googleRefreshToken');
    if (!user) throw new AppError('User not found', 404);
    res.json({ success: true, data: user });
  } catch (error) {
    next(error);
  }
};

export const deleteAccount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Promise.all([
      User.findByIdAndUpdate(req.userId, { $set: { isActive: false } }),
      Setting.deleteOne({ userId: req.userId }),
    ]);
    res.json({ success: true, message: 'Account deleted' });
  } catch (error) {
    next(error);
  }
};
