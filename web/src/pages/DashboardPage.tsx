import { useState, useEffect } from 'react';
import { getOverview } from '../services/analytics';
import type { DashboardOverview } from '../services/analytics';
import SummaryCards from '../components/dashboard/SummaryCards';
import CashFlowChart from '../components/dashboard/CashFlowChart';
import RecentTransactions from '../components/dashboard/RecentTransactions';
import NotificationFeed from '../components/dashboard/NotificationFeed';

export default function DashboardPage() {
  const [data, setData] = useState<DashboardOverview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await getOverview();
        setData(res.data);
      } catch {
        setError('Failed to load dashboard data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your financial overview</p>
        </div>
        <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button onClick={() => window.location.reload()} className="btn-primary">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your financial overview</p>
      </div>

      <SummaryCards
        totalIncome={data?.totalIncome || 0}
        totalExpense={data?.totalExpense || 0}
        savings={data?.savings || 0}
        yearIncome={data?.yearIncome || 0}
        yearExpense={data?.yearExpense || 0}
        monthlyIncome={data?.monthlyIncome || 0}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <CashFlowChart data={data?.cashFlow || []} />
        </div>
        <div>
          <NotificationFeed />
        </div>
      </div>

      <RecentTransactions transactions={data?.recentTransactions || []} />
    </div>
  );
}
