export interface ValidationSignal {
  keyword: number;
  account: number;
  balance: number;
  reference: number;
  merchant: number;
  paymentMethod: number;
  valueDate: number;
}

export interface ValidationPenalties {
  marketing: number;
  notification: number;
  billReminder: number;
  generic: number;
}

export interface ValidationResult {
  valid: boolean;
  confidence: number;
  threshold: number;
  signals: ValidationSignal;
  penalties: ValidationPenalties;
  breakdown: string[];
}
