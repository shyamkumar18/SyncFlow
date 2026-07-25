import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['fi.money'];
const aliases = ['Fi', 'Fi Money'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'fi', providerName: 'Fi', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@fi\.money/i, /support@fi\.money/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'fi', providerName: 'Fi', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:fi money|fi\.money)/i.test(text)) return { providerId: 'fi', providerName: 'Fi', confidence: 70, matchedPattern: 'keyword:fi', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const fiProvider: BankProvider = { id: 'fi', name: 'Fi', type: 'bank', domains, aliases, detect, parse };
