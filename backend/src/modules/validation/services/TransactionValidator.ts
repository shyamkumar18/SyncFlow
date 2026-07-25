import type { ParsedTransaction } from '../../bankDetection/types';
import type { ValidationResult, ValidationSignal, ValidationPenalties } from '../types';

const THRESHOLD = 30;

export function validateTransaction(
  extracted: ParsedTransaction,
  subject: string,
  body: string,
): ValidationResult {
  const text = `${subject} ${body}`.toLowerCase();

  const signals = computeSignals(text, extracted);
  const penalties = computePenalties(text);
  const breakdown: string[] = [];

  const signalTotal = Object.values(signals).reduce((a, b) => a + b, 0);
  const penaltyTotal = Object.values(penalties).reduce((a, b) => a + b, 0);
  const confidence = signalTotal + penaltyTotal;

  if (extracted.amount !== null) breakdown.push('amount:+5');
  if (extracted.type !== null) breakdown.push('type:+5');
  if (signals.keyword > 0) breakdown.push(`keyword:+${signals.keyword}`);
  if (signals.account > 0) breakdown.push(`account:+${signals.account}`);
  if (signals.balance > 0) breakdown.push(`balance:+${signals.balance}`);
  if (signals.reference > 0) breakdown.push(`reference:+${signals.reference}`);
  if (signals.merchant > 0) breakdown.push(`merchant:+${signals.merchant}`);
  if (signals.paymentMethod > 0) breakdown.push(`payment_method:+${signals.paymentMethod}`);
  if (signals.valueDate > 0) breakdown.push(`value_date:+${signals.valueDate}`);
  if (penalties.marketing < 0) breakdown.push(`marketing_penalty:${penalties.marketing}`);
  if (penalties.notification < 0) breakdown.push(`notification_penalty:${penalties.notification}`);
  if (penalties.billReminder < 0) breakdown.push(`bill_reminder_penalty:${penalties.billReminder}`);
  if (penalties.generic < 0) breakdown.push(`generic_penalty:${penalties.generic}`);
  breakdown.push(`total:${confidence}/${THRESHOLD}`);

  return {
    valid: confidence >= THRESHOLD,
    confidence,
    threshold: THRESHOLD,
    signals,
    penalties,
    breakdown,
  };
}

function computeSignals(text: string, extracted: ParsedTransaction): ValidationSignal {
  let keyword = 0;
  let account = 0;
  let balance = 0;
  let reference = 0;
  let merchant = 0;
  let paymentMethod = 0;
  let valueDate = 0;

  if (extracted.amount !== null) valueDate += 5;
  if (extracted.type !== null) valueDate += 5;

  const kwMatches: { re: RegExp; pts: number }[] = [
    { re: /\b(?:debited|debit)\b/i, pts: 15 },
    { re: /\b(?:credited|credit)\b/i, pts: 15 },
    { re: /\b(?:withdrawn|withdrawal)\b/i, pts: 12 },
    { re: /\b(?:deposited|deposit)\b/i, pts: 12 },
    { re: /\b(?:transferred|transfer(?:red)?)\b/i, pts: 8 },
    { re: /\b(?:paid|purchase|payment)\b/i, pts: 5 },
    { re: /\b(?:refund(?:ed)?|reversal|reversed)\b/i, pts: 10 },
    { re: /\b(?:salary)\b/i, pts: 8 },
    { re: /\b(?:interest\s+credited|interest)\b/i, pts: 8 },
    { re: /\b(?:auto\s+debit|auto-debit)\b/i, pts: 10 },
    { re: /\b(?:standing\s+instruction|standing)\b/i, pts: 10 },
    { re: /\bemi\b/i, pts: 8 },
    { re: /\b(?:bank\s+charges|service\s+charges)\b/i, pts: 8 },
    { re: /\b(?:fastag|fast\s+tag)\b/i, pts: 8 },
  ];

  for (const { re, pts } of kwMatches) {
    if (re.test(text)) keyword += pts;
  }

  const accountPatterns: RegExp[] = [
    /(?:a\/c|account|acct)\s*(?:no|number|#)?\s*:?\s*(?:\*{2,})?\d{4,}/i,
    /account\s*(?:ending|ending with|ending in)?\s*(?:\*{2,})?\d{4,}/i,
    /(?:ending|ending with)\s+(?:\*{2,})?\d{4}/i,
  ];
  for (const p of accountPatterns) {
    if (p.test(text)) { account = 15; break; }
  }

  if (account === 0) {
    const cardPatterns: RegExp[] = [
      /card\s*(?:no|number|#)?\s*:?\s*(?:\*{2,})?\d{4,}/i,
      /card\s*(?:ending|ending with)\s*(?:\*{2,})?\d{4,}/i,
    ];
    for (const p of cardPatterns) {
      if (p.test(text)) { account = 10; break; }
    }
  }

  const balancePatterns: RegExp[] = [
    /(?:available|avl|current)\s*balance/i,
    /balance\s*(?:available|is|:|rs)/i,
  ];
  for (const p of balancePatterns) {
    if (p.test(text)) { balance = 10; break; }
  }

  const refPatterns: RegExp[] = [
    /\b(?:utr|rrn)\b/i,
    /(?:txn|transaction)\s*(?:id|no|number|#)\s*:?\s*[a-z0-9]{6,}/i,
    /(?:ref|reference)\s*(?:no|number|#)\s*:?\s*[a-z0-9]{6,}/i,
  ];
  for (const p of refPatterns) {
    if (p.test(text)) { reference = 10; break; }
  }

  const merchantPatterns: RegExp[] = [
    /\b(?:at|to)\s+[A-Z][A-Za-z0-9\s.&'-]{2,}/i,
    /\b(?:beneficiary|payee|merchant)\b/i,
  ];
  for (const p of merchantPatterns) {
    if (p.test(text)) { merchant = 10; break; }
  }

  const methodPatterns: RegExp[] = [
    /\b(?:neft|rtgs|imps)\b/i, /\bupi\b/i, /\bpos\b/i, /\batm\b/i,
  ];
  for (const p of methodPatterns) {
    if (p.test(text)) { paymentMethod = 15; break; }
  }

  const datePatterns: RegExp[] = [
    /value\s*date/i, /transaction\s*date/i, /txn\s*date/i,
  ];
  for (const p of datePatterns) {
    if (p.test(text)) { valueDate += 5; break; }
  }

  return { keyword, account, balance, reference, merchant, paymentMethod, valueDate };
}

function computePenalties(text: string): ValidationPenalties {
  let marketing = 0;
  let notification = 0;
  let billReminder = 0;
  let generic = 0;

  const marketingPatterns: { re: RegExp; pts: number }[] = [
    { re: /\bcashback\b/i, pts: -60 },
    { re: /reward\s+points?\b/i, pts: -60 },
    { re: /\breward\b(?!\s*points)/i, pts: -50 },
    { re: /\b(?:offer|offers|promotion|promotional|discount)\b/i, pts: -50 },
    { re: /exclusive\s+offer/i, pts: -50 },
    { re: /limited\s+period/i, pts: -40 },
    { re: /get\s+(?:flat|up\s+to|an?\s+extra)\b/i, pts: -40 },
    { re: /earn\s+(?:up\s+to\s+)?\d/i, pts: -40 },
    { re: /\bsave\s+(?:up\s+to\s+)?\d/i, pts: -40 },
    { re: /increase.*(?:credit\s+limit|limit)/i, pts: -50 },
    { re: /credit\s+limit.*increase/i, pts: -50 },
    { re: /\bloan\s+offer\b/i, pts: -50 },
    { re: /personal\s+loan/i, pts: -50 },
    { re: /\bfd\s+offer\b/i, pts: -50 },
    { re: /fixed\s+deposit/i, pts: -40 },
    { re: /\binsurance\s+(?:plan|policy|offer)\b/i, pts: -50 },
    { re: /insurance\s+advertisement/i, pts: -50 },
    { re: /\binvestment\s+(?:plan|opportunity|offer)\b/i, pts: -50 },
    { re: /mutual\s+fund/i, pts: -40 },
    { re: /advertisement/i, pts: -40 },
  ];
  for (const { re, pts } of marketingPatterns) {
    if (re.test(text)) marketing += pts;
  }

  const notificationPatterns: { re: RegExp; pts: number }[] = [
    { re: /\botp\b/i, pts: -60 },
    { re: /\bpassword\b/i, pts: -50 },
    { re: /login\s*(?:alert|attempt|notification)/i, pts: -50 },
    { re: /\bkyc\b/i, pts: -40 },
    { re: /know\s+your\s+customer/i, pts: -40 },
    { re: /\bwelcome\b/i, pts: -30 },
    { re: /profile\s*(?:update|updated|verification)/i, pts: -30 },
    { re: /service\s*(?:announcement|update|notification)/i, pts: -30 },
    { re: /maintenance\s*(?:downtime|notification|update)/i, pts: -30 },
    { re: /upi\s*(?:registration|activation|enabled)/i, pts: -30 },
  ];
  for (const { re, pts } of notificationPatterns) {
    if (re.test(text)) notification += pts;
  }

  const hasPaymentCompleted = /\b(?:debited|credited|paid|payment\s+completed)\b/i.test(text);
  const billPatterns: { re: RegExp; pts: number }[] = [
    { re: /bill\s*(?:reminder|due|payment\s+due|pay\s+before)/i, pts: -40 },
    { re: /due\s+date/i, pts: -30 },
    { re: /outstanding\s*(?:amount|balance|payment)/i, pts: -30 },
    { re: /pay\s+(?:by|before|your)\s/i, pts: -30 },
  ];
  for (const { re, pts } of billPatterns) {
    if (re.test(text)) billReminder += hasPaymentCompleted ? 0 : pts;
  }

  const hasAmount = extractedAmountFromText(text) !== null;
  const hasTransactionWord = /\b(?:debited|credited|withdrawn|deposited|transferred|paid|purchased|refund)\b/i.test(text);
  const hasAccount = /(?:a\/c|account|card\s*\*)/i.test(text);

  if (hasAmount && !hasTransactionWord && !hasAccount) {
    generic = -30;
  }

  return { marketing, notification, billReminder, generic };
}

function extractedAmountFromText(text: string): number | null {
  const patterns = [
    /(?:rs\.?\s*|inr\s*|₹\s*|:\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /(?:rs|inr|₹)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
  ];
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return parseFloat(match[1].replace(/,/g, ''));
  }
  return null;
}
