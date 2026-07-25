import {
  extractAmount,
  extractTransactionType,
  extractDate,
  extractTime,
  extractMerchant,
  extractUPI,
  extractReferenceNumber,
  extractBalance,
  extractCardType,
  extractStatus,
  extractSender,
  extractReceiver,
} from '../../../services/parser/extractors';
import type { ParsedTransaction } from '../types';

export function parseGeneric(text: string): ParsedTransaction {
  return {
    amount: extractAmount(text),
    type: extractTransactionType(text),
    date: extractDate(text),
    time: extractTime(text),
    merchant: extractMerchant(text),
    sender: extractSender(text),
    receiver: extractReceiver(text),
    balance: extractBalance(text),
    upiId: extractUPI(text),
    upiApp: null,
    referenceNumber: extractReferenceNumber(text),
    cardType: extractCardType(text),
    status: extractStatus(text),
    description: null,
    bank: null,
  };
}
