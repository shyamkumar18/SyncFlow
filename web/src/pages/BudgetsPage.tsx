import { useState, useEffect } from 'react';
import * as budgetService from '../services/budgets';
import * as categoryService from '../services/categories';
import type { ICategory } from '../types';
import { MONTHS, formatCurrencyInt, formatCurrency } from '../utils';
import Button from '../components/ui/Button';
import Select from '../components/ui/Select';
import Input from '../components/ui/Input';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import { useToast } from '../components/ui/Toast';

export default function BudgetsPage() {
  const { toast } = useToast();
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
    } catch { setError('Failed to load budgets. Please try again.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const amount = parseFloat(formData.amount);
    if (!formData.category || !amount || amount <= 0) { setFormError('Select a category and enter a valid amount'); return; }
    setFormLoading(true);
    try {
      await budgetService.createBudget({ category: formData.category, amount, month: formData.month, year: formData.year });
      setShowForm(false);
      setFormData({ category: '', amount: '', month: new Date().getMonth() + 1, year: new Date().getFullYear() });
      await fetch();
      toast('Budget created', 'success');
    } catch (err: any) { setFormError(err.response?.data?.message || 'Failed to create budget'); }
    finally { setFormLoading(false); }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this budget?')) return;
    try { await budgetService.deleteBudget(id); await fetch(); toast('Budget deleted', 'success'); }
    catch { setError('Failed to delete budget'); }
  };

  if (loading) return <div className="space-y-6"><div className="flex items-center justify-between"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h2></div><CardSkeleton count={3} /></div>;
  if (error) return <ErrorDisplay message={error} onRetry={fetch} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Budgets</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Track your spending limits</p>
        </div>
        <Button onClick={() => setShowForm(!showForm)}>{showForm ? 'Cancel' : 'Add Budget'}</Button>
      </div>

      {showForm && (
        <form onSubmit={handleCreate} className="p-5 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 space-y-4 animate-slide-up">
          <h3 className="font-medium text-gray-900 dark:text-white">Create Budget</h3>
          {formError && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <Select label="Category" options={[{ value: '', label: 'Select category' }, ...categories.filter((c) => c.type === 'expense').map((c) => ({ value: c._id, label: c.name }))]} value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} />
            <Input label="Monthly Limit" type="number" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0" required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Month" options={MONTHS.slice(1).map((m, i) => ({ value: String(i + 1), label: m }))} value={String(formData.month)} onChange={(e) => setFormData({ ...formData, month: Number(e.target.value) })} />
            <Input label="Year" type="number" value={formData.year} onChange={(e) => setFormData({ ...formData, year: Number(e.target.value) })} />
          </div>
          <Button type="submit" loading={formLoading} className="w-full">Create Budget</Button>
        </form>
      )}

      {summary.length === 0 ? (
        <EmptyState title="No budgets set" description="Create your first budget to start tracking." />
      ) : (
        <div className="space-y-4">
          {summary.map((budget: any) => {
            const catName = budget.category?.name || budget.category || 'Unknown';
            const catColor = budget.category?.color || '#3b82f6';
            const isOver = budget.percentage >= 100;
            return (
              <div key={budget._id} className="p-5 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow animate-fade-in">
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
                      <p className="text-sm font-medium text-gray-900 dark:text-white">{formatCurrencyInt(budget.spent)} / {formatCurrency(budget.amount)}</p>
                      <p className={`text-xs ${isOver ? 'text-red-500' : 'text-gray-400'}`}>{formatCurrency(budget.remaining)} remaining</p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(budget._id)}><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg></Button>
                  </div>
                </div>
                <div className="w-full h-2 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all duration-500 ${isOver ? 'bg-red-500' : 'bg-primary-600'}`} style={{ width: `${Math.min(budget.percentage, 100)}%` }} />
                </div>
                <p className={`text-xs mt-1 ${isOver ? 'text-red-500' : 'text-gray-400'}`}>{budget.percentage}% used</p>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
