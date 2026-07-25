import { bankPatterns, BankPattern } from './bankPatterns';

export interface BankDetectionResult {
  bank: string;
  confidence: number;
  pattern: BankPattern | null;
}

export function detectBank(from: string, subject: string, snippet?: string): BankDetectionResult {
  const text = `${from} ${subject} ${snippet || ''}`;

  for (const pattern of bankPatterns) {
    // Check email sender address
    const fromLower = from.toLowerCase();
    const domainMatch = pattern.domains.some((d) => fromLower.includes(d));
    if (domainMatch) {
      return { bank: pattern.name, confidence: 100, pattern };
    }

    // Check exact email pattern
    const emailMatch = pattern.emailPatterns.some((re) => re.test(from));
    if (emailMatch) {
      return { bank: pattern.name, confidence: 95, pattern };
    }

    // Check keywords in subject/body
    const keywordMatch = pattern.keywords.some((re) => re.test(text));
    if (keywordMatch) {
      return { bank: pattern.name, confidence: 70, pattern };
    }
  }

  return { bank: 'Unknown', confidence: 0, pattern: null };
}

export function getKnownBanks(): string[] {
  return bankPatterns.map((b) => b.name);
}
