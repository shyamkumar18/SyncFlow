import { useState, useEffect } from 'react';
import * as settingsService from '../services/settings';
import api from '../services/api';
import { useAuthStore } from '../store/authStore';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Input from '../components/ui/Input';
import { CardSkeleton } from '../components/ui/Skeleton';
import ErrorDisplay from '../components/ui/ErrorDisplay';
import { useToast } from '../components/ui/Toast';

export default function SettingsPage() {
  const { user, setUser } = useAuthStore();
  const { toast } = useToast();
  const [settings, setSettings] = useState<any>(null);
  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<'profile' | 'preferences' | 'account'>('profile');

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError('');
      try {
        const res = await settingsService.getSettings();
        setSettings(res.data);
      } catch { setError('Failed to load settings.'); }
      finally { setLoading(false); }
    };
    fetch();
  }, []);

  const handleSave = async (section: string) => {
    setSaving(true);
    setError('');
    try {
      if (section === 'profile') {
        if (displayName !== user?.displayName && user) {
          await api.put('/settings/profile', { displayName });
          setUser({ ...user, displayName });
        }
      } else {
        await settingsService.updateSettings({
          monthlyIncome: settings?.monthlyIncome,
          currency: settings?.currency,
          theme: settings?.theme,
          timezone: settings?.timezone,
        });
      }
      toast('Settings saved', 'success');
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to save.');
    } finally { setSaving(false); }
  };

  const handleDeleteAccount = async () => {
    if (!window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) return;
    if (!window.confirm('All your data will be permanently removed. Continue?')) return;
    try {
      await api.delete('/settings/account');
      localStorage.removeItem('accessToken');
      window.location.href = '/login';
    } catch { setError('Failed to delete account.'); }
  };

  if (loading) return <div className="space-y-6"><h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2><CardSkeleton count={2} /></div>;
  if (error && !settings) return <ErrorDisplay message={error} onRetry={() => window.location.reload()} />;

  const tabs = [
    { value: 'profile' as const, label: 'Profile' },
    { value: 'preferences' as const, label: 'Preferences' },
    { value: 'account' as const, label: 'Account' },
  ];

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Settings</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your account and preferences</p>
      </div>

      <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700 pb-2">
        {tabs.map((t) => (
          <button key={t.value} onClick={() => setTab(t.value)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors capitalize ${tab === t.value ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>{t.label}</button>
        ))}
      </div>

      {error && <div className="p-3 text-sm text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400 rounded-xl">{error}</div>}

      {tab === 'profile' && (
        <Card className="space-y-4">
          <div className="flex items-center gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
            <div className="w-16 h-16 rounded-full bg-primary-600 flex items-center justify-center text-white text-xl font-bold">
              {user?.displayName?.charAt(0).toUpperCase() || user?.email?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.displayName || 'User'}</p>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>
          <Input label="Display Name" type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)} />
          <Input label="Email" type="email" value={user?.email || ''} disabled />
          <Button onClick={() => handleSave('profile')} loading={saving}>Save Profile</Button>
        </Card>
      )}

      {tab === 'preferences' && (
        <Card className="space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900 dark:text-white">Monthly Income</p>
              <p className="text-xs text-gray-500">Used for budget calculations and savings rate</p>
            </div>
            <input type="number" value={settings?.monthlyIncome ?? ''} onChange={(e) => setSettings({ ...settings, monthlyIncome: e.target.value ? Number(e.target.value) : 0 })} className="w-32 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white text-right" placeholder="0" />
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-900 dark:text-white">Currency</p></div>
            <select value={settings?.currency || 'INR'} onChange={(e) => setSettings({ ...settings, currency: e.target.value })} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white">
              <option value="INR">INR (₹)</option>
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-900 dark:text-white">Theme</p></div>
            <select value={settings?.theme || 'system'} onChange={(e) => setSettings({ ...settings, theme: e.target.value })} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white">
              <option value="light">Light</option>
              <option value="dark">Dark</option>
              <option value="system">System</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div><p className="text-sm font-medium text-gray-900 dark:text-white">Timezone</p></div>
            <select value={settings?.timezone || 'Asia/Kolkata'} onChange={(e) => setSettings({ ...settings, timezone: e.target.value })} className="px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-[#1A1D21] text-gray-900 dark:text-white">
              <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
              <option value="America/New_York">America/New_York (EST)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
              <option value="Asia/Dubai">Asia/Dubai (GST)</option>
            </select>
          </div>
          <Button onClick={() => handleSave('preferences')} loading={saving}>Save Preferences</Button>
        </Card>
      )}

      {tab === 'account' && (
        <Card className="space-y-4">
          <div>
            <h3 className="font-medium text-gray-900 dark:text-white">Danger Zone</h3>
            <p className="text-sm text-gray-500 mt-1">Once you delete your account, there is no going back.</p>
          </div>
          <div className="p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
            <p className="text-sm text-red-700 dark:text-red-300">
              This will permanently delete your account, settings, and all associated data.
            </p>
          </div>
          <Button variant="danger" onClick={handleDeleteAccount}>Delete My Account</Button>
        </Card>
      )}
    </div>
  );
}
