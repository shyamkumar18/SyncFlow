import Imap from 'imap';
import https from 'https';
import { GmailAccount } from '../../../../../models/GmailAccount';
import { getAccessToken, revokeTokens } from '../oauth';

function buildXoauth2String(user: string, accessToken: string): string {
  return Buffer.from(`user=${user}\x01auth=Bearer ${accessToken}\x01\x01`).toString('base64');
}

async function verifyTokenScope(accessToken: string): Promise<{ valid: boolean; scopes: string[]; error?: string }> {
  return new Promise((resolve) => {
    const req = https.get(
      `https://oauth2.googleapis.com/tokeninfo?access_token=${accessToken}`,
      { timeout: 5000 },
      (res) => {
        let data = '';
        res.on('data', (chunk: string) => { data += chunk; });
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.error) {
              resolve({ valid: false, scopes: [], error: `Token verification failed: ${parsed.error}` });
            } else {
              const scopes = (parsed.scope || '').split(' ');
              resolve({ valid: true, scopes });
            }
          } catch {
            resolve({ valid: false, scopes: [], error: 'Failed to parse token verification response' });
          }
        });
      },
    );
    req.on('error', (err) => {
      resolve({ valid: false, scopes: [], error: `Token verification network error: ${err.message}` });
    });
    req.end();
  });
}

export async function testConnection(userId: string, email: string): Promise<{ latencyMs: number }> {
  let accessToken: string;
  try {
    accessToken = await getAccessToken(userId);
  } catch (err: any) {
    await GmailAccount.findOneAndDelete({ userId: userId as any }).catch(() => {});
    throw new Error(`Cannot retrieve access token: ${err.message}. Please reconnect Gmail.`);
  }

  const tokenInfo = await verifyTokenScope(accessToken);
  if (!tokenInfo.valid) {
    await revokeTokens(userId).catch(() => {});
    await GmailAccount.findOneAndDelete({ userId: userId as any }).catch(() => {});
    throw new Error(`OAuth token is invalid or revoked: ${tokenInfo.error || 'Unknown error'}. The account has been disconnected. Please connect Gmail again.`);
  }

  const hasImapScope = tokenInfo.scopes.some(
    (s) => s === 'https://mail.google.com/' || s === 'https://www.googleapis.com/auth/gmail.full' || s === 'https://www.googleapis.com/auth/gmail.modify',
  );
  if (!hasImapScope) {
    const scopeList = tokenInfo.scopes.join(', ');
    await revokeTokens(userId).catch(() => {});
    await GmailAccount.findOneAndDelete({ userId: userId as any }).catch(() => {});
    throw new Error(
      `The OAuth token does not contain IMAP permission. ` +
      `Current scopes: ${scopeList || 'none'}. ` +
      `The account has been disconnected. Please click "Connect Gmail" to grant IMAP access.`,
    );
  }

  const xoauth2 = buildXoauth2String(email, accessToken);
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      xoauth2,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: process.env.NODE_ENV === 'development' ? { rejectUnauthorized: false } : undefined,
      connTimeout: 15000,
      authTimeout: 10000,
    } as import('imap').Config);

    const timeout = setTimeout(() => {
      imap.destroy();
      reject(new Error('IMAP connection timed out after 20s'));
    }, 20000);

    imap.once('ready', () => {
      clearTimeout(timeout);
      const latencyMs = Date.now() - start;
      imap.end();
      resolve({ latencyMs });
    });

    imap.once('error', (err: Error) => {
      clearTimeout(timeout);
      imap.destroy();

      const msg = err.message || '';
      if (msg.includes('Invalid credentials') || msg.includes('AUTHENTICATIONFAILED')) {
        reject(new Error(
          `IMAP rejected XOAUTH2: The access token was rejected by Gmail IMAP. ` +
          `This may happen if the token scope is incorrect or the token was revoked. ` +
          `Please reconnect Gmail.`,
        ));
      } else if (msg.includes('Too many login attempts') || msg.includes('Too many simultaneous')) {
        reject(new Error(`IMAP rate limited: ${msg}. Please wait a few minutes and try again.`));
      } else {
        reject(new Error(`IMAP connection failed: ${msg}`));
      }
    });

    imap.connect();
  });
}

export function createConnection(userId: string, email: string, accessToken: string): Imap {
  const xoauth2 = buildXoauth2String(email, accessToken);

  return new Imap({
    user: email,
    xoauth2,
    host: 'imap.gmail.com',
    port: 993,
    tls: true,
    tlsOptions: process.env.NODE_ENV === 'development' ? { rejectUnauthorized: false } : undefined,
    connTimeout: 15000,
    authTimeout: 10000,
  } as import('imap').Config);
}
