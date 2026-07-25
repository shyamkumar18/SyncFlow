import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['kotak.com', 'kotakmahindra.com'];
const aliases = ['Kotak', 'Kotak Mahindra', 'Kotak Mahindra Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'kotak', providerName: 'Kotak Mahindra Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alert@kotak\.com/i, /creditcard@kotak\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'kotak', providerName: 'Kotak Mahindra Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:kotak|kotak mahindra)/i.test(text)) return { providerId: 'kotak', providerName: 'Kotak Mahindra Bank', confidence: 70, matchedPattern: 'keyword:kotak', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const kotakProvider: BankProvider = { id: 'kotak', name: 'Kotak Mahindra Bank', type: 'bank', domains, aliases, detect, parse };
