import mongoose, { Schema, Document } from 'mongoose';

export type GmailProvider = 'gmail';
export type GmailConnectionStatus = 'connected' | 'disconnected' | 'expired' | 'error';
export type SyncMode = 'idle' | 'first_sync' | 'incremental';

export interface IGmailAccount extends Document {
  userId: mongoose.Types.ObjectId;
  googleId: string;
  gmailEmail: string;
  accessTokenEncrypted: string;
  refreshTokenEncrypted: string;
  expiresAt: Date;
  connected: boolean;
  connectedAt?: Date;
  lastConnected?: Date;
  lastSync?: Date;
  syncMode: SyncMode;
  provider: GmailProvider;
  status: GmailConnectionStatus;
  createdAt: Date;
  updatedAt: Date;
}

const gmailAccountSchema = new Schema<IGmailAccount>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    googleId: { type: String, required: true },
    gmailEmail: { type: String, required: true },
    accessTokenEncrypted: { type: String, required: true },
    refreshTokenEncrypted: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    connected: { type: Boolean, default: false },
    connectedAt: Date,
    lastConnected: Date,
    lastSync: Date,
    syncMode: { type: String, enum: ['idle', 'first_sync', 'incremental'], default: 'idle' },
    provider: { type: String, enum: ['gmail'], default: 'gmail' },
    status: {
      type: String,
      enum: ['connected', 'disconnected', 'expired', 'error'],
      default: 'disconnected',
    },
  },
  { timestamps: true },
);

gmailAccountSchema.index({ userId: 1 }, { unique: true });
gmailAccountSchema.index({ googleId: 1 });

export const GmailAccount = mongoose.models.GmailAccount || mongoose.model<IGmailAccount>('GmailAccount', gmailAccountSchema);
