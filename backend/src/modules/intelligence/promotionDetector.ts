export interface PromotionResult {
  isPromotion: boolean;
  confidence: number;
  reason: string | null;
  matchedPatterns: string[];
}

interface PatternDef {
  pattern: RegExp;
  label: string;
  weight: number;
  scope: 'subject' | 'body' | 'any';
}

const PROMO_PATTERNS: PatternDef[] = [
  { pattern: /\b(?:cashback|cash\s*back)\b/i, label: 'cashback', weight: 50, scope: 'any' },
  { pattern: /\breward\s+points?\b/i, label: 'reward_points', weight: 45, scope: 'any' },
  { pattern: /\b(?:eligible|pre[- ]?approved)\s+(?:for|to\s+get|loan|limit)\b/i, label: 'pre_approved_offer', weight: 55, scope: 'any' },
  { pattern: /\bcredit\s+limit\s+(?:increase|enhanced|upgraded)\b/i, label: 'credit_limit_increase', weight: 55, scope: 'any' },
  { pattern: /\b(?:loan|credit)\s+offer\b/i, label: 'loan_offer', weight: 55, scope: 'any' },
  { pattern: /\bpersonal\s+loan\b/i, label: 'personal_loan', weight: 50, scope: 'any' },
  { pattern: /\b(?:pre[- ]?approved|instantly)\s+(?:loan|credit|cash)\b/i, label: 'instant_loan', weight: 60, scope: 'any' },
  { pattern: /\bget\s+(?:up\s+to\s+)?(?:rs\.?\s*|inr\s*|₹\s*)\s*\d[\d,]*\b/i, label: 'get_amount', weight: 45, scope: 'any' },
  { pattern: /\bearn\s+(?:up\s+to\s+)?(?:rs\.?\s*|inr\s*|₹\s*)?\s*\d[\d,]*\b/i, label: 'earn_amount', weight: 45, scope: 'any' },
  { pattern: /\bsave\s+(?:up\s+to\s+)?(?:rs\.?\s*|inr\s*|₹\s*)?\s*\d[\d,]*\b/i, label: 'save_amount', weight: 40, scope: 'any' },
  { pattern: /\bexclusive\s+offer\b/i, label: 'exclusive_offer', weight: 50, scope: 'any' },
  { pattern: /\blimited\s+(?:period|time|edition)\b/i, label: 'limited_time', weight: 40, scope: 'any' },
  { pattern: /\b(?:offer|offers|promotion|promotional)\b/i, label: 'promo_keyword', weight: 30, scope: 'any' },
  { pattern: /\bdiscount\s+(?:of\s+)?\d/i, label: 'discount', weight: 35, scope: 'any' },
  { pattern: /\b(?:insurance|life\s+insurance)\s+(?:plan|policy|cover|protection)\b/i, label: 'insurance', weight: 50, scope: 'any' },
  { pattern: /\b(?:mutual\s+fund|investment\s+(?:plan|opportunity))\b/i, label: 'investment', weight: 45, scope: 'any' },
  { pattern: /\b(?:fd|fixed\s+deposit)\s+(?:offer|rates?|scheme)\b/i, label: 'fd_offer', weight: 45, scope: 'any' },
  { pattern: /\b(?:credit\s+card\s+)?(?:emi\s+offers?|no[- ]?cost\s+emi|0%\s+emi)\b/i, label: 'emi_offer', weight: 40, scope: 'any' },
  { pattern: /\b(?:select|choose)\s+your\s+(?:card|credit\s+card)\b/i, label: 'card_ad', weight: 40, scope: 'any' },
  { pattern: /\b(?:apply\s+now|book\s+now|buy\s+now|click\s+here)\b/i, label: 'cta', weight: 25, scope: 'any' },
  { pattern: /\b(?:newsletter|unsubscribe|marketing\s+email)\b/i, label: 'marketing', weight: 40, scope: 'any' },
  { pattern: /\b(?:lucky\s+draw|contest|win\s+(?:a\s+)?(?:rs|prize))\b/i, label: 'contest', weight: 50, scope: 'any' },
  { pattern: /\b(?:upgrade|upgraded?)\s+(?:to|your)\s+(?:account|card|plan)\b/i, label: 'upgrade', weight: 35, scope: 'any' },
  { pattern: /\b(?:refer\s+(?:a\s+)?friend|referral\s+(?:bonus|reward))\b/i, label: 'referral', weight: 45, scope: 'subject' },
  { pattern: /\b(?:welcome\s+(?:offer|gift|bonus))\b/i, label: 'welcome_offer', weight: 40, scope: 'any' },
  { pattern: /\b(?:otp|one[- ]?time[- ]?password)\b/i, label: 'otp', weight: 55, scope: 'subject' },
  { pattern: /\b(?:kyc|know\s+your\s+customer)\b/i, label: 'kyc', weight: 40, scope: 'subject' },
  { pattern: /\b(?:transaction\s+failed|payment\s+failed)\b/i, label: 'failed_notification', weight: 50, scope: 'any' },
];

const ANNOUNCEMENT_PATTERNS: RegExp[] = [
  /(?:statement|account\s+statement|monthly\s+statement|e[- ]?statement)\s+(?:for|available|ready)/i,
  /(?:minimum\s+amount\s+due|total\s+amount\s+due|payment\s+due\s+date)/i,
  /(?:bill\s*(?:reminder|due|payment\s+due|pay\s+before))/i,
  /(?:interest\s+rate|service\s+charge\s+revision|fee\s+revision)/i,
];

const CONFIRMATION_KEYWORDS: RegExp[] = [
  /\b(?:debited|credited|withdrawn|deposited)\b/i,
  /\b(?:upi|neft|rtgs|imps)\s+(?:successful|completed|credited|debited)\b/i,
  /\b(?:transaction|txn)\s+(?:successful|completed|done|failed)\b/i,
  /\b(?:salary|refund|interest)\s+(?:credited|deposited|paid)\b/i,
  /\b(?:atm|pos|card)\s+(?:withdrawal|purchase|transaction)\b/i,
  /\b(?:paid\s+(?:via|by|through|using)|payment\s+(?:of|to))\b/i,
];

export function detectPromotion(email: {
  subject: string;
  bodyText?: string | null;
  body?: string | null;
  from?: string;
}): PromotionResult {
  const subject = email.subject || '';
  const bodyText = email.bodyText || '';
  const body = email.body || '';
  const text = `${subject} ${bodyText} ${body}`;

  const matchedPatterns: string[] = [];
  let promoScore = 0;
  let maxPossible = 0;

  for (const def of PROMO_PATTERNS) {
    const target = def.scope === 'subject' ? subject : def.scope === 'body' ? `${bodyText} ${body}` : text;
    const matches = target.match(def.pattern);
    if (matches) {
      promoScore += def.weight * matches.length;
      maxPossible += def.weight;
      matchedPatterns.push(def.label);
    }
  }

  const hasConfirmation = CONFIRMATION_KEYWORDS.some((re) => re.test(text));
  let penalty = 0;
  if (hasConfirmation) penalty += 30;

  const isAnnouncement = ANNOUNCEMENT_PATTERNS.some((re) => re.test(text));

  maxPossible = Math.max(maxPossible, 1);
  const rawConfidence = Math.min(100, Math.round((promoScore / maxPossible) * 100));
  const adjustedConfidence = Math.max(0, Math.min(100, rawConfidence - penalty));

  const hasAmount = /\b(?:rs\.?\s*|inr\s*|₹\s*)\s*\d[\d,]*/.test(text);
  const hasTransactionVerb = /\b(?:debited|credited|paid\s+|purchased|refund)\b/i.test(text);
  const score = hasConfirmation && hasAmount && hasTransactionVerb ? adjustedConfidence * 0.6 : adjustedConfidence;

  const isPromotion = score >= 40;
  let reason: string | null = null;
  if (isPromotion) {
    reason = matchedPatterns.length > 0 ? `Matched patterns: ${matchedPatterns.slice(0, 3).join(', ')}` : 'Promotional content detected';
  }

  return {
    isPromotion,
    confidence: Math.min(100, Math.round(score)),
    reason,
    matchedPatterns: [...new Set(matchedPatterns)],
  };
}
