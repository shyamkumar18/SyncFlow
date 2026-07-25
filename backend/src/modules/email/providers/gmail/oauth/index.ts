import { google } from 'googleapis';
import crypto from 'crypto';
import { config } from '../../../../../config/env';
import { encrypt, decrypt } from '../../../../../services/encryption';
import { GmailAccount } from '../../../../../models/GmailAccount';

const STATE_SECRET = crypto.scryptSync(config.jwtSecret, 'gmail-oauth-state', 32);

function encodeState(state: string): string {
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', STATE_SECRET, iv);
  let enc = cipher.update(state, 'utf8', 'hex');
  enc += cipher.final('hex');
  const tag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${tag}:${enc}`;
}

function decodeState(encoded: string): string | null {
  try {
    const parts = encoded.split(':');
    if (parts.length !== 3) return null;
    const [ivHex, tagHex, data] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const tag = Buffer.from(tagHex, 'hex');
    const decipher = crypto.createDecipheriv('aes-256-gcm', STATE_SECRET, iv);
    decipher.setAuthTag(tag);
    let dec = decipher.update(data, 'hex', 'utf8');
    dec += decipher.final('utf8');
    return dec;
  } catch {
    return null;
  }
}

function getOAuth2Client() {
  return new google.auth.OAuth2(
    config.googleClientId,
    config.googleClientSecret,
    config.emailRedirectUri,
  );
}

export function generateAuthUrl(userId: string): string {
  const state = encodeState(userId);
  const client = getOAuth2Client();
  return client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent',
    state,
    scope: [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/userinfo.profile',
      'https://www.googleapis.com/auth/userinfo.email',
    ],
  });
}

export function verifyState(encodedState: string): string | null {
  return decodeState(encodedState);
}

export async function handleCallback(code: string, userId: string): Promise<{ email: string; googleId: string }> {
  const client = getOAuth2Client();
  const { tokens } = await client.getToken(code);

  if (!tokens.access_token || !tokens.refresh_token || !tokens.expiry_date) {
    throw new Error('Incomplete OAuth token response');
  }

  client.setCredentials({ access_token: tokens.access_token });
  const oauth2 = google.oauth2({ version: 'v2', auth: client });
  const profile = await oauth2.userinfo.get();

  if (!profile.data.email || !profile.data.id) {
    throw new Error('Could not retrieve Google profile');
  }

  const expiresAt = new Date(tokens.expiry_date);

  await GmailAccount.findOneAndUpdate(
    { userId: userId as any },
    {
      userId: userId as any,
      googleId: profile.data.id,
      gmailEmail: profile.data.email,
      accessTokenEncrypted: encrypt(tokens.access_token),
      refreshTokenEncrypted: encrypt(tokens.refresh_token),
      expiresAt,
      connected: true,
      connectedAt: new Date(),
      lastConnected: new Date(),
      provider: 'gmail',
      status: 'connected',
    },
    { upsert: true, new: true },
  );

  return { email: profile.data.email, googleId: profile.data.id };
}

export async function refreshAccessToken(userId: string): Promise<string> {
  const account = await GmailAccount.findOne({ userId: userId as any });
  if (!account) {
    throw new Error('Gmail account not connected');
  }

  const refreshToken = decrypt(account.refreshTokenEncrypted);
  const client = getOAuth2Client();
  client.setCredentials({ refresh_token: refreshToken });

  const { credentials } = await client.refreshAccessToken();

  if (!credentials.access_token || !credentials.expiry_date) {
    throw new Error('Token refresh returned incomplete credentials');
  }

  account.accessTokenEncrypted = encrypt(credentials.access_token);
  account.expiresAt = new Date(credentials.expiry_date);
  account.status = 'connected';
  account.lastConnected = new Date();
  await account.save();

  return credentials.access_token;
}

export async function getAccessToken(userId: string): Promise<string> {
  const account = await GmailAccount.findOne({ userId: userId as any });
  if (!account) {
    throw new Error('Gmail account not connected');
  }

  if (account.expiresAt <= new Date()) {
    return refreshAccessToken(userId);
  }

  return decrypt(account.accessTokenEncrypted);
}

export async function revokeTokens(userId: string): Promise<void> {
  try {
    const account = await GmailAccount.findOne({ userId: userId as any });
    if (account) {
      const accessToken = decrypt(account.accessTokenEncrypted);
      const client = getOAuth2Client();
      client.setCredentials({ access_token: accessToken });
      await client.revokeCredentials();
    }
  } catch {
    // Revocation failure is non-fatal
  }
}
