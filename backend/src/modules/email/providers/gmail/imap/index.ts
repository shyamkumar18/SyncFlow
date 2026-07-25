import Imap from 'imap';
import { getAccessToken } from '../oauth';

function buildXoauth2String(user: string, accessToken: string): string {
  return Buffer.from(`user=${user}\x01auth=Bearer ${accessToken}\x01\x01`).toString('base64');
}

export async function testConnection(userId: string, email: string): Promise<number> {
  const start = Date.now();
  const accessToken = await getAccessToken(userId);
  const xoauth2 = buildXoauth2String(email, accessToken);

  return new Promise((resolve, reject) => {
    const imap = new Imap({
      user: email,
      xoauth2,
      host: 'imap.gmail.com',
      port: 993,
      tls: true,
      tlsOptions: { rejectUnauthorized: true },
      connTimeout: 15000,
      authTimeout: 10000,
    } as import('imap').Config);

    const timeout = setTimeout(() => {
      imap.destroy();
      reject(new Error('IMAP connection timed out'));
    }, 20000);

    imap.once('ready', () => {
      clearTimeout(timeout);
      const latency = Date.now() - start;
      imap.end();
      resolve(latency);
    });

    imap.once('error', (err: Error) => {
      clearTimeout(timeout);
      imap.destroy();
      reject(err);
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
    tlsOptions: { rejectUnauthorized: true },
    connTimeout: 15000,
    authTimeout: 10000,
  } as import('imap').Config);
}
