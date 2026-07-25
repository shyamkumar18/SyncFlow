export const CATEGORIES = {
  income: [
    'salary', 'freelance', 'business', 'investment_income', 'rental_income',
    'refund', 'cashback', 'gift', 'interest', 'dividend', 'insurance_claim', 'others_income',
  ],
  expense: [
    'food_dining', 'groceries', 'transport', 'shopping', 'entertainment',
    'bills_utilities', 'healthcare', 'education', 'housing', 'travel',
    'insurance', 'investment', 'subscriptions', 'emi', 'loan_repayment',
    'atm_withdrawal', 'transfer', 'tax', 'charity', 'others_expense',
  ],
} as const;

export type IncomeCategory = (typeof CATEGORIES.income)[number];
export type ExpenseCategory = (typeof CATEGORIES.expense)[number];
export type TransactionCategory = IncomeCategory | ExpenseCategory;

interface CategorizationInput {
  merchant?: string | null;
  description?: string | null;
  bank?: string | null;
  amount: number;
  type: 'debit' | 'credit';
}

export interface CategorizationResult {
  category: TransactionCategory | null;
  confidence: number;
}

const keywordRules: Array<{ keywords: string[]; category: TransactionCategory; type: 'debit' | 'credit' | 'both' }> = [
  { keywords: ['salary', 'payroll', 'monthly pay'], category: 'salary', type: 'credit' },
  { keywords: ['freelance', 'contractor', 'consulting'], category: 'freelance', type: 'credit' },
  { keywords: ['dividend', 'stock', 'investment return'], category: 'dividend', type: 'credit' },
  { keywords: ['refund', 'cashback', 'money back'], category: 'refund', type: 'credit' },
  { keywords: ['interest', 'int paid'], category: 'interest', type: 'credit' },
  { keywords: ['swiggy', 'zomato', 'food', 'restaurant', 'dining', 'dominos', 'pizza', 'mcdonald', 'kfc', 'starbucks', 'eat', 'cafe'], category: 'food_dining', type: 'debit' },
  { keywords: ['grocery', 'groceries', 'vegetables', 'fruits', 'milk', 'supermarket'], category: 'groceries', type: 'debit' },
  { keywords: ['uber', 'ola', 'rapido', 'cab', 'taxi', 'auto', 'metro', 'bus', 'fuel', 'petrol', 'diesel', 'parking', 'toll'], category: 'transport', type: 'debit' },
  { keywords: ['amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'shopping', 'clothing', 'apparel', 'shoe'], category: 'shopping', type: 'debit' },
  { keywords: ['netflix', 'hotstar', 'prime video', 'spotify', 'youtube', 'bookmyshow', 'movie', 'cinema', 'concert', 'game', 'gaming'], category: 'entertainment', type: 'debit' },
  { keywords: ['electricity', 'water bill', 'gas bill', 'broadband', 'internet', 'phone bill', 'mobile', 'recharge', 'dth', 'cable'], category: 'bills_utilities', type: 'debit' },
  { keywords: ['hospital', 'doctor', 'clinic', 'pharmacy', 'medicine', 'apollo', 'mediclaim', 'health'], category: 'healthcare', type: 'debit' },
  { keywords: ['school', 'college', 'tuition', 'university', 'course', 'class', 'coaching', 'exam fee'], category: 'education', type: 'debit' },
  { keywords: ['rent', 'maintenance', 'society'], category: 'housing', type: 'debit' },
  { keywords: ['hotel', 'flight', 'train', 'bus ticket', 'holiday', 'trip', 'tour', 'oyo', 'airbnb', 'makemytrip'], category: 'travel', type: 'debit' },
  { keywords: ['insurance', 'lic', 'policy'], category: 'insurance', type: 'debit' },
  { keywords: ['mutual fund', 'sip', 'nps', 'ppf', 'stock', 'zerodha', 'groww', 'upstox'], category: 'investment', type: 'debit' },
  { keywords: ['netflix', 'spotify', 'apple music', 'subscription', 'membership', 'prime'], category: 'subscriptions', type: 'debit' },
  { keywords: ['emi', 'equated monthly'], category: 'emi', type: 'debit' },
  { keywords: ['loan', 'personal loan', 'home loan', 'car loan', 'repayment'], category: 'loan_repayment', type: 'debit' },
  { keywords: ['atm', 'cash withdrawal', 'withdrawal'], category: 'atm_withdrawal', type: 'debit' },
  { keywords: ['transfer', 'neft', 'rtgs', 'imps', 'upi transfer'], category: 'transfer', type: 'both' },
  { keywords: ['tax', 'gst', 'income tax', 'property tax'], category: 'tax', type: 'debit' },
  { keywords: ['donation', 'charity', 'ngo', 'donate'], category: 'charity', type: 'debit' },
];

export function categorize(input: CategorizationInput): CategorizationResult {
  const text = [input.merchant, input.description, input.bank].filter(Boolean).join(' ').toLowerCase();
  if (!text) return { category: null, confidence: 0 };

  let bestCategory: TransactionCategory | null = null;
  let bestConfidence = 0;

  for (const rule of keywordRules) {
    if (rule.type !== 'both' && rule.type !== input.type) continue;

    for (const kw of rule.keywords) {
      if (text.includes(kw)) {
        const conf = kw.length > 6 ? 85 : 70;
        if (conf > bestConfidence) {
          bestConfidence = conf;
          bestCategory = rule.category;
        }
      }
    }
  }

  if (!bestCategory) {
    if (input.type === 'credit') {
      return { category: 'others_income', confidence: 20 };
    }
    return { category: 'others_expense', confidence: 20 };
  }

  return { category: bestCategory, confidence: bestConfidence };
}
