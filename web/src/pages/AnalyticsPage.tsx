import { useState, useEffect, useMemo } from 'react';
import {
  getYearlyOverview, getSpendingByCategory, getSpendingByMerchant,
  getMonthlyTrend, getBankDistribution, downloadCSV, getCardSpending, getCashFlow,
} from '../services/analytics';
import type { YearlyOverview, CategorySpending, MerchantSpending, MonthlyTrend, BankDistribution, CardSpending, CashFlowPoint } from '../services/analytics';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, AreaChart, Area,
} from 'recharts';
import { useDateFilterStore } from '../store/dateFilterStore';
import { MONTHS, safeArray, formatCurrency, formatCurrencyInt } from '../utils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import EmptyState from '../components/ui/EmptyState';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import { ChartSkeleton } from '../components/ui/Skeleton';

const COLORS = ['#6366F1', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#14B8A6', '#F97316', '#06B6D4', '#84CC16', '#0D9488', '#7C3AED'];

export default function AnalyticsPage() {
  const preset = useDateFilterStore(s => s.preset);
  const startDate = useDateFilterStore(s => s.startDate);
  const endDate = useDateFilterStore(s => s.endDate);
  const year = useMemo(() => {
    const now = new Date();
    if (preset === 'current_year') return now.getFullYear();
    if (preset === 'last_year') return now.getFullYear() - 1;
    return undefined;
  }, [preset]);
  const params = useMemo(() => {
    const p: Record<string, string> = {};
    if (startDate) p.startDate = startDate;
    if (endDate) p.endDate = endDate;
    return p;
  }, [startDate, endDate]);

  const [yearOv, setYearOv] = useState<YearlyOverview | null>(null);
  const [categories, setCategories] = useState<CategorySpending[]>([]);
  const [merchants, setMerchants] = useState<MerchantSpending[]>([]);
  const [trends, setTrends] = useState<MonthlyTrend[]>([]);
  const [banks, setBanks] = useState<BankDistribution[]>([]);
  const [cards, setCards] = useState<CardSpending[]>([]);
  const [cashFlow, setCashFlow] = useState<CashFlowPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const fetchAll = async () => {
      setLoading(true);
      setError('');
      try {
        const [catRes, merchRes, trendRes, bankRes, cardRes, flowRes] = await Promise.all([
          getSpendingByCategory(params),
          getSpendingByMerchant({ limit: 15, ...params }),
          getMonthlyTrend({ months: 24 }),
          getBankDistribution(params),
          getCardSpending(params),
          getCashFlow({ months: 12 }),
        ]);
        if (cancelled) return;
        let ov = null;
        if (year) {
          const ovRes = await getYearlyOverview(year);
          ov = ovRes.data;
        }
        if (cancelled) return;
        setYearOv(ov);
        setCategories(safeArray(catRes?.data));
        setMerchants(safeArray(merchRes?.data));
        setTrends(safeArray(trendRes?.data));
        setBanks(safeArray(bankRes?.data));
        setCards(safeArray(cardRes?.data));
        setCashFlow(safeArray(flowRes?.data));
      } catch {
        if (!cancelled) setError('Failed to load analytics data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    fetchAll();
    return () => { cancelled = true; };
  }, [year, params]);

  const handleExport = async () => {
    setExporting(true);
    try { await downloadCSV(params); } finally { setExporting(false); }
  };

  if (loading) return <div className="space-y-6"><ChartSkeleton /><div className="grid grid-cols-1 lg:grid-cols-2 gap-6"><ChartSkeleton /><ChartSkeleton /></div></div>;
  if (error) return <ErrorDisplay message={error} onRetry={() => window.location.reload()} fullPage />;

  const safeCategories = safeArray(categories);
  const safeCashFlow = safeArray(cashFlow);
  const safeBanks = safeArray(banks);
  const safeCards = safeArray(cards);
  const safeMerchants = safeArray(merchants);
  const safeTrends = safeArray(trends);
  const monthly = safeArray(yearOv?.monthly);
  const catsWithId = safeCategories.filter(c => c && c.categoryId);
  const totalSpend = catsWithId.reduce((s, c) => s + (Number(c.total) || 0), 0);
  const hasData = totalSpend > 0 || safeCashFlow.length > 0 || safeBanks.length > 0;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Spending patterns, trends, and insights</p>
        </div>
        <Button variant="secondary" size="sm" loading={exporting} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>} onClick={handleExport}>
          {exporting ? 'Exporting...' : 'Export CSV'}
        </Button>
      </div>

      {yearOv && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
          {[
            { label: 'Income', value: yearOv.totalIncome, color: 'text-green-600' },
            { label: 'Expense', value: yearOv.totalExpense, color: 'text-red-600' },
            { label: 'Net Savings', value: yearOv.netSavings, color: yearOv.netSavings >= 0 ? 'text-green-600' : 'text-red-600' },
            { label: 'Avg Monthly', value: yearOv.avgMonthlySpend, color: 'text-gray-900 dark:text-white' },
            { label: 'Avg Daily', value: yearOv.avgDaily, color: 'text-gray-900 dark:text-white' },
            { label: 'Transactions', value: yearOv.totalTransactions, color: 'text-gray-900 dark:text-white' },
          ].map((s) => (
            <div key={s.label} className="p-4 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in">
              <p className="text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wide">{s.label}</p>
              <p className={`text-xl font-bold mt-1 ${s.color}`}>{typeof s.value === 'number' ? formatCurrencyInt(s.value) : s.value}</p>
            </div>
          ))}
        </div>
      )}

      {!hasData && (
        <EmptyState
          icon={<svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>}
          title="No analytics data yet"
          description="Sync your Gmail or add transactions to see insights"
        />
      )}

      {hasData && (
        <>
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Income vs Expense</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthly.length > 0 ? monthly.map(d => ({ ...d, name: MONTHS[d.month] })) : safeTrends.map(t => ({ ...t, name: `${MONTHS[t.month]} ${t.year}` }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                  <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                  <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px' }} />
                  <Bar dataKey="income" fill="#10B981" radius={[4, 4, 0, 0]} name="Income" />
                  <Bar dataKey="expense" fill="#EF4444" radius={[4, 4, 0, 0]} name="Expense" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cash Flow (12m)</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={safeCashFlow.map(d => ({ ...d, name: `${MONTHS[d.month] || ''} ${d.year || ''}` }))}>
                    <defs>
                      <linearGradient id="cfInc" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10B981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10B981" stopOpacity={0} /></linearGradient>
                      <linearGradient id="cfExp" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#EF4444" stopOpacity={0} /></linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="income" stroke="#10B981" fill="url(#cfInc)" strokeWidth={2} name="Income" />
                    <Area type="monotone" dataKey="expense" stroke="#EF4444" fill="url(#cfExp)" strokeWidth={2} name="Expense" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Net Savings Trend</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={(monthly.length > 0 ? monthly : safeTrends).map(d => ({ ...d, name: monthly.length > 0 ? MONTHS[(d as any).month] : `${MONTHS[(d as any).month]} ${(d as any).year}`, net: (d as any).income - (d as any).expense }))}>
                    <defs><linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#6366F1" stopOpacity={0.3} /><stop offset="95%" stopColor="#6366F1" stopOpacity={0} /></linearGradient></defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                    <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px' }} />
                    <Area type="monotone" dataKey="net" stroke="#6366F1" fill="url(#netGrad)" strokeWidth={2} name="Net Savings" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Category Breakdown</h3>
              {catsWithId.length > 0 ? (
                <>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={catsWithId.sort((a, b) => (b.total || 0) - (a.total || 0)).map(c => ({ ...c, name: String(c.categoryId).replace(/_/g, ' ') }))} layout="vertical">
                        <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                        <XAxis type="number" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} stroke="#9CA3AF" />
                        <YAxis type="category" dataKey="name" width={140} tick={{ fontSize: 12 }} stroke="#9CA3AF" />
                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px' }} />
                        <Bar dataKey="total" radius={[0, 6, 6, 0]}>{catsWithId.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}</Bar>
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="grid grid-cols-2 gap-2 mt-4">
                    {catsWithId.slice(0, 8).map((cat, i) => (
                      <div key={cat.categoryId} className="flex items-center gap-2 text-sm">
                        <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                        <span className="text-gray-600 dark:text-gray-400 truncate capitalize">{String(cat.categoryId).replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <EmptyState title="No category data" />}
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Distribution</h3>
              {safeBanks.length > 0 ? (
                <>
                  <div className="h-[400px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={safeBanks} dataKey="total" nameKey="name" cx="50%" cy="50%" outerRadius={140} innerRadius={80} paddingAngle={2}>
                          {safeBanks.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                        </Pie>
                        <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2 mt-4">
                    {safeBanks.slice(0, 7).map((bank, i) => (
                      <div key={bank.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-gray-700 dark:text-gray-300">{bank.name}</span>
                        </div>
                        <span className="text-gray-500">{formatCurrencyInt(bank.total)} ({bank.percentage}%)</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : <EmptyState title="No bank data" />}
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Income vs Expense Trend</h3>
              {safeTrends.length > 0 ? (
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={safeTrends.map(t => ({ ...t, name: `${MONTHS[t.month] || ''} ${t.year || ''}` }))}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} stroke="#9CA3AF" />
                      <YAxis tick={{ fontSize: 11 }} stroke="#9CA3AF" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
                      <Tooltip formatter={(value: any) => formatCurrency(Number(value))} contentStyle={{ borderRadius: '12px' }} />
                      <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2} dot={{ r: 3 }} name="Income" />
                      <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2} dot={{ r: 3 }} name="Expense" />
                      <Line type="monotone" dataKey="net" stroke="#6366F1" strokeWidth={2} dot={{ r: 3 }} name="Net" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : <EmptyState title="No trend data" />}
            </Card>
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Card Spending</h3>
              {safeCards.length > 0 ? (
                <div className="space-y-4 h-[400px] overflow-y-auto">
                  {safeCards.map((card, i) => (
                    <div key={`${card?.bank}-${card?.cardType}`} className="flex items-center justify-between p-3 rounded-lg bg-gray-50 dark:bg-[#1A1D21]">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${COLORS[i % COLORS.length]}20` }}>
                          <span className="text-lg" style={{ color: COLORS[i % COLORS.length] }}>{card?.cardType === 'credit' ? '💳' : '🏦'}</span>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{card?.bank || 'Unknown'}</p>
                          <p className="text-xs text-gray-500 capitalize">{card?.cardType || 'Unknown'} · {card?.count} txns</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-red-600 dark:text-red-400">{formatCurrencyInt(Number(card?.total) || 0)}</span>
                    </div>
                  ))}
                </div>
              ) : <EmptyState title="No card spending data" />}
            </Card>
          </div>

          {safeMerchants.length > 0 && (
            <Card>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Merchants</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                      <th className="pb-3 font-medium">#</th>
                      <th className="pb-3 font-medium">Merchant</th>
                      <th className="pb-3 font-medium text-right">Total Spend</th>
                      <th className="pb-3 font-medium text-right">Transactions</th>
                      <th className="pb-3 font-medium text-right">Avg/Transaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {safeMerchants.map((m, i) => (
                      <tr key={m?.name || i} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2D323A] transition-colors">
                        <td className="py-3 text-sm text-gray-500">{i + 1}</td>
                        <td className="py-3 text-sm font-medium text-gray-900 dark:text-white">{m?.name || 'Unknown'}</td>
                        <td className="py-3 text-sm text-right text-red-600 dark:text-red-400 font-medium">{formatCurrencyInt(Number(m?.total) || 0)}</td>
                        <td className="py-3 text-sm text-right text-gray-700 dark:text-gray-300">{Number(m?.count) || 0}</td>
                        <td className="py-3 text-sm text-right text-gray-500">{m?.count ? formatCurrencyInt(Number(m.total) / Number(m.count)) : '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
