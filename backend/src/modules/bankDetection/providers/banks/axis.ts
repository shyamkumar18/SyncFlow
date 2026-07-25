import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';
import { extractUPI, extractSender, extractReceiver } from '../../../../services/parser/extractors';

const domains = ['axisbank.com'];
const aliases = ['Axis', 'Axis Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'axis', providerName: 'Axis Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alert@axisbank\.com/i, /creditcard@axisbank\.com/i, /debitcard@axisbank\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'axis', providerName: 'Axis Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:axis|axis bank)/i.test(text)) return { providerId: 'axis', providerName: 'Axis Bank', confidence: 70, matchedPattern: 'keyword:axis', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  if (!data.upiId) data.upiId = extractUPI(text);
  if (!data.sender) data.sender = extractSender(text);
  if (!data.receiver) data.receiver = extractReceiver(text);
  const mm = text.match(/(?:at|to)\s+([A-Z][A-Za-z0-9\s.&'-]{2,40})(?:\s+ref|\s+on|\s*$)/);
  if (mm && !data.merchant) data.merchant = mm[1].trim();
  return data;
}

export const axisProvider: BankProvider = { id: 'axis', name: 'Axis Bank', type: 'bank', domains, aliases, detect, parse };
