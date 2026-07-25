interface SummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  savings: number;
  yearIncome: number;
  yearExpense: number;
  monthlyIncome?: number;
}

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function SummaryCards({ totalIncome, totalExpense, savings, yearIncome, yearExpense, monthlyIncome }: SummaryCardsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const now = new Date();
  const monthName = MONTH_NAMES[now.getMonth()];

  const cards = [
    {
      title: `Income (${monthName})`,
      value: formatCurrency(totalIncome),
      subtitle: `Year: ${formatCurrency(yearIncome)}`,
      icon: 'M13 7h8m0 0v8m0-8l-8 8-4-4-6 6',
      color: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-50 dark:bg-green-900/20',
    },
    {
      title: `Expense (${monthName})`,
      value: formatCurrency(totalExpense),
      subtitle: `Year: ${formatCurrency(yearExpense)}`,
      icon: 'M13 17h8m0 0V9m0 8l-8-8-4 4-6-6',
      color: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: `Savings (${monthName})`,
      value: formatCurrency(Math.abs(savings)),
      subtitle: savings >= 0 ? 'You\'re saving!' : 'Overspending',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: savings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bg: savings >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
    },
    {
      title: 'Monthly Income (Goal)',
      value: formatCurrency(monthlyIncome ?? 0),
      subtitle: 'Set in Settings',
      icon: 'M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z',
      color: 'text-primary-600',
      bg: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      title: 'Net Worth Change',
      value: formatCurrency(yearIncome - yearExpense),
      subtitle: 'Year to date',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: (yearIncome - yearExpense) >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400',
      bg: (yearIncome - yearExpense) >= 0 ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="p-5 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
              <p className={`text-2xl font-bold mt-1 ${card.color}`}>{card.value}</p>
              <p className="text-xs text-gray-400 mt-1">{card.subtitle}</p>
            </div>
            <div className={`p-2 rounded-lg ${card.bg}`}>
              <svg className={`w-5 h-5 ${card.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
              </svg>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
