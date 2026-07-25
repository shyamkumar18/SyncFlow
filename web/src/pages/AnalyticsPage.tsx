import { useState, useEffect } from 'react';
import { getSpendingByCategory, getSpendingByMerchant, getMonthlyTrend, getBankDistribution, downloadCSV } from '../services/analytics';
import SpendingByCategoryChart from '../components/analytics/SpendingByCategoryChart';
import SpendingByMerchantChart from '../components/analytics/SpendingByMerchantChart';
import MonthlyTrendChart from '../components/analytics/MonthlyTrendChart';
import BankDistribution from '../components/analytics/BankDistribution';

export default function AnalyticsPage() {
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [merchantData, setMerchantData] = useState<any[]>([]);
  const [trendData, setTrendData] = useState<any[]>([]);
  const [bankData, setBankData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [catRes, merchRes, trendRes, bankRes] = await Promise.all([
          getSpendingByCategory(),
          getSpendingByMerchant({ limit: 10 }),
          getMonthlyTrend({ months: 12 }),
          getBankDistribution(),
        ]);
        setCategoryData(catRes.data as any);
        setMerchantData(merchRes.data as any);
        setTrendData(trendRes.data as any);
        setBankData(bankRes.data as any);
      } catch {
        setError('Failed to load analytics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleExport = async () => {
    setExporting(true);
    try {
      await downloadCSV();
    } finally {
      setExporting(false);
    }
  };

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
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your spending patterns and insights</p>
          </div>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Your spending patterns and insights</p>
        </div>
        <button
          onClick={handleExport}
          disabled={exporting}
          className="btn-primary flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingByCategoryChart data={categoryData} />
        <BankDistribution data={bankData} />
      </div>

      <SpendingByMerchantChart data={merchantData} />

      <MonthlyTrendChart data={trendData} />
    </div>
  );
}
