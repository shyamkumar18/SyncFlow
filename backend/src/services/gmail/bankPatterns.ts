export interface BankPattern {
  name: string;
  domains: string[];
  emailPatterns: RegExp[];
  keywords: RegExp[];
}

export const bankPatterns: BankPattern[] = [
  {
    name: 'HDFC Bank',
    domains: ['hdfcbank.com', 'hdfc.com'],
    emailPatterns: [
      /alert@(?:alerts?\.)?hdfcbank\.com/i,
      /credit\.card@hdfcbank\.com/i,
      /debit\.card@hdfcbank\.com/i,
    ],
    keywords: [
      /hdfc/i, /hdfc bank/i,
    ],
  },
  {
    name: 'ICICI Bank',
    domains: ['icicibank.com', 'icici.com'],
    emailPatterns: [
      /alert@icicibank\.com/i,
      /creditcard@icicibank\.com/i,
      /accounts@icicibank\.com/i,
    ],
    keywords: [
      /icici/i, /icici bank/i,
    ],
  },
  {
    name: 'State Bank of India',
    domains: ['sbi.co.in', 'sbicard.com', 'onlinesbi.com'],
    emailPatterns: [
      /alert@sbi\.co\.in/i,
      /alerts@sbi\.co\.in/i,
      /transaction@sbicard\.com/i,
    ],
    keywords: [
      /sbi/i, /state bank/i,
    ],
  },
  {
    name: 'Axis Bank',
    domains: ['axisbank.com'],
    emailPatterns: [
      /alert@axisbank\.com/i,
      /creditcard@axisbank\.com/i,
      /debitcard@axisbank\.com/i,
    ],
    keywords: [
      /axis/i, /axis bank/i,
    ],
  },
  {
    name: 'Kotak Mahindra Bank',
    domains: ['kotak.com', 'kotakmahindra.com'],
    emailPatterns: [
      /alert@kotak\.com/i,
      /creditcard@kotak\.com/i,
    ],
    keywords: [
      /kotak/i, /kotak mahindra/i,
    ],
  },
  {
    name: 'Yes Bank',
    domains: ['yesbank.in', 'yesbank.com'],
    emailPatterns: [
      /alert@yesbank\.in/i,
      /transaction@yesbank\.in/i,
    ],
    keywords: [
      /yes bank/i,
    ],
  },
  {
    name: 'Bank of Baroda',
    domains: ['bankofbaroda.com', 'bob.com'],
    emailPatterns: [
      /alert@bankofbaroda\.com/i,
    ],
    keywords: [
      /baroda/i, /bank of baroda/i,
    ],
  },
  {
    name: 'IndusInd Bank',
    domains: ['indusind.com', 'indusindbank.com'],
    emailPatterns: [
      /alert@indusind\.com/i,
    ],
    keywords: [
      /indusind/i,
    ],
  },
  {
    name: 'RBL Bank',
    domains: ['rblbank.com'],
    emailPatterns: [
      /alert@rblbank\.com/i,
    ],
    keywords: [
      /rbl bank/i,
    ],
  },
  {
    name: 'Federal Bank',
    domains: ['federalbank.co.in'],
    emailPatterns: [
      /alert@federalbank\.co\.in/i,
    ],
    keywords: [
      /federal bank/i,
    ],
  },
  {
    name: 'American Express',
    domains: ['americanexpress.com', 'aexp.com'],
    emailPatterns: [
      /alert@americanexpress\.com/i,
      /transaction@americanexpress\.com/i,
    ],
    keywords: [
      /american express/i, /amex/i,
    ],
  },
];
