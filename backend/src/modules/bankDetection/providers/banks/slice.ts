import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['sliceit.com', 'slicepay.in'];
const aliases = ['Slice', 'Slice Card', 'Slice Pay'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'slice', providerName: 'Slice', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/support@sliceit\.com/i, /alerts@sliceit\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'slice', providerName: 'Slice', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/\bslice\b/i.test(text) && !/\bsliced?\b/i.test(text)) return { providerId: 'slice', providerName: 'Slice', confidence: 70, matchedPattern: 'keyword:slice', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  const merchantMatch = text.match(/at\s+([A-Z][A-Za-z0-9\s.&'-]{2,40})(?:\s+on|\s+dt|\s*$)/);
  if (merchantMatch && !data.merchant) data.merchant = merchantMatch[1].trim();
  return data;
}

export const sliceProvider: BankProvider = { id: 'slice', name: 'Slice', type: 'bank', domains, aliases, detect, parse };
