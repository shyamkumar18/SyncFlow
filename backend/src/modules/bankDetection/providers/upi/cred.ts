import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['cred.club', 'credapp.com'];
const aliases = ['CRED'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'cred', providerName: 'CRED', confidence: 100, matchedPattern: `domain:${d}`, type: 'upi' }; }
  const fps = [/noreply@cred\.club/i, /alerts@cred\.club/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'cred', providerName: 'CRED', confidence: 95, matchedPattern: `from:${p}`, type: 'upi' }; }
  if (/\bcred\b/i.test(text) && !/credit/i.test(text)) return { providerId: 'cred', providerName: 'CRED', confidence: 70, matchedPattern: 'keyword:cred', type: 'upi' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  data.upiApp = 'CRED';
  return data;
}

export const credProvider: BankProvider = { id: 'cred', name: 'CRED', type: 'upi', domains, aliases, detect, parse };
