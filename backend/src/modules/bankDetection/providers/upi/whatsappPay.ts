import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['whatsapp.com', 'pay.whatsapp.com'];
const aliases = ['WhatsApp Pay'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d) && /pay/i.test(email.from)) return { providerId: 'whatsapppay', providerName: 'WhatsApp Pay', confidence: 100, matchedPattern: `domain:${d}`, type: 'upi' }; }
  const fps = [/noreply@whatsapp\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'whatsapppay', providerName: 'WhatsApp Pay', confidence: 95, matchedPattern: `from:${p}`, type: 'upi' }; }
  if (/(?:whatsapp\s*pay|whatsapp payment)/i.test(text)) return { providerId: 'whatsapppay', providerName: 'WhatsApp Pay', confidence: 70, matchedPattern: 'keyword:whatsapp', type: 'upi' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  data.upiApp = 'WhatsApp Pay';
  return data;
}

export const whatsappPayProvider: BankProvider = { id: 'whatsapppay', name: 'WhatsApp Pay', type: 'upi', domains, aliases, detect, parse };
