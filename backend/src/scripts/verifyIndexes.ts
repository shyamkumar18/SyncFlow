import mongoose from 'mongoose';
import { config } from '../config/env';

const modelsToVerify = [
  {
    name: 'User',
    expectedIndexes: [
      { keys: { email: 1 }, options: { unique: true } },
      { keys: { googleId: 1 }, options: { unique: true, sparse: true } },
    ],
  },
  {
    name: 'Transaction',
    expectedIndexes: [
      { keys: { userId: 1, date: -1 } },
      { keys: { userId: 1, type: 1 } },
      { keys: { userId: 1, bank: 1 } },
      { keys: { userId: 1, category: 1 } },
      { keys: { userId: 1, status: 1 } },
      { keys: { userId: 1, merchant: 1 } },
      { keys: { userId: 1, date: -1, type: 1 } },
      { keys: { transactionFingerprint: 1 }, options: { sparse: true } },
    ],
  },
  {
    name: 'Email',
    expectedIndexes: [
      { keys: { userId: 1, gmailMessageId: 1 }, options: { unique: true } },
      { keys: { userId: 1, receivedAt: -1 } },
      { keys: { userId: 1, category: 1 } },
      { keys: { userId: 1, bank: 1 } },
      { keys: { userId: 1, isProcessed: 1 } },
    ],
  },
  {
    name: 'GmailAccount',
    expectedIndexes: [
      { keys: { userId: 1 }, options: { unique: true } },
      { keys: { googleId: 1 } },
    ],
  },
];

async function verifyIndexes() {
  await mongoose.connect(config.mongodbUri);
  console.log('Connected to MongoDB');
  console.log('Database:', mongoose.connection.db?.databaseName);
  console.log();

  let allPassed = true;

  for (const model of modelsToVerify) {
    console.log(`\n=== ${model.name} ===`);
    try {
      const collection = mongoose.connection.collection(model.name.toLowerCase() + 's');
      const existingIndexes = await collection.indexes();
      const existingKeys = existingIndexes.map((idx) => ({
        key: idx.key,
        options: { unique: !!idx.unique, sparse: !!idx.sparse },
      }));

      for (const expected of model.expectedIndexes) {
        const match = existingKeys.find((existing) => {
          const keyMatch = Object.keys(expected.keys).every(
            (k) => existing.key[k] === expected.keys[k],
          ) && Object.keys(expected.keys).length === Object.keys(existing.key).length;
          if (!keyMatch) return false;
          if (expected.options?.unique && !existing.options.unique) return false;
          return true;
        });

        if (match) {
          console.log(`  ✓ ${JSON.stringify(expected.keys)}`);
        } else {
          console.log(`  ✗ MISSING: ${JSON.stringify(expected.keys)}`);
          allPassed = false;
        }
      }
    } catch (err: any) {
      console.log(`  ✗ Error: ${err.message}`);
      allPassed = false;
    }
  }

  console.log(`\n${allPassed ? '✓ All indexes verified' : '✗ Some indexes are missing'}`);
  await mongoose.disconnect();
  process.exit(allPassed ? 0 : 1);
}

verifyIndexes();
