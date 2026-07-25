import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['unionbankofindia.com', 'unionbank.com'];
const aliases = ['Union Bank', 'Union Bank of India'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'unionbank', providerName: 'Union Bank of India', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@unionbank/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'unionbank', providerName: 'Union Bank of India', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:union bank of india|union bank)/i.test(text)) return { providerId: 'unionbank', providerName: 'Union Bank of India', confidence: 70, matchedPattern: 'keyword:union', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const unionBankProvider: BankProvider = { id: 'unionbank', name: 'Union Bank of India', type: 'bank', domains, aliases, detect, parse };
