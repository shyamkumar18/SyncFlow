import { Email } from '../../models/Email';
import { Transaction } from '../../models/Transaction';
import { getParser } from './bankParsers';
import { ExtractedData } from './extractors';

export interface ParseResult {
  processed: number;
  transactionsCreated: number;
  errors: number;
}

export async function parseUnprocessedEmails(userId?: string): Promise<ParseResult> {
  const result: ParseResult = { processed: 0, transactionsCreated: 0, errors: 0 };

  const filter: any = { isProcessed: false, hasTransaction: true };
  if (userId) filter.userId = userId;

  const emails = await Email.find(filter).lean();
  if (emails.length === 0) return result;

  for (const email of emails) {
    try {
      const text = `${email.subject} ${email.bodyText || ''} ${email.body || ''} ${email.snippet || ''}`;
      const parser = getParser(email.bank);
      const extracted: Partial<ExtractedData> = parser(text);

      if (extracted.amount && extracted.type) {
        const transactionData: Record<string, any> = {
          userId: email.userId,
          emailId: email._id,
          amount: extracted.amount,
          type: extracted.type,
          date: extracted.date || email.receivedAt,
          time: extracted.time || undefined,
          description: extracted.description || email.subject.substring(0, 200),
          merchant: extracted.merchant || undefined,
          sender: extracted.sender || undefined,
          receiver: extracted.receiver || undefined,
          balance: extracted.balance || undefined,
          upiId: extracted.upiId || undefined,
          referenceNumber: extracted.referenceNumber || undefined,
          bank: email.bank,
          cardType: extracted.cardType || undefined,
          status: extracted.status || 'success',
        };

        const transaction = await Transaction.create(transactionData);

        await Email.findByIdAndUpdate(email._id, {
          $set: { isProcessed: true, transactionId: transaction._id },
        });

        result.transactionsCreated++;
      } else {
        // Mark as processed even if no transaction could be extracted
        await Email.findByIdAndUpdate(email._id, {
          $set: { isProcessed: true },
        });
      }

      result.processed++;
    } catch (err) {
      result.errors++;
      console.error(`Parse error for email ${email._id}:`, err);
    }
  }

  return result;
}

export async function parseSingleEmail(emailId: string): Promise<boolean> {
  const email = await Email.findById(emailId).lean();
  if (!email) return false;

  const text = `${email.subject} ${email.bodyText || ''} ${email.body || ''} ${email.snippet || ''}`;
  const parser = getParser(email.bank);
  const extracted: Partial<ExtractedData> = parser(text);

  if (extracted.amount && extracted.type) {
    const transactionData: Record<string, any> = {
      userId: email.userId,
      emailId: email._id,
      amount: extracted.amount,
      type: extracted.type,
      date: extracted.date || email.receivedAt,
      time: extracted.time || undefined,
      description: extracted.description || email.subject.substring(0, 200),
      merchant: extracted.merchant || undefined,
      sender: extracted.sender || undefined,
      receiver: extracted.receiver || undefined,
      balance: extracted.balance || undefined,
      upiId: extracted.upiId || undefined,
      referenceNumber: extracted.referenceNumber || undefined,
      bank: email.bank,
      cardType: extracted.cardType || undefined,
      status: extracted.status || 'success',
    };

    const transaction = await Transaction.create(transactionData);
    await Email.findByIdAndUpdate(email._id, {
      $set: { isProcessed: true, transactionId: transaction._id },
    });
  } else {
    await Email.findByIdAndUpdate(email._id, {
      $set: { isProcessed: true },
    });
  }

  return true;
}
