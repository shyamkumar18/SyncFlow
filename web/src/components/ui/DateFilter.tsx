import { useState } from 'react';
import { useDateFilterStore, type DateRangePreset } from '../../store/dateFilterStore';

export default function DateFilter() {
  const { preset, customStartDate, customEndDate, setPreset, setCustomRange } = useDateFilterStore();
  const [open, setOpen] = useState(false);

  const now = new Date();
  const thisYear = now.getFullYear();
  const lastYear = thisYear - 1;

  const PRESETS: { value: DateRangePreset; label: string }[] = [
    { value: 'current_month', label: 'This Month' },
    { value: 'last_3_months', label: 'Last 3 Months' },
    { value: 'last_6_months', label: 'Last 6 Months' },
    { value: 'current_year', label: `${thisYear}` },
    { value: 'last_year', label: `${lastYear}` },
    { value: 'all_time', label: 'All Time' },
    { value: 'custom', label: 'Custom Range' },
  ];

  const currentLabel = PRESETS.find(p => p.value === preset)?.label || 'Select';

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#23272E] border border-gray-200 dark:border-gray-700 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D323A] transition-colors"
      >
        <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span>{currentLabel}</span>
        <svg className={`w-4 h-4 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-2 z-50 w-64 bg-white dark:bg-[#23272E] border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden">
            <div className="p-2">
              {PRESETS.map((p) => (
                <button
                  key={p.value}
                  onClick={() => {
                    setPreset(p.value);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    preset === p.value
                      ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 font-medium'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#2D323A]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
            {preset === 'custom' && (
              <div className="p-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
                <input
                  type="date"
                  value={customStartDate || ''}
                  onChange={(e) => setCustomRange(e.target.value, customEndDate || '')}
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white text-sm"
                />
                <input
                  type="date"
                  value={customEndDate || ''}
                  onChange={(e) => setCustomRange(customStartDate || '', e.target.value)}
                  className="w-full px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white text-sm"
                />
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
