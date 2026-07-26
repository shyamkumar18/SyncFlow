import { Transaction } from '../../models/Transaction';
import { computeFingerprint } from './duplicateDetection';

export interface DedupCandidate {
  amount: number;
  type: 'debit' | 'credit';
  date: Date;
  time?: string | null;
  merchant?: string | null;
  referenceNumber?: string | null;
  upiId?: string | null;
  bank?: string | null;
  description?: string | null;
  sender?: string | null;
  receiver?: string | null;
  cardNumber?: string | null;
  emailThreadId?: string | null;
}

export interface MatchScore {
  score: number;
  maxPossible: number;
  confidence: number;
  matchedTransaction: any;
  reasons: string[];
}

const MERGE_THRESHOLD = 70;
const AMOUNT_TOLERANCE = 0.01;
const DATE_WINDOW_MS = 3 * 24 * 60 * 60 * 1000;

function normalizeMerchant(m: string | null | undefined): string {
  return (m || '').toLowerCase().replace(/[^a-z0-9]/g, '').trim();
}

function isRefSimilar(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return false;
  const na = a.toLowerCase().replace(/[^a-z0-9]/g, '');
  const nb = b.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (na.length < 4 || nb.length < 4) return false;
  return na === nb || na.includes(nb) || nb.includes(na);
}

function sameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear()
    && a.getMonth() === b.getMonth()
    && a.getDate() === b.getDate();
}

function hoursDiff(a: Date, b: Date): number {
  return Math.abs(a.getTime() - b.getTime()) / (1000 * 60 * 60);
}

function fuzzyMerchantScore(a: string | null | undefined, b: string | null | undefined): number {
  const na = normalizeMerchant(a);
  const nb = normalizeMerchant(b);
  if (!na || !nb) return 0;
  if (na === nb) return 15;
  if (na.includes(nb) || nb.includes(na)) return 12;
  const minLen = Math.min(na.length, nb.length);
  const dist = levenshtein(na, nb);
  if (minLen > 0 && dist / minLen < 0.25) return 10;
  return 0;
}

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      dp[i][j] = a[i - 1] === b[j - 1]
        ? dp[i - 1][j - 1]
        : 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
    }
  }
  return dp[m][n];
}

function computeScore(candidate: DedupCandidate, existing: any): MatchScore {
  const reasons: string[] = [];
  let score = 0;
  const maxPossible = 100;

  const amtDiff = Math.abs(candidate.amount - existing.amount);
  if (amtDiff === 0) { score += 30; reasons.push('amount_exact'); }
  else if (amtDiff <= AMOUNT_TOLERANCE) { score += 25; reasons.push('amount_within_tolerance'); }
  else {
    const pct = candidate.amount > 0 ? amtDiff / candidate.amount : 1;
    if (pct <= 0.005) { score += 20; reasons.push('amount_within_0.5pct'); }
    else if (pct <= 0.01) { score += 10; reasons.push('amount_within_1pct'); }
  }

  if (candidate.type === existing.type) { score += 15; reasons.push('type_match'); }

  const d1 = candidate.date instanceof Date ? candidate.date : new Date(candidate.date);
  const d2 = existing.date instanceof Date ? existing.date : new Date(existing.date);
  const hDiff = hoursDiff(d1, d2);
  if (sameDay(d1, d2)) {
    if (hDiff <= 1) { score += 20; reasons.push('date_same_hour'); }
    else if (hDiff <= 6) { score += 15; reasons.push('date_same_6h'); }
    else if (hDiff <= 24) { score += 10; reasons.push('date_same_day'); }
    else { score += 5; reasons.push('date_same_day_wide'); }
  } else if (hDiff <= 48) { score += 5; reasons.push('date_within_2d'); }

  if (isRefSimilar(candidate.referenceNumber, existing.referenceNumber)) {
    score += 25; reasons.push('reference_match');
  }

  if (candidate.upiId && existing.upiId && candidate.upiId.toLowerCase() === existing.upiId.toLowerCase()) {
    score += 20; reasons.push('upi_match');
  }

  const merchScore = fuzzyMerchantScore(candidate.merchant, existing.merchant);
  if (merchScore > 0) {
    score += merchScore;
    reasons.push('merchant_match');
  }

  if (candidate.bank && existing.bank && candidate.bank.toLowerCase() === existing.bank.toLowerCase()) {
    score += 10; reasons.push('bank_match');
  }

  if (candidate.sender && existing.sender && candidate.sender.toLowerCase() === existing.sender.toLowerCase()) {
    score += 5; reasons.push('sender_match');
  }
  if (candidate.receiver && existing.receiver && candidate.receiver.toLowerCase() === existing.receiver.toLowerCase()) {
    score += 5; reasons.push('receiver_match');
  }

  if (candidate.emailThreadId && existing.emailThreadId && candidate.emailThreadId === existing.emailThreadId) {
    score += 15; reasons.push('same_thread');
  }

  if (candidate.description && existing.description) {
    const da = candidate.description.toLowerCase().trim().slice(0, 30);
    const db = existing.description.toLowerCase().trim().slice(0, 30);
    if (da === db) { score += 5; reasons.push('description_match'); }
  }

  const finalScore = Math.min(score, maxPossible);
  return {
    score: finalScore,
    maxPossible,
    confidence: Math.round((finalScore / maxPossible) * 100),
    matchedTransaction: existing,
    reasons: [...new Set(reasons)],
  };
}

export async function findDuplicates(
  userId: string,
  candidate: DedupCandidate,
): Promise<MatchScore | null> {
  const d = candidate.date instanceof Date ? candidate.date : new Date(candidate.date);
  const windowStart = new Date(d.getTime() - DATE_WINDOW_MS);
  const windowEnd = new Date(d.getTime() + DATE_WINDOW_MS);

  const candidates = await Transaction.find({
    userId,
    amount: { $gte: candidate.amount - 1, $lte: candidate.amount + 1 },
    type: candidate.type,
    date: { $gte: windowStart, $lte: windowEnd },
  }).lean();

  if (candidates.length === 0) return null;

  let best: MatchScore | null = null;
  for (const existing of candidates) {
    const result = computeScore(candidate, existing);
    if (!best || result.score > best.score) {
      best = result;
    }
  }

  return best;
}

export async function findAndMergeDuplicate(
  userId: string,
  candidate: DedupCandidate,
  emailId: string,
): Promise<{ isDuplicate: boolean; merged: boolean; existingTransactionId?: string }> {
  const match = await findDuplicates(userId, candidate);
  if (!match || match.score < MERGE_THRESHOLD) {
    return { isDuplicate: false, merged: false };
  }

  const existing = match.matchedTransaction;
  const updates: Record<string, any> = {};

  if (!existing.merchant && candidate.merchant) updates.merchant = candidate.merchant;
  if (!existing.merchantRaw && candidate.merchant) updates.merchantRaw = candidate.merchant;
  if (!existing.referenceNumber && candidate.referenceNumber) updates.referenceNumber = candidate.referenceNumber;
  if (!existing.upiId && candidate.upiId) updates.upiId = candidate.upiId;
  if (!existing.sender && candidate.sender) updates.sender = candidate.sender;
  if (!existing.receiver && candidate.receiver) updates.receiver = candidate.receiver;
  if (!existing.description && candidate.description) updates.description = candidate.description;
  if (!existing.cardNumber && candidate.cardNumber) updates.cardNumber = candidate.cardNumber;
  if (!existing.time && candidate.time) updates.time = candidate.time;

  if (Object.keys(updates).length > 0) {
    updates.duplicateGroupId = existing.duplicateGroupId || existing._id.toString();
    await Transaction.findByIdAndUpdate(existing._id, { $set: updates });
    return { isDuplicate: true, merged: true, existingTransactionId: existing._id.toString() };
  }

  return { isDuplicate: true, merged: false, existingTransactionId: existing._id.toString() };
}

export async function mergeExistingDuplicates(userId?: string): Promise<{ removed: number; merged: number }> {
  const filter: any = {};
  if (userId) filter.userId = userId;

  const transactions = await Transaction.find(filter).sort({ date: 1 }).lean();
  let removed = 0;
  let merged = 0;
  const used = new Set<string>();

  for (let i = 0; i < transactions.length; i++) {
    if (used.has(transactions[i]._id.toString())) continue;
    used.add(transactions[i]._id.toString());

    const t = transactions[i];
    const candidate: DedupCandidate = {
      amount: t.amount,
      type: t.type,
      date: t.date,
      time: t.time,
      merchant: t.merchant,
      referenceNumber: t.referenceNumber,
      upiId: t.upiId,
      bank: t.bank,
      description: t.description,
      sender: t.sender,
      receiver: t.receiver,
      cardNumber: t.cardNumber,
    };

    for (let j = i + 1; j < transactions.length; j++) {
      if (used.has(transactions[j]._id.toString())) continue;
      const other = transactions[j];

      if (Math.abs(t.amount - other.amount) > 1) continue;
      if (t.type !== other.type) continue;
      const hd = hoursDiff(t.date, other.date);
      if (hd > 72) continue;

      const score = computeScore(candidate, other);
      if (score.score >= MERGE_THRESHOLD) {
        used.add(other._id.toString());
        const updates: Record<string, any> = {};
        if (!t.merchant && other.merchant) updates.merchant = other.merchant;
        if (!t.merchantRaw && other.merchantRaw) updates.merchantRaw = other.merchantRaw;
        if (!t.referenceNumber && other.referenceNumber) updates.referenceNumber = other.referenceNumber;
        if (!t.upiId && other.upiId) updates.upiId = other.upiId;
        if (!t.sender && other.sender) updates.sender = other.sender;
        if (!t.receiver && other.receiver) updates.receiver = other.receiver;
        if (!t.description && other.description) updates.description = other.description;

        updates.duplicateGroupId = t._id.toString();
        if (Object.keys(updates).length > 0) {
          await Transaction.findByIdAndUpdate(t._id, { $set: updates });
          merged++;
        }
        await Transaction.findByIdAndDelete(other._id);
        removed++;
      }
    }
  }

  return { removed, merged };
}
