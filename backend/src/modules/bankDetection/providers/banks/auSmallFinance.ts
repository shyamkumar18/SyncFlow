import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['aubank.com', 'aubank.in'];
const aliases = ['AU Bank', 'AU Small Finance Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'ausmallfinance', providerName: 'AU Small Finance Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@aubank/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'ausmallfinance', providerName: 'AU Small Finance Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:au small finance bank|au bank)/i.test(text)) return { providerId: 'ausmallfinance', providerName: 'AU Small Finance Bank', confidence: 70, matchedPattern: 'keyword:au', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const auSmallFinanceProvider: BankProvider = { id: 'ausmallfinance', name: 'AU Small Finance Bank', type: 'bank', domains, aliases, detect, parse };
