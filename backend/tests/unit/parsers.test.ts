import { describe, it, expect } from 'vitest';
import { extractAmount, extractTransactionType, extractDate, extractMerchant, extractUPI, extractReferenceNumber, extractBalance, extractCardType, extractStatus } from '../../src/services/parser/extractors';
import { categorizeEmail } from '../../src/services/gmail/categorizer';
import { detectBank } from '../../src/services/gmail/bankDetection';

describe('Transaction Parser - Extractors', () => {
  describe('extractAmount', () => {
    it('should extract INR amount with Rs prefix', () => {
      expect(extractAmount('Rs. 1,234.56 debited')).toBe(1234.56);
    });

    it('should extract INR amount with ₹ symbol', () => {
      expect(extractAmount('₹ 5,000 credited')).toBe(5000);
    });

    it('should extract amount with INR prefix', () => {
      expect(extractAmount('Amount: INR 2,500.00')).toBe(2500);
    });

    it('should return null when no amount found', () => {
      expect(extractAmount('No transaction here')).toBeNull();
    });
  });

  describe('extractTransactionType', () => {
    it('should detect debit', () => {
      expect(extractTransactionType('Your account has been debited')).toBe('debit');
    });

    it('should detect credit', () => {
      expect(extractTransactionType('Amount credited to your account')).toBe('credit');
    });

    it('should return null for ambiguous text', () => {
      expect(extractTransactionType('Your account statement')).toBeNull();
    });
  });

  describe('extractDate', () => {
    it('should extract DD/MM/YYYY format', () => {
      const d = extractDate('Transaction on 15/03/2024');
      expect(d).not.toBeNull();
      expect(d!.getDate()).toBe(15);
      expect(d!.getMonth()).toBe(2); // 0-indexed
      expect(d!.getFullYear()).toBe(2024);
    });

    it('should extract YYYY-MM-DD format', () => {
      const d = extractDate('Date: 2024-03-15');
      expect(d).not.toBeNull();
    });

    it('should return null for invalid date', () => {
      expect(extractDate('No date here')).toBeNull();
    });
  });

  describe('extractMerchant', () => {
    it('should extract merchant after "at"', () => {
      expect(extractMerchant('Purchase at Amazon India')).toBe('Amazon India');
    });

    it('should extract merchant after "merchant:"', () => {
      expect(extractMerchant('Merchant: Swiggy')).toBe('Swiggy');
    });
  });

  describe('extractUPI', () => {
    it('should extract UPI ID', () => {
      expect(extractUPI('UPI: user@paytm')).toBe('user@paytm');
    });

    it('should extract VPA reference', () => {
      expect(extractUPI('VPA: name@icici')).toBe('name@icici');
    });

    it('should return null when no UPI found', () => {
      expect(extractUPI('Normal transaction')).toBeNull();
    });
  });

  describe('extractReferenceNumber', () => {
    it('should extract reference number', () => {
      expect(extractReferenceNumber('Ref: TXN1234567890')).toBe('TXN1234567890');
    });

    it('should extract UTR number', () => {
      expect(extractReferenceNumber('UTR: 1234567890123456')).toBe('1234567890123456');
    });
  });

  describe('extractBalance', () => {
    it('should extract available balance', () => {
      expect(extractBalance('Available balance: Rs. 25,000.50')).toBe(25000.5);
    });
  });

  describe('extractCardType', () => {
    it('should detect credit card', () => {
      expect(extractCardType('Credit card transaction')).toBe('credit');
    });

    it('should detect debit card', () => {
      expect(extractCardType('Debit card transaction')).toBe('debit');
    });
  });

  describe('extractStatus', () => {
    it('should detect success', () => {
      expect(extractStatus('Transaction successful')).toBe('success');
    });

    it('should detect failed', () => {
      expect(extractStatus('Payment failed')).toBe('failed');
    });

    it('should detect pending', () => {
      expect(extractStatus('Transaction pending')).toBe('pending');
    });

    it('should detect refunded', () => {
      expect(extractStatus('Refund processed')).toBe('refunded');
    });
  });
});

describe('Email Categorizer', () => {
  it('should categorize UPI transaction', () => {
    const cat = categorizeEmail('UPI Transaction', 'Your UPI payment of Rs. 500 to user@paytm is successful');
    expect(cat).toBe('upi');
  });

  it('should categorize credit card email', () => {
    const cat = categorizeEmail('Credit Card Statement', 'Your credit card payment of Rs. 10,000');
    expect(cat).toBe('credit_card');
  });

  it('should categorize failed transaction', () => {
    const cat = categorizeEmail('Transaction Failed', 'Your payment of Rs. 500 has failed due to insufficient balance');
    expect(cat).toBe('failed');
  });

  it('should categorize refund', () => {
    const cat = categorizeEmail('Refund Initiated', 'Your refund of Rs. 1,000 has been credited');
    expect(cat).toBe('refund');
  });

  it('should categorize EMI', () => {
    const cat = categorizeEmail('EMI Payment Due', 'Your monthly EMI of Rs. 5,000 is due');
    expect(cat).toBe('emi');
  });
});

describe('Bank Detection', () => {
  it('should detect HDFC Bank from email domain', () => {
    const result = detectBank('alert@alerts.hdfcbank.com', 'Transaction Alert');
    expect(result.bank).toBe('HDFC Bank');
    expect(result.confidence).toBeGreaterThanOrEqual(95);
  });

  it('should detect ICICI Bank from email domain', () => {
    const result = detectBank('alert@icicibank.com', 'Transaction Alert');
    expect(result.bank).toBe('ICICI Bank');
  });

  it('should detect SBI from email domain', () => {
    const result = detectBank('alert@sbi.co.in', 'Transaction');
    expect(result.bank).toBe('State Bank of India');
  });

  it('should detect Axis Bank from keywords', () => {
    const result = detectBank('noreply@somebank.com', 'Axis Bank Transaction');
    expect(result.bank).toBe('Axis Bank');
  });

  it('should return Unknown for unrecognized banks', () => {
    const result = detectBank('noreply@unknown-bank.com', 'Your transaction');
    expect(result.bank).toBe('Unknown');
  });
});
