import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { getYearlyOverview, getSpendingByCategory, getBankDistribution } from '../services/analytics';
import type { YearlyOverview, CategorySpending, BankDistribution as BankDist } from '../services/analytics';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, AreaChart, Area,
} from 'recharts';
import { useDateFilterStore } from '../store/dateFilterStore';
import { MONTHS, safeArray, formatCurrency, formatCompact } from '../utils';
import Card from '../components/ui/Card';
import StatCard from '../components/ui/StatCard';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton, ChartSkeleton } from '../components/ui/Skeleton';
import ErrorDisplay from '../components/ui/ErrorDisplay';

const PIE_COLORS = ['#6366F1', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16'];

export default function DashboardPage() {
  const preset = useDateFilterStore(s => s.preset);
  const startDate = useDateFilterStore(s => s.startDate);
  const endDate = useDateFilterStore(s => s.endDate);
  const year = useMemo(() => {
    const now = new Date();
    if (preset === 'current_year') return now.getFullYear();
    if (preset === 'last_year') return now.getFullYear() - 1;
    return undefined;
  }, [preset]) || new Date().getFullYear();
  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    return p;
  }, [startDate, endDate]);

  const [overview, setOverview] = useState<YearlyOverview | null>(null);
  const [categories, setCategories] = useState<CategorySpending[]>([]);
  const [banks, setBanks] = useState<BankDist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [ovRes, catRes, bankRes] = await Promise.all([
          getYearlyOverview(year),
          getSpendingByCategory(params),
          getBankDistribution(params),
        ]);
        if (cancelled) return;
        setOverview(ovRes.data);
        setCategories(safeArray(catRes?.data));
        setBanks(safeArray(bankRes?.data));
      } catch {
        if (!cancelled) setError('Failed to load dashboard data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [year, params]);

  if (loading) return <div className="space-y-6"><CardSkeleton count={4} /><ChartSkeleton /><ChartSkeleton className="h-72" /></div>;
  if (error) return <ErrorDisplay message={error} onRetry={() => window.location.reload()} fullPage />;

  const totalIncome = Number(overview?.totalIncome) || 0;
  const totalExpense = Number(overview?.totalExpense) || 0;
  const savings = totalIncome - totalExpense;
  const monthly = safeArray(overview?.monthly);
  const safeCats = safeArray(categories);
  const safeBanks = safeArray(banks);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-primary-600 to-primary-800 p-6 sm:p-8">
        <div className="relative z-10">
          <h1 className="text-2xl font-bold text-white">{year} Financial Overview</h1>
          <p className="text-primary-100 mt-1">{overview?.monthsWithData ?? 0} months with data · {overview?.totalTransactions ?? 0} transactions</p>
        </div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30" />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Income" value={formatCompact(totalIncome)} valueColor="text-green-600" />
        <StatCard label="Expense" value={formatCompact(totalExpense)} valueColor="text-red-600" />
        <StatCard label="Net Savings" value={formatCompact(Math.abs(savings))} valueColor={savings >= 0 ? 'text-green-600' : 'text-red-600'} />
        <StatCard label="Avg Monthly Spend" value={formatCompact(overview?.avgMonthlySpend ?? 0)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Income vs Expense</h3>
          {monthly.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly.map(d => ({ ...d, name: MONTHS[d.month] }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} />
                  <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState title={`No data for ${year}`} />}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
          {safeCats.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={safeCats} dataKey="total" nameKey="categoryId" cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={3}>
                    {safeCats.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-2">
                {safeCats.slice(0, 5).map((cat, i) => (
                  <div key={cat.categoryId} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                      <span className="text-gray-700 dark:text-gray-300 capitalize">{String(cat.categoryId).replace(/_/g, ' ')}</span>
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">{formatCurrency(cat.total)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : <EmptyState title="No category data" />}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Savings Trend</h3>
          {monthly.length > 0 ? (
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={monthly.map(d => ({ ...d, name: MONTHS[d.month], net: d.income - d.expense }))}>
                  <defs>
                    <linearGradient id="savingsGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }} />
                  <Area type="monotone" dataKey="net" stroke="#6366F1" fill="url(#savingsGrad)" strokeWidth={2} name="Net Savings" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : <EmptyState title={`No data for ${year}`} />}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Year Highlights</h3>
          {overview ? (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
                <p className="text-xs text-green-600 dark:text-green-400">Best Month</p>
                <p className="text-lg font-bold text-green-700 dark:text-green-300">{MONTHS[overview.bestMonth.month]} <span className="text-sm font-normal">(+{formatCompact(overview.bestMonth.savings)})</span></p>
              </div>
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
                <p className="text-xs text-red-600 dark:text-red-400">Worst Month</p>
                <p className="text-lg font-bold text-red-700 dark:text-red-300">{MONTHS[overview.worstMonth.month]} <span className="text-sm font-normal">({formatCompact(overview.worstMonth.savings)})</span></p>
              </div>
              <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <p className="text-xs text-blue-600 dark:text-blue-400">Highest Expense</p>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300">{MONTHS[overview.highestExpenseMonth.month]} <span className="text-sm font-normal">({formatCompact(overview.highestExpenseMonth.amount)})</span></p>
              </div>
              <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
                <p className="text-xs text-gray-500">Avg Daily Spend</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{formatCompact(overview.avgDaily)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Savings Rate</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{totalIncome > 0 ? `${Math.round((savings / totalIncome) * 100)}%` : '0%'}</p>
              </div>
            </div>
          ) : <EmptyState title="No highlights" />}
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Transactions</h3>
            <Link to="/transactions" className="text-sm text-primary-600 hover:underline font-medium">View All</Link>
          </div>
          {monthly.reduce((s, m) => s + (m.count ?? 0), 0) > 0 ? (
            <div className="h-72 flex items-center justify-center text-gray-400">View full list in Transactions</div>
          ) : (
            <EmptyState
              title={`No transactions in ${year}`}
              action={<Link to="/transactions" className="text-sm text-primary-600 hover:underline">Sync Gmail to get started</Link>}
            />
          )}
        </Card>

        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Distribution</h3>
          {safeBanks.length > 0 ? (
            <div className="space-y-3">
              {safeBanks.slice(0, 7).map((bank, i) => (
                <div key={bank.name}>
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-700 dark:text-gray-300 truncate">{bank.name}</span>
                    <span className="text-gray-900 dark:text-white font-medium">{bank.percentage}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-gray-100 dark:bg-[#1A1D21] rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all duration-500" style={{ width: `${bank.percentage}%`, backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                  </div>
                </div>
              ))}
            </div>
          ) : <EmptyState title="No bank data" />}

          {savings > 0 && (
            <div className="mt-6 p-4 rounded-xl bg-gradient-to-r from-primary-50 to-blue-50 dark:from-primary-900/20 dark:to-blue-900/20 border border-primary-200 dark:border-primary-800">
              <p className="text-sm text-primary-700 dark:text-primary-300 font-medium">Annual Savings Rate</p>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400 mt-1">
                {totalIncome > 0 ? `${Math.round((savings / totalIncome) * 100)}%` : '0%'}
              </p>
              <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">of income saved in {year}</p>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
