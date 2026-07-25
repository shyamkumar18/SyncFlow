import mongoose, { Schema, Document } from 'mongoose';
import { BUDGET_PERIODS } from '../utils/constants';

export interface IBudget extends Document {
  userId: mongoose.Types.ObjectId;
  category: mongoose.Types.ObjectId;
  amount: number;
  period: typeof BUDGET_PERIODS[number];
  month: number;
  year: number;
  spent: number;
  rollover: boolean;
  notifyAt: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true },
    amount: { type: Number, required: true },
    period: { type: String, enum: BUDGET_PERIODS, default: 'monthly' },
    month: { type: Number, required: true },
    year: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    rollover: { type: Boolean, default: false },
    notifyAt: { type: Number, default: 80 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

budgetSchema.index({ userId: 1, category: 1, period: 1, month: 1, year: 1 }, { unique: true });
budgetSchema.index({ userId: 1, isActive: 1 });

export const Budget = mongoose.model<IBudget>('Budget', budgetSchema);
