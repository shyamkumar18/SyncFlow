import mongoose from 'mongoose';
import { config } from '../config/env';
import { Transaction } from '../models/Transaction';
import { Email } from '../models/Email';
import { ReviewItem } from '../models/ReviewItem';
import { detectPromotion } from '../modules/intelligence/promotionDetector';
import { mergeExistingDuplicates } from '../modules/intelligence/dedupEngine';

interface MigrationStats {
  totalTransactions: number;
  promotionsRemoved: number;
  duplicatesMerged: number;
  duplicatesRemoved: number;
  emailsUpdated: number;
  errors: string[];
}

async function removePromotions(): Promise<number> {
  const transactions = await Transaction.find({}).lean();
  let removed = 0;

  for (const t of transactions) {
    const text = [
      t.description || '',
      t.merchant || '',
      t.merchantRaw || '',
    ].join(' ');

    const email = t.emailId
      ? await Email.findById(t.emailId).lean()
      : null;

    const result = detectPromotion({
      subject: email?.subject || t.description || '',
      bodyText: email?.bodyText || '',
      body: email?.body || '',
    });

    if (result.isPromotion && result.confidence >= 50) {
      await Transaction.findByIdAndDelete(t._id);
      if (email) {
        await Email.findByIdAndUpdate(email._id, {
          $set: { hasTransaction: false, isProcessed: true },
          $unset: { transactionId: '' },
        });
      }
      removed++;
    }
  }

  return removed;
}

async function runMigration(): Promise<MigrationStats> {
  const stats: MigrationStats = {
    totalTransactions: 0,
    promotionsRemoved: 0,
    duplicatesMerged: 0,
    duplicatesRemoved: 0,
    emailsUpdated: 0,
    errors: [],
  };

  console.log('=== SyncFlow Dedup Migration ===\n');

  await mongoose.connect(config.mongodbUri);
  console.log('Connected to MongoDB:', mongoose.connection.db?.databaseName);

  stats.totalTransactions = await Transaction.countDocuments({});
  console.log(`Total transactions before migration: ${stats.totalTransactions}\n`);

  console.log('Phase 1: Removing promotional/fake transactions...');
  try {
    stats.promotionsRemoved = await removePromotions();
    console.log(`  Promotional transactions removed: ${stats.promotionsRemoved}`);
  } catch (err: any) {
    stats.errors.push(`Promotion removal failed: ${err.message}`);
    console.error(`  Error: ${err.message}`);
  }

  console.log('\nPhase 2: Merging duplicate transactions...');
  try {
    const mergeResult = await mergeExistingDuplicates();
    stats.duplicatesMerged = mergeResult.merged;
    stats.duplicatesRemoved = mergeResult.removed;
    console.log(`  Duplicates merged: ${mergeResult.merged}`);
    console.log(`  Duplicate documents removed: ${mergeResult.removed}`);
  } catch (err: any) {
    stats.errors.push(`Dedup merge failed: ${err.message}`);
    console.error(`  Error: ${err.message}`);
  }

  const afterTotal = await Transaction.countDocuments({});
  console.log(`\nTotal transactions after migration: ${afterTotal}`);
  console.log(`Total removed: ${stats.totalTransactions - afterTotal}`);

  if (stats.errors.length > 0) {
    console.log(`\nErrors (${stats.errors.length}):`);
    for (const e of stats.errors) {
      console.log(`  - ${e}`);
    }
  }

  console.log('\n=== Migration Complete ===');

  await mongoose.disconnect();
  return stats;
}

runMigration()
  .then((stats) => {
    console.log(JSON.stringify(stats, null, 2));
    process.exit(0);
  })
  .catch((err) => {
    console.error('Migration failed:', err);
    process.exit(1);
  });
