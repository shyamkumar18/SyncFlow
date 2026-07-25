import mongoose, { Schema, Document } from 'mongoose';

export interface IBank extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  emailPatterns: string[];
  logo?: string;
  color: string;
  connected: boolean;
  lastActivity?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const bankSchema = new Schema<IBank>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    name: { type: String, required: true, trim: true },
    emailPatterns: [String],
    logo: String,
    color: { type: String, default: '#0D6B4F' },
    connected: { type: Boolean, default: true },
    lastActivity: Date,
  },
  { timestamps: true },
);

bankSchema.index({ userId: 1, name: 1 }, { unique: true });

export const Bank = mongoose.model<IBank>('Bank', bankSchema);
