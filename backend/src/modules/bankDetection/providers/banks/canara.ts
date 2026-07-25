import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['canarabank.com', 'canarabank.in'];
const aliases = ['Canara', 'Canara Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'canara', providerName: 'Canara Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@canara/i, /ebanking@canara/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'canara', providerName: 'Canara Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:canara bank|canara)/i.test(text)) return { providerId: 'canara', providerName: 'Canara Bank', confidence: 70, matchedPattern: 'keyword:canara', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const canaraProvider: BankProvider = { id: 'canara', name: 'Canara Bank', type: 'bank', domains, aliases, detect, parse };
