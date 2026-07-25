import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['iob.in', 'iob.co.in'];
const aliases = ['IOB', 'Indian Overseas Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'iob', providerName: 'Indian Overseas Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@iob/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'iob', providerName: 'Indian Overseas Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:indian overseas bank|iob)/i.test(text)) return { providerId: 'iob', providerName: 'Indian Overseas Bank', confidence: 70, matchedPattern: 'keyword:iob', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const iobProvider: BankProvider = { id: 'iob', name: 'Indian Overseas Bank', type: 'bank', domains, aliases, detect, parse };
