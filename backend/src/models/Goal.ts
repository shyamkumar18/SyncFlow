import mongoose, { Schema, Document } from 'mongoose';
import { GOAL_CATEGORIES, GOAL_PRIORITIES } from '../utils/constants';

export interface IGoal extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: Date;
  icon: string;
  color: string;
  category: typeof GOAL_CATEGORIES[number];
  priority: typeof GOAL_PRIORITIES[number];
  notes?: string;
  isCompleted: boolean;
  completedAt?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const goalSchema = new Schema<IGoal>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    targetAmount: { type: Number, required: true },
    currentAmount: { type: Number, default: 0 },
    targetDate: Date,
    icon: { type: String, default: 'flag' },
    color: { type: String, default: '#0D6B4F' },
    category: { type: String, enum: GOAL_CATEGORIES, default: 'savings' },
    priority: { type: String, enum: GOAL_PRIORITIES, default: 'medium' },
    notes: String,
    isCompleted: { type: Boolean, default: false },
    completedAt: Date,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

goalSchema.index({ userId: 1, isActive: 1 });
goalSchema.index({ userId: 1, isCompleted: 1 });

export const Goal = mongoose.models.Goal || mongoose.model<IGoal>('Goal', goalSchema);
