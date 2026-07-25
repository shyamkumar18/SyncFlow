import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction';
import { ReviewItem } from '../models/ReviewItem';
import { normalizeMerchant } from '../modules/intelligence/merchantNormalizer';
import { categorize } from '../modules/intelligence/autoCategorizer';
import { AppError } from '../middleware/errorHandler';
import { getFinancialSummary } from '../services/FinancialSummaryService';

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
      if (endDate) filter.date.$lt = new Date(new Date(endDate as string).getTime() + 86400000);
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
    const summary = await getFinancialSummary({
      userId: req.userId!,
      startDate: startDate ? new Date(startDate as string) : undefined,
      endDate: endDate ? new Date(endDate as string) : undefined,
    });

    res.json({ success: true, data: summary });
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
      if (endDate) filter.date.$lt = new Date(new Date(endDate as string).getTime() + 86400000);
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

export const getReviewQueue = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { page = 1, limit = 20, status = 'pending', sort = '-date' } = req.query;
    const filter: any = { userId: req.userId };
    if (status) filter.status = status;

    const pageNum = Math.max(1, Number(page));
    const limitNum = Math.min(100, Math.max(1, Number(limit)));
    const skip = (pageNum - 1) * limitNum;
    const sortOrder: Record<string, 1 | -1> = sort === 'date' ? { date: -1 } : { date: -1 };

    const [items, total] = await Promise.all([
      ReviewItem.find(filter).sort(sortOrder as any).skip(skip).limit(limitNum).lean(),
      ReviewItem.countDocuments(filter),
    ]);

    res.json({
      success: true,
      data: items,
      pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
    });
  } catch (error) {
    next(error);
  }
};

export const getReviewQueueCount = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const count = await ReviewItem.countDocuments({ userId: req.userId, status: 'pending' });
    res.json({ success: true, data: { count } });
  } catch (error) {
    next(error);
  }
};

export const approveReviewItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await ReviewItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) throw new AppError('Review item not found', 404);

    const normResult = normalizeMerchant(item.merchant);
    const catResult = categorize({
      merchant: normResult.canonical || item.merchant,
      description: item.description,
      bank: item.bank,
      amount: item.amount,
      type: item.type,
    });

    const transaction = await Transaction.create({
      userId: item.userId,
      emailId: item.emailId,
      amount: item.amount,
      type: item.type,
      date: item.date,
      time: item.time,
      description: item.description,
      merchant: normResult.canonical || item.merchant,
      merchantRaw: item.merchant,
      sender: item.sender,
      receiver: item.receiver,
      balance: item.balance,
      upiId: item.upiId,
      referenceNumber: item.referenceNumber,
      bank: item.bank,
      status: 'success',
      normalized: normResult.confidence > 0,
      autoCategory: catResult.category || undefined,
      categoryConfidence: catResult.confidence || 0,
    });

    item.status = 'approved';
    item.transactionId = transaction._id;
    item.reviewedAt = new Date();
    await item.save();

    res.json({ success: true, data: { reviewItem: item, transaction } });
  } catch (error) {
    next(error);
  }
};

export const rejectReviewItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await ReviewItem.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { status: 'rejected', reviewedAt: new Date(), reviewNotes: req.body?.notes || '' } },
      { new: true },
    );
    if (!item) throw new AppError('Review item not found', 404);
    res.json({ success: true, data: item });
  } catch (error) {
    next(error);
  }
};

export const updateReviewItem = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const item = await ReviewItem.findOne({ _id: req.params.id, userId: req.userId });
    if (!item) throw new AppError('Review item not found', 404);

    Object.assign(item, req.body, { status: 'edited', reviewedAt: new Date() });
    await item.save();

    const normResult = normalizeMerchant(item.merchant);
    const catResult = categorize({
      merchant: normResult.canonical || item.merchant,
      description: item.description,
      bank: item.bank,
      amount: item.amount,
      type: item.type,
    });

    const transaction = await Transaction.create({
      userId: item.userId,
      emailId: item.emailId,
      amount: item.amount,
      type: item.type,
      date: item.date,
      time: item.time,
      description: item.description,
      merchant: normResult.canonical || item.merchant,
      merchantRaw: item.merchant,
      sender: item.sender,
      receiver: item.receiver,
      balance: item.balance,
      upiId: item.upiId,
      referenceNumber: item.referenceNumber,
      bank: item.bank,
      status: 'success',
      normalized: normResult.confidence > 0,
      autoCategory: catResult.category || undefined,
      categoryConfidence: catResult.confidence || 0,
    });

    item.transactionId = transaction._id;
    await item.save();

    res.json({ success: true, data: { reviewItem: item, transaction } });
  } catch (error) {
    next(error);
  }
};

export const assignCategoryToTransaction = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const transaction = await Transaction.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      { $set: { category: req.body.categoryId, categoryConfidence: 100 } },
      { new: true },
    );
    if (!transaction) throw new AppError('Transaction not found', 404);
    res.json({ success: true, data: transaction });
  } catch (error) {
    next(error);
  }
};
