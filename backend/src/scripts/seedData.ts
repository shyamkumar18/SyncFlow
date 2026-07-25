import mongoose from 'mongoose';
import { Transaction } from '../models/Transaction';
import { Category } from '../models/Category';

import 'dotenv/config';
const MONGO_URI = process.env.MONGODB_URI;
if (!MONGO_URI) {
  console.error('MONGODB_URI environment variable is required');
  process.exit(1);
}

const BANKS = ['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank', 'Kotak Mahindra Bank'];
const MERCHANTS_FOOD = ['Zomato', 'Swiggy', 'Dominos', 'McDonalds', 'Pizza Hut', 'Burger King', 'KFC', 'Starbucks'];
const MERCHANTS_SHOPPING = ['Amazon', 'Flipkart', 'Myntra', 'Ajio', 'Nykaa', 'Meesho', 'TataCliq'];
const MERCHANTS_TRAVEL = ['Uber', 'Ola', 'Rapido', 'MakeMyTrip', 'IRCTC', 'Goibibo', 'RedBus'];
const MERCHANTS_BILLS = ['Tata Power', 'BSES', 'Airtel', 'Jio', 'Vodafone', 'Adani Electricity'];
const MERCHANTS_FUEL = ['Indian Oil', 'BPCL', 'HPCL', 'Reliance Petroleum', 'Shell'];
const MERCHANTS_HEALTHCARE = ['Apollo Pharmacy', 'MedPlus', 'Practo', 'Pharmeasy', 'Fortis'];
const MERCHANTS_GROCERY = ['BigBasket', 'Blinkit', 'Zepto', 'Instamart', 'Reliance Smart', 'DMart'];
const MERCHANTS_ENTERTAINMENT = ['Netflix', 'Amazon Prime', 'Hotstar', 'Spotify', 'BookMyShow', 'Zomato Live'];

const EXPENSE_CATEGORIES = [
  { name: 'Food & Dining', color: '#EF4444' },
  { name: 'Transport', color: '#F59E0B' },
  { name: 'Shopping', color: '#EC4899' },
  { name: 'Entertainment', color: '#8B5CF6' },
  { name: 'Bills & Utilities', color: '#3B82F6' },
  { name: 'Healthcare', color: '#10B981' },
  { name: 'Education', color: '#6366F1' },
  { name: 'Housing', color: '#F97316' },
  { name: 'Travel', color: '#06B6D4' },
];

const INCOME_CATEGORIES = [
  { name: 'Salary', color: '#0D6B4F' },
  { name: 'Refund', color: '#10B981' },
  { name: 'Investment', color: '#F5A623' },
];

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randAmount(min: number, max: number, decimals = 2): number {
  const val = Math.random() * (max - min) + min;
  return Number(val.toFixed(decimals));
}

function makeDate(year: number, month: number, day: number): Date {
  return new Date(year, month - 1, day, randInt(6, 22), randInt(0, 59), randInt(0, 59));
}

interface TxnTemplate {
  type: 'debit' | 'credit';
  categoryName: string;
  merchant?: string;
  description: string;
  amount: [number, number];
  bank?: string;
  count: number;
  tags?: string[];
}

function generateMonthTransactions(year: number, month: number, catMap: Record<string, string>, bankCycle: number): Array<Record<string, any>> {
  const txns: Array<Record<string, any>> = [];
  const daysInMonth = new Date(year, month, 0).getDate();

  const salaryDay = Math.min(28, daysInMonth);

  const monthlySalary = 85000 + randInt(0, 30000);
  const rentAmount = 22000 + randInt(0, 5000);

  const templates: TxnTemplate[] = [
    { type: 'credit', categoryName: 'Salary', description: 'Monthly Salary', amount: [monthlySalary, monthlySalary + 10000], count: 1 },
    { type: 'debit', categoryName: 'Housing', merchant: 'Housing', description: 'Rent Payment', amount: [rentAmount, rentAmount], count: 1 },
    { type: 'debit', categoryName: 'Bills & Utilities', merchant: pick(MERCHANTS_BILLS), description: 'Electricity Bill', amount: [1200, 4500], count: 1 },
    { type: 'debit', categoryName: 'Bills & Utilities', merchant: pick(MERCHANTS_BILLS), description: 'Broadband / Phone Recharge', amount: [500, 1500], count: 2 },
    { type: 'debit', categoryName: 'Food & Dining', merchant: pick(MERCHANTS_FOOD), description: 'Food Order', amount: [150, 1500], count: 6 },
    { type: 'debit', categoryName: 'Food & Dining', merchant: pick(MERCHANTS_GROCERY), description: 'Grocery Purchase', amount: [800, 4000], count: 3 },
    { type: 'debit', categoryName: 'Transport', merchant: pick(MERCHANTS_TRAVEL), description: 'Cab Ride', amount: [80, 600], count: 5 },
    { type: 'debit', categoryName: 'Transport', merchant: pick(MERCHANTS_FUEL), description: 'Fuel', amount: [1500, 5000], count: 3 },
    { type: 'debit', categoryName: 'Shopping', merchant: pick(MERCHANTS_SHOPPING), description: 'Online Shopping', amount: [500, 8000], count: 3 },
    { type: 'debit', categoryName: 'Entertainment', merchant: pick(MERCHANTS_ENTERTAINMENT), description: 'Entertainment / Subscription', amount: [100, 2000], count: 3 },
    { type: 'debit', categoryName: 'Healthcare', merchant: pick(MERCHANTS_HEALTHCARE), description: 'Pharmacy / Health', amount: [200, 2500], count: 2 },
    { type: 'debit', categoryName: 'Shopping', description: 'Credit Card Payment', amount: [15000, 40000], count: 1 },
  ];

  const extraDebits = [
    { merchant: pick(MERCHANTS_FOOD), desc: 'Weekend Dining', min: 500, max: 3000 },
    { merchant: pick(MERCHANTS_GROCERY), desc: 'Weekly Groceries', min: 600, max: 2500 },
    { merchant: pick(MERCHANTS_TRAVEL), desc: 'Intercity Travel', min: 300, max: 2000 },
    { merchant: pick(MERCHANTS_SHOPPING), desc: 'Apparel Purchase', min: 1000, max: 6000 },
    { merchant: 'ATM Withdrawal', desc: 'ATM Cash Withdrawal', min: 2000, max: 10000 },
    { merchant: pick(MERCHANTS_FUEL), desc: 'Fuel Refill', min: 1000, max: 4000 },
  ];

  if (month === 1 || month === 6 || month === 12) {
    templates.push({ type: 'debit', categoryName: 'Travel', merchant: pick(MERCHANTS_TRAVEL), description: 'Holiday Booking', amount: [5000, 25000], count: 1 });
  }

  if (month % 3 === 0) {
    templates.push({ type: 'credit', categoryName: 'Investment', description: 'Dividend / Interest', amount: [500, 5000], count: 1 });
  }

  if (month % 4 === 0) {
    templates.push({ type: 'credit', categoryName: 'Refund', description: 'Cashback / Refund', amount: [200, 3000], count: 1 });
  }

  if (month % 2 === 0) {
    templates.push({ type: 'debit', categoryName: 'Education', description: 'Online Course / Learning', amount: [1000, 10000], count: 1 });
  }

  for (const tpl of templates) {
    for (let i = 0; i < tpl.count; i++) {
      const day = tpl.categoryName === 'Salary' ? salaryDay : randInt(5, daysInMonth);
      const amount = randAmount(tpl.amount[0], tpl.amount[1]);
      const bank = tpl.bank || BANKS[(day + bankCycle + i) % BANKS.length];

      txns.push({
        userId: undefined,
        amount,
        currency: 'INR',
        type: tpl.type,
        date: makeDate(year, month, day),
        description: tpl.merchant ? `${tpl.description} at ${tpl.merchant}` : tpl.description,
        merchant: tpl.merchant || undefined,
        bank,
        category: catMap[tpl.categoryName] || undefined,
        autoCategory: tpl.categoryName,
        status: 'success',
        isManual: true,
        tags: tpl.tags || [tpl.categoryName.toLowerCase().replace(/\s+/g, '_')],
      });
    }
  }

  for (let e = 0; e < 2; e++) {
    const extra = pick(extraDebits);
    const day = randInt(8, daysInMonth);
    const amount = randAmount(extra.min, extra.max);
    const category = catMap['Food & Dining'];
    const bank = BANKS[(day + bankCycle + e) % BANKS.length];
    txns.push({
      userId: undefined,
      amount,
      currency: 'INR',
      type: 'debit',
      date: makeDate(year, month, day),
      description: `${extra.desc}${extra.merchant !== 'ATM Withdrawal' ? ` at ${extra.merchant}` : ''}`,
      merchant: extra.merchant,
      bank,
      category,
      autoCategory: extra.desc.includes('Grocery') || extra.desc.includes('Dining') ? 'Food & Dining'
        : extra.desc.includes('Travel') ? 'Travel'
        : extra.desc.includes('Fuel') || extra.desc.includes('Cab') ? 'Transport'
        : extra.desc.includes('Apparel') || extra.desc.includes('Shopping') ? 'Shopping'
        : extra.desc.includes('ATM') ? 'Others'
        : 'Food & Dining',
      status: 'success',
      isManual: true,
    });
  }

  return txns;
}

async function main() {
  const userIdHex = process.argv[2];
  if (!userIdHex) {
    console.error('Usage: npx tsx src/scripts/seedData.ts <userId>');
    console.error('  Get userId from auth/me endpoint after login');
    process.exit(1);
  }
  const userId = new mongoose.Types.ObjectId(userIdHex);

  await mongoose.connect(MONGO_URI);
  console.log('Connected to MongoDB');
  console.log(`Seeding data for userId: ${userId}`);

  const existing = await Transaction.countDocuments({ userId });
  if (existing > 100) {
    console.log(`User already has ${existing} transactions, skipping seed.`);
    await mongoose.disconnect();
    return;
  }

  let catMap: Record<string, string> = {};

  const existingCats = await Category.find({ userId }).lean();
  if (existingCats.length === 0) {
    console.log('Creating user categories...');
    const allCats = [
      ...EXPENSE_CATEGORIES.map(c => ({ userId, name: c.name, type: 'expense' as const, icon: '', color: c.color, isDefault: false, sortOrder: 0, isActive: true })),
      ...INCOME_CATEGORIES.map(c => ({ userId, name: c.name, type: 'income' as const, icon: '', color: c.color, isDefault: false, sortOrder: 0, isActive: true })),
    ];
    const inserted = await Category.insertMany(allCats);
    for (const c of inserted) {
      catMap[c.name] = c._id.toString();
    }
    console.log(`Created ${inserted.length} categories`);
  } else {
    for (const c of existingCats) {
      catMap[c.name] = (c as any)._id.toString();
    }
    console.log(`Using ${existingCats.length} existing categories`);
  }

  const allTransactions: Array<Record<string, any>> = [];
  let bankCycle = 0;

  for (let month = 1; month <= 12; month++) {
    const monthTxns = generateMonthTransactions(2026, month, catMap, bankCycle);
    for (const txn of monthTxns) {
      txn.userId = userId;
    }
    allTransactions.push(...monthTxns);
    bankCycle += 7;
    console.log(`  Generated ${monthTxns.length} transactions for month ${month}`);
  }

  console.log(`Total transactions to insert: ${allTransactions.length}`);

  const batchSize = 500;
  for (let i = 0; i < allTransactions.length; i += batchSize) {
    const batch = allTransactions.slice(i, i + batchSize);
    await Transaction.insertMany(batch, { ordered: false });
    console.log(`  Inserted batch ${i / batchSize + 1} (${batch.length} txns)`);
  }

  await mongoose.disconnect();
  console.log(`\nDone! Seeded ${allTransactions.length} transactions across 12 months.`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
