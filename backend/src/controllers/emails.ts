import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { Email } from '../models/Email';
import { AppError } from '../middleware/errorHandler';
import { syncGmailEmails } from '../services/gmail/sync';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, category, bank, search, startDate, endDate } = req.query;
    const filter: any = { userId: req.userId };

    if (category) filter.category = category;
    if (bank) filter.bank = bank;
    if (startDate || endDate) {
      filter.receivedAt = {};
      if (startDate) filter.receivedAt.$gte = new Date(startDate as string);
      if (endDate) filter.receivedAt.$lte = new Date(endDate as string);
    }
    if (search) {
      filter.$or = [
        { subject: { $regex: search, $options: 'i' } },
        { from: { $regex: search, $options: 'i' } },
        { bank: { $regex: search, $options: 'i' } },
        { snippet: { $regex: search, $options: 'i' } },
      ];
    }

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;

    const [emails, total] = await Promise.all([
      Email.find(filter).sort({ receivedAt: -1 }).skip(skip).limit(limitNum).select('-body').lean(),
      Email.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: emails,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const email = await Email.findOne({ _id: req.params.id, userId: req.userId }).lean();
    if (!email) throw new AppError('Email not found', 404);
    res.json({ success: true, data: email });
  } catch (error) {
    next(error);
  }
};

export const getStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const [total, unprocessed, categories] = await Promise.all([
      Email.countDocuments({ userId: req.userId }),
      Email.countDocuments({ userId: req.userId, isProcessed: false }),
      Email.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
        { $group: { _id: '$category', count: { $sum: 1 } } },
      ]),
    ]);

    const banks = await Email.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: '$bank', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        total,
        unprocessed,
        categories: Object.fromEntries(categories.map((c) => [c._id, c.count])),
        banks: Object.fromEntries(banks.map((b) => [b._id, b.count])),
      },
    });
  } catch (error) {
    next(error);
  }
};

export const getBanks = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banks = await Email.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId) } },
      { $group: { _id: '$bank', count: { $sum: 1 }, lastEmail: { $max: '$receivedAt' } } },
      { $sort: { count: -1 } },
    ]);
    res.json({ success: true, data: banks.map((b) => ({ name: b._id, count: b.count, lastEmail: b.lastEmail })) });
  } catch (error) {
    next(error);
  }
};

export const sync = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { transactionLimit, bankingEmailLimit, fetchBatchSize } = req.body;
    const result = await syncGmailEmails(req.userId!, {
      transactionLimit,
      bankingEmailLimit,
      fetchBatchSize,
    });
    res.json({ success: true, data: result });
  } catch (error) {
    next(error);
  }
};
