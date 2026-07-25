import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface BankData {
  name: string;
  total: number;
  count: number;
  percentage: number;
}

interface BankDistributionProps {
  data: BankData[];
}

export default function BankDistribution({ data }: BankDistributionProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  if (data.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Distribution</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Bank Distribution</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ left: 100 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
            <XAxis type="number" tickFormatter={(v: number) => `₹${(v / 1000).toFixed(0)}k`} stroke="#9CA3AF" tick={{ fontSize: 12 }} />
            <YAxis type="category" dataKey="name" stroke="#9CA3AF" tick={{ fontSize: 12 }} width={100} />
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Bar dataKey="total" fill="var(--color-primary-500)" radius={[0, 4, 4, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
