import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['federalbank.co.in', 'federalbank.com'];
const aliases = ['Federal', 'Federal Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'federal', providerName: 'Federal Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@federalbank/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'federal', providerName: 'Federal Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:federal bank|federal)/i.test(text)) return { providerId: 'federal', providerName: 'Federal Bank', confidence: 70, matchedPattern: 'keyword:federal', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const federalProvider: BankProvider = { id: 'federal', name: 'Federal Bank', type: 'bank', domains, aliases, detect, parse };
