import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['yesbank.in', 'yesbank.com'];
const aliases = ['Yes Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'yesbank', providerName: 'Yes Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alert@yesbank\.in/i, /transaction@yesbank\.in/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'yesbank', providerName: 'Yes Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:yes bank|yesbank)/i.test(text)) return { providerId: 'yesbank', providerName: 'Yes Bank', confidence: 70, matchedPattern: 'keyword:yesbank', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const yesBankProvider: BankProvider = { id: 'yesbank', name: 'Yes Bank', type: 'bank', domains, aliases, detect, parse };
