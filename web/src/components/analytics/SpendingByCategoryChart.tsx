import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface CategoryData {
  categoryId: string;
  total: number;
  count: number;
  percentage: number;
}

interface SpendingByCategoryChartProps {
  data: CategoryData[];
}

const COLORS = ['#2563EB', '#3B82F6', '#F5A623', '#EF4444', '#3B82F6', '#8B5CF6', '#EC4899', '#F97316', '#10B981', '#06B6D4', '#6366F1', '#6C757D'];

export default function SpendingByCategoryChart({ data }: SpendingByCategoryChartProps) {
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(value);

  if (data.length === 0) {
    return (
      <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
        <div className="h-64 flex items-center justify-center text-gray-400">No data available</div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Spending by Category</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="total"
              nameKey="categoryId"
              cx="50%"
              cy="50%"
              outerRadius={80}
              innerRadius={50}
              paddingAngle={2}
            >
              {data.map((_, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip formatter={(value: any) => formatCurrency(Number(value))} />
            <Legend
              formatter={(value: string) => {
                const item = data.find((d) => d.categoryId === value);
                return `${value} (${item?.percentage || 0}%)`;
              }}
              wrapperStyle={{ fontSize: '12px' }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
