import { useState, useEffect, useCallback } from 'react';
import * as emailService from '../services/emails';

const CATEGORIES = [
  { value: '', label: 'All Banking Emails' },
  { value: 'transaction', label: 'Transaction' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'debit_card', label: 'Debit Card' },
  { value: 'upi', label: 'UPI' },
  { value: 'emi', label: 'EMI' },
  { value: 'loan', label: 'Loan' },
  { value: 'refund', label: 'Refund' },
  { value: 'failed', label: 'Failed' },
  { value: 'statement', label: 'Statements' },
];

export default function MailCenterPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [syncing, setSyncing] = useState(false);
  const [category, setCategory] = useState('');
  const [search, setSearch] = useState('');
  const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });
  const [stats, setStats] = useState<any>(null);
  const [syncResult, setSyncResult] = useState<any>(null);

  const fetchEmails = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (category) params.category = category;
      if (search) params.search = search;
      const res = await emailService.getEmails(params);
      setEmails(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Failed to load emails.');
    } finally {
      setLoading(false);
    }
  }, [category, search]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await emailService.getEmailStats();
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => {
    fetchEmails(1);
    fetchStats();
  }, [fetchEmails, fetchStats]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await emailService.syncEmails(50);
      setSyncResult(res.data);
      await fetchEmails(1);
      await fetchStats();
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mail Center</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {stats ? `${stats.total} banking emails from ${Object.keys(stats.banks).length} banks` : 'Loading...'}
          </p>
        </div>
        <button
          onClick={handleSync}
          disabled={syncing}
          className="btn-primary flex items-center gap-2"
        >
          {syncing ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          {syncing ? 'Syncing...' : 'Sync Gmail'}
        </button>
      </div>

      {syncResult && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <p className="text-sm text-green-700 dark:text-green-400">
            Synced {syncResult.processed} emails — {syncResult.newEmails} new, {syncResult.newTransactions} transactions detected
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search emails..."
            className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#23272E] text-gray-900 dark:text-white"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-[#23272E] text-gray-900 dark:text-white"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
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
            <button onClick={() => fetchEmails(1)} className="btn-primary">Retry</button>
          </div>
        </div>
      ) : emails.length === 0 ? (
        <div className="text-center py-12 text-gray-500 dark:text-gray-400">
          <p>No banking emails found.</p>
          <p className="mt-1 text-sm">Click "Sync Gmail" to import your banking emails.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <div
              key={email._id}
              className="p-4 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-primary-500/10 text-primary-600 dark:text-primary-500">
                      {email.bank}
                    </span>
                    <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400">
                      {email.category}
                    </span>
                    {email.hasTransaction && (
                      <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-400">
                        Transaction
                      </span>
                    )}
                  </div>
                  <p className="font-medium text-gray-900 dark:text-white truncate">{email.subject}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400 truncate mt-1">{email.snippet}</p>
                  <div className="flex items-center gap-4 mt-2 text-xs text-gray-400">
                    <span>{email.from}</span>
                    <span>{new Date(email.receivedAt).toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {pagination.pages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-4">
              <button
                onClick={() => fetchEmails(pagination.page - 1)}
                disabled={pagination.page <= 1}
                className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-[#23272E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2D323A] disabled:opacity-40"
              >
                Prev
              </button>
              {(() => {
                const pages: (number | string)[] = [];
                const total = pagination.pages;
                const current = pagination.page;
                if (total <= 7) {
                  for (let i = 1; i <= total; i++) pages.push(i);
                } else {
                  pages.push(1);
                  if (current > 3) pages.push('...');
                  for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i++) pages.push(i);
                  if (current < total - 2) pages.push('...');
                  pages.push(total);
                }
                return pages.map((p, i) =>
                  typeof p === 'string' ? (
                    <span key={`e${i}`} className="px-1 text-gray-400">...</span>
                  ) : (
                    <button key={p} onClick={() => fetchEmails(p)}
                      className={`px-3 py-1 rounded-lg text-sm ${p === current ? 'bg-primary-600 text-white' : 'bg-gray-100 dark:bg-[#23272E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2D323A]'}`}
                    >{p}</button>
                  )
                );
              })()}
              <button
                onClick={() => fetchEmails(pagination.page + 1)}
                disabled={pagination.page >= pagination.pages}
                className="px-3 py-1 rounded-lg text-sm bg-gray-100 dark:bg-[#23272E] text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2D323A] disabled:opacity-40"
              >
                Next
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
