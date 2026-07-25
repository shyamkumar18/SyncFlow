import { useState, useEffect, useCallback, useRef } from 'react';
import * as transactionService from '../services/transactions';
import * as emailService from '../services/emails';
import type { ITransaction } from '../types';

const TYPE_COLORS: Record<string, string> = {
  credit: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/20',
  debit: 'text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20',
};

const STATUS_COLORS: Record<string, string> = {
  success: 'bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400',
  failed: 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-400',
  pending: 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-700 dark:text-yellow-400',
  refunded: 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400',
};

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netSavings: 0 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const searchTimer = useRef<ReturnType<typeof setTimeout>>();

  const [formData, setFormData] = useState({
    amount: '',
    type: 'debit' as 'debit' | 'credit',
    description: '',
    merchant: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (typeFilter) params.type = typeFilter;
      if (debouncedSearch) params.search = debouncedSearch;
      const res = await transactionService.getTransactions(params);
      setTransactions(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [typeFilter, debouncedSearch]);

  const fetchSummary = useCallback(async () => {
    try {
      const res = await transactionService.getTransactionSummary();
      setSummary(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchTransactions(1);
    fetchSummary();
  }, [fetchTransactions, fetchSummary]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) {
      setFormError('Enter a valid amount');
      return;
    }
    setFormLoading(true);
    try {
      await transactionService.createManualTransaction({
        amount,
        type: formData.type,
        description: formData.description,
        merchant: formData.merchant,
        date: formData.date,
        status: 'success',
        bank: 'Manual Entry',
      });
      setShowAddForm(false);
      setFormData({ amount: '', type: 'debit', description: '', merchant: '', category: '', date: new Date().toISOString().split('T')[0] });
      await fetchTransactions(1);
      await fetchSummary();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this transaction?')) return;
    try {
      await transactionService.deleteTransaction(id);
      await fetchTransactions(pagination.page);
      await fetchSummary();
    } catch {
      setError('Failed to delete transaction');
    }
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount);

  const renderPagination = () => {
    if (pagination.pages <= 1) return null;
    const pages: (number | string)[] = [];
    const total = pagination.pages;
    const current = pagination.page;

    if (total <= 7) {
      for (let i = 1; i <= total; i++) pages.push(i);
    } else {
      pages.push(1);
      if (current > 3) pages.push('...');
      for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) {
        pages.push(i);
      }
      if (current < total - 2) pages.push('...');
      pages.push(total);
    }

    return (
      <div className="flex items-center justify-center gap-2 pt-4">
        <button
          onClick={() => fetchTransactions(current - 1)}
          disabled={current <= 1}
          className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-[#23272E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2D323A] disabled:opacity-40"
        >
          Prev
        </button>
        {pages.map((p, i) =>
          typeof p === 'string' ? (
            <span key={`ellipsis-${i}`} className="px-1 text-gray-400">...</span>
          ) : (
            <button
              key={p}
              onClick={() => fetchTransactions(p)}
              className={`px-3 py-1 rounded-lg text-sm ${
                p === current
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 dark:bg-[#23272E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2D323A]'
              }`}
            >
              {p}
            </button>
          )
        )}
        <button
          onClick={() => fetchTransactions(current + 1)}
          disabled={current >= total}
          className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-[#23272E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2D323A] disabled:opacity-40"
        >
          Next
        </button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={async () => {
              setSyncing(true);
              try {
                await emailService.syncEmails(50);
                await fetchTransactions(1);
                await fetchSummary();
              } finally {
                setSyncing(false);
              }
            }}
            disabled={syncing}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-50 dark:hover:bg-[#23272E] disabled:opacity-50 flex items-center gap-2"
          >
            <svg className={`w-4 h-4 ${syncing ? 'animate-spin' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {syncing ? 'Syncing...' : 'Sync Gmail'}
          </button>
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
            {showAddForm ? 'Cancel' : 'Add Cash'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Income', value: summary.totalIncome, color: 'text-green-600 dark:text-green-400' },
          { label: 'Total Expense', value: summary.totalExpense, color: 'text-red-600 dark:text-red-400' },
          { label: 'Net Savings', value: summary.netSavings, color: summary.netSavings >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
            <p className={`text-xl font-bold mt-1 ${stat.color}`}>{formatCurrency(Math.abs(stat.value))}</p>
          </div>
        ))}
      </div>

      {showAddForm && (
        <form onSubmit={handleAddTransaction} className="p-5 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 space-y-4">
          <h3 className="font-medium text-gray-900 dark:text-white">Add Cash Transaction</h3>

          {formError && (
            <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">{formError}</div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Type</label>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'debit' })}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    formData.type === 'debit'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Spent
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, type: 'credit' })}
                  className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    formData.type === 'credit'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600'
                      : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  Gained
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Amount</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                placeholder="0.00"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="e.g. Coffee at Starbucks"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Merchant</label>
              <input
                type="text"
                value={formData.merchant}
                onChange={(e) => setFormData({ ...formData, merchant: e.target.value })}
                placeholder="e.g. Starbucks"
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Date</label>
            <input
              type="date"
              value={formData.date}
              onChange={(e) => setFormData({ ...formData, date: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white"
              required
            />
          </div>

          <button
            type="submit"
            disabled={formLoading}
            className="btn-primary w-full"
          >
            {formLoading ? 'Adding...' : `Add ${formData.type === 'debit' ? 'Expense' : 'Income'}`}
          </button>
        </form>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by merchant, bank, description..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#23272E] text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#23272E] text-gray-900 dark:text-white"
        >
          <option value="">All Types</option>
          <option value="credit">Income</option>
          <option value="debit">Expense</option>
        </select>
      </div>

      {loading ? (
        <div className="text-center py-12">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto" />
        </div>
      ) : error ? (
        <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-center py-8">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <button onClick={() => fetchTransactions(1)} className="btn-primary">Retry</button>
          </div>
        </div>
      ) : transactions.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No transactions found. Sync your Gmail or add cash manually.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Description</th>
                <th className="pb-3 font-medium">Merchant</th>
                <th className="pb-3 font-medium">Bank</th>
                <th className="pb-3 font-medium">Status</th>
                <th className="pb-3 font-medium text-right">Amount</th>
                <th className="pb-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((txn) => (
                <tr key={txn._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2D323A]">
                  <td className="py-3 text-sm text-gray-900 dark:text-white">
                    {new Date(txn.date).toLocaleDateString()}
                    {txn.time && <span className="ml-1 text-gray-400">{txn.time}</span>}
                  </td>
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">
                    {txn.description || '-'}
                  </td>
                  <td className="py-3 text-sm text-gray-700 dark:text-gray-300">{txn.merchant || '-'}</td>
                  <td className="py-3 text-sm text-gray-500 dark:text-gray-400">{txn.bank}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${STATUS_COLORS[txn.status] || ''}`}>
                      {txn.status}
                    </span>
                  </td>
                  <td className={`py-3 text-sm font-medium text-right ${TYPE_COLORS[txn.type] || ''}`}>
                    {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => handleDelete(txn._id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                      title="Delete transaction"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {renderPagination()}
        </div>
      )}
    </div>
  );
}
