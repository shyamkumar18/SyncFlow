import mongoose, { Schema, Document } from 'mongoose';
import { CARD_TYPES, CARD_NETWORKS } from '../utils/constants';

export interface ICard extends Document {
  userId: mongoose.Types.ObjectId;
  type: typeof CARD_TYPES[number];
  bank: string;
  cardNetwork: typeof CARD_NETWORKS[number];
  cardNumber: string;
  cardHolderName: string;
  expiryMonth: number;
  expiryYear: number;
  creditLimit?: number;
  availableBalance?: number;
  billingDate?: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const cardSchema = new Schema<ICard>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: ['credit', 'debit'], required: true },
    bank: { type: String, required: true },
    cardNetwork: { type: String, enum: CARD_NETWORKS, required: true },
    cardNumber: { type: String, required: true },
    cardHolderName: { type: String, required: true },
    expiryMonth: { type: Number, required: true },
    expiryYear: { type: Number, required: true },
    creditLimit: Number,
    availableBalance: Number,
    billingDate: Number,
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

cardSchema.index({ userId: 1 });

export const Card = mongoose.model<ICard>('Card', cardSchema);
