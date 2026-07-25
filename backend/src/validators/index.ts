import Joi from 'joi';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .message('Password must contain uppercase, lowercase, number, and special character')
    .required(),
  displayName: Joi.string().min(2).max(50).required(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});

export const googleAuthSchema = Joi.object({
  code: Joi.string().required(),
});

export const refreshSchema = Joi.object({
  refreshToken: Joi.string().required(),
});

export const forgotPasswordSchema = Joi.object({
  email: Joi.string().email().required(),
});

export const resetPasswordSchema = Joi.object({
  token: Joi.string().required(),
  password: Joi.string().min(8).max(128)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])/)
    .message('Password must contain uppercase, lowercase, number, and special character')
    .required(),
});

export const createTransactionSchema = Joi.object({
  amount: Joi.number().positive().required(),
  type: Joi.string().valid('debit', 'credit').required(),
  date: Joi.date().required(),
  time: Joi.string(),
  description: Joi.string().max(500),
  merchant: Joi.string().max(200),
  sender: Joi.string().max(200),
  receiver: Joi.string().max(200),
  balance: Joi.number(),
  upiId: Joi.string(),
  referenceNumber: Joi.string(),
  bank: Joi.string().max(100).required(),
  cardType: Joi.string().valid('credit', 'debit', 'unknown'),
  status: Joi.string().valid('success', 'failed', 'pending', 'refunded'),
  category: Joi.string(),
  tags: Joi.array().items(Joi.string()),
  notes: Joi.string().max(1000),
});

export const updateTransactionSchema = Joi.object({
  category: Joi.string(),
  notes: Joi.string().max(1000),
  tags: Joi.array().items(Joi.string()),
});

export const createCategorySchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  type: Joi.string().valid('income', 'expense').required(),
  icon: Joi.string().max(50),
  color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/),
  parent: Joi.string(),
});

export const createWalletSchema = Joi.object({
  name: Joi.string().min(1).max(50).required(),
  type: Joi.string().valid('savings', 'current', 'cash', 'wallet', 'investment').required(),
  bank: Joi.string().max(100),
  balance: Joi.number().default(0),
  color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/),
  icon: Joi.string().max(50),
});

export const updateBalanceSchema = Joi.object({
  balance: Joi.number().required(),
});

export const createCardSchema = Joi.object({
  type: Joi.string().valid('credit', 'debit').required(),
  bank: Joi.string().max(100).required(),
  cardNetwork: Joi.string().valid('visa', 'mastercard', 'rupay', 'amex').required(),
  cardNumber: Joi.string().required(),
  cardHolderName: Joi.string().max(100).required(),
  expiryMonth: Joi.number().min(1).max(12).required(),
  expiryYear: Joi.number().min(2024).max(2050).required(),
  creditLimit: Joi.number().positive(),
  billingDate: Joi.number().min(1).max(31),
});

export const createBudgetSchema = Joi.object({
  category: Joi.string().required(),
  amount: Joi.number().positive().required(),
  period: Joi.string().valid('monthly', 'yearly').default('monthly'),
  month: Joi.number().min(1).max(12).required(),
  year: Joi.number().required(),
  rollover: Joi.boolean().default(false),
  notifyAt: Joi.number().min(0).max(100).default(80),
});

export const createGoalSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  targetAmount: Joi.number().positive().required(),
  currentAmount: Joi.number().min(0).default(0),
  targetDate: Joi.date().min('now'),
  icon: Joi.string().max(50),
  color: Joi.string().pattern(/^#[0-9a-fA-F]{6}$/),
  category: Joi.string().valid(
    'savings', 'investment', 'debt', 'emergency',
    'travel', 'education', 'purchase', 'other',
  ).default('savings'),
  priority: Joi.string().valid('low', 'medium', 'high').default('medium'),
  notes: Joi.string().max(1000),
});

export const updateProgressSchema = Joi.object({
  currentAmount: Joi.number().min(0).required(),
});

export const updateSettingsSchema = Joi.object({
  theme: Joi.string().valid('light', 'dark', 'system'),
  language: Joi.string().min(2).max(5),
  currency: Joi.string().min(3).max(3),
  timezone: Joi.string(),
  monthlyIncome: Joi.number().min(0),
  notificationPreferences: Joi.object({
    emailSync: Joi.boolean(),
    budgetAlerts: Joi.boolean(),
    goalReminders: Joi.boolean(),
    monthlyReport: Joi.boolean(),
    pushNotifications: Joi.boolean(),
  }),
  privacy: Joi.object({
    showAmountsInDashboard: Joi.boolean(),
    showRecentTransactions: Joi.boolean(),
  }),
});

export const updateProfileSchema = Joi.object({
  displayName: Joi.string().min(2).max(50),
  avatar: Joi.string().uri(),
  monthlyIncome: Joi.number().min(0),
});

export const paginationSchema = Joi.object({
  page: Joi.number().min(1).default(1),
  limit: Joi.number().min(1).max(100).default(20),
  sort: Joi.string().default('-date'),
  search: Joi.string(),
  startDate: Joi.date(),
  endDate: Joi.date(),
  type: Joi.string().valid('debit', 'credit'),
  bank: Joi.string(),
  category: Joi.string(),
  status: Joi.string().valid('success', 'failed', 'pending', 'refunded'),
  minAmount: Joi.number(),
  maxAmount: Joi.number(),
});

export const syncEmailSchema = Joi.object({
  maxResults: Joi.number().min(1).max(500).default(50),
});
