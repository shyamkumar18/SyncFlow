import { google } from 'googleapis';
import Imap from 'imap';
import { GmailAccount } from '../../../../../models/GmailAccount';
import { getAccessToken, revokeTokens } from '../oauth';

function buildXoauth2String(user: string, accessToken: string): string {
  return Buffer.from(`user=${user}\x01auth=Bearer ${accessToken}\x01\x01`).toString('base64');
}

export async function testConnection(userId: string): Promise<{ latencyMs: number }> {
  let accessToken: string;
  try {
    accessToken = await getAccessToken(userId);
  } catch (err: any) {
    await GmailAccount.findOneAndDelete({ userId: userId as any }).catch(() => {});
    throw new Error(`Cannot retrieve access token: ${err.message}. Please reconnect Gmail.`);
  }

  const oauth2Client = new google.auth.OAuth2();
  oauth2Client.setCredentials({ access_token: accessToken });
  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const start = Date.now();

  try {
    await gmail.users.getProfile({ userId: 'me' });
    const latencyMs = Date.now() - start;
    return { latencyMs };
  } catch (err: any) {
    if (err.response?.status === 401) {
      await revokeTokens(userId).catch(() => {});
      await GmailAccount.findOneAndDelete({ userId: userId as any }).catch(() => {});
      throw new Error('Gmail API rejected the access token. The account has been disconnected. Please connect Gmail again.');
    }
    if (err.response?.status === 403) {
      throw new Error('Gmail API access forbidden. The OAuth token may not have the required scopes. Please reconnect Gmail.');
    }
    throw new Error(`Gmail API connection failed: ${err.message}`);
  }
}

export function createConnection(userId: string, email: string, accessToken: string): Imap {
  const xoauth2 = buildXoauth2String(email, accessToken);

  return new Imap({
    user: email,
    xoauth2,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: process.env.NODE_ENV === 'undefined' ? { rejectUnauthorized: false } : undefined,
    connTimeout: 15000,
    authTimeout: 10000,
  } as import('imap').Config);
}
