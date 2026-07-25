import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import * as transactionService from '../services/transactions';
import * as emailService from '../services/emails';
import type { ITransaction } from '../types';
import { useDateFilterStore } from '../store/dateFilterStore';
import { formatCurrency } from '../utils';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import { useToast } from '../components/ui/Toast';

const TYPE_COLORS: Record<string, string> = {
  credit: 'text-green-600 dark:text-green-400',
  debit: 'text-red-600 dark:text-red-400',
};

const STATUS_BADGE: Record<string, 'success' | 'danger' | 'warning' | 'info'> = {
  success: 'success',
  failed: 'danger',
  pending: 'warning',
  refunded: 'info',
};

const CATEGORIES = [
  { value: '', label: 'All Categories' },
  ...'food_dining,groceries,transport,shopping,entertainment,bills_utilities,healthcare,education,housing,travel,insurance,investment,subscriptions,emi,loan_repayment,atm_withdrawal,transfer,tax,charity,salary,freelance,refund,cashback,interest,dividend,others_income,others_expense'.split(',').map(c => ({ value: c, label: c.replace(/_/g, ' ') })),
];

export default function TransactionsPage() {
  const filterStartDate = useDateFilterStore(s => s.startDate);
  const filterEndDate = useDateFilterStore(s => s.endDate);
  const dateParams = useMemo(() => ({ startDate: filterStartDate, endDate: filterEndDate }), [filterStartDate, filterEndDate]);
  const { toast } = useToast();

  const [transactions, setTransactions] = useState<ITransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [summary, setSummary] = useState({ totalIncome: 0, totalExpense: 0, netSavings: 0 });
  const [showFilters, setShowFilters] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [selectedTxn, setSelectedTxn] = useState<ITransaction | null>(null);
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [formData, setFormData] = useState({
    amount: '', type: 'debit' as 'debit' | 'credit', description: '',
    merchant: '', category: '', date: new Date().toISOString().split('T')[0],
  });
  const [formError, setFormError] = useState('');
  const [formLoading, setFormLoading] = useState(false);

  const buildParams = useCallback((page = 1) => {
    const params: Record<string, string | number> = { page, limit: 20 };
    if (typeFilter) params.type = typeFilter;
    if (categoryFilter) params.category = categoryFilter;
    if (statusFilter) params.status = statusFilter;
    if (debouncedSearch) params.search = debouncedSearch;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    if (!startDate && !endDate) {
      if (dateParams.startDate) params.startDate = dateParams.startDate;
      if (dateParams.endDate) params.endDate = dateParams.endDate;
    }
    return params;
  }, [typeFilter, categoryFilter, statusFilter, debouncedSearch, startDate, endDate, dateParams]);

  const fetchTransactions = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const res = await transactionService.getTransactions(buildParams(page));
      setTransactions(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Failed to load transactions.');
    } finally {
      setLoading(false);
    }
  }, [buildParams]);

  const fetchSummary = useCallback(async () => {
    try {
      const params: Record<string, string> = {};
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      if (!startDate && !endDate) {
        if (dateParams.startDate) params.startDate = dateParams.startDate;
        if (dateParams.endDate) params.endDate = dateParams.endDate;
      }
      const res = await transactionService.getTransactionSummary(params);
      setSummary(res.data);
    } catch {}
  }, [startDate, endDate, dateParams]);

  useEffect(() => { fetchTransactions(1); fetchSummary(); }, [fetchTransactions, fetchSummary]);

  useEffect(() => {
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => setDebouncedSearch(search), 400);
    return () => { if (searchTimer.current) clearTimeout(searchTimer.current); };
  }, [search]);

  const handleAddTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    const amount = parseFloat(formData.amount);
    if (!amount || amount <= 0) { setFormError('Enter a valid amount'); return; }
    setFormLoading(true);
    try {
      await transactionService.createManualTransaction({
        amount, type: formData.type, description: formData.description,
        merchant: formData.merchant, date: formData.date, status: 'success', bank: 'Manual Entry',
      });
      setShowAddForm(false);
      setFormData({ amount: '', type: 'debit', description: '', merchant: '', category: '', date: new Date().toISOString().split('T')[0] });
      await fetchTransactions(1);
      await fetchSummary();
      toast('Transaction added successfully', 'success');
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Failed to add transaction');
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await transactionService.deleteTransaction(id);
      await fetchTransactions(pagination.page);
      await fetchSummary();
      toast('Transaction deleted', 'success');
    } catch {
      setError('Failed to delete transaction');
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Transactions</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{pagination.total} total transactions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>} onClick={() => setShowFilters(!showFilters)}>
            Filters
          </Button>
          <Button variant="secondary" size="sm" loading={syncing} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>} onClick={async () => { setSyncing(true); try { await emailService.syncEmails(500); await fetchTransactions(1); await fetchSummary(); toast('Sync complete', 'success'); } finally { setSyncing(false); } }}>
            {syncing ? 'Syncing...' : 'Sync'}
          </Button>
          <Button variant="primary" size="sm" icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>} onClick={() => setShowAddForm(true)}>
            Add
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Income" value={formatCurrency(Math.abs(summary.totalIncome))} valueColor="text-green-600" />
        <StatCard label="Expense" value={formatCurrency(Math.abs(summary.totalExpense))} valueColor="text-red-600" />
        <StatCard label="Net" value={formatCurrency(Math.abs(summary.netSavings))} valueColor={summary.netSavings >= 0 ? 'text-green-600' : 'text-red-600'} />
      </div>

      {showFilters && (
        <Card className="p-5">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <Input label="Search" type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Merchant, bank..." />
            <Select label="Type" options={[{ value: '', label: 'All Types' }, { value: 'credit', label: 'Income' }, { value: 'debit', label: 'Expense' }]} value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} />
            <Select label="Category" options={CATEGORIES} value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} />
            <Select label="Status" options={[{ value: '', label: 'All Status' }, { value: 'success', label: 'Success' }, { value: 'failed', label: 'Failed' }, { value: 'pending', label: 'Pending' }, { value: 'refunded', label: 'Refunded' }]} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} />
            <Input label="Start Date" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            <Input label="End Date" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
            <div className="flex items-end">
              <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setTypeFilter(''); setCategoryFilter(''); setStatusFilter(''); setStartDate(''); setEndDate(''); setDebouncedSearch(''); }}>Clear</Button>
            </div>
          </div>
        </Card>
      )}

      <Card className="overflow-hidden p-0">
        {loading ? (
          <div className="p-6"><TableSkeleton rows={8} cols={7} /></div>
        ) : error ? (
          <div className="p-6 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Button onClick={() => fetchTransactions(1)}>Retry</Button>
          </div>
        ) : transactions.length === 0 ? (
          <EmptyState
            icon={<svg className="w-16 h-16 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>}
            title="No transactions found"
            description={(debouncedSearch || typeFilter || categoryFilter) ? 'Try adjusting your filters' : 'Sync your Gmail or add a cash transaction to get started'}
            action={<div className="flex gap-2"><Button onClick={async () => { setSyncing(true); try { await emailService.syncEmails(500); await fetchTransactions(1); await fetchSummary(); } finally { setSyncing(false); } }} loading={syncing}>Sync Gmail</Button><Button variant="secondary" onClick={() => setShowAddForm(true)}>Add Cash</Button></div>}
          />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#1A1D21]">
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Description</th>
                    <th className="px-4 py-3 font-medium">Merchant</th>
                    <th className="px-4 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Bank</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Amount</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn._id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-[#2D323A] transition-colors cursor-pointer" onClick={() => setSelectedTxn(txn)}>
                      <td className="px-4 py-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        {new Date(txn.date).toLocaleDateString('en-IN')}
                        {txn.time && <span className="ml-1 text-gray-400 text-xs">{txn.time}</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300 max-w-xs truncate">{txn.description || '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">{txn.merchant || '-'}</td>
                      <td className="px-4 py-3 text-sm">{txn.category ? <Badge variant="default">{txn.category.replace(/_/g, ' ')}</Badge> : '-'}</td>
                      <td className="px-4 py-3 text-sm text-gray-500 dark:text-gray-400">{txn.bank}</td>
                      <td className="px-4 py-3"><Badge variant={STATUS_BADGE[txn.status] || 'default'}>{txn.status}</Badge></td>
                      <td className={`px-4 py-3 text-sm font-medium text-right whitespace-nowrap ${TYPE_COLORS[txn.type] || ''}`}>
                        {txn.type === 'debit' ? '-' : '+'}{formatCurrency(txn.amount)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={(e) => { e.stopPropagation(); if (window.confirm('Delete this transaction?')) handleDelete(txn._id); }} aria-label="Delete transaction">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700">
              <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchTransactions} />
            </div>
          </>
        )}
      </Card>

      <Modal open={!!selectedTxn} onClose={() => setSelectedTxn(null)} title="Transaction Details">
        {selectedTxn && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 dark:bg-[#1A1D21]">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Amount</p>
                <p className={`text-2xl font-bold ${TYPE_COLORS[selectedTxn.type] || 'text-gray-900 dark:text-white'}`}>
                  {selectedTxn.type === 'debit' ? '-' : '+'}{formatCurrency(selectedTxn.amount)}
                </p>
              </div>
              <Badge variant={STATUS_BADGE[selectedTxn.status] || 'default'} size="md">{selectedTxn.status}</Badge>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              {[
                ['Date', new Date(selectedTxn.date).toLocaleDateString('en-IN') + (selectedTxn.time ? ` ${selectedTxn.time}` : '')],
                ['Type', selectedTxn.type === 'credit' ? 'Income' : 'Expense'],
                ['Bank', selectedTxn.bank],
                ['Merchant', selectedTxn.merchant || '-'],
                ['Category', selectedTxn.category ? selectedTxn.category.replace(/_/g, ' ') : '-'],
                ['Reference', selectedTxn.referenceNumber || '-'],
                ['Description', selectedTxn.description || '-'],
              ].map(([label, value]) => (
                <div key={label} className={label === 'Description' ? 'col-span-2' : ''}>
                  <p className="text-gray-500 dark:text-gray-400">{label}</p>
                  <p className="text-gray-900 dark:text-white font-medium capitalize">{value}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Modal>

      <Modal open={showAddForm} onClose={() => setShowAddForm(false)} title="Add Cash Transaction">
        <form onSubmit={handleAddTransaction} className="space-y-4">
          {formError && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-lg">{formError}</div>}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Type</label>
              <div className="flex gap-2">
                <button type="button" onClick={() => setFormData({ ...formData, type: 'debit' })} className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${formData.type === 'debit' ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>Spent</button>
                <button type="button" onClick={() => setFormData({ ...formData, type: 'credit' })} className={`flex-1 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${formData.type === 'credit' ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-600' : 'border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400'}`}>Gained</button>
              </div>
            </div>
            <Input label="Amount" type="number" step="0.01" min="0" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" required />
          </div>
          <Input label="Description" type="text" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="e.g. Coffee at Starbucks" />
          <Input label="Merchant" type="text" value={formData.merchant} onChange={(e) => setFormData({ ...formData, merchant: e.target.value })} placeholder="e.g. Starbucks" />
          <Input label="Date" type="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} required />
          <Button type="submit" loading={formLoading} className="w-full">Add {formData.type === 'debit' ? 'Expense' : 'Income'}</Button>
        </form>
      </Modal>
    </div>
  );
}

function StatCard({ label, value, valueColor }: { label: string; value: string; valueColor: string }) {
  return (
    <div className="p-4 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 animate-fade-in">
      <p className="text-sm text-gray-500 dark:text-gray-400">{label}</p>
      <p className={`text-xl font-bold mt-1 ${valueColor}`}>{value}</p>
    </div>
  );
}
