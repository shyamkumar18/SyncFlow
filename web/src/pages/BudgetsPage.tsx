import { useState, useEffect } from 'react';
import * as budgetService from '../services/budgets';
import * as categoryService from '../services/categories';
import type { ICategory } from '../types';

const MONTHS = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default function BudgetsPage() {
  const [summary, setSummary] = useState<any[]>([]);
  const [categories, setCategories] = useState<ICategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ category: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetch = async () => {
    setLoading(true);
    setError('');
    try {
      const [budgetRes, catRes] = await Promise.all([
        budgetService.getBudgetSummary(),
        categoryService.getCategories(),
      ]);
      setSummary(budgetRes.data);
      setCategories(catRes.data);
    } catch {
      setError('Failed to load budgets. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const amount = parseFloat(formData.amount);
    if (!formData.category || !amount || amount <= 0) {
      setFormError('Select a category and enter a valid amount');
      return;
    }
    setFormLoading(true);
    try {
      await budgetService.createBudget({ category: formData.category, amount, month: formData.month, year: formData.year });
      setShowForm(false);
      setFormData({ category: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      await fetch();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to create budget');
    } finally {
      setFormLoading(false);
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(amount);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this budget?')) return;
    try {
      await budgetService.deleteBudget(id);
      await fetch();
    } catch {
      setError('Failed to delete budget');
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
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h2>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track your spending limits</p>
          </div>
        </div>
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <div className="flex items-center gap-2">
            <span className="text-red-600 dark:text-red-400 text-sm">{error}</span>
            <button onClick={fetch} className="ml-auto px-3 py-1 text-sm bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/60">Retry</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track your spending limits</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="btn-primary"
        >
          {showForm ? 'Cancel' : 'Add Budget'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-5 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Create Budget</h3>
          {formError && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white"
                required
              >
                <option value="">Select category</option>
                {categories.filter((c) => c.type === 'expense').map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Monthly Limit</label>
              <input
                type="number"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Month</label>
              <select
                value={formData.month}
                onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white"
              >
                {MONTHS.slice(1).map((m, i) => <option key={i + 1} value={i + 1}>{m}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Year</label>
              <input
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={formLoading}
            className="btn-primary w-full"
          >
            {formLoading ? 'Creating...' : 'Create Budget'}
          </button>
        </form>
      )}

      {summary.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No budgets set. Create your first budget to start tracking.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {summary.map((budget: any) => {
            const catName = budget.category?.name || budget.category || 'Unknown';
            const catColor = budget.category?.color || '#3b82f6';
            const isOver = budget.percentage >= 100;

            return (
              <div key={budget._id} className="p-5 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${catColor}20` }}>
                      <span className="text-lg" style={{ color: catColor }}>{budget.category?.icon || '📊'}</span>
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{catName}</p>
                      <p className="text-xs text-gray-500">{MONTHS[budget.month]} {budget.year} · {budget.period || 'monthly'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}</p>
                      <p className={`text-xs ${isOver ? 'text-red-500' : 'text-gray-400'}`}>
                        {formatCurrency(budget.remaining)} remaining
                      </p>
                    </div>
                    <button onClick={() => handleDelete(budget._id)} className="p-1.5 text-gray-400 hover:text-red-500 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isOver ? 'bg-red-500' : 'bg-primary-600'}`}
                    style={{ width: `${Math.min(budget.percentage, 100)}%` }}
                  />
                </div>
                <p className={`text-xs mt-1 ${isOver ? 'text-red-500' : 'text-gray-400'}`}>
                  {budget.percentage}% used
                </p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
