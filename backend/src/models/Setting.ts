import mongoose, { Schema, Document } from 'mongoose';

export interface ISetting extends Document {
  userId: mongoose.Types.ObjectId;
  theme: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  timezone: string;
  monthlyIncome: number;
  notificationPreferences: {
    emailSync: boolean;
    budgetAlerts: boolean;
    goalReminders: boolean;
    monthlyReport: boolean;
    pushNotifications: boolean;
  };
  privacy: {
    showAmountsInDashboard: boolean;
    showRecentTransactions: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const settingSchema = new Schema<ISetting>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'system' },
    language: { type: String, default: 'en' },
    currency: { type: String, default: 'INR' },
    timezone: { type: String, default: 'Asia/Kolkata' },
    monthlyIncome: { type: Number, default: 0 },
    notificationPreferences: {
      emailSync: { type: Boolean, default: true },
      budgetAlerts: { type: Boolean, default: true },
      goalReminders: { type: Boolean, default: true },
      monthlyReport: { type: Boolean, default: true },
      pushNotifications: { type: Boolean, default: true },
    },
    privacy: {
      showAmountsInDashboard: { type: Boolean, default: true },
      showRecentTransactions: { type: Boolean, default: true },
    },
  },
  { timestamps: true },
);

// Index is defined via field-level unique constraint above

export const Setting = mongoose.model<ISetting>('Setting', settingSchema);
