import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['sc.com', 'standardchartered.com'];
const aliases = ['Standard Chartered', 'Standard Chartered Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'standardchartered', providerName: 'Standard Chartered', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@sc\.com/i, /creditcard@standardchartered\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'standardchartered', providerName: 'Standard Chartered', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:standard chartered|standardchartered)/i.test(text)) return { providerId: 'standardchartered', providerName: 'Standard Chartered', confidence: 70, matchedPattern: 'keyword:sc', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const standardCharteredProvider: BankProvider = { id: 'standardchartered', name: 'Standard Chartered', type: 'bank', domains, aliases, detect, parse };
