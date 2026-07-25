import { create } from 'zustand';

export type DateRangePreset = 'current_month' | 'last_3_months' | 'last_6_months' | 'current_year' | 'last_year' | 'all_time' | 'custom';

export interface DateRange {
  preset: DateRangePreset;
  startDate?: string;
  endDate?: string;
}

function getDateRange(preset: DateRangePreset, customStart?: string, customEnd?: string): { startDate?: string; endDate?: string } {
  const now = new Date();
  const y = now.getFullYear();
  const m = now.getMonth();

  switch (preset) {
    case 'current_month':
      return {
        startDate: new Date(y, m, 1).toISOString(),
        endDate: new Date(y, m + 1, 0, 23, 59, 59).toISOString(),
      };
    case 'last_3_months':
      return {
        startDate: new Date(y, m - 2, 1).toISOString(),
        endDate: new Date(y, m + 1, 0, 23, 59, 59).toISOString(),
      };
    case 'last_6_months':
      return {
        startDate: new Date(y, m - 5, 1).toISOString(),
        endDate: new Date(y, m + 1, 0, 23, 59, 59).toISOString(),
      };
    case 'current_year':
      return {
        startDate: new Date(y, 0, 1).toISOString(),
        endDate: new Date(y, 11, 31, 23, 59, 59).toISOString(),
      };
    case 'last_year':
      return {
        startDate: new Date(y - 1, 0, 1).toISOString(),
        endDate: new Date(y - 1, 11, 31, 23, 59, 59).toISOString(),
      };
    case 'all_time':
      return {};
    case 'custom':
      return {
        startDate: customStart,
        endDate: customEnd,
      };
    default:
      return {
        startDate: new Date(y, 0, 1).toISOString(),
        endDate: new Date(y, 11, 31, 23, 59, 59).toISOString(),
      };
  }
}

export function getYearFromPreset(preset: DateRangePreset): number | undefined {
  const now = new Date();
  if (preset === 'current_year') return now.getFullYear();
  if (preset === 'last_year') return now.getFullYear() - 1;
  return undefined;
}

interface DateFilterState {
  preset: DateRangePreset;
  startDate?: string;
  endDate?: string;
  customStartDate?: string;
  customEndDate?: string;
  setPreset: (preset: DateRangePreset) => void;
  setCustomRange: (start: string, end: string) => void;
  getParams: () => Record<string, string>;
  getYear: () => number | undefined;
  getLabel: () => string;
}

export const useDateFilterStore = create<DateFilterState>((set, get) => ({
  preset: 'current_year',
  startDate: getDateRange('current_year').startDate,
  endDate: getDateRange('current_year').endDate,
  customStartDate: '',
  customEndDate: '',

  setPreset: (preset) => {
    const range = getDateRange(preset);
    set({ preset, startDate: range.startDate, endDate: range.endDate });
  },

  setCustomRange: (start, end) => {
    set({
      preset: 'custom',
      customStartDate: start,
      customEndDate: end,
      startDate: start,
      endDate: end,
    });
  },

  getParams: () => {
    const state = get();
    const params: Record<string, string> = {};
    if (state.startDate) params.startDate = state.startDate;
    if (state.endDate) params.endDate = state.endDate;
    return params;
  },

  getYear: () => getYearFromPreset(get().preset),

  getLabel: () => {
    const state = get();
    const now = new Date();
    switch (state.preset) {
      case 'current_month': return 'This Month';
      case 'last_3_months': return 'Last 3 Months';
      case 'last_6_months': return 'Last 6 Months';
      case 'current_year': return `${now.getFullYear()}`;
      case 'last_year': return `${now.getFullYear() - 1}`;
      case 'all_time': return 'All Time';
      case 'custom': return `${state.customStartDate || '?'} – ${state.customEndDate || '?'}`;
      default: return 'Select Period';
    }
  },
}));
