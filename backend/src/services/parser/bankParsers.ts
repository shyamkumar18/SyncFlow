import { ExtractedData, extractAmount, extractTransactionType, extractDate, extractTime, extractMerchant, extractUPI, extractReferenceNumber, extractBalance, extractCardType, extractStatus, extractSender, extractReceiver } from './extractors';

type BankParser = (text: string) => Partial<ExtractedData>;

function parseHDFC(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {};
  data.amount = extractAmount(text);
  data.type = extractTransactionType(text);
  data.date = extractDate(text);
  data.time = extractTime(text);
  data.balance = extractBalance(text);
  data.referenceNumber = extractReferenceNumber(text);
  data.status = extractStatus(text);

  // HDFC specific: "Card XXXXXX1234 Debited for Rs.1,234.56 at MERCHANT on Date"
  const cardMatch = text.match(/card\s*(\*{2,})?(\d{4})/i);
  if (cardMatch) data.cardType = 'debit';

  const merchantMatch = text.match(/at\s+([A-Z][A-Za-z0-9\s.&'-]{2,40})(?:\s+on|\s+dt|\s*$)/);
  if (merchantMatch) data.merchant = merchantMatch[1].trim();

  return data;
}

function parseICICI(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {};
  data.amount = extractAmount(text);
  data.type = extractTransactionType(text);
  data.date = extractDate(text);
  data.time = extractTime(text);
  data.balance = extractBalance(text);
  data.referenceNumber = extractReferenceNumber(text);
  data.upiId = extractUPI(text);
  data.status = extractStatus(text);
  data.merchant = extractMerchant(text);
  data.sender = extractSender(text);
  data.receiver = extractReceiver(text);

  const cardTypeMatch = text.match(/credit\s*(?:card)?|debit\s*(?:card)?/i);
  if (cardTypeMatch) {
    data.cardType = /credit/i.test(cardTypeMatch[0]) ? 'credit' : 'debit';
  }

  return data;
}

function parseSBI(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {};
  data.amount = extractAmount(text);
  data.type = extractTransactionType(text);
  data.date = extractDate(text);
  data.time = extractTime(text);
  data.balance = extractBalance(text);
  data.referenceNumber = extractReferenceNumber(text);
  data.upiId = extractUPI(text);
  data.status = extractStatus(text);
  data.merchant = extractMerchant(text);

  return data;
}

function parseAxis(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {};
  data.amount = extractAmount(text);
  data.type = extractTransactionType(text);
  data.date = extractDate(text);
  data.time = extractTime(text);
  data.balance = extractBalance(text);
  data.referenceNumber = extractReferenceNumber(text);
  data.upiId = extractUPI(text);
  data.status = extractStatus(text);
  data.sender = extractSender(text);
  data.receiver = extractReceiver(text);

  const merchantMatch = text.match(/(?:at|to)\s+([A-Z][A-Za-z0-9\s.&'-]{2,40})(?:\s+ref|\s+on|\s*$)/);
  if (merchantMatch) data.merchant = merchantMatch[1].trim();

  return data;
}

function parseKotak(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {};
  data.amount = extractAmount(text);
  data.type = extractTransactionType(text);
  data.date = extractDate(text);
  data.time = extractTime(text);
  data.balance = extractBalance(text);
  data.referenceNumber = extractReferenceNumber(text);
  data.upiId = extractUPI(text);
  data.status = extractStatus(text);
  data.merchant = extractMerchant(text);

  return data;
}

function parseYesBank(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {};
  data.amount = extractAmount(text);
  data.type = extractTransactionType(text);
  data.date = extractDate(text);
  data.time = extractTime(text);
  data.balance = extractBalance(text);
  data.referenceNumber = extractReferenceNumber(text);
  data.upiId = extractUPI(text);
  data.status = extractStatus(text);

  return data;
}

function parseGeneric(text: string): Partial<ExtractedData> {
  const data: Partial<ExtractedData> = {};
  data.amount = extractAmount(text);
  data.type = extractTransactionType(text);
  data.date = extractDate(text);
  data.time = extractTime(text);
  data.merchant = extractMerchant(text);
  data.sender = extractSender(text);
  data.receiver = extractReceiver(text);
  data.balance = extractBalance(text);
  data.upiId = extractUPI(text);
  data.referenceNumber = extractReferenceNumber(text);
  data.cardType = extractCardType(text);
  data.status = extractStatus(text);

  return data;
}

const bankParserMap: Record<string, BankParser> = {
  'HDFC Bank': parseHDFC,
  'ICICI Bank': parseICICI,
  'State Bank of India': parseSBI,
  'Axis Bank': parseAxis,
  'Kotak Mahindra Bank': parseKotak,
  'Yes Bank': parseYesBank,
};

export function getParser(bank: string): BankParser {
  return bankParserMap[bank] || parseGeneric;
}
