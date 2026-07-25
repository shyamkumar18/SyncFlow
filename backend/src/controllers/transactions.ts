import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction';
import { AppError } from '../middleware/errorHandler';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, sort = '-date', type, bank, category, status, startDate, endDate, search, minAmount, maxAmount } = req.query;
    const filter: any = { userId: req.userId };

    if (type) filter.type = type;
    if (bank) filter.bank = bank;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }
    if (minAmount) filter.amount = { ...filter.amount, $gte: Number(minAmount) };
    if (maxAmount) filter.amount = { ...filter.amount, $lte: Number(maxAmount) };
    if (search) {
      filter.$or = [
        { merchant: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { bank: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder: Record<string, 1 | -1> = sort === 'amount' ? { amount: -1 } : { date: -1 };

    const [transactions, total] = await Promise.all([
      Transaction.find(filter).sort(sortOrder as any).skip(skip).limit(limitNum).lean(),
      Transaction.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: transactions,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!transaction) throw new AppError('Transaction not found', 404);
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

export const create = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.userId });
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

export const createManual = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.create({ ...req.body, userId: req.userId, isManual: true });
    res.status(201).json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

export const update = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: req.body },
      { new: true, runValidators: true },
    );
    if (!transaction) throw new AppError('Transaction not found', 404);
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};

export const remove = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!transaction) throw new AppError('Transaction not found', 404);
    res.json({ success: true, message: 'Transaction deleted' });
  } catch (error) {
    next(error);
  }
};

export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = { userId: new mongoose.Types.ObjectId(req.userId) };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const summary = await Transaction.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
    ]);

    const income = summary.find((s) => s._id === 'credit')?.total || 0;
    const expense = summary.find((s) => s._id === 'debit')?.total || 0;

    res.json({
      success: true,
      data: { totalIncome: income, totalExpense: expense, netSavings: income - expense, count: summary.reduce((acc, s) => acc + s.count, 0) },
    });
  } catch (error) {
    next(error);
  }
};

export const getGrouped = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { groupBy, startDate, endDate } = req.query;
    const filter: any = { userId: new mongoose.Types.ObjectId(req.userId) };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const groupField = groupBy === 'category' ? '$category'
      : groupBy === 'bank' ? '$bank'
      : groupBy === 'merchant' ? '$merchant'
      : groupBy === 'date' ? { $dateToString: { format: '%Y-%m-%d', date: '$date' } }
      : '$category';

    const groups = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: groupField, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json({ success: true, data: groups.map((g) => ({ key: g._id, total: g.total, count: g.count })) });
  } catch (error) {
    next(error);
  }
};
