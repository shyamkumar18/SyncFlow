import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['jupiter.money', 'jupiterhq.com'];
const aliases = ['Jupiter', 'Jupiter Money'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'jupiter', providerName: 'Jupiter', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@jupiter\.money/i, /support@jupiter\.money/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'jupiter', providerName: 'Jupiter', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:jupiter money|jupiter)/i.test(text)) return { providerId: 'jupiter', providerName: 'Jupiter', confidence: 70, matchedPattern: 'keyword:jupiter', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const jupiterProvider: BankProvider = { id: 'jupiter', name: 'Jupiter', type: 'bank', domains, aliases, detect, parse };
