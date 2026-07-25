import { useState, useEffect, useCallback, useMemo } from 'react';
import * as emailService from '../services/emails';
import { useDateFilterStore } from '../store/dateFilterStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import Badge from '../components/ui/Badge';
import EmptyState from '../components/ui/EmptyState';
import Pagination from '../components/ui/Pagination';
import { TableSkeleton } from '../components/ui/Skeleton';
import ErrorDisplay from '../components/ui/ErrorDisplay';

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

  const filterStartDate = useDateFilterStore(s => s.startDate);
  const filterEndDate = useDateFilterStore(s => s.endDate);
  const dateParams = useMemo(() => ({ startDate: filterStartDate, endDate: filterEndDate }), [filterStartDate, filterEndDate]);

  const fetchEmails = useCallback(async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const params: Record<string, string | number> = { page, limit: 20 };
      if (category) params.category = category;
      if (search) params.search = search;
      if (dateParams.startDate) params.startDate = dateParams.startDate;
      if (dateParams.endDate) params.endDate = dateParams.endDate;
      const res = await emailService.getEmails(params);
      setEmails(res.data);
      setPagination(res.pagination);
    } catch {
      setError('Failed to load emails.');
    } finally {
      setLoading(false);
    }
  }, [category, search, dateParams]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await emailService.getEmailStats();
      setStats(res.data);
    } catch {}
  }, []);

  useEffect(() => { fetchEmails(1); fetchStats(); }, [fetchEmails, fetchStats]);

  const handleSync = async () => {
    setSyncing(true);
    setSyncResult(null);
    try {
      const res = await emailService.syncEmails(500);
      setSyncResult(res.data);
      await fetchEmails(1);
      await fetchStats();
    } finally { setSyncing(false); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Mail Center</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
            {stats ? `${stats.total} banking emails from ${Object.keys(stats.banks).length} banks` : 'Loading...'}
          </p>
        </div>
        <Button onClick={handleSync} loading={syncing} icon={<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>}>
          {syncing ? 'Syncing...' : 'Sync Gmail'}
        </Button>
      </div>

      {syncResult && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl animate-slide-up">
          <p className="text-sm text-green-700 dark:text-green-400">
            Synced {syncResult.processed} emails — {syncResult.newEmails} new, {syncResult.newTransactions} transactions detected
          </p>
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <Input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search emails..." />
        </div>
        <Select options={CATEGORIES} value={category} onChange={(e) => setCategory(e.target.value)} className="w-48" />
      </div>

      {loading ? (
        <Card><TableSkeleton rows={5} cols={4} /></Card>
      ) : error ? (
        <ErrorDisplay message={error} onRetry={() => fetchEmails(1)} />
      ) : emails.length === 0 ? (
        <EmptyState title="No banking emails found" description='Click "Sync Gmail" to import your banking emails.' />
      ) : (
        <div className="space-y-3">
          {emails.map((email) => (
            <div key={email._id} className="p-4 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200 animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="primary">{email.bank}</Badge>
                    <Badge variant="default">{email.category}</Badge>
                    {email.hasTransaction && <Badge variant="success">Transaction</Badge>}
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
            <Pagination page={pagination.page} pages={pagination.pages} onPageChange={fetchEmails} />
          )}
        </div>
      )}
    </div>
  );
}
