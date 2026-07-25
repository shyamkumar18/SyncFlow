import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['googlepay.com', 'google.com'];
const aliases = ['Google Pay', 'GPay', 'Google Tez'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d) && /pay/i.test(email.from)) return { providerId: 'googlepay', providerName: 'Google Pay', confidence: 100, matchedPattern: `domain:${d}`, type: 'upi' }; }
  const fps = [/noreply@googlepay\.com/i, /noreply@google\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'googlepay', providerName: 'Google Pay', confidence: 95, matchedPattern: `from:${p}`, type: 'upi' }; }
  if (/(?:google\s*pay|gpay|google\s*tez)/i.test(text)) return { providerId: 'googlepay', providerName: 'Google Pay', confidence: 70, matchedPattern: 'keyword:gpay', type: 'upi' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  data.upiApp = 'Google Pay';
  const upiMatch = text.match(/(?:upi|vpa|pay)\s*(?:id|ref|no|#|:)?\s*:?\s*([a-zA-Z0-9._-]+@(?:okicici|okhdfcbank|okaxis|paytm|ybl|sbi|upi|ibl|axis|hdfc|icici))/i);
  if (upiMatch && !data.upiId) data.upiId = upiMatch[1].toLowerCase();
  if (!data.merchant) {
    const mm = text.match(/(?:to|paid\s*to|receiver)\s*:?\s*([A-Z][A-Za-z\s.]{2,40})(?:\s|$|\.)/);
    if (mm) data.merchant = mm[1].trim();
  }
  return data;
}

export const googlePayProvider: BankProvider = { id: 'googlepay', name: 'Google Pay', type: 'upi', domains, aliases, detect, parse };
