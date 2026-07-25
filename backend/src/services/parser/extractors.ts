export interface ExtractedData {
  amount: number | null;
  type: 'debit' | 'credit' | null;
  date: Date | null;
  time: string | null;
  merchant: string | null;
  sender: string | null;
  receiver: string | null;
  balance: number | null;
  upiId: string | null;
  referenceNumber: string | null;
  cardType: 'credit' | 'debit' | 'unknown' | null;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  description: string | null;
}

export function extractAmount(text: string): number | null {
  const patterns = [
    /(?:Rs\.?\s*|INR\s*|₹\s*|:\s*)(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /(?:amount|amt|value)\s*(?:rs\.?\s*|inr\s*|:?\s*|₹\s*)?(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
    /(?:rs|inr|₹)\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  return null;
}

export function extractTransactionType(text: string): 'debit' | 'credit' | null {
  const debitPatterns = [
    /\b(debited|debit|withdrawn|withdrawal|spent|paid|purchased)\b/i,
    /(?:amount|amt).{0,20}(?:debited|debit)/i,
    /\bdr\b/i,
  ];
  const creditPatterns = [
    /\b(credited|credit|deposited|deposit|received|refund|added)\b/i,
    /(?:amount|amt).{0,20}(?:credited|credit|deposit)/i,
    /\bcr\b/i,
  ];

  const textLower = text.toLowerCase();
  const debitScore = debitPatterns.reduce((s, p) => s + (p.test(textLower) ? 1 : 0), 0);
  const creditScore = creditPatterns.reduce((s, p) => s + (p.test(textLower) ? 1 : 0), 0);

  if (debitScore > creditScore) return 'debit';
  if (creditScore > debitScore) return 'credit';
  return null;
}

export function extractDate(text: string): Date | null {
  const patterns = [
    { regex: /(\d{1,2})\/(\d{1,2})\/(\d{4})/, groups: [1, 2, 3] },
    { regex: /(\d{4})-(\d{1,2})-(\d{1,2})/, groups: [1, 2, 3] },
    { regex: /(\d{1,2})-(\d{1,2})-(\d{4})/, groups: [3, 2, 1] },
    { regex: /(\d{1,2})\s+(jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(\d{4})/i, groups: [1, 'month', 3] },
  ];

  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };

  for (const { regex, groups } of patterns) {
    const match = text.match(regex);
    if (match) {
      const d = match[groups[1] as number];
      const month = groups[1] === 'month' ? months[match[2]!.toLowerCase()] : parseInt(match[groups[1] as number]) - 1;
      const day = parseInt(match[groups[0] as number]);
      const year = parseInt(match[groups[2] as number]);

      if (!isNaN(month) && !isNaN(day) && !isNaN(year)) {
        const date = new Date(year, month, day);
        if (!isNaN(date.getTime())) return date;
      }
    }
  }
  return null;
}

export function extractTime(text: string): string | null {
  const patterns = [
    /(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(?:am|pm)?/i,
    /(?:time|at)\s*(\d{1,2}:\d{2}(?::\d{2})?\s*(?:am|pm)?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[0].trim();
  }
  return null;
}

export function extractMerchant(text: string): string | null {
  const patterns = [
    /(?:at|to|merchant|payee|vendor|shop)[:\s]+([A-Za-z][A-Za-z0-9\s.&'-]{2,50})(?:\s|$|\.)/i,
    /(?:purchased?\s+(?:at|from)\s+)([A-Za-z][A-Za-z0-9\s.&'-]{2,50})/i,
    /(?:pos|swipe|txn)\s*(?::|at)\s*([A-Za-z][A-Za-z0-9\s.&'-]{2,50})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

export function extractUPI(text: string): string | null {
  const patterns = [
    /(?:upi|vpa|pay)\s*(?:id|ref|no|#|:)?\s*([a-zA-Z0-9._-]+@[a-zA-Z0-9]+)/i,
    /([a-zA-Z0-9._-]+@(?:paytm|ybl|ibl|sbi|upi|axis|hdfc|icici|okicici|okhdfcbank|okaxis))/i,
    /upi\s*(?:ref|transaction|trxn)?\s*:?\s*(\d{12,})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].toLowerCase();
  }
  return null;
}

export function extractReferenceNumber(text: string): string | null {
  const patterns = [
    /(?:ref|reference|txn|transaction|utr|rrn)\s*(?:no|number|id|#|:)?\s*:?\s*([A-Za-z0-9]{8,30})/i,
    /(?:utr|rrn)\s*(?::|#)?\s*(\d{10,})/i,
    /\b(?:TXN|REF|UTR|RRN)[:\s]*([A-Za-z0-9]{8,30})\b/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].toUpperCase();
  }
  return null;
}

export function extractBalance(text: string): number | null {
  const patterns = [
    /(?:avl|available|balance|bal)\s*(?:bal|balance)?\s*(?::|rs\.?|inr|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/i,
    /(?:balance|bal)[:\s]*(?:rs\.?|inr|₹)?\s*(\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return parseFloat(match[1].replace(/,/g, ''));
    }
  }
  return null;
}

export function extractCardType(text: string): 'credit' | 'debit' | 'unknown' | null {
  if (/\bcredit\s*card\b/i.test(text)) return 'credit';
  if (/\bdebit\s*card\b/i.test(text)) return 'debit';
  if (/\bcard\s*(?:no|number|#)\s*:?\s*\*?\d{4,}/i.test(text)) {
    if (/\b(?:credit|cc)\b/i.test(text)) return 'credit';
    return 'debit';
  }
  return null;
}

export function extractStatus(text: string): 'success' | 'failed' | 'pending' | 'refunded' {
  if (/\b(failed|declined|rejected|unsuccessful|insufficient)\b/i.test(text)) return 'failed';
  if (/\b(pending|processing|in progress)\b/i.test(text)) return 'pending';
  if (/\b(refund|reversal|cashback|reversed)\b/i.test(text)) return 'refunded';
  return 'success';
}

export function extractSender(text: string): string | null {
  const patterns = [
    /(?:from|sender|sent by)[:\s]+([A-Z][A-Za-z\s.]{2,40})(?:\s|$|\.)/,
    /(?:remitter|from ac|debit)[:\s]+([A-Z][A-Za-z\s.]{2,40})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}

export function extractReceiver(text: string): string | null {
  const patterns = [
    /(?:to|receiver|beneficiary|payee)[:\s]+([A-Z][A-Za-z\s.]{2,40})(?:\s|$|\.)/,
    /(?:credited to|transfer to|paid to)[:\s]+([A-Z][A-Za-z\s.]{2,40})/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) return match[1].trim();
  }
  return null;
}
