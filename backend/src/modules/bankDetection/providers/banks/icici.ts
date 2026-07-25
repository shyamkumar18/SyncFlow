import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';
import { extractUPI, extractMerchant, extractSender, extractReceiver } from '../../../../services/parser/extractors';

const domains = ['icicibank.com', 'icici.com', 'icicidirect.com'];
const aliases = ['ICICI', 'ICICI Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'icici', providerName: 'ICICI Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alert@icicibank\.com/i, /creditcard@icicibank\.com/i, /accounts@icicibank\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'icici', providerName: 'ICICI Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:icici|icici bank)/i.test(text)) return { providerId: 'icici', providerName: 'ICICI Bank', confidence: 70, matchedPattern: 'keyword:icici', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  if (!data.upiId) data.upiId = extractUPI(text);
  if (!data.merchant) data.merchant = extractMerchant(text);
  if (!data.sender) data.sender = extractSender(text);
  if (!data.receiver) data.receiver = extractReceiver(text);
  const ct = text.match(/credit\s*(?:card)?|debit\s*(?:card)?/i);
  if (ct) data.cardType = /credit/i.test(ct[0]) ? 'credit' : 'debit';
  return data;
}

export const iciciProvider: BankProvider = { id: 'icici', name: 'ICICI Bank', type: 'bank', domains, aliases, detect, parse };
