import { getBankDetector } from '../../modules/bankDetection';

export interface BankDetectionResult {
  bank: string;
  confidence: number;
  pattern: string | null;
}

export function detectBank(from: string, subject: string, snippet?: string): BankDetectionResult {
  const result = getBankDetector().detect({ from, subject, body: snippet || '' });
  return {
    bank: result.providerName,
    confidence: result.confidence,
    pattern: result.matchedPattern,
  };
}

export function getKnownBanks(): string[] {
  return getBankDetector().getKnownBanks().map((b) => b.name);
}
