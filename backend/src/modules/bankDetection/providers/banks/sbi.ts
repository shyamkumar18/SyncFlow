import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';
import {
  extractAmount, extractTransactionType, extractDate, extractTime,
  extractBalance, extractReferenceNumber, extractUPI, extractStatus,
  extractMerchant,
} from '../../../../services/parser/extractors';

const domains = ['sbi.co.in', 'sbicard.com', 'onlinesbi.com', 'statebankofindia.com'];
const aliases = ['SBI', 'State Bank of India'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();

  for (const domain of domains) {
    if (from.includes(domain)) {
      return { providerId: 'sbi', providerName: 'State Bank of India', confidence: 100, matchedPattern: `domain:${domain}`, type: 'bank' };
    }
  }

  const fromPatterns = [/alert@sbi\.co\.in/i, /alerts@sbi\.co\.in/i, /transaction@sbicard\.com/i];
  for (const p of fromPatterns) {
    if (p.test(email.from)) return { providerId: 'sbi', providerName: 'State Bank of India', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' };
  }

  const keywords = [/sbi alert/i, /state bank/i, /sbicard/i];
  for (const p of keywords) {
    if (p.test(text)) return { providerId: 'sbi', providerName: 'State Bank of India', confidence: 70, matchedPattern: `keyword:${p}`, type: 'bank' };
  }

  return null;
}

function parse(text: string): ParsedTransaction {
  const data = parseGeneric(text);
  const cardMatch = text.match(/card\s*(?:\*{2,})?(\d{4})/i);
  if (cardMatch && !data.cardType) data.cardType = 'debit';
  if (!data.merchant) data.merchant = extractMerchant(text);
  return data;
}

export const sbiProvider: BankProvider = { id: 'sbi', name: 'State Bank of India', type: 'bank', domains, aliases, detect, parse };
