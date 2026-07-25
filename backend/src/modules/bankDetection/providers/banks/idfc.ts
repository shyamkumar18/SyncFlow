import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['idfcfirstbank.com', 'idfc.com'];
const aliases = ['IDFC', 'IDFC FIRST', 'IDFC FIRST Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'idfc', providerName: 'IDFC FIRST Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@idfc/i, /creditcard@idfcfirstbank\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'idfc', providerName: 'IDFC FIRST Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:idfc first|idfc|idfc bank)/i.test(text)) return { providerId: 'idfc', providerName: 'IDFC FIRST Bank', confidence: 70, matchedPattern: 'keyword:idfc', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const idfcProvider: BankProvider = { id: 'idfc', name: 'IDFC FIRST Bank', type: 'bank', domains, aliases, detect, parse };
