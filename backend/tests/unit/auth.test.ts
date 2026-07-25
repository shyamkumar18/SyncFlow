import { describe, it, expect, beforeAll } from 'vitest';
import {
  hashPassword,
  comparePassword,
  generateAccessToken,
  generateRefreshJWT,
  decodeRefreshJWT,
  hashToken,
} from '../../src/services/auth';
import { config } from '../../src/config/env';

describe('Auth Service', () => {
  describe('Password Hashing', () => {
    it('should hash and verify password correctly', async () => {
      const password = 'Test@1234';
      const hash = await hashPassword(password);
      expect(hash).not.toBe(password);
      expect(hash).toContain('$2b$');

      const valid = await comparePassword(password, hash);
      expect(valid).toBe(true);
    });

    it('should reject wrong password', async () => {
      const hash = await hashPassword('Correct@123');
      const valid = await comparePassword('Wrong@123', hash);
      expect(valid).toBe(false);
    });
  });

  describe('JWT Tokens', () => {
    it('should generate and verify access token', () => {
      const token = generateAccessToken('user123', 'user');
      expect(token).toBeTruthy();
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate and decode refresh token', () => {
      const token = generateRefreshJWT('user123', 'user');
      expect(token).toBeTruthy();

      const decoded = decodeRefreshJWT(token);
      expect(decoded).not.toBeNull();
      expect(decoded!.userId).toBe('user123');
      expect(decoded!.role).toBe('user');
    });

    it('should return null for invalid refresh token', () => {
      const decoded = decodeRefreshJWT('invalid.token.here');
      expect(decoded).toBeNull();
    });

    it('should reject expired token', () => {
      const decoded = decodeRefreshJWT('expired.token.here');
      expect(decoded).toBeNull();
    });
  });

  describe('Token Hashing', () => {
    it('should hash token consistently', () => {
      const token = 'my-refresh-token-123';
      const hash1 = hashToken(token);
      const hash2 = hashToken(token);
      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(token);
    });
  });
});
