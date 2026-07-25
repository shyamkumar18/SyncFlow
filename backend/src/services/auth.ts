import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env';
import { User } from '../models/User';

const SALT_ROUNDS = 12;

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateAccessToken(userId: string, role: string): string {
  return jwt.sign({ userId, role }, config.jwtSecret, { expiresIn: config.jwtExpiry as any });
}

export function generateRefreshJWT(userId: string, role: string): string {
  return jwt.sign({ userId, role, jti: crypto.randomUUID() }, config.jwtRefreshSecret, { expiresIn: config.jwtRefreshExpiry as any });
}

export function decodeRefreshJWT(token: string): { userId: string; role: string } | null {
  try {
    return jwt.verify(token, config.jwtRefreshSecret) as { userId: string; role: string };
  } catch {
    return null;
  }
}

export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function storeRefreshTokenHash(userId: string, token: string, deviceInfo?: string): Promise<void> {
  const hashed = hashToken(token);
  await User.findByIdAndUpdate(userId, {
    $push: {
      refreshTokens: {
        token: hashed,
        deviceInfo: deviceInfo || 'unknown',
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
      },
    },
  });
}

export async function isRefreshTokenValid(userId: string, token: string): Promise<boolean> {
  const user = await User.findById(userId);
  if (!user) return false;
  const hashed = hashToken(token);
  return user.refreshTokens.some(
    (rt) => rt.token === hashed && rt.expiresAt > new Date(),
  );
}

export async function revokeRefreshToken(userId: string, token: string): Promise<void> {
  const hashed = hashToken(token);
  await User.findByIdAndUpdate(userId, {
    $pull: { refreshTokens: { token: hashed } },
  });
}

export async function revokeAllRefreshTokens(userId: string): Promise<void> {
  await User.findByIdAndUpdate(userId, { $set: { refreshTokens: [] } });
}
