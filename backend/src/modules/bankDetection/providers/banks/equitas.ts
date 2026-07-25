import type { BankProvider, DetectionResult, EmailInput, ParsedTransaction } from '../../types';
import { parseGeneric } from '../../services/GenericParser';

const domains = ['equitasbank.com', 'equitas.in'];
const aliases = ['Equitas', 'Equitas Small Finance Bank'];

function detect(email: EmailInput): DetectionResult | null {
  const from = email.from.toLowerCase();
  const text = `${email.subject} ${email.body} ${email.snippet || ''}`.toLowerCase();
  for (const d of domains) { if (from.includes(d)) return { providerId: 'equitas', providerName: 'Equitas Small Finance Bank', confidence: 100, matchedPattern: `domain:${d}`, type: 'bank' }; }
  const fps = [/alerts@equitasbank\.com/i, /alert@equitasbank\.com/i];
  for (const p of fps) { if (p.test(email.from)) return { providerId: 'equitas', providerName: 'Equitas Small Finance Bank', confidence: 95, matchedPattern: `from:${p}`, type: 'bank' }; }
  if (/(?:equitas|equitas small finance bank)/i.test(text)) return { providerId: 'equitas', providerName: 'Equitas Small Finance Bank', confidence: 70, matchedPattern: 'keyword:equitas', type: 'bank' };
  return null;
}

function parse(text: string): ParsedTransaction {
  return parseGeneric(text);
}

export const equitasProvider: BankProvider = { id: 'equitas', name: 'Equitas Small Finance Bank', type: 'bank', domains, aliases, detect, parse };
