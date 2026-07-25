import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['paytm.com'];
const aliases = ['Paytm'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'paytm', providerName: 'Paytm', confidence: 100, matchedPattern: `domain:${d}`, type: 'upi' }; }
  const fps = [/noreply@paytm\.com/i, /alerts@paytm\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'paytm', providerName: 'Paytm', confidence: 95, matchedPattern: `from:${p}`, type: 'upi' }; }
  if (/\bpaytm\b/i.test(text)) return { providerId: 'paytm', providerName: 'Paytm', confidence: 70, matchedPattern: 'keyword:paytm', type: 'upi' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  data.upiApp = 'Paytm';
  const upiMatch = text.match(/([a-zA-Z0-9._-]+@(?:paytm|ybl|sbi|icici|hdfc))/i);
  if (upiMatch && !data.upiId) data.upiId = upiMatch[1].toLowerCase();
  if (!data.merchant) {
    const mm = text.match(/(?:to|paid\s*to|receiver)\s*:?\s*([A-Z][A-Za-z\s.]{2,40})(?:\s|$|\.)/);
    if (mm) data.merchant = mm[1].trim();
  }
  return data;
}

export const paytmProvider: BankProvider = { id: 'paytm', name: 'Paytm', type: 'upi', domains, aliases, detect, parse };
