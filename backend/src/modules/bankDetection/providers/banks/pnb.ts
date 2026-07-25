import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['pnb.co.in', 'pnb.com'];
const aliases = ['PNB', 'Punjab National Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'pnb', providerName: 'Punjab National Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@pnb/i, /ebanking@pnb/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'pnb', providerName: 'Punjab National Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:punjab national bank|pnb|pnb bank)/i.test(text)) return { providerId: 'pnb', providerName: 'Punjab National Bank', confidence: 70, matchedPattern: 'keyword:pnb', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const pnbProvider: BankProvider = { id: 'pnb', name: 'Punjab National Bank', type: 'bank', domains, aliases, detect, parse };
