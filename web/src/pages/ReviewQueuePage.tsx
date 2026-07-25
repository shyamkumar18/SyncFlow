import { useState, useEffect } from 'react';
import * as transactionsService from '../services/transactions';
import type { IReviewItem } from '../types';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Modal from '../components/ui/Modal';
import Input from '../components/ui/Input';
import Select from '../components/ui/Select';
import EmptyState from '../components/ui/EmptyState';
import { CardSkeleton } from '../components/ui/Skeleton';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import { useToast } from '../components/ui/Toast';

export default function ReviewQueuePage() {
  const { toast } = useToast();
  const [items, setItems] = useState<IReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [editItem, setEditItem] = useState<IReviewItem | null>(null);
  const [editForm, setEditForm] = useState<Record<string, any>>({});

  const fetchItems = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await transactionsService.getReviewQueue({ limit: 50 });
      setItems(res.data);
    } catch { setError('Failed to load review queue.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleApprove = async (id: string) => {
    setActionLoading(id);
    try { await transactionsService.approveReviewItem(id); toast('Transaction approved', 'success'); fetchItems(); }
    catch { setError('Failed to approve.'); }
    finally { setActionLoading(null); }
  };

  const handleReject = async (id: string) => {
    setActionLoading(id);
    try { await transactionsService.rejectReviewItem(id); toast('Item rejected', 'success'); fetchItems(); }
    catch { setError('Failed to reject.'); }
    finally { setActionLoading(null); }
  };

  const handleEdit = (item: IReviewItem) => {
    setEditItem(item);
    setEditForm({ amount: item.amount, type: item.type, description: item.description || '', merchant: item.merchant || '' });
  };

  const handleSaveEdit = async () => {
    if (!editItem) return;
    setActionLoading(editItem._id);
    try { await transactionsService.updateReviewItem(editItem._id, editForm); setEditItem(null); toast('Item updated and transaction created.', 'success'); fetchItems(); }
    catch { setError('Failed to update.'); }
    finally { setActionLoading(null); }
  };

  if (loading) return <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Queue</h2><CardSkeleton count={3} /></div>;
  if (error && items.length === 0) return <ErrorDisplay message={error} onRetry={fetchItems} />;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Review Queue</h2>
          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Review and approve low-confidence transactions</p>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchItems}>Refresh</Button>
      </div>

      {error && <div className="p-3 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-400 rounded-lg text-sm">{error}</div>}

      {items.length === 0 ? (
        <EmptyState title="No items to review" description="All caught up! Low-confidence transactions will appear here for your review." />
      ) : (
        <div className="space-y-3">
          {items.map((item) => (
            <div key={item._id} className="p-4 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow animate-fade-in">
              <div className="flex items-start justify-between">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-3">
                    <span className={`text-lg font-bold ${item.type === 'debit' ? 'text-red-600' : 'text-green-600'}`}>
                      {item.type === 'debit' ? '-' : '+'}₹{item.amount.toLocaleString()}
                    </span>
                    <Badge variant={item.confidence >= 30 ? 'warning' : 'danger'}>{item.confidence}% confidence</Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{item.merchant || 'Unknown merchant'}</p>
                  <p className="text-xs text-gray-500">{item.description}</p>
                  <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                    <span>{item.bank}</span>
                    <span>{new Date(item.date).toLocaleDateString()}</span>
                    {item.referenceNumber && <span>Ref: {item.referenceNumber}</span>}
                  </div>
                  {item.detectionDetails && <p className="text-xs text-gray-400 mt-1">{item.detectionDetails}</p>}
                </div>
                <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                  <Button variant="primary" size="sm" loading={actionLoading === item._id} onClick={() => handleApprove(item._id)}>Approve</Button>
                  <Button variant="secondary" size="sm" onClick={() => handleEdit(item)}>Edit</Button>
                  <Button variant="ghost" size="sm" loading={actionLoading === item._id} onClick={() => handleReject(item._id)}>Reject</Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editItem} onClose={() => setEditItem(null)} title="Edit Transaction">
        {editItem && (
          <div className="space-y-4">
            <Input label="Amount" type="number" value={editForm.amount} onChange={(e) => setEditForm({ ...editForm, amount: Number(e.target.value) })} />
            <Select label="Type" options={[{ value: 'debit', label: 'Debit' }, { value: 'credit', label: 'Credit' }]} value={editForm.type} onChange={(e) => setEditForm({ ...editForm, type: e.target.value })} />
            <Input label="Merchant" type="text" value={editForm.merchant} onChange={(e) => setEditForm({ ...editForm, merchant: e.target.value })} />
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">Description</label>
              <textarea value={editForm.description} onChange={(e) => setEditForm({ ...editForm, description: e.target.value })} className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-xl bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white" rows={3} />
            </div>
            <div className="flex gap-3 justify-end">
              <Button variant="secondary" onClick={() => setEditItem(null)}>Cancel</Button>
              <Button loading={actionLoading === editItem._id} onClick={handleSaveEdit}>Save & Create</Button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
