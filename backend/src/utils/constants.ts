export const EMAIL_CATEGORIES = [
  'transaction', 'credit_card', 'debit_card', 'upi',
  'emi', 'loan', 'refund', 'failed', 'statement', 'unknown',
] as const;

export const TRANSACTION_TYPES = ['debit', 'credit'] as const;

export const TRANSACTION_STATUSES = ['success', 'failed', 'pending', 'refunded'] as const;

export const CARD_TYPES = ['credit', 'debit', 'unknown'] as const;

export const CARD_NETWORKS = ['visa', 'mastercard', 'rupay', 'amex'] as const;

export const WALLET_TYPES = ['savings', 'current', 'cash', 'wallet', 'investment'] as const;

export const BUDGET_PERIODS = ['monthly', 'yearly'] as const;

export const GOAL_CATEGORIES = [
  'savings', 'investment', 'debt', 'emergency', 'travel',
  'education', 'purchase', 'other',
] as const;

export const GOAL_PRIORITIES = ['low', 'medium', 'high'] as const;

export const NOTIFICATION_TYPES = [
  'budget_alert', 'goal_milestone', 'sync_complete',
  'monthly_report', 'system',
] as const;

export const DEFAULT_EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', icon: 'restaurant', color: '#EF4444' },
  { name: 'Transport', icon: 'directions_car', color: '#F59E0B' },
  { name: 'Shopping', icon: 'shopping_bag', color: '#EC4899' },
  { name: 'Entertainment', icon: 'movie', color: '#8B5CF6' },
  { name: 'Bills & Utilities', icon: 'receipt', color: '#3B82F6' },
  { name: 'Healthcare', icon: 'local_hospital', color: '#10B981' },
  { name: 'Education', icon: 'school', color: '#6366F1' },
  { name: 'Housing', icon: 'home', color: '#F97316' },
  { name: 'Travel', icon: 'flight', color: '#06B6D4' },
  { name: 'Investment', icon: 'trending_up', color: '#0D6B4F' },
  { name: 'Insurance', icon: 'verified_user', color: '#1A8C62' },
  { name: 'Others', icon: 'category', color: '#6C757D' },
] as const;

export const DEFAULT_INCOME_CATEGORIES = [
  { name: 'Salary', icon: 'work', color: '#0D6B4F' },
  { name: 'Freelance', icon: 'computer', color: '#1A8C62' },
  { name: 'Investment', icon: 'trending_up', color: '#F5A623' },
  { name: 'Refund', icon: 'undo', color: '#10B981' },
  { name: 'Gift', icon: 'card_giftcard', color: '#EC4899' },
  { name: 'Others', icon: 'category', color: '#6C757D' },
] as const;
