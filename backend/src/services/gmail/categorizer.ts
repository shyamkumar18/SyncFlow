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

const categoryPatterns: Record<EmailCategory, RegExp[]> = {
  transaction: [
    /(?:tr(?:ansaction)?|txn|txnid|transaction)\s*(?:\d+|:|-|id)/i,
    /(?:debited|credited|withdrawn|deposited)/i,
    /(?:a\.?c\.?|account)\s*(?:no|number|#)?\s*:?\s*\*?\d{4,}/i,
    /(?:amount|amt)\s*:?\s*(?:rs|inr|₹)\s*\d/i,
    /(?:available|avl)\s*(?:balance|bal)/i,
  ],
  credit_card: [
    /credit\s*card/i,
    /card\s*(?:no|number|#)\s*:?\s*\*?\d{4,}/i,
    /(?:cc|credit).*(?:spend|transaction|purchase|payment)/i,
    /card\s*(?:declined|blocked|unblocked)/i,
    /(?:minimum|min)\s*(?:amount|due|payment)/i,
    /credit\s*limit/i,
  ],
  debit_card: [
    /debit\s*card/i,
    /(?:dc|debit).*(?:transaction|swipe|pos|purchase|withdrawal)/i,
    /atm\s*(?:withdrawal|transaction)/i,
    /card\s*(?:used|swiped)/i,
  ],
  upi: [
    /upi\s*(?:ref|transaction|id|transfer)/i,
    /(?:paytm|google\s*pay|gpay|phonepe|amazon\s*pay|bhim)/i,
    /vpa\s*:?/i,
    /upi\s*:?\s*\w+@\w+/i,
    /(?:sent|received|paid|collected)\s*(?:via|through|by)\s*upi/i,
  ],
  emi: [
    /\bemi\b/i,
    /equated\s*monthly\s*installment/i,
    /(?:loan|card)\s*emi/i,
    /monthly\s*(?:installment|inst)/i,
  ],
  loan: [
    /\bloan\b/i,
    /(?:personal|home|auto|car|education|business)\s*loan/i,
    /loan\s*(?:sanctioned|approved|disbursed|repayment)/i,
    /(?:od|overdraft)/i,
  ],
  refund: [
    /refund/i,
    /cashback/i,
    /money\s*(?:back|returned)/i,
    /(?:reversal|reversed)/i,
    /(?:credit|credited)\s*(?:back|return)/i,
  ],
  failed: [
    /(?:failed|failure|unsuccessful|declined|rejected)/i,
    /(?:insufficient|inadequate)\s*(?:balance|fund)/i,
    /transaction\s*(?:could not|cannot be)\s*(?:processed|completed)/i,
    /(?:payment|transaction)\s*(?:failed|declined)/i,
  ],
  statement: [
    /(?:monthly|e-?)?statement/i,
    /(?:account|card)\s*(?:summary|statement)/i,
    /(?:mini|detailed)\s*statement/i,
    /(?:transaction|account)\s*summary/i,
  ],
  unknown: [],
};

const categoryOrder: EmailCategory[] = [
  'refund', 'failed', 'upi', 'credit_card', 'debit_card',
  'emi', 'loan', 'statement', 'transaction', 'unknown',
];

export function categorizeEmail(subject: string, body: string): EmailCategory {
  const text = `${subject} ${body}`;

  const scores: Record<EmailCategory, number> = {
    transaction: 0,
    credit_card: 0,
    debit_card: 0,
    upi: 0,
    emi: 0,
    loan: 0,
    refund: 0,
    failed: 0,
    statement: 0,
    unknown: 0,
  };

  for (const [category, patterns] of Object.entries(categoryPatterns)) {
    for (const pattern of patterns) {
      const matches = text.match(pattern);
      if (matches) {
        scores[category as EmailCategory] += matches.length;
      }
    }
  }

  // Penalize certain overlaps: if UPI score high, reduce card scores
  if (scores.upi > 1) {
    scores.credit_card = Math.max(0, scores.credit_card - 1);
    scores.debit_card = Math.max(0, scores.debit_card - 1);
  }

  // Statement patterns with many transaction keywords
  if (scores.statement > 0 && scores.transaction > 2) {
    scores.statement += 2;
  }

  // Refund boosts: if refund keyword present, prefer refund over generic transaction
  if (scores.refund > 0 && scores.transaction > 0) {
    scores.refund += 1;
  }

  const bestCategory = (Object.entries(scores) as [EmailCategory, number][])
    .sort((a, b) => b[1] - a[1] || categoryOrder.indexOf(a[0] as EmailCategory) - categoryOrder.indexOf(b[0] as EmailCategory))[0][0];

  return bestCategory || 'unknown';
}
