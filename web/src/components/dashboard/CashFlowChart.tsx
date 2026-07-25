import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CashFlowData {
  month: number;
  year: number;
  income: number;
  expense: number;
  net: number;
}

interface CashFlowChartProps {
  data: CashFlowData[];
}

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function CashFlowChart({ data }: CashFlowChartProps) {
  const chartData = data.map((d) => ({
    name: `${MONTHS[d.month]} ${d.year}`,
    Income: d.income,
    Expense: d.expense,
    Net: d.net,
  }));

  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  if (chartData.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cash Flow</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">No data yet. Sync your emails to see cash flow.</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Cash Flow</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--color-primary-600)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="var(--color-primary-600)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="expenseGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} stroke="#9CA3AF" />
            <YAxis tick={{ fontSize: 12 }} stroke="#9CA3AF" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} />
            <Tooltip
              formatter={(value: any) => formatCurrency(Number(value))}
              contentStyle={{ borderRadius: '12px', border: '1px solid #E5E7EB' }}
            />
            <Area type="monotone" dataKey="Income" stroke="var(--color-primary-600)" fill="url(#incomeGradient)" strokeWidth={2} />
            <Area type="monotone" dataKey="Expense" stroke="#EF4444" fill="url(#expenseGradient)" strokeWidth={2} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
