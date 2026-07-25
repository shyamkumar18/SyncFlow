import mongoose, { Schema, Document } from 'mongoose';
import { EMAIL_CATEGORIES } from '../utils/constants';

export interface IEmail extends Document {
  userId: mongoose.Types.ObjectId;
  gmailMessageId: string;
  threadId: string;
  from: string;
  to: string;
  subject: string;
  body: string;
  bodyText: string;
  snippet: string;
  receivedAt: Date;
  category: typeof EMAIL_CATEGORIES[number];
  bank: string;
  isProcessed: boolean;
  hasTransaction: boolean;
  transactionId?: mongoose.Types.ObjectId;
  labels: string[];
  attachments: Array<{
    filename: string;
    mimeType: string;
    size: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const emailSchema = new Schema<IEmail>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    gmailMessageId: { type: String, required: true },
    threadId: String,
    from: { type: String, required: true },
    to: String,
    subject: { type: String, required: true },
    body: String,
    bodyText: String,
    snippet: String,
    receivedAt: { type: Date, required: true },
    category: { type: String, enum: EMAIL_CATEGORIES, default: 'unknown' },
    bank: { type: String, default: 'Unknown' },
    isProcessed: { type: Boolean, default: false },
    hasTransaction: { type: Boolean, default: false },
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' },
    labels: [String],
    attachments: [
      {
        filename: String,
        mimeType: String,
        size: Number,
      },
    ],
  },
  { timestamps: true },
);

emailSchema.index({ userId: 1, gmailMessageId: 1 }, { unique: true });
emailSchema.index({ userId: 1, receivedAt: -1 });
emailSchema.index({ userId: 1, category: 1 });
emailSchema.index({ userId: 1, bank: 1 });
emailSchema.index({ userId: 1, isProcessed: 1 });

export const Email = mongoose.models.Email || mongoose.model<IEmail>('Email', emailSchema);
