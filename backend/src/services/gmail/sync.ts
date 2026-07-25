import { google } from 'googleapis';
import { Email } from '../../models/Email';
import { GmailAccount } from '../../models/GmailAccount';
import { getAccessToken } from '../../modules/email/providers/gmail/oauth';
import { getBankDetector } from '../../modules/bankDetection';
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
    const accessToken = await getAccessToken(userId);

    const gmailAccount = await GmailAccount.findOne({ userId }).lean();
    if (!gmailAccount) {
      throw new Error('Gmail account not connected. Please connect Gmail first.');
    }

    const isFirstSync = !gmailAccount.lastSync;
    result.syncMode = isFirstSync ? 'first_sync' : 'incremental';

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    let query = BANK_QUERY;
    if (!isFirstSync) {
      const lastSyncDate = gmailAccount.lastSync!;
      const datePart = lastSyncDate.toISOString().split('T')[0].replace(/-/g, '/');
      query = `${BANK_QUERY} after:${datePart}`;
    }

    let pageToken: string | undefined;
    let transactionCount = 0;

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

      const messageIds = messages.map(m => m.id!).filter(Boolean);
      const existingEmails = await Email.find({
        userId,
        gmailMessageId: { $in: messageIds },
      }).lean();
      const existingIds = new Set(existingEmails.map((e: any) => e.gmailMessageId));

      const newMessages = messages.filter(m => m.id && !existingIds.has(m.id));
      result.processed += messages.length - newMessages.length;

      const batch: any[] = [];

      const fetchDetail = async (msgId: string) => {
        try {
          const detail = await gmail.users.messages.get({
            userId: 'me',
            id: msgId,
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

          const detection = getBankDetector().detect({
            from,
            subject,
            body: `${snippet} ${bodyText} ${body}`,
          });

          if (detection.providerId === 'unknown') {
            result.processed++;
            return;
          }

          if (transactionCount >= config.transactionLimit) {
            return;
          }
          transactionCount++;

          batch.push({
            userId,
            gmailMessageId: msgId,
            threadId: detail.data.threadId || '',
            from,
            to,
            subject,
            body,
            bodyText,
            snippet,
            receivedAt,
            category: 'transaction',
            bank: detection.providerName,
            isProcessed: false,
            hasTransaction: true,
          });

          result.newEmails++;
          result.newTransactions++;
        } catch (err: any) {
          result.failed++;
          result.errors.push(`Message ${msgId}: ${err.message}`);
        }
      };

      const concurrency = 5;
      for (let i = 0; i < newMessages.length; i += concurrency) {
        const chunk = newMessages.slice(i, i + concurrency);
        await Promise.all(chunk.map(m => fetchDetail(m.id!)));
      }

      if (batch.length > 0) {
        await Email.insertMany(batch, { ordered: false });
      }

      if (transactionCount >= config.transactionLimit) {
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
