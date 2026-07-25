import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['indusind.com', 'indusindbank.com'];
const aliases = ['IndusInd', 'IndusInd Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'indusind', providerName: 'IndusInd Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alert@indusind\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'indusind', providerName: 'IndusInd Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:indusind|indusind bank)/i.test(text)) return { providerId: 'indusind', providerName: 'IndusInd Bank', confidence: 70, matchedPattern: 'keyword:indusind', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const indusIndProvider: BankProvider = { id: 'indusind', name: 'IndusInd Bank', type: 'bank', domains, aliases, detect, parse };
