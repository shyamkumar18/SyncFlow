import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['bankofindia.co.in', 'bankofindia.com'];
const aliases = ['Bank of India', 'BOI'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'bankofindia', providerName: 'Bank of India', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alert@bankofindia\.co\.in/i, /alerts@bankofindia/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'bankofindia', providerName: 'Bank of India', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:bank of india|boi\s+alert)/i.test(text)) return { providerId: 'bankofindia', providerName: 'Bank of India', confidence: 70, matchedPattern: 'keyword:boi', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const bankOfIndiaProvider: BankProvider = { id: 'bankofindia', name: 'Bank of India', type: 'bank', domains, aliases, detect, parse };
