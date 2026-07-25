import { describe, it, expect } from 'vitest';
import { encrypt, decrypt } from '../../src/services/encryption';

describe('Encryption Service', () => {
  it('should encrypt and decrypt text correctly', () => {
    const original = 'This is sensitive financial data';
    const encrypted = encrypt(original);
    expect(encrypted).not.toBe(original);
    expect(encrypted).toContain(':');

    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  it('should produce different ciphertexts for same input', () => {
    const text = 'Same text';
    const e1 = encrypt(text);
    const e2 = encrypt(text);
    expect(e1).not.toBe(e2);
  });

  it('should handle empty string', () => {
    const encrypted = encrypt('');
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe('');
  });

  it('should handle special characters', () => {
    const text = 'UPI: user@paytm, ₹1,234.56, Ref: ABC123!@#$%';
    const encrypted = encrypt(text);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(text);
  });

  it('should throw on invalid ciphertext', () => {
    expect(() => decrypt('invalid')).toThrow();
  });
});
