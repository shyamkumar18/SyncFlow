import mongoose, { Schema, Document } from 'mongoose';

export type ReviewStatus = 'pending' | 'approved' | 'rejected' | 'edited';

export interface IReviewItem extends Document {
  userId: mongoose.Types.ObjectId;
  emailId?: mongoose.Types.ObjectId;
  amount: number;
  type: 'debit' | 'credit';
  date: Date;
  time?: string;
  description?: string;
  merchant?: string;
  sender?: string;
  receiver?: string;
  balance?: number;
  upiId?: string;
  referenceNumber?: string;
  bank: string;
  status: ReviewStatus;
  reviewNotes?: string;
  confidence: number;
  detectionDetails?: string;
  transactionId?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const reviewItemSchema = new Schema<IReviewItem>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    emailId: { type: Schema.Types.ObjectId, ref: 'Email' },
    amount: { type: Number, required: true },
    type: { type: String, enum: ['debit', 'credit'], required: true },
    date: { type: Date, required: true },
    time: String,
    description: String,
    merchant: String,
    sender: String,
    receiver: String,
    balance: Number,
    upiId: String,
    referenceNumber: String,
    bank: { type: String, required: true },
    status: { type: String, enum: ['pending', 'approved', 'rejected', 'edited'], default: 'pending' },
    reviewNotes: String,
    confidence: { type: Number, required: true },
    detectionDetails: String,
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    reviewedAt: Date,
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true },
);

reviewItemSchema.index({ userId: 1, status: 1 });
reviewItemSchema.index({ userId: 1, date: -1 });

export const ReviewItem = mongoose.model<IReviewItem>('ReviewItem', reviewItemSchema);
