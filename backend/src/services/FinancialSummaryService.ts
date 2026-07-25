import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';

export interface FinancialSummaryParams {
  userId: string;
  startDate?: Date;
  endDate?: Date;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpense: number;
  netSavings: number;
  count: number;
}

export async function getFinancialSummary(params: FinancialSummaryParams): Promise<FinancialSummary> {
  const filter: any = { userId: new mongoose.Types.ObjectId(params.userId) };

  if (params.startDate || params.endDate) {
    filter.date = {};
    if (params.startDate) filter.date.$gte = params.startDate;
    if (params.endDate) filter.date.$lt = new Date(params.endDate.getTime() + 86400000);
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

  const incomeItem = summary.find((s) => s._id === 'credit');
  const expenseItem = summary.find((s) => s._id === 'debit');
  const totalIncome = incomeItem?.total || 0;
  const totalExpense = expenseItem?.total || 0;
  const totalCount = summary.reduce((acc, s) => acc + s.count, 0);

  return {
    totalIncome,
    totalExpense,
    netSavings: totalIncome - totalExpense,
    count: totalCount,
  };
}

export function monthStart(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1);
}

export function yearStart(): Date {
  return new Date(new Date().getFullYear(), 0, 1);
}
