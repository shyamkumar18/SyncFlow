import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';
import { extractAmount, extractDate, extractTime, extractBalance, extractReferenceNumber, extractStatus } from '../../../../services/parser/extractors';

const domains = ['hdfcbank.com', 'hdfc.com', 'hdfcbank.net'];
const aliases = ['HDFC', 'HDFC Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'hdfc', providerName: 'HDFC Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alert@(?:alerts?\.)?hdfcbank\.com/i, /credit\.card@hdfcbank\.com/i, /debit\.card@hdfcbank\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'hdfc', providerName: 'HDFC Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:hdfc|hdfc bank)/i.test(text)) return { providerId: 'hdfc', providerName: 'HDFC Bank', confidence: 70, matchedPattern: 'keyword:hdfc', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  const cardMatch = text.match(/card\s*(?:\*{2,})?(\d{4})/i);
  if (cardMatch) data.cardType = 'debit';
  const merchantMatch = text.match(/at\s+([A-Z][A-Za-z0-9\s.&'-]{2,40})(?:\s+on|\s+dt|\s*$)/);
  if (merchantMatch && !data.merchant) data.merchant = merchantMatch[1].trim();
  return data;
}

export const hdfcProvider: BankProvider = { id: 'hdfc', name: 'HDFC Bank', type: 'bank', domains, aliases, detect, parse };
