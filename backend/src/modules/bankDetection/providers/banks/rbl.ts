import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['rblbank.com'];
const aliases = ['RBL', 'RBL Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'rbl', providerName: 'RBL Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alert@rblbank\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'rbl', providerName: 'RBL Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:rbl bank|rbl)/i.test(text)) return { providerId: 'rbl', providerName: 'RBL Bank', confidence: 70, matchedPattern: 'keyword:rbl', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const rblProvider: BankProvider = { id: 'rbl', name: 'RBL Bank', type: 'bank', domains, aliases, detect, parse };
