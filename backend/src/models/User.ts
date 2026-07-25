import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  password?: string;
  displayName: string;
  avatar?: string;
  provider: 'local' | 'google';
  googleId?: string;
  googleAccessToken?: string;
  googleRefreshToken?: string;
  gmailSyncEnabled: boolean;
  lastSyncAt?: Date;
  monthlyIncome: number;
  currency: string;
  timezone: string;
  emailVerified: boolean;
  refreshTokens: Array<{
    token: string;
    deviceInfo?: string;
    expiresAt: Date;
    createdAt: Date;
  }>;
  role: 'user' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const refreshTokenSchema = new Schema(
  {
    token: { type: String, required: true },
    deviceInfo: String,
    expiresAt: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: false },
);

const userSchema = new Schema<IUser>(
  {
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String },
    displayName: { type: String, required: true, trim: true },
    avatar: String,
    provider: { type: String, enum: ['local', 'google'], required: true },
    googleId: { type: String, unique: true, sparse: true },
    googleAccessToken: String,
    googleRefreshToken: String,
    gmailSyncEnabled: { type: Boolean, default: true },
    lastSyncAt: Date,
    monthlyIncome: { type: Number, default: 0 },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    emailVerified: { type: Boolean, default: false },
    refreshTokens: [refreshTokenSchema],
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

// Indexes are defined via field-level unique constraints above

export const User = mongoose.models.User || mongoose.model<IUser>('User', userSchema);
