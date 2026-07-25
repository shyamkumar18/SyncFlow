import crypto from 'crypto';

export interface FingerprintInput {
  amount: number;
  date: Date | string;
  type: 'debit' | 'credit';
  merchant?: string | null;
  referenceNumber?: string | null;
  description?: string | null;
  bank?: string | null;
}

export function computeFingerprint(input: FingerprintInput): string {
  const dateStr = typeof input.date === 'string' ? input.date.split('T')[0] : input.date.toISOString().split('T')[0];
  const raw = [
    input.amount.toFixed(2),
    dateStr,
    input.type,
    (input.referenceNumber || '').toLowerCase().trim(),
    (input.merchant || '').toLowerCase().trim(),
    (input.description || '').toLowerCase().trim().slice(0, 50),
    (input.bank || '').toLowerCase().trim(),
  ].join('|');
  return crypto.createHash('sha256').update(raw).digest('hex');
}
