import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['bhimupi.org.in', 'bhim.com', 'bhimapp.com'];
const aliases = ['BHIM', 'BHIM UPI'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'bhim', providerName: 'BHIM', confidence: 100, matchedPattern: `domain:${d}`, type: 'upi' }; }
  const fps = [/noreply@bhim/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'bhim', providerName: 'BHIM', confidence: 95, matchedPattern: `from:${p}`, type: 'upi' }; }
  if (/\bbhim\b/i.test(text) || /bharat interface for money/i.test(text)) return { providerId: 'bhim', providerName: 'BHIM', confidence: 70, matchedPattern: 'keyword:bhim', type: 'upi' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  data.upiApp = 'BHIM';
  return data;
}

export const bhimProvider: BankProvider = { id: 'bhim', name: 'BHIM', type: 'upi', domains, aliases, detect, parse };
