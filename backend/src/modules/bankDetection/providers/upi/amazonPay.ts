import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['amazonpay.com', 'amazon.com', 'amazon.in'];
const aliases = ['Amazon Pay'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d) && /pay/i.test(email.from)) return { providerId: 'amazonpay', providerName: 'Amazon Pay', confidence: 100, matchedPattern: `domain:${d}`, type: 'upi' }; }
  const fps = [/noreply@amazonpay\.com/i, /payments-noreply@amazon/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'amazonpay', providerName: 'Amazon Pay', confidence: 95, matchedPattern: `from:${p}`, type: 'upi' }; }
  if (/(?:amazon\s*pay|amazonpay)/i.test(text)) return { providerId: 'amazonpay', providerName: 'Amazon Pay', confidence: 70, matchedPattern: 'keyword:amazonpay', type: 'upi' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  data.upiApp = 'Amazon Pay';
  if (!data.merchant) {
    const mm = text.match(/(?:to|paid\s*to)\s*:?\s*([A-Z][A-Za-z\s.]{2,40})(?:\s|$|\.)/);
    if (mm) data.merchant = mm[1].trim();
  }
  return data;
}

export const amazonPayProvider: BankProvider = { id: 'amazonpay', name: 'Amazon Pay', type: 'upi', domains, aliases, detect, parse };
