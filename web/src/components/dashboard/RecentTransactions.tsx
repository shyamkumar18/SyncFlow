import { Link } from 'react-router-dom';

interface Transaction {
  _id: string;
  amount: number;
  type: 'debit' | 'credit';
  description?: string;
  merchant?: string;
  bank: string;
  date: string;
  category?: string;
}

interface RecentTransactionsProps {
  transactions: Transaction[];
}

export default function RecentTransactions({ transactions }: RecentTransactionsProps) {
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  if (transactions.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        </div>
        <div className="h-32 flex items-center justify-center text-gray-400">No recent transactions.</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
        <Link to="/transactions" className="text-sm text-primary-600 hover:underline">View all</Link>
      </div>
      <div className="space-y-3">
        {transactions.slice(0, 5).map((txn) => (
          <div key={txn._id} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                txn.type === 'credit' ? 'bg-green-50 dark:bg-green-900/20' : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <svg className={`w-4 h-4 ${txn.type === 'credit' ? 'text-green-600' : 'text-red-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={txn.type === 'credit' ? 'M7 11l5-5m0 0l5 5m-5-5v12' : 'M17 13l-5 5m0 0l-5-5m5 5V6'} />
                </svg>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{txn.merchant || txn.description || 'Transaction'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {txn.bank} · {new Date(txn.date).toLocaleDateString()}
                </p>
              </div>
            </div>
            <span className={`text-sm font-semibold ${txn.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
              {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
