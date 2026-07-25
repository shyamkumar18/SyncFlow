export interface EmailInput {
  from: string;
  subject: string;
  body: string;
  snippet?: string;
}

export interface DetectionPattern {
  type: 'domain' | 'from' | 'subject' | 'body';
  pattern: RegExp;
  confidence: number;
}

export interface DetectionResult {
  providerId: string;
  providerName: string;
  confidence: number;
  matchedPattern: string;
  type: 'bank' | 'upi';
}

export interface ParsedTransaction {
  amount: number | null;
  type: 'debit' | 'credit' | null;
  date: Date | null;
  time: string | null;
  description: string | null;
  merchant: string | null;
  sender: string | null;
  receiver: string | null;
  balance: number | null;
  upiId: string | null;
  upiApp: string | null;
  referenceNumber: string | null;
  cardType: 'credit' | 'debit' | 'unknown' | null;
  status: 'success' | 'failed' | 'pending' | 'refunded';
  bank: string | null;
}

export interface BankProvider {
  readonly id: string;
  readonly name: string;
  readonly type: 'bank' | 'upi';
  readonly domains: string[];
  readonly aliases: string[];

  detect(email: EmailInput): DetectionResult | null;
  parse(text: string): ParsedTransaction | null;
}
