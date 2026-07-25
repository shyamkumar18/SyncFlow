interface StatCardProps {
  label: string;
  value: string;
  valueColor?: string;
  sub?: string;
  icon?: React.ReactNode;
}

export default function StatCard({ label, value, valueColor = 'text-gray-900 dark:text-white', sub, icon }: StatCardProps) {
  return (
    <div className="p-5 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
          <p className={`text-2xl font-bold mt-1 ${valueColor}`}>{value}</p>
          {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
        </div>
        {icon && (
          <div className="w-10 h-10 rounded-lg bg-gray-50 dark:bg-[#1A1D21] flex items-center justify-center flex-shrink-0">
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}
