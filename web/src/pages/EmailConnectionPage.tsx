import { useState, useEffect } from 'react';
import * as emailConnectionService from '../services/emailConnection';

export default function EmailConnectionPage() {
  const [connection, setConnection] = useState<emailConnectionService.EmailConnectionStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<emailConnectionService.EmailTestResult | null>(null);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const fetchStatus = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams(window.location.search);
      const emailConnected = params.get('email_connected');
      const emailError = params.get('email_error');

      if (emailConnected) {
        setSuccessMsg(`Successfully connected ${emailConnected}`);
      }
      if (emailError) {
        setError(decodeURIComponent(emailError));
      }

      const status = await emailConnectionService.getConnectionStatus();
      setConnection(status);
    } catch {
      setError('Failed to load connection status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError('');
    try {
      const url = await emailConnectionService.getConnectUrl();
      window.location.href = url;
    } catch {
      setError('Failed to generate connection URL');
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    setConnecting(true);
    setError('');
    try {
      await emailConnectionService.disconnectGmail();
      setConnection(null);
      setTestResult(null);
    } catch {
      setError('Failed to disconnect');
    } finally {
      setConnecting(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError('');
    setTestResult(null);
    try {
      const result = await emailConnectionService.testConnection();
      setTestResult(result);
    } catch {
      setTestResult({ success: false, message: 'Connection test failed' });
    } finally {
      setTesting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Gmail Connection</h2>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Connect your Gmail account to auto-import financial emails
        </p>
      </div>

      {successMsg && (
        <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl">
          <p className="text-sm text-green-600 dark:text-green-400">{successMsg}</p>
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="p-6 bg-white dark:bg-[#23272E] rounded-xl border border-gray-200 dark:border-gray-700">
        {!connection?.connected ? (
          <div className="text-center py-6">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 dark:bg-[#2D323A] flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No Gmail account connected</h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
              Connect your Gmail to automatically scan for transaction emails, bills, and financial updates.
            </p>
            <button onClick={handleConnect} disabled={connecting} className="btn-primary">
              {connecting ? 'Redirecting...' : 'Connect Gmail'}
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                  <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">{connection.email}</p>
                  <p className="text-xs text-gray-500">{connection.provider} &middot; {connection.status}</p>
                </div>
              </div>
              <button onClick={handleDisconnect} disabled={connecting} className="text-sm text-red-600 dark:text-red-400 hover:underline">
                Disconnect
              </button>
            </div>

            {connection.lastConnected && (
              <p className="text-xs text-gray-400">
                Last connected: {new Date(connection.lastConnected).toLocaleString()}
              </p>
            )}

            <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
              <button onClick={handleTest} disabled={testing} className="btn-secondary text-sm">
                {testing ? 'Testing...' : 'Test Connection'}
              </button>

              {testResult && (
                <div className={`mt-3 p-3 rounded-lg text-sm ${
                  testResult.success
                    ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                    : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                }`}>
                  <p>{testResult.message}</p>
                  {testResult.latency && <p className="text-xs mt-1">Latency: {testResult.latency}ms</p>}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
