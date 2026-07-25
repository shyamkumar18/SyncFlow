import mongoose, { Schema, Document } from 'mongoose';
import { WALLET_TYPES } from '../utils/constants';

export interface IWallet extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  type: typeof WALLET_TYPES[number];
  bank: string;
  accountNumber?: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const walletSchema = new Schema<IWallet>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: WALLET_TYPES, required: true },
    bank: { type: String, default: '' },
    accountNumber: String,
    balance: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    color: { type: String, default: '#0D6B4F' },
    icon: { type: String, default: 'account_balance' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

walletSchema.index({ userId: 1 });

export const Wallet = mongoose.models.Wallet || mongoose.model<IWallet>('Wallet', walletSchema);
