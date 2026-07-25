const merchantRegistry: Record<string, { canonical: string; category?: string }> = {
  'google pay': { canonical: 'Google Pay', category: 'others' },
  'googlepay': { canonical: 'Google Pay' },
  'gpay': { canonical: 'Google Pay' },
  'phonepe': { canonical: 'PhonePe', category: 'others' },
  'phone pe': { canonical: 'PhonePe' },
  'paytm': { canonical: 'Paytm', category: 'others' },
  'paytm wallet': { canonical: 'Paytm' },
  'amazon pay': { canonical: 'Amazon Pay', category: 'others' },
  'amazonpay': { canonical: 'Amazon Pay' },
  'amazon': { canonical: 'Amazon', category: 'shopping' },
  'amazon.in': { canonical: 'Amazon' },
  'flipkart': { canonical: 'Flipkart', category: 'shopping' },
  'myntra': { canonical: 'Myntra', category: 'shopping' },
  'ajio': { canonical: 'AJIO', category: 'shopping' },
  'meesho': { canonical: 'Meesho', category: 'shopping' },
  'nykaa': { canonical: 'Nykaa', category: 'shopping' },
  'zepto': { canonical: 'Zepto', category: 'groceries' },
  'blinkit': { canonical: 'Blinkit', category: 'groceries' },
  'instamart': { canonical: 'Instamart', category: 'groceries' },
  'swiggy': { canonical: 'Swiggy', category: 'food_dining' },
  'zomato': { canonical: 'Zomato', category: 'food_dining' },
  'dominos': { canonical: "Domino's", category: 'food_dining' },
  'pizza hut': { canonical: 'Pizza Hut', category: 'food_dining' },
  'mcdonalds': { canonical: "McDonald's", category: 'food_dining' },
  'kfc': { canonical: 'KFC', category: 'food_dining' },
  'starbucks': { canonical: 'Starbucks', category: 'food_dining' },
  'uber eats': { canonical: 'Uber Eats', category: 'food_dining' },
  'uber': { canonical: 'Uber', category: 'transport' },
  'uber cab': { canonical: 'Uber' },
  'ola': { canonical: 'Ola', category: 'transport' },
  'ola cab': { canonical: 'Ola' },
  'rapido': { canonical: 'Rapido', category: 'transport' },
  'irctc': { canonical: 'IRCTC', category: 'transport' },
  'indian railway': { canonical: 'Indian Railways', category: 'transport' },
  'make my trip': { canonical: 'MakeMyTrip', category: 'travel' },
  'makemytrip': { canonical: 'MakeMyTrip' },
  'goibibo': { canonical: 'GoIbibo', category: 'travel' },
  'ixigo': { canonical: 'ixigo', category: 'travel' },
  'cleartrip': { canonical: 'ClearTrip', category: 'travel' },
  'oyo': { canonical: 'OYO', category: 'travel' },
  'airbnb': { canonical: 'Airbnb', category: 'travel' },
  'netflix': { canonical: 'Netflix', category: 'entertainment' },
  'amazon prime': { canonical: 'Amazon Prime', category: 'entertainment' },
  'prime video': { canonical: 'Amazon Prime' },
  'hotstar': { canonical: 'Disney+ Hotstar', category: 'entertainment' },
  'disney hotstar': { canonical: 'Disney+ Hotstar' },
  'spotify': { canonical: 'Spotify', category: 'entertainment' },
  'youtube premium': { canonical: 'YouTube Premium', category: 'entertainment' },
  'youtube music': { canonical: 'YouTube Music', category: 'entertainment' },
  'sony liv': { canonical: 'Sony LIV', category: 'entertainment' },
  'zee5': { canonical: 'ZEE5', category: 'entertainment' },
  'jio cinema': { canonical: 'JioCinema', category: 'entertainment' },
  'bookmyshow': { canonical: 'BookMyShow', category: 'entertainment' },
  'jio fiber': { canonical: 'JioFiber', category: 'bills_utilities' },
  'airtel': { canonical: 'Airtel', category: 'bills_utilities' },
  'airtel broadband': { canonical: 'Airtel Broadband' },
  'vi': { canonical: 'Vi', category: 'bills_utilities' },
  'vodafone idea': { canonical: 'Vi' },
  'bsnl': { canonical: 'BSNL', category: 'bills_utilities' },
  'jio': { canonical: 'Jio', category: 'bills_utilities' },
  'reliance jio': { canonical: 'Jio' },
  'tata power': { canonical: 'Tata Power', category: 'bills_utilities' },
  'adani electricity': { canonical: 'Adani Electricity', category: 'bills_utilities' },
  'bses': { canonical: 'BSES', category: 'bills_utilities' },
  'mahanagar gas': { canonical: 'Mahanagar Gas', category: 'bills_utilities' },
  'lpg': { canonical: 'LPG', category: 'bills_utilities' },
  'bigbasket': { canonical: 'BigBasket', category: 'groceries' },
  'grofers': { canonical: 'Grofers', category: 'groceries' },
  'dmart': { canonical: 'DMart', category: 'groceries' },
  'reliance fresh': { canonical: 'Reliance Fresh', category: 'groceries' },
  'nature basket': { canonical: 'Nature Basket', category: 'groceries' },
  'lic': { canonical: 'LIC', category: 'insurance' },
  'lic of india': { canonical: 'LIC' },
  'hdfc life': { canonical: 'HDFC Life', category: 'insurance' },
  'icici prudential': { canonical: 'ICICI Prudential', category: 'insurance' },
  'bajaj finserv': { canonical: 'Bajaj Finserv', category: 'insurance' },
  'tata aig': { canonical: 'Tata AIG', category: 'insurance' },
  'star health': { canonical: 'Star Health', category: 'insurance' },
  'policybazaar': { canonical: 'PolicyBazaar', category: 'insurance' },
  'zerodha': { canonical: 'Zerodha', category: 'investment' },
  'groww': { canonical: 'Groww', category: 'investment' },
  'angel one': { canonical: 'Angel One', category: 'investment' },
  'angel broking': { canonical: 'Angel One' },
  'upstox': { canonical: 'Upstox', category: 'investment' },
  'coin by zerodha': { canonical: 'Coin by Zerodha', category: 'investment' },
  'mutual fund': { canonical: 'Mutual Fund', category: 'investment' },
  'sip': { canonical: 'SIP', category: 'investment' },
  'nps': { canonical: 'NPS', category: 'investment' },
  'pfrda': { canonical: 'NPS' },
  'ppf': { canonical: 'PPF', category: 'investment' },
  'epfo': { canonical: 'EPFO', category: 'investment' },
  'pf': { canonical: 'PF' },
  'apollo': { canonical: 'Apollo', category: 'healthcare' },
  'apollo pharmacy': { canonical: 'Apollo Pharmacy' },
  'netmeds': { canonical: 'Netmeds', category: 'healthcare' },
  'pharmeasy': { canonical: 'PharmEasy', category: 'healthcare' },
  '1mg': { canonical: 'Tata 1mg', category: 'healthcare' },
  'practo': { canonical: 'Practo', category: 'healthcare' },
  'medlife': { canonical: 'MedLife', category: 'healthcare' },
  'byju': { canonical: 'Byju\'s', category: 'education' },
  'byjus': { canonical: 'Byju\'s' },
  'unacademy': { canonical: 'Unacademy', category: 'education' },
  'vedantu': { canonical: 'Vedantu', category: 'education' },
  'coursera': { canonical: 'Coursera', category: 'education' },
  'udemy': { canonical: 'Udemy', category: 'education' },
  'linkedin learning': { canonical: 'LinkedIn Learning', category: 'education' },
  'nike': { canonical: 'Nike', category: 'shopping' },
  'adidas': { canonical: 'Adidas', category: 'shopping' },
  'decentro': { canonical: 'Decentro', category: 'others' },
  'razorpay': { canonical: 'Razorpay', category: 'others' },
  'stripe': { canonical: 'Stripe', category: 'others' },
  'paypal': { canonical: 'PayPal', category: 'others' },
};

export interface NormalizationResult {
  canonical: string | null;
  category?: string;
  confidence: number;
}

export function normalizeMerchant(rawMerchant: string | null | undefined): NormalizationResult {
  if (!rawMerchant) return { canonical: null, confidence: 0 };

  const cleaned = rawMerchant.replace(/[^a-z0-9\s]/gi, '').toLowerCase().trim();

  const exact = merchantRegistry[cleaned];
  if (exact) return { canonical: exact.canonical, category: exact.category, confidence: 100 };

  for (const [alias, entry] of Object.entries(merchantRegistry)) {
    if (cleaned.includes(alias) || alias.includes(cleaned)) {
      return { canonical: entry.canonical, category: entry.category, confidence: 80 };
    }
  }

  return { canonical: rawMerchant, confidence: 0 };
}

export function getMerchantRegistry() {
  return merchantRegistry;
}

export function addMerchantAlias(alias: string, canonical: string, category?: string): void {
  merchantRegistry[alias.toLowerCase().trim()] = { canonical, category };
}
