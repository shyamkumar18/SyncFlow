import mongoose from 'mongoose';
import { Request, Response, NextFunction } from 'express';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';
import { Setting } from '../models/Setting';
import { getFinancialSummary, monthStart, yearStart } from '../services/FinancialSummaryService';

export const getOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const now = new Date();
    const userId = req.userId!;

    const { startDate, endDate } = req.query;
    const rangeStart = startDate ? new Date(startDate as string) : monthStart();
    const rangeEnd = endDate ? new Date(endDate as string) : undefined;

    const settings = await Setting.findOne({ userId }).lean();

    const [
      monthlySummary,
      yearlySummary,
      recentTransactions,
      monthlyCashFlow,
    ] = await Promise.all([
      getFinancialSummary({ userId, startDate: rangeStart, endDate: rangeEnd }),
      getFinancialSummary({ userId, startDate: yearStart() }),
      Transaction.find({ userId })
        .sort({ date: -1 })
        .limit(10)
        .lean(),
      Transaction.aggregate([
        {
          $match: {
            userId: new mongoose.Types.ObjectId(userId),
            date: {
              $gte: rangeStart,
              ...(rangeEnd ? { $lte: rangeEnd } : { $lte: now }),
            },
          },
        },
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

    res.json({
      success: true,
      data: {
        totalIncome: monthlySummary.totalIncome,
        totalExpense: monthlySummary.totalExpense,
        savings: monthlySummary.netSavings,
        net: monthlySummary.netSavings,
        yearIncome: yearlySummary.totalIncome,
        yearExpense: yearlySummary.totalExpense,
        yearSavings: yearlySummary.netSavings,
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
      if (endDate) filter.date.$lt = new Date(new Date(endDate as string).getTime() + 86400000);
    }

    const categories = await Transaction.aggregate([
      { $match: filter },
      {
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: '_id',
          as: 'resolvedCategory',
        },
      },
      {
        $addFields: {
          categoryName: {
            $cond: {
              if: { $gt: [{ $size: '$resolvedCategory' }, 0] },
              then: { $arrayElemAt: ['$resolvedCategory.name', 0] },
              else: { $ifNull: ['$autoCategory', 'Uncategorized'] },
            },
          },
        },
      },
      {
        $group: {
          _id: '$categoryName',
          total: { $sum: '$amount' },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
    ]);

    const grandTotal = categories.reduce((sum, c) => sum + c.total, 0);

    res.json({
      success: true,
      data: categories.map((c) => ({
        categoryName: c._id,
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
      if (endDate) filter.date.$lt = new Date(new Date(endDate as string).getTime() + 86400000);
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
    startDate.setDate(1);
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
    const { startDate, endDate } = req.query;
    const userId = new mongoose.Types.ObjectId(req.userId);
    const filter: any = { userId, type: 'debit' };
    if (startDate || endDate) {
      filter.date = {};
      if (startDate) filter.date.$gte = new Date(startDate as string);
      if (endDate) filter.date.$lt = new Date(new Date(endDate as string).getTime() + 86400000);
    }

    const banks = await Transaction.aggregate([
      { $match: filter },
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
      if (endDate) filter.date.$lt = new Date(new Date(endDate as string).getTime() + 86400000);
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

function fillMonthlyGaps(data: Array<{ _id: { year: number; month: number } } & Record<string, number>>, startYear: number, endYear: number): Array<{ month: number; year: number } & Record<string, number>> {
  const all: Array<{ month: number; year: number } & Record<string, number>> = [];
  for (let y = startYear; y <= endYear; y++) {
    for (let m = 1; m <= 12; m++) {
      const entry = data.find(d => d._id.year === y && d._id.month === m);
      const base: Record<string, number> = {};
      const keys = data.length > 0 ? Object.keys(data[0]).filter(k => k !== '_id') : ['income', 'expense', 'count'];
      for (const k of keys) base[k] = entry?.[k] ?? 0;
      all.push({ month: m, year: y, ...base } as any);
    }
  }
  return all;
}

export const yearlyOverview = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const year = parseInt(req.query.year as string) || new Date().getFullYear();
    const startDate = new Date(Date.UTC(year, 0, 1));
    const endDate = new Date(Date.UTC(year, 11, 31, 23, 59, 59));
    const userId = new mongoose.Types.ObjectId(req.userId);

    const byMonth = await Transaction.aggregate([
      { $match: { userId, date: { $gte: startDate, $lte: endDate } } },
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

    const monthly = fillMonthlyGaps(byMonth, year, year);
    const totalIncome = monthly.reduce((s, m) => s + m.income, 0);
    const totalExpense = monthly.reduce((s, m) => s + m.expense, 0);
    const bestMonth = monthly.reduce((a, b) => (a.income - a.expense) > (b.income - b.expense) ? a : b, monthly[0] || { month: 1, year, income: 0, expense: 0, count: 0 });
    const worstMonth = monthly.reduce((a, b) => (a.income - a.expense) < (b.income - b.expense) ? a : b, monthly[0] || { month: 1, year, income: 0, expense: 0, count: 0 });
    const highestIncome = [...monthly].sort((a, b) => b.income - a.income)[0];
    const highestExpense = [...monthly].sort((a, b) => b.expense - a.expense)[0];
    const avgMonthlySpend = totalExpense / 12;
    const daysInYear = (startDate.getFullYear() % 4 === 0 && (startDate.getFullYear() % 100 !== 0 || startDate.getFullYear() % 400 === 0)) ? 366 : 365;
    const avgDaily = totalExpense / daysInYear;

    res.json({
      success: true,
      data: {
        year,
        monthly,
        totalIncome,
        totalExpense,
        netSavings: totalIncome - totalExpense,
        totalTransactions: monthly.reduce((s, m) => s + m.count, 0),
        bestMonth: { month: bestMonth.month, savings: bestMonth.income - bestMonth.expense },
        worstMonth: { month: worstMonth.month, savings: worstMonth.income - worstMonth.expense },
        highestIncomeMonth: { month: highestIncome.month, amount: highestIncome.income },
        highestExpenseMonth: { month: highestExpense.month, amount: highestExpense.expense },
        avgMonthlySpend,
        avgDaily,
        monthsWithData: byMonth.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const cashFlow = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const months = Math.max(1, Math.min(60, Number(req.query.months) || 6));
    const startDate = new Date();
    startDate.setDate(1);
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
      if (endDate) filter.date.$lt = new Date(new Date(endDate as string).getTime() + 86400000);
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
