import { Request, Response, NextFunction } from 'express';
import { Category } from '../models/Category';
import { Transaction } from '../models/Transaction';
import { AppError } from '../middleware/errorHandler';
import { DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '../utils/constants';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await Category.find({
      $or: [{ userId: req.userId }, { isDefault: true }],
      isActive: true,
    }).sort({ sortOrder: 1, name: 1 }).lean();
    res.json({ success: true, data: categories });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.create({ ...req.body, userId: req.userId });
    res.status(201).json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!category) throw new AppError('Category not found', 404);
    res.json({ success: true, data: category });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const category = await Category.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!category) throw new AppError('Category not found', 404);

    const others = await Category.findOne({ userId: req.userId, name: 'Others', type: category.type });
    if (others) {
      await Transaction.updateMany(
        { userId: req.userId, category: category._id },
        { $set: { category: others._id } },
      );
    }
    res.json({ success: true, message: 'Category deleted' });
  } catch (error) {
    next(error);
  }
};

export const reset = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await Category.deleteMany({ userId: req.userId });

    const defaults = [
      ...DEFAULT_EXPENSE_CATEGORIES.map((cat) => ({
        name: cat.name, type: 'expense' as const, icon: cat.icon, color: cat.color, userId: req.userId, isDefault: false, sortOrder: 0,
      })),
      ...DEFAULT_INCOME_CATEGORIES.map((cat) => ({
        name: cat.name, type: 'income' as const, icon: cat.icon, color: cat.color, userId: req.userId, isDefault: false, sortOrder: 0,
      })),
    ];
    await Category.insertMany(defaults);
    res.json({ success: true, message: 'Categories reset to defaults' });
  } catch (error) {
    next(error);
  }
};
