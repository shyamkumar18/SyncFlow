import { google } from 'googleapis';
import { Email } from '../../models/Email';
import { Transaction } from '../../models/Transaction';
import { getStoredAuth } from '../google';
import { detectBank } from './bankDetection';
import { categorizeEmail } from './categorizer';
import { parseUnprocessedEmails } from '../parser/engine';

const BANK_QUERY = '("debited" OR "credited" OR "transaction" OR "upi" OR "trf" OR "withdrawn" OR "deposited" OR "statement" OR "emi" OR "refund" OR "card" OR "atm" OR "balance" OR "account" OR "loan" OR "credit card" OR "debit card" OR "payment")';

export interface SyncResult {
  processed: number;
  newEmails: number;
  newTransactions: number;
  failed: number;
  errors: string[];
}

export async function syncGmailEmails(
  userId: string,
  maxResults: number = 50,
): Promise<SyncResult> {
  const result: SyncResult = { processed: 0, newEmails: 0, newTransactions: 0, failed: 0, errors: [] };

  try {
    const auth = await getStoredAuth(userId);
    if (!auth) {
      throw new Error('Google authentication not found. Please reconnect Gmail.');
    }

    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({
      access_token: auth.accessToken,
      refresh_token: auth.refreshToken,
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    const listResponse = await gmail.users.messages.list({
      userId: 'me',
      q: BANK_QUERY,
      maxResults: Math.min(maxResults, 500),
    });

    const messages = listResponse.data.messages || [];
    if (messages.length === 0) {
      return result;
    }

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

        // Extract body
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

        // Detect bank
        const { bank } = detectBank(from, subject, snippet || bodyText);

        // Skip if not a known bank (low confidence)
        if (bank === 'Unknown') {
          result.processed++;
          continue;
        }

        // Categorize email
        const category = categorizeEmail(subject, `${bodyText} ${body}`);

        const email = await Email.create({
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
          hasTransaction: category !== 'statement' && category !== 'unknown',
        });

        result.newEmails++;

        if (email.hasTransaction) {
          result.newTransactions++;
        }
      } catch (err: any) {
        result.failed++;
        result.errors.push(`Message ${msg.id}: ${err.message}`);
      }
    }
  } catch (err: any) {
    result.errors.push(err.message);
  }

  // Run parser on unprocessed emails
  const parseResult = await parseUnprocessedEmails(userId);
  result.newTransactions += parseResult.transactionsCreated;

  return result;
}
