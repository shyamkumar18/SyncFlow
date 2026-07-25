import { useState } from 'react';

const articles = [
  {
    id: 'understand-expenses',
    title: 'Understanding Your Expenses',
    category: 'Basics',
    readTime: '4 min',
    content: `Tracking where your money goes is the first step toward financial freedom. Start by categorizing every expense — fixed (rent, EMIs, subscriptions) vs variable (food, entertainment, shopping). $yncFlow automatically categorizes transactions from your banking emails so you can see exactly what you're spending on each month without manual data entry.`,
    tips: [
      'Review your expense categories monthly to spot trends',
      'Aim for the 50/30/20 rule: 50% needs, 30% wants, 20% savings',
      'Use the Analytics page to see which categories consume the most',
    ],
  },
  {
    id: 'control-spending',
    title: 'How to Control Impulse Spending',
    category: 'Behavior',
    readTime: '5 min',
    content: `That urge to buy something you don't really need is normal — but it doesn't have to control you. Here's how to pause before you purchase.`,
    tips: [
      'The 24-hour rule: Wait one day before buying anything non-essential',
      'Unsubscribe from promotional emails that trigger FOMO',
      'Use the Budgets page to set monthly limits on discretionary categories',
      'Track every expense — awareness alone reduces spending by up to 20%',
      'Ask yourself: "Will this matter in a week?" before checking out',
    ],
  },
  {
    id: 'save-money',
    title: 'Smart Saving Strategies',
    category: 'Savings',
    readTime: '6 min',
    content: `Saving isn't about how much you earn — it's about how much you keep. Small habits compound into significant savings over time.`,
    tips: [
      'Pay yourself first: automate a transfer to savings on payday',
      'Build a 3-6 month emergency fund before investing',
      'Use the 52-week challenge: save ₹100 week 1, ₹200 week 2, etc.',
      'Round up transactions and save the difference',
      'Review subscriptions quarterly — cancel what you don\'t use',
    ],
  },
  {
    id: 'budget-basics',
    title: 'Budgeting Made Simple',
    category: 'Budgeting',
    readTime: '4 min',
    content: `A budget isn't a restriction — it's a plan that gives you permission to spend without guilt. $yncFlow's budget tools help you set limits per category and track progress in real time.`,
    tips: [
      'Start with just 3 categories: Fixed Costs, Daily Expenses, Savings',
      'Review your budget weekly — 10 minutes is enough',
      'Adjust as life changes: a budget should flex with you',
      'Use the Budgets page to get visual progress bars',
    ],
  },
  {
    id: 'debt-management',
    title: 'Managing and Reducing Debt',
    category: 'Debt',
    readTime: '5 min',
    content: `Not all debt is bad, but high-interest debt can trap you in a cycle. Here's a practical approach to becoming debt-free.`,
    tips: [
      'List all debts with interest rates — tackle the highest rate first (avalanche method)',
      'Or use the snowball method: pay smallest balance first for motivation',
      'Never make only the minimum payment on credit cards',
      'Consider a balance transfer for high-interest credit card debt',
      'Use $yncFlow to track your debt payments and see progress',
    ],
  },
  {
    id: 'emergency-fund',
    title: 'Building an Emergency Fund',
    category: 'Savings',
    readTime: '3 min',
    content: `Life happens — job loss, medical emergencies, car repairs. An emergency fund is your financial safety net.`,
    tips: [
      'Start small: aim for ₹10,000 first, then build to 1 month of expenses',
      'Keep it in a separate savings account (not your daily account)',
      'Only use it for real emergencies, not planned expenses',
      'Replenish as soon as possible after using it',
    ],
  },
  {
    id: 'bank-fees',
    title: 'Avoiding Hidden Bank Fees',
    category: 'Banking',
    readTime: '3 min',
    content: `Banks charge fees for everything — minimum balance, ATM usage, SMS alerts. These small charges add up.`,
    tips: [
      'Switch to a zero-balance savings account if you pay minimum balance fees',
      'Use your bank\'s ATM network to avoid withdrawal charges',
      'Disable paid SMS alerts — use the bank\'s app or email instead',
      'Review your bank statements (in $yncFlow Mail Center) for hidden charges',
    ],
  },
  {
    id: 'upi-safety',
    title: 'Staying Safe with UPI Payments',
    category: 'Security',
    readTime: '3 min',
    content: `UPI is convenient but scammers are creative. Protect your money with these habits.`,
    tips: [
      'Never share your UPI PIN, even with bank officials',
      'Only scan QR codes at trusted merchants',
      'Set a daily UPI transaction limit in your banking app',
      'Enable two-factor authentication everywhere',
      'Report fraudulent transactions to your bank immediately',
    ],
  },
];

const categories = ['All', 'Basics', 'Behavior', 'Savings', 'Budgeting', 'Debt', 'Banking', 'Security'];

export default function HelpCentrePage() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [openArticle, setOpenArticle] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filtered = articles.filter((a) => {
    const matchesCategory = activeCategory === 'All' || a.category === activeCategory;
    const matchesSearch = searchQuery === '' || a.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Help Centre</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Learn to understand your expenses, control spending, and save more
        </p>
      </div>

      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search articles..."
          className="w-full pl-10 pr-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#23272E] text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none"
        />
      </div>

      <div className="flex gap-2 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeCategory === cat
                ? 'bg-primary-600 text-white'
                : 'bg-gray-100 dark:bg-[#23272E] text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-[#2D323A]'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            No articles found for this category.
          </div>
        ) : (
          filtered.map((article) => (
            <div
              key={article.id}
              className="bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setOpenArticle(openArticle === article.id ? null : article.id)}
                className="w-full p-4 text-left flex items-start justify-between hover:bg-gray-50 dark:hover:bg-[#2D323A] transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-500">
                      {article.category}
                    </span>
                    <span className="text-xs text-gray-400">{article.readTime}</span>
                  </div>
                  <h3 className="font-medium text-gray-900 dark:text-white">{article.title}</h3>
                </div>
                <svg
                  className={`w-5 h-5 mt-1 text-gray-400 transition-transform ${openArticle === article.id ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {openArticle === article.id && (
                <div className="px-4 pb-4 border-t border-gray-100 dark:border-gray-700">
                  <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {article.content}
                  </p>
                  <div className="mt-3 space-y-1.5">
                    {article.tips.map((tip, i) => (
                      <div key={i} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                        <span className="mt-0.5 w-1.5 h-1.5 rounded-full bg-primary-600 flex-shrink-0" />
                        {tip}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
