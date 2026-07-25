import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['bankofbaroda.com', 'bob.com'];
const aliases = ['BOB', 'Bank of Baroda'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'bob', providerName: 'Bank of Baroda', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alert@bankofbaroda\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'bob', providerName: 'Bank of Baroda', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:bank of baroda|baroda|bob)/i.test(text)) return { providerId: 'bob', providerName: 'Bank of Baroda', confidence: 70, matchedPattern: 'keyword:bob', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const bobProvider: BankProvider = { id: 'bob', name: 'Bank of Baroda', type: 'bank', domains, aliases, detect, parse };
