import mongoose, { Schema, Document } from 'mongoose';
import { NOTIFICATION_TYPES } from '../utils/constants';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  type: typeof NOTIFICATION_TYPES[number];
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    type: { type: String, enum: NOTIFICATION_TYPES, required: true },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Schema.Types.Mixed },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true },
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });
notificationSchema.index({ userId: 1, type: 1 });

export const Notification = mongoose.model<INotification>('Notification', notificationSchema);
