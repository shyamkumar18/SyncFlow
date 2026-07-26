import mongoose, { Schema, Document } from 'mongoose';
import { TRANSACTION_TYPES, TRANSACTION_STATUSES, CARD_TYPES } from '../utils/constants';

export interface ITransaction extends Document {
  userId: mongoose.Types.ObjectId;
  emailId?: mongoose.Types.ObjectId;
  amount: number;
  currency: string;
  type: typeof TRANSACTION_TYPES[number];
  date: Date;
  time?: string;
  description?: string;
  merchant?: string;
  merchantRaw?: string;
  sender?: string;
  receiver?: string;
  balance?: number;
  upiId?: string;
  referenceNumber?: string;
  bank: string;
  cardType?: typeof CARD_TYPES[number];
  cardNumber?: string;
  status: typeof TRANSACTION_STATUSES[number];
  category?: mongoose.Types.ObjectId;
  autoCategory?: string;
  categoryConfidence?: number;
  tags: string[];
  notes?: string;
  isRecurring: boolean;
  isManual: boolean;
  transactionFingerprint?: string;
  duplicateGroupId?: string;
  normalized?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const transactionSchema = new Schema<ITransaction>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emailId: { type: Schema.Types.ObjectId, ref: 'Email' },
    amount: { type: Number, required: true },
    currency: { type: String, default: 'INR' },
    type: { type: String, enum: TRANSACTION_TYPES, required: true },
    date: { type: Date, required: true },
    time: String,
    description: String,
    merchant: String,
    merchantRaw: String,
    sender: String,
    receiver: String,
    balance: Number,
    upiId: String,
    referenceNumber: String,
    bank: { type: String, required: true },
    cardType: { type: String, enum: CARD_TYPES },
    cardNumber: String,
    status: { type: String, enum: TRANSACTION_STATUSES, default: 'success' },
    category: { type: Schema.Types.ObjectId, ref: 'Category' },
    autoCategory: String,
    categoryConfidence: Number,
    tags: [String],
    notes: String,
    isRecurring: { type: Boolean, default: false },
    isManual: { type: Boolean, default: false },
    transactionFingerprint: { type: String, index: true },
    duplicateGroupId: String,
    normalized: { type: Boolean, default: false },
  },
  { timestamps: true },
);

transactionSchema.index({ userId: 1, date: -1 });
transactionSchema.index({ userId: 1, type: 1 });
transactionSchema.index({ userId: 1, bank: 1 });
transactionSchema.index({ userId: 1, category: 1 });
transactionSchema.index({ userId: 1, status: 1 });
transactionSchema.index({ userId: 1, merchant: 1 });
transactionSchema.index({ userId: 1, date: -1, type: 1 });
transactionSchema.index({ userId: 1, amount: 1, type: 1, date: 1 });

export const Transaction = mongoose.model<ITransaction>('Transaction', transactionSchema);
