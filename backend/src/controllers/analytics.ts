import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction';
import { Setting } from '../models/Setting';

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    const settings = await Setting.findOne({ userId: req.userId }).lean();

    const [
      monthlySummary,
      yearlySummary,
      recentTransactions,
      monthlyCashFlow,
    ] = await Promise.all([
      Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.userId), date: { $gte: startOfMonth } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.userId), date: { $gte: startOfYear } } },
        { $group: { _id: '$type', total: { $sum: '$amount' } } },
      ]),
      Transaction.find({ userId: req.userId })
        .sort({ date: -1 })
        .limit(10)
        .lean(),
      Transaction.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(req.userId), date: { $gte: new Date(now.getFullYear() - 1, now.getMonth(), 1) } } },
        {
          $group: {
            _id: { year: { $year: '$date' }, month: { $month: '$date' } },
            income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
            expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
          },
        },
        { $sort: { '_id.year': 1, '_id.month': 1 } },
      ]),
    ]);

    const monthlyIncome = monthlySummary.find((s) => s._id === 'credit')?.total || 0;
    const monthlyExpense = monthlySummary.find((s) => s._id === 'debit')?.total || 0;
    const yearlyIncome = yearlySummary.find((s) => s._id === 'credit')?.total || 0;
    const yearlyExpense = yearlySummary.find((s) => s._id === 'debit')?.total || 0;

    res.json({
      success: true,
      data: {
        totalIncome: monthlyIncome,
        totalExpense: monthlyExpense,
        savings: monthlyIncome - monthlyExpense,
        yearIncome: yearlyIncome,
        yearExpense: yearlyExpense,
        yearSavings: yearlyIncome - yearlyExpense,
        monthlyIncome: settings?.monthlyIncome || 0,
        cashFlow: monthlyCashFlow.map((c) => ({
          month: c._id.month,
          year: c._id.year,
          income: c.income,
          expense: c.expense,
          net: c.income - c.expense,
        })),
        recentTransactions,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const spendingByCategory = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const userId = new mongoose.Types.ObjectId(req.userId);
    const filter: any = { userId, type: 'debit' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const categories = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);

    res.json({
      success: true,
      data: categories.map((c) => ({
        categoryId: c._id,
        total: c.total,
        count: c.count,
        percentage: grandTotal > 0 ? Math.round((c.total / grandTotal) * 100) : 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const spendingByMerchant = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate, limit = 10 } = req.query;
    const userId = new mongoose.Types.ObjectId(req.userId);
    const filter: any = { userId, type: 'debit' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const merchants = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: '$merchant', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
      { $limit: Number(limit) },
    ]);

    res.json({
      success: true,
      data: merchants.map((m) => ({ name: m._id || 'Unknown', total: m.total, count: m.count })),
    });
  } catch (error) {
    next(error);
  }
};

export const monthlyTrend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = Math.max(1, Math.min(60, Number(req.query.months) || 12));
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const trends = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId), date: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: trends.map((t) => ({
        month: t._id.month,
        year: t._id.year,
        income: t.income,
        expense: t.expense,
        net: t.income - t.expense,
        count: t.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const bankDistribution = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const banks = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId), type: 'debit' } },
      { $group: { _id: '$bank', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = banks.reduce((sum, b) => sum + b.total, 0);

    res.json({
      success: true,
      data: banks.map((b) => ({
        name: b._id || 'Unknown',
        total: b.total,
        count: b.count,
        percentage: grandTotal > 0 ? Math.round((b.total / grandTotal) * 100) : 0,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const cardSpending = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = { userId: new mongoose.Types.ObjectId(req.userId), cardType: { $ne: 'unknown' } };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const cards = await Transaction.aggregate([
      { $match: filter },
      { $group: { _id: { bank: '$bank', cardType: '$cardType' }, total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]);

    res.json({
      success: true,
      data: cards.map((c) => ({
        bank: c._id.bank,
        cardType: c._id.cardType,
        total: c.total,
        count: c.count,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const cashFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = Math.max(1, Math.min(60, Number(req.query.months) || 6));
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months);

    const flow = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.userId), date: { $gte: startDate } } },
      {
        $group: {
          _id: { year: { $year: '$date' }, month: { $month: '$date' } },
          income: { $sum: { $cond: [{ $eq: ['$type', 'credit'] }, '$amount', 0] } },
          expense: { $sum: { $cond: [{ $eq: ['$type', 'debit'] }, '$amount', 0] } },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    res.json({
      success: true,
      data: flow.map((f) => ({
        month: f._id.month,
        year: f._id.year,
        income: f.income,
        expense: f.expense,
        net: f.income - f.expense,
      })),
    });
  } catch (error) {
    next(error);
  }
};

export const exportData = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { startDate, endDate } = req.query;
    const filter: any = { userId: req.userId };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lte = new Date(endDate as string);
    }

    const transactions = await Transaction.find(filter).sort({ date: -1 }).lean();

    const csv = [
      'Date,Time,Type,Amount,Currency,Merchant,Bank,Category,Status,Description',
      ...transactions.map((t) =>
        [
          t.date.toISOString().split('T')[0],
          t.time || '',
          t.type,
          t.amount,
          t.currency,
          `"${t.merchant || ''}"`,
          t.bank,
          t.category || '',
          t.status,
          `"${(t.description || '').replace(/"/g, '""')}"`,
        ].join(','),
      ),
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="syncflow-transactions-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csv);
  } catch (error) {
    next(error);
  }
};
