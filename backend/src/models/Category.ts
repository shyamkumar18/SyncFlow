import mongoose, { Schema, Document } from 'mongoose';

export interface ICategory extends Document {
  userId?: mongoose.Types.ObjectId;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
  parent?: mongoose.Types.ObjectId;
  sortOrder: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const categorySchema = new Schema<ICategory>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ['income', 'expense'], required: true },
    icon: { type: String, default: 'category' },
    color: { type: String, default: '#6C757D' },
    isDefault: { type: Boolean, default: false },
    parent: { type: Schema.Types.ObjectId, ref: 'Category' },
    sortOrder: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true },
);

categorySchema.index({ userId: 1, name: 1 }, { unique: true });
categorySchema.index({ userId: 1, type: 1 });

export const Category = mongoose.models.Category || mongoose.model<ICategory>('Category', categorySchema);
