import { Email } from '../../models/Email';
import { Transaction } from '../../models/Transaction';
import { ReviewItem } from '../../models/ReviewItem';
import { getParser } from './bankParsers';
import { getBankDetector } from '../../modules/bankDetection';
import { validateTransaction } from '../../modules/validation';
import { parseGeneric } from '../../modules/bankDetection';
import { computeFingerprint } from '../../modules/intelligence/duplicateDetection';
import { normalizeMerchant } from '../../modules/intelligence/merchantNormalizer';
import { categorize } from '../../modules/intelligence/autoCategorizer';
import { detectPromotion } from '../../modules/intelligence/promotionDetector';
import { findAndMergeDuplicate } from '../../modules/intelligence/dedupEngine';

const REVIEW_CONFIDENCE_THRESHOLD = 40;
const PROMOTION_GATE_THRESHOLD = 50;

export interface ParseResult {
  processed: number;
  transactionsCreated: number;
  skipped: number;
  errors: number;
  duplicatesFound: number;
  sentForReview: number;
  promotionsRejected: number;
}

async function processEmail(email: any, userId: string): Promise<{
  created: boolean;
  duplicate: boolean;
  review: boolean;
  promotion: boolean;
  merged: boolean;
}> {
  const subject = email.subject || '';
  const bodyText = email.bodyText || '';
  const body = email.body || '';
  const snippet = email.snippet || '';
  const text = `${subject} ${bodyText} ${body} ${snippet}`;

  const promotionCheck = detectPromotion({ subject, bodyText, body, from: email.from });
  if (promotionCheck.isPromotion && promotionCheck.confidence >= PROMOTION_GATE_THRESHOLD) {
    await Email.findByIdAndUpdate(email._id, {
      $set: { isProcessed: true, hasTransaction: false, category: 'unknown' },
    });
    return { created: false, duplicate: false, review: false, promotion: true, merged: false };
  }

  let bank = email.bank;
  if (bank === 'Unknown' || !bank) {
    const detection = getBankDetector().detect({
      from: email.from || '',
      subject: email.subject || '',
      body: text,
    });
    if (detection.providerId !== 'unknown') {
      bank = detection.providerName;
      await Email.findByIdAndUpdate(email._id, { $set: { bank } });
    }
  }

  const parser = getParser(bank);
  const extracted: Record<string, any> = parser(text);

  if (!extracted.amount || !extracted.type) {
    await Email.findByIdAndUpdate(email._id, { $set: { isProcessed: true } });
    return { created: false, duplicate: false, review: false, promotion: false, merged: false };
  }

  const parsed = parseGeneric(text);
  const validation = validateTransaction(parsed, subject, `${bodyText} ${body} ${snippet}`);

  if (!validation.valid) {
    await Email.findByIdAndUpdate(email._id, {
      $set: { isProcessed: true, hasTransaction: false },
    });
    return { created: false, duplicate: false, review: false, promotion: false, merged: false };
  }

  const dupResult = await findAndMergeDuplicate(
    userId,
    {
      amount: extracted.amount,
      type: extracted.type,
      date: extracted.date || email.receivedAt,
      time: extracted.time,
      merchant: extracted.merchant,
      referenceNumber: extracted.referenceNumber,
      upiId: extracted.upiId,
      bank,
      description: extracted.description || email.subject,
      sender: extracted.sender,
      receiver: extracted.receiver,
      emailThreadId: email.threadId,
    },
    email._id.toString(),
  );

  if (dupResult.isDuplicate) {
    await Email.findByIdAndUpdate(email._id, {
      $set: {
        isProcessed: true,
        hasTransaction: true,
        transactionId: dupResult.existingTransactionId,
      },
    });
    return { created: false, duplicate: true, review: false, promotion: false, merged: dupResult.merged };
  }

  const normResult = normalizeMerchant(extracted.merchant);
  const catResult = categorize({
    merchant: normResult.canonical || extracted.merchant,
    description: extracted.description || email.subject,
    bank,
    amount: extracted.amount,
    type: extracted.type,
  });

  const fingerprint = computeFingerprint({
    amount: extracted.amount,
    date: extracted.date || email.receivedAt,
    type: extracted.type,
    merchant: extracted.merchant,
    referenceNumber: extracted.referenceNumber,
    description: extracted.description || email.subject,
    bank,
  });

  const transactionData: Record<string, any> = {
    userId,
    emailId: email._id,
    amount: extracted.amount,
    type: extracted.type,
    date: extracted.date || email.receivedAt,
    time: extracted.time || undefined,
    description: extracted.description || email.subject.substring(0, 200),
    merchant: normResult.canonical || extracted.merchant || undefined,
    merchantRaw: extracted.merchant || undefined,
    sender: extracted.sender || undefined,
    receiver: extracted.receiver || undefined,
    balance: extracted.balance || undefined,
    upiId: extracted.upiId || undefined,
    referenceNumber: extracted.referenceNumber || undefined,
    bank,
    cardType: extracted.cardType || undefined,
    status: extracted.status || 'success',
    transactionFingerprint: fingerprint,
    normalized: normResult.confidence > 0,
    autoCategory: catResult.category || undefined,
    categoryConfidence: catResult.confidence || 0,
  };

  const confidence = validation.confidence || 0;

  if (confidence < REVIEW_CONFIDENCE_THRESHOLD) {
    const reviewItem = await ReviewItem.create({
      userId,
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
      bank,
      confidence,
      detectionDetails: (validation.breakdown || []).join(', ') || 'Low confidence transaction',
    });

    await Email.findByIdAndUpdate(email._id, {
      $set: { isProcessed: true, hasTransaction: false },
    });

    return { created: false, duplicate: false, review: true, promotion: false, merged: false };
  }

  const transaction = await Transaction.create(transactionData);

  await Email.findByIdAndUpdate(email._id, {
    $set: { isProcessed: true, transactionId: transaction._id, hasTransaction: true },
  });

  return { created: true, duplicate: false, review: false, promotion: false, merged: false };
}

export async function parseUnprocessedEmails(userId?: string): Promise<ParseResult> {
  const result: ParseResult = {
    processed: 0,
    transactionsCreated: 0,
    skipped: 0,
    errors: 0,
    duplicatesFound: 0,
    sentForReview: 0,
    promotionsRejected: 0,
  };

  const filter: any = { isProcessed: false, hasTransaction: true };
  if (userId) filter.userId = userId;

  const emails = await Email.find(filter).lean();
  if (emails.length === 0) return result;

  for (const email of emails) {
    try {
      const outcome = await processEmail(email, email.userId.toString());
      result.processed++;
      if (outcome.created) result.transactionsCreated++;
      if (outcome.duplicate) result.duplicatesFound++;
      if (outcome.review) result.sentForReview++;
      if (outcome.promotion) result.promotionsRejected++;
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

  try {
    const outcome = await processEmail(email, email.userId.toString());
    return true;
  } catch (err) {
    console.error(`Parse error for email ${emailId}:`, err);
    return false;
  }
}
