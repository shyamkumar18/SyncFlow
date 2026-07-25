import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['phonepe.com'];
const aliases = ['PhonePe'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'phonepe', providerName: 'PhonePe', confidence: 100, matchedPattern: `domain:${d}`, type: 'upi' }; }
  const fps = [/noreply@phonepe\.com/i, /alerts@phonepe\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'phonepe', providerName: 'PhonePe', confidence: 95, matchedPattern: `from:${p}`, type: 'upi' }; }
  if (/\bphonepe\b/i.test(text)) return { providerId: 'phonepe', providerName: 'PhonePe', confidence: 70, matchedPattern: 'keyword:phonepe', type: 'upi' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  data.upiApp = 'PhonePe';
  const upiMatch = text.match(/([a-zA-Z0-9._-]+@(?:ybl|paytm|sbi|icici|hdfc|okicici|okhdfcbank))/i);
  if (upiMatch && !data.upiId) data.upiId = upiMatch[1].toLowerCase();
  if (!data.merchant) {
    const mm = text.match(/(?:to|paid\s*to|receiver|sent\s*to)\s*:?\s*([A-Z][A-Za-z\s.]{2,40})(?:\s|$|\.)/);
    if (mm) data.merchant = mm[1].trim();
  }
  return data;
}

export const phonePeProvider: BankProvider = { id: 'phonepe', name: 'PhonePe', type: 'upi', domains, aliases, detect, parse };
