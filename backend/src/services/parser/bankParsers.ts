import { getBankDetector } from '../../modules/bankDetection';
import type { ParsedTransaction } from '../../modules/bankDetection/types';
import type { ExtractedData } from './extractors';

type BankParser = (text: string) => Partial<ExtractedData>;

function parsedToExtracted(p: ParsedTransaction): Partial<ExtractedData> {
  return {
    amount: p.amount,
    type: p.type,
    date: p.date,
    time: p.time,
    merchant: p.merchant,
    sender: p.sender,
    receiver: p.receiver,
    balance: p.balance,
    upiId: p.upiId,
    referenceNumber: p.referenceNumber,
    cardType: p.cardType,
    status: p.status,
    description: p.description,
  };
}

function getParserForBank(bankName: string): BankParser | null {
  const detector = getBankDetector();
  for (const provider of detector.getAllProviders()) {
    if (provider.type !== 'bank') continue;
    if (provider.name === bankName || provider.aliases.includes(bankName)) {
      return (text: string) => {
        const result = provider.parse(text);
        return result ? parsedToExtracted(result) : parsedToExtracted(detector.parse(text));
      };
    }
  }
  return null;
}

const parserCache = new Map<string, BankParser>();

export function getParser(bank: string): BankParser {
  if (parserCache.has(bank)) return parserCache.get(bank)!;

  const bankParser = getParserForBank(bank);
  if (bankParser) {
    parserCache.set(bank, bankParser);
    return bankParser;
  }

  const fallback: BankParser = (text: string) => {
    const result = getBankDetector().parse(text);
    return parsedToExtracted(result);
  };
  parserCache.set(bank, fallback);
  return fallback;
}

export function clearParserCache(): void {
  parserCache.clear();
}
