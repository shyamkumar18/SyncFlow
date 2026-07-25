export interface IUser {
  _id: string;
  email: string;
  displayName: string;
  avatar?: string;
  provider: 'local' | 'google';
  monthlyIncome: number;
  currency: string;
  timezone: string;
  role: 'user' | 'admin';
}

export interface ITransaction {
  _id: string;
  userId: string;
  emailId?: string;
  amount: number;
  currency: string;
  type: 'debit' | 'credit';
  date: string;
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
  cardType?: 'credit' | 'debit' | 'unknown';
  status: 'success' | 'failed' | 'pending' | 'refunded';
  autoCategory?: string;
  category?: string;
  categoryConfidence?: number;
  tags: string[];
  notes?: string;
  isRecurring: boolean;
  isManual: boolean;
  transactionFingerprint?: string;
  duplicateGroupId?: string;
  normalized?: boolean;
}

export interface IReviewItem {
  _id: string;
  userId: string;
  emailId?: string;
  amount: number;
  type: 'debit' | 'credit';
  date: string;
  time?: string;
  description?: string;
  merchant?: string;
  sender?: string;
  receiver?: string;
  balance?: number;
  upiId?: string;
  referenceNumber?: string;
  bank: string;
  status: 'pending' | 'approved' | 'rejected' | 'edited';
  reviewNotes?: string;
  confidence: number;
  detectionDetails?: string;
  transactionId?: string;
  reviewedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface IEmail {
  _id: string;
  userId: string;
  gmailMessageId: string;
  from: string;
  to: string;
  subject: string;
  snippet: string;
  receivedAt: string;
  category: EmailCategory;
  bank: string;
  isProcessed: boolean;
  hasTransaction: boolean;
}

export type EmailCategory =
  | 'transaction'
  | 'credit_card'
  | 'debit_card'
  | 'upi'
  | 'emi'
  | 'loan'
  | 'refund'
  | 'failed'
  | 'statement'
  | 'unknown';

export interface ICategory {
  _id: string;
  userId?: string;
  name: string;
  type: 'income' | 'expense';
  icon: string;
  color: string;
  isDefault: boolean;
  parent?: string;
}

export interface IWallet {
  _id: string;
  name: string;
  type: 'savings' | 'current' | 'cash' | 'wallet' | 'investment';
  bank: string;
  balance: number;
  currency: string;
  color: string;
  icon: string;
}

export interface ICard {
  _id: string;
  type: 'credit' | 'debit';
  bank: string;
  cardNetwork: 'visa' | 'mastercard' | 'rupay' | 'amex';
  cardNumber: string;
  cardHolderName: string;
  creditLimit?: number;
  billingDate?: number;
}

export interface IBudget {
  _id: string;
  category: string;
  amount: number;
  period: 'monthly' | 'yearly';
  month: number;
  year: number;
  spent: number;
  rollover: boolean;
  notifyAt: number;
}

export interface IGoal {
  _id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate?: string;
  icon: string;
  color: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  isCompleted: boolean;
}

export interface INotification {
  _id: string;
  type: 'budget_alert' | 'goal_milestone' | 'sync_complete' | 'monthly_report' | 'system';
  title: string;
  message: string;
  data?: Record<string, unknown>;
  isRead: boolean;
  createdAt: string;
}

export interface IApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  errors?: Array<{ field: string; message: string }>;
}

export interface IPaginatedResponse<T> extends IApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}
