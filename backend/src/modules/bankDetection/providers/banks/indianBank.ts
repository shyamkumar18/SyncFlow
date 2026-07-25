import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['indianbank.co.in', 'indianbank.com'];
const aliases = ['Indian Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'indianbank', providerName: 'Indian Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@indianbank/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'indianbank', providerName: 'Indian Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:indian bank|indianbank)/i.test(text)) return { providerId: 'indianbank', providerName: 'Indian Bank', confidence: 70, matchedPattern: 'keyword:indian', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const indianBankProvider: BankProvider = { id: 'indianbank', name: 'Indian Bank', type: 'bank', domains, aliases, detect, parse };
