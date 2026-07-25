import { google } from 'googleapis';
import { Email } from '../../models/Email';
import { GmailAccount } from '../../models/GmailAccount';
import { getStoredAuth } from '../google';
import { detectBank } from './bankDetection';
import { categorizeEmail } from './categorizer';
import { resolveConfig, type SyncConfigOverrides } from '../../modules/email/config';

const BANK_QUERY = '("debited" OR "credited" OR "transaction" OR "upi" OR "trf" OR "withdrawn" OR "deposited" OR "statement" OR "emi" OR "refund" OR "card" OR "atm" OR "balance" OR "account" OR "loan" OR "credit card" OR "debit card" OR "payment")';

export interface SyncResult {
  processed: number;
  newEmails: number;
  newTransactions: number;
  bankingEmails: number;
  reachedLimit: boolean;
  syncMode: 'first_sync' | 'incremental';
  failed: number;
  errors: string[];
}

export async function syncGmailEmails(
  userId: string,
  overrides?: SyncConfigOverrides,
): Promise<SyncResult> {
  const config = resolveConfig(overrides);

  const result: SyncResult = {
    processed: 0, newEmails: 0, newTransactions: 0, bankingEmails: 0,
    reachedLimit: false, syncMode: 'first_sync', failed: 0, errors: [],
  };

  try {
    const auth = await getStoredAuth(userId);
    if (!auth) {
      throw new Error('Google authentication not found. Please reconnect Gmail.');
    }

    const gmailAccount = await GmailAccount.findOne({ userId }).lean();
    if (!gmailAccount) {
      throw new Error('Gmail account not connected. Please connect Gmail first.');
    }

    const isFirstSync = !gmailAccount.lastSync;
    result.syncMode = isFirstSync ? 'first_sync' : 'incremental';

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: auth.accessToken,
      refresh_token: auth.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    let query = BANK_QUERY;
    if (!isFirstSync) {
      const lastSyncDate = gmailAccount.lastSync!;
      const datePart = lastSyncDate.toISOString().split('T')[0].replace(/-/g, '/');
      query = `${BANK_QUERY} after:${datePart}`;
    }

    let pageToken: string | undefined;
    let transactionCount = 0;
    let bankingCount = 0;

    await GmailAccount.findOneAndUpdate(
      { userId },
      { $set: { syncMode: isFirstSync ? 'first_sync' : 'incremental' } },
    );

    let keepFetching = true;

    while (keepFetching) {
      const listResponse = await gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults: config.fetchBatchSize,
        pageToken,
      });

      const messages = listResponse.data.messages || [];
      pageToken = listResponse.data.nextPageToken || undefined;

      if (messages.length === 0) break;

      const batch: any[] = [];

      for (const msg of messages) {
        try {
          const existingEmail = await Email.findOne({
            userId,
            gmailMessageId: msg.id,
          });

          if (existingEmail) {
            result.processed++;
            continue;
          }

          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msg.id!,
            format: 'full',
          });

          const headers = detail.data.payload?.headers || [];
          const getHeader = (name: string) =>
            headers.find((h) => h.name?.toLowerCase() === name.toLowerCase())?.value || '';

          const from = getHeader('From');
          const to = getHeader('To');
          const subject = getHeader('Subject');
          const dateStr = getHeader('Date');
          const receivedAt = dateStr ? new Date(dateStr) : new Date();

          let body = '';
          let bodyText = '';
          const extractText = (part: any): void => {
            if (part.mimeType === 'text/plain' && part.body?.data) {
              bodyText += Buffer.from(part.body.data, 'base64url').toString('utf-8');
            } else if (part.mimeType === 'text/html' && part.body?.data) {
              body += Buffer.from(part.body.data, 'base64url').toString('utf-8');
            }
            if (part.parts) {
              part.parts.forEach(extractText);
            }
          };
          if (detail.data.payload) {
            extractText(detail.data.payload);
          }

          const snippet = detail.data.snippet || '';

          const { bank } = detectBank(from, subject, `${snippet} ${bodyText} ${body}`);

          if (bank === 'Unknown') {
            result.processed++;
            continue;
          }

          const category = categorizeEmail(subject, `${bodyText} ${body}`);
          const isTransaction = category !== 'statement' && category !== 'unknown';

          if (isTransaction) {
            if (transactionCount >= config.transactionLimit) {
              continue;
            }
            transactionCount++;
          } else {
            if (bankingCount >= config.bankingEmailLimit) {
              continue;
            }
            bankingCount++;
          }

          batch.push({
            userId,
            gmailMessageId: msg.id,
            threadId: detail.data.threadId || '',
            from,
            to,
            subject,
            body,
            bodyText,
            snippet,
            receivedAt,
            category,
            bank,
            isProcessed: false,
            hasTransaction: isTransaction,
          });

          result.newEmails++;
          if (isTransaction) result.newTransactions++;
          else result.bankingEmails++;
        } catch (err: any) {
          result.failed++;
          result.errors.push(`Message ${msg.id}: ${err.message}`);
        }
      }

      if (batch.length > 0) {
        await Email.insertMany(batch, { ordered: false });
      }

      if (transactionCount >= config.transactionLimit && bankingCount >= config.bankingEmailLimit) {
        result.reachedLimit = true;
        keepFetching = false;
      } else if (!isFirstSync) {
        keepFetching = false;
      } else if (!pageToken) {
        keepFetching = false;
      }
    }

    const now = new Date();
    await GmailAccount.findOneAndUpdate(
      { userId },
      {
        $set: {
          lastSync: now,
          syncMode: 'idle',
          lastConnected: now,
          status: 'connected',
        },
      },
    );

  } catch (err: any) {
    await GmailAccount.findOneAndUpdate(
      { userId },
      { $set: { syncMode: 'idle' } },
    ).catch(() => {});
    result.errors.push(err.message);
  }

  return result;
}
